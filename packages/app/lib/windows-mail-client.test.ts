import { describe, expect, mock, test } from "bun:test";

// `@electron-toolkit/utils` imports four of these and reads `app.isPackaged` as
// it loads; the three it only passes on stay undefined so that `electron-log`,
// which reaches for them defensively, takes its no-Electron path
mock.module("electron", () => ({
  app: { isPackaged: true, getPath: () => "" },
  shell: { openExternal: () => {} },
  session: undefined,
  ipcMain: undefined,
  BrowserWindow: undefined,
}));

const { buildRegistration, parseUserChoiceProgId } = await import("./windows-mail-client");

const EXECUTABLE_PATH = String.raw`C:\Program Files\Meru\Meru.exe`;

describe("buildRegistration", () => {
  test("escapes the executable path in every value that carries it", () => {
    const registration = buildRegistration(EXECUTABLE_PATH);

    expect(registration).toContain(String.raw`@="C:\\Program Files\\Meru\\Meru.exe,0"`);
    expect(registration).toContain(String.raw`@="\"C:\\Program Files\\Meru\\Meru.exe\" \"%1\""`);
    expect(registration).toContain(String.raw`@="\"C:\\Program Files\\Meru\\Meru.exe\""`);
    expect(registration).toContain(
      String.raw`"ApplicationIcon"="C:\\Program Files\\Meru\\Meru.exe,0"`,
    );
  });

  test("writes the keys Default apps reads", () => {
    const lines = buildRegistration(EXECUTABLE_PATH).split("\r\n");

    expect(lines[0]).toBe("Windows Registry Editor Version 5.00");

    expect(lines).toContain(String.raw`[-HKEY_CURRENT_USER\Software\Meru]`);
    expect(lines).toContain(String.raw`[HKEY_CURRENT_USER\Software\Classes\Meru.mailto]`);
    expect(lines).toContain(
      String.raw`[HKEY_CURRENT_USER\Software\Classes\Meru.mailto\shell\open\command]`,
    );
    expect(lines).toContain(String.raw`[HKEY_CURRENT_USER\Software\Classes\mailto]`);
    expect(lines).toContain(
      String.raw`[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Capabilities]`,
    );
    expect(lines).toContain(
      String.raw`[HKEY_CURRENT_USER\Software\Clients\Mail\Meru\Capabilities\URLAssociations]`,
    );
    expect(lines).toContain(String.raw`"mailto"="Meru.mailto"`);
    expect(lines).toContain(String.raw`[HKEY_CURRENT_USER\Software\RegisteredApplications]`);
    expect(lines).toContain(String.raw`"Meru"="Software\\Clients\\Mail\\Meru\\Capabilities"`);
  });

  test("ends every line with a carriage return", () => {
    expect(buildRegistration(EXECUTABLE_PATH)).not.toMatch(/[^\r]\n/);
  });
});

describe("parseUserChoiceProgId", () => {
  test("reads the prog id out of a reg query", () => {
    expect(
      parseUserChoiceProgId(
        [
          String.raw`HKEY_CURRENT_USER\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\mailto\UserChoice`,
          "    ProgId    REG_SZ    Meru.mailto",
          "",
        ].join("\r\n"),
      ),
    ).toBe("Meru.mailto");
  });

  test("ignores the padding around the value", () => {
    expect(parseUserChoiceProgId("    ProgId    REG_SZ    Microsoft.Outlook.Mail.15    \r\n")).toBe(
      "Microsoft.Outlook.Mail.15",
    );
  });

  test("returns undefined when the value is not there", () => {
    expect(parseUserChoiceProgId("")).toBeUndefined();
    expect(
      parseUserChoiceProgId("ERROR: The system was unable to find the specified registry key"),
    ).toBeUndefined();
  });
});
