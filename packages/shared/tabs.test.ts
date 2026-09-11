import { describe, expect, test } from "bun:test";
import { getVisibleVerticalTabs, showsGmailUnreadCount } from "./tabs";

type VerticalTab = { id: string; dormant: boolean; pinned: boolean; windowed: boolean };

const gmailTab: VerticalTab = { id: "gmail", dormant: false, pinned: false, windowed: false };

const openTab: VerticalTab = { id: "open", dormant: false, pinned: false, windowed: false };

const unloadedTab: VerticalTab = { id: "unloaded", dormant: true, pinned: false, windowed: false };

const unopenedPinnedTab: VerticalTab = {
  id: "unopened-pinned",
  dormant: true,
  pinned: true,
  windowed: false,
};

const windowedTab: VerticalTab = { id: "windowed", dormant: false, pinned: false, windowed: true };

const tabs = [gmailTab, unopenedPinnedTab, openTab, unloadedTab, windowedTab];

describe("getVisibleVerticalTabs", () => {
  test("lists an unloaded unpinned tab in windows mode", () => {
    const visibleTabs = getVisibleVerticalTabs(tabs, {
      workspaceAppsMode: "windows",
      showWindows: true,
    });

    expect(visibleTabs.map((tab) => tab.id)).toEqual(["gmail", "open", "unloaded"]);
  });

  test("lists every unwindowed tab in tabs mode", () => {
    const visibleTabs = getVisibleVerticalTabs(tabs, {
      workspaceAppsMode: "tabs",
      showWindows: false,
    });

    expect(visibleTabs.map((tab) => tab.id)).toEqual([
      "gmail",
      "unopened-pinned",
      "open",
      "unloaded",
    ]);
  });

  test("lists windowed tabs in tabs mode when they are shown", () => {
    const visibleTabs = getVisibleVerticalTabs(tabs, {
      workspaceAppsMode: "tabs",
      showWindows: true,
    });

    expect(visibleTabs).toEqual(tabs);
  });
});

describe("showsGmailUnreadCount", () => {
  test("shows the count in always mode whichever tab is active", () => {
    expect(showsGmailUnreadCount("always", true)).toBe(true);
    expect(showsGmailUnreadCount("always", false)).toBe(true);
  });

  test("hides the count in whenInactive mode only while the Gmail tab is active", () => {
    expect(showsGmailUnreadCount("whenInactive", true)).toBe(false);
    expect(showsGmailUnreadCount("whenInactive", false)).toBe(true);
  });

  test("hides the count in never mode whichever tab is active", () => {
    expect(showsGmailUnreadCount("never", true)).toBe(false);
    expect(showsGmailUnreadCount("never", false)).toBe(false);
  });
});
