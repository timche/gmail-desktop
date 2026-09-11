import * as childProcess from "node:child_process";
import { writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { is, platform } from "@electron-toolkit/utils";
import { ms } from "@meru/shared/ms";
import { app, shell } from "electron";
import { serializeError } from "serialize-error";
import { log } from "./log";

const execFile = promisify(childProcess.execFile);

const MAILTO_PROG_ID = "Meru.mailto";

const USER_CHOICE_KEY = String.raw`HKCU\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\mailto`;

const USER_CHOICE_SUBKEYS = ["UserChoiceLatest", "UserChoice"];

/**
 * Windows 11 22H2 added Meru's own page under Default apps, which
 * `registeredAppUser` opens; earlier builds get the plain page.
 */
const DEFAULT_APPS_PAGE_BUILD = 22621;

/**
 * Resolved from the environment rather than left to `PATH`, which a user can
 * put another `reg` on the front of.
 */
function getRegExePath() {
  const systemRoot = process.env.SystemRoot ?? process.env.windir ?? String.raw`C:\Windows`;

  return path.join(systemRoot, "System32", "reg.exe");
}

/**
 * The portable build runs from a temporary extraction that is gone by the next
 * launch, so the registration has to name the executable the user launched.
 * electron-builder's portable launcher passes its arguments on to the app, so a
 * mailto url reaches Meru through it.
 */
function getExecutablePath() {
  return process.env.PORTABLE_EXECUTABLE_FILE ?? process.execPath;
}

function escapeRegValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function buildRegistration(executablePath: string) {
  const icon = escapeRegValue(`${executablePath},0`);

  const openCommand = escapeRegValue(`"${executablePath}"`);

  const mailtoCommand = escapeRegValue(`"${executablePath}" "%1"`);

  // The leading `-` deletes `Software\Meru`, the second set of capabilities
  // earlier installers wrote: left behind, Default apps lists two Merus
  const registration = String.raw`Windows Registry Editor Version 5.00

[-HKEY_CURRENT_USER\Software\Meru]

[HKEY_CURRENT_USER\Software\Classes\Meru.mailto]
@="Meru URL"
"FriendlyTypeName"="Meru URL"
"EditFlags"=dword:00000002

[HKEY_CURRENT_USER\Software\Classes\Meru.mailto\DefaultIcon]
@=${icon}

[HKEY_CURRENT_USER\Software\Classes\Meru.mailto\shell\open\command]
@=${mailtoCommand}

[HKEY_CURRENT_USER\Software\Classes\mailto]
"URL Protocol"=""

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru]
@="Meru"
"LocalizedString"="Meru"

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\DefaultIcon]
@=${icon}

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\shell\open\command]
@=${openCommand}

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Protocols\mailto]
@="URL:MailTo Protocol"
"URL Protocol"=""
"EditFlags"=dword:00000002

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Protocols\mailto\DefaultIcon]
@=${icon}

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Protocols\mailto\shell\open\command]
@=${mailtoCommand}

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Capabilities]
"ApplicationName"="Meru"
"ApplicationDescription"="The Gmail experience you deserve"
"ApplicationIcon"=${icon}

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Capabilities\StartMenu]
"Mail"="Meru"

[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Capabilities\URLAssociations]
"mailto"="Meru.mailto"

[HKEY_CURRENT_USER\Software\RegisteredApplications]
"Meru"="Software\\Clients\\Mail\\Meru\\Capabilities"
`;

  // `reg.exe import` parses the file as Windows text
  return registration.replace(/\n/g, "\r\n");
}

/**
 * Rewritten on every launch rather than by the installer, whose write of
 * `Software\Classes\Meru.mailto` Windows 11 did not keep, and because the path
 * it registers moves with an update or a relocated portable copy. Importing the
 * same keys again is a no-op.
 */
export async function registerWindowsMailClient() {
  // A development run would register Electron itself as the mail client
  if (!platform.isWindows || is.dev) {
    return;
  }

  const filePath = path.join(app.getPath("userData"), "windows-mail-client.reg");

  try {
    // UTF-16LE with a BOM, as regedit writes: read as ANSI, an executable path
    // holding characters outside the system code page arrives mangled
    await writeFile(filePath, `\ufeff${buildRegistration(getExecutablePath())}`, "utf16le");

    await execFile(getRegExePath(), ["import", filePath], { timeout: ms("10s") });
  } catch (error) {
    log.error("Failed to register Meru as a Windows mail client", {
      error: serializeError(error),
    });
  }
}

/**
 * Every `REG_SZ` value in a `reg query` dump except the hash. Windows 11 24H2
 * moved the choice from a `ProgId` value on `UserChoice` to a `ProgId` subkey
 * of `UserChoiceLatest`, so the value's name is not relied on, only its data.
 */
export function parseUserChoiceProgIds(output: string) {
  return [...output.matchAll(/^\s*(?!Hash\s)\S+\s+REG_SZ\s+(\S.*?)\s*$/gm)].map(
    (match) => match[1],
  );
}

async function queryUserChoiceProgIds(subKey: string) {
  try {
    const { stdout } = await execFile(
      getRegExePath(),
      ["query", `${USER_CHOICE_KEY}\\${subKey}`, "/s"],
      { timeout: ms("10s") },
    );

    return parseUserChoiceProgIds(stdout);
  } catch {
    // `reg.exe` exits non-zero when the key is absent
    return [];
  }
}

/**
 * Windows keeps the association the user picked under `UserChoice`, which only
 * it can write. Windows 11 24H2 writes `UserChoiceLatest` instead and leaves the
 * old key stale, so the newer key wins whenever it has an answer. Not
 * `app.isDefaultProtocolClient`: it reads back the key Electron wrote itself, so
 * it answers yes for a Meru that no mailto link reaches.
 */
export async function isWindowsDefaultMailClient() {
  const [latest, legacy] = await Promise.all(USER_CHOICE_SUBKEYS.map(queryUserChoiceProgIds));

  return (latest.length > 0 ? latest : legacy).includes(MAILTO_PROG_ID);
}

export function openWindowsDefaultAppsSettings() {
  const buildNumber = Number(os.release().split(".")[2]);

  // Not `openExternalUrl`: its trusted-host dialog and origin check are for web
  // links, and `ms-settings:` has no origin to show
  shell.openExternal(
    buildNumber >= DEFAULT_APPS_PAGE_BUILD
      ? "ms-settings:defaultapps?registeredAppUser=Meru"
      : "ms-settings:defaultapps",
  );
}
