import { Alert, AlertDescription, AlertTitle } from "@meru/ui/components/alert";
import { FieldGroup } from "@meru/ui/components/field";
import { CircleAlertIcon } from "lucide-react";
import { ConfigSelectField } from "@/components/config-select-field";
import { ConfigSwitchField } from "@/components/config-switch-field";
import { Settings, SettingsContent, SettingsHeader, SettingsTitle } from "@/components/settings";
import { useIsBelowMinimumMacOSVersion } from "@/lib/react-query";

const releaseChannelItems = [
  { value: "stable", label: "Stable" },
  { value: "beta", label: "Beta" },
];

function BelowMinimumMacOSVersionAlert() {
  return (
    <Alert>
      <CircleAlertIcon />
      <AlertTitle>This is the last version of Meru for this Mac</AlertTitle>
      <AlertDescription>
        Updates need macOS 13 or later, so Meru won't check for them on this Mac. This version keeps
        working, but it gets no further fixes, security fixes included, so using it long term is at
        your own risk.
      </AlertDescription>
    </Alert>
  );
}

export function UpdatesSettings() {
  const isBelowMinimumMacOSVersion = useIsBelowMinimumMacOSVersion();

  return (
    <Settings>
      <SettingsHeader>
        <SettingsTitle>Updates</SettingsTitle>
      </SettingsHeader>
      <SettingsContent>
        <FieldGroup>
          {isBelowMinimumMacOSVersion && <BelowMinimumMacOSVersionAlert />}
          <ConfigSwitchField
            label="Check for updates automatically"
            description="Check for updates in the background."
            configKey="updates.autoCheck"
            disabled={isBelowMinimumMacOSVersion}
            restartRequired
          />
          <ConfigSwitchField
            label="Notify when updates are available"
            description="Receive notifications when updates are available."
            configKey="updates.showNotifications"
            disabled={isBelowMinimumMacOSVersion}
          />
          <ConfigSelectField
            label="Release channel"
            description="Choose which releases to receive. The beta channel gets upcoming features early."
            configKey="updates.channel"
            items={releaseChannelItems}
            disabled={isBelowMinimumMacOSVersion}
            confirmation={{
              when: (value) => value === "beta",
              title: "Switch to the beta channel?",
              description:
                "Beta releases are unfinished builds of upcoming versions. They can contain bugs and break in ways a stable release won't. You can switch back to the stable channel at any time.",
              confirmLabel: "Switch to beta",
            }}
          />
        </FieldGroup>
      </SettingsContent>
    </Settings>
  );
}
