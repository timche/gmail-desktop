import { describe, expect, test } from "bun:test";
import { isUpdateSupported, MINIMUM_MACOS_VERSION } from "./support";

describe("isUpdateSupported", () => {
  test("refuses an update on the macOS versions Electron 44 dropped", () => {
    expect(isUpdateSupported("darwin", "12.7.6")).toBe(false);
    expect(isUpdateSupported("darwin", "12.0")).toBe(false);
    expect(isUpdateSupported("darwin", "11.7.10")).toBe(false);
  });

  test("allows the minimum version itself", () => {
    expect(isUpdateSupported("darwin", MINIMUM_MACOS_VERSION)).toBe(true);
    expect(isUpdateSupported("darwin", "13.0.0")).toBe(true);
    expect(isUpdateSupported("darwin", "13.7.1")).toBe(true);
  });

  test("allows every later major", () => {
    expect(isUpdateSupported("darwin", "14.6.1")).toBe(true);
    expect(isUpdateSupported("darwin", "15.0")).toBe(true);
    expect(isUpdateSupported("darwin", "26")).toBe(true);
  });

  test("reads a missing component as zero rather than as below the minimum", () => {
    expect(isUpdateSupported("darwin", "13")).toBe(true);
  });

  test("lets an update through when the version does not parse", () => {
    expect(isUpdateSupported("darwin", "")).toBe(true);
    expect(isUpdateSupported("darwin", "Monterey")).toBe(true);
    expect(isUpdateSupported("darwin", "12.7.6-beta")).toBe(true);
    expect(isUpdateSupported("darwin", "12..6")).toBe(true);
  });

  test("gates nothing off macOS, where the same version number means something else", () => {
    expect(isUpdateSupported("win32", "12.0.0")).toBe(true);
    expect(isUpdateSupported("linux", "12.0.0")).toBe(true);
    expect(isUpdateSupported("linux", "6.12.101")).toBe(true);
  });
});
