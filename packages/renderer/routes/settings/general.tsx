import { ipc } from "@meru/shared/renderer/ipc";
import { Button } from "@meru/ui/components/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@meru/ui/components/field";
import { Switch } from "@meru/ui/components/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { LoginItemSettings } from "electron";
import { useEffect, useId } from "react";
import { ConfigSwitchField } from "@/components/config-switch-field";
import { LicenseKeyRequiredBanner } from "@/components/license-key-required-banner";
import { LicenseKeyRequiredFieldBadge } from "@/components/license-key-required-field-badge";
import { Settings, SettingsContent, SettingsHeader, SettingsTitle } from "@/components/settings";
import { useIsLicenseKeyValid } from "@/lib/hooks";
import { queryClient } from "@/lib/react-query";
import { platform } from "@/lib/utils";

function LaunchAtLoginField() {
  const queryKey = ["login-item-settings"];

  const { data: loginItemSettings } = useQuery({
    queryKey,
    queryFn: () => ipc.main.invoke("app.getLoginItemSettings"),
  });

  const loginItemSettingsMutation = useMutation({
    mutationFn: (settings: Partial<LoginItemSettings>) =>
      ipc.main.invoke("app.setLoginItemSettings", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const fieldId = useId();

  if (platform.isLinux || !loginItemSettings) {
    return;
  }

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={fieldId}>Launch at login</FieldLabel>
        <FieldDescription>
          Start the application automatically when you log in to your computer.
        </FieldDescription>
      </FieldContent>
      <Switch
        id={fieldId}
        checked={loginItemSettings.openAtLogin}
        onCheckedChange={(checked) => {
          loginItemSettingsMutation.mutate({
            openAtLogin: checked,
          });
        }}
      />
    </Field>
  );
}

const DEFAULT_MAILTO_CLIENT_QUERY_KEY = ["default-mailto-client"];

function DefaultMailClientField() {
  const { data: defaultMailtoClientState } = useQuery({
    queryKey: DEFAULT_MAILTO_CLIENT_QUERY_KEY,
    queryFn: () => ipc.main.invoke("app.getDefaultMailtoClientState"),
  });

  const isDefaultMailtoClientMutation = useMutation({
    mutationFn: () => ipc.main.invoke("app.setAsDefaultMailtoClient"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEFAULT_MAILTO_CLIENT_QUERY_KEY,
      });
    },
  });

  const fieldId = useId();

  const isLicenseKeyValid = useIsLicenseKeyValid();

  /**
   * Windows takes the choice in its own settings, so the row cannot tell when it
   * was made; asking again on every focus is the closest it gets.
   */
  useEffect(() => {
    if (!platform.isWindows) {
      return;
    }

    const handleWindowFocus = () => {
      queryClient.invalidateQueries({
        queryKey: DEFAULT_MAILTO_CLIENT_QUERY_KEY,
      });
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  if (!defaultMailtoClientState) {
    return;
  }

  const { isDefault, isPortableBuild } = defaultMailtoClientState;

  const heading = (
    <>
      Default mail client <LicenseKeyRequiredFieldBadge />
    </>
  );

  if (platform.isWindows) {
    let description = "Choose Meru as the default mail client in Windows Settings.";

    if (isDefault) {
      description = "Meru is set as the default mail client.";
    } else if (isPortableBuild) {
      description = "The portable version of Meru can't be set as the default mail client.";
    }

    return (
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{heading}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
        {!isDefault && !isPortableBuild && (
          <Button
            variant="outline"
            onClick={() => {
              ipc.main.send("app.openDefaultAppsSettings");
            }}
            disabled={!isLicenseKeyValid}
          >
            Open Windows Settings
          </Button>
        )}
      </Field>
    );
  }

  return (
    <Field orientation="horizontal">
      <FieldContent>
        {/*
         * A label only while there is a switch for it to label. Once Meru is the
         * default there is nothing left to turn on, so the switch goes and the
         * row states the fact instead — and a `label` naming an id that nothing
         * on the page carries is read as unlabelled by assistive technology.
         */}
        {isDefault ? (
          <FieldTitle>{heading}</FieldTitle>
        ) : (
          <FieldLabel htmlFor={fieldId}>{heading}</FieldLabel>
        )}
        <FieldDescription>
          {isDefault
            ? "Meru is set as the default mail client."
            : "Set Meru as the default mail client to handle email links and related protocols."}
        </FieldDescription>
      </FieldContent>
      {!isDefault && (
        <Switch
          id={fieldId}
          checked={isDefault}
          onCheckedChange={(checked) => {
            if (checked) {
              isDefaultMailtoClientMutation.mutate();
            }
          }}
          disabled={!isLicenseKeyValid}
        />
      )}
    </Field>
  );
}

export function GeneralSettings() {
  return (
    <Settings>
      <SettingsHeader>
        <SettingsTitle>General</SettingsTitle>
      </SettingsHeader>
      <SettingsContent>
        <LicenseKeyRequiredBanner />
        <FieldGroup>
          <DefaultMailClientField />
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Startup</FieldLegend>
            <LaunchAtLoginField />
            <ConfigSwitchField
              label="Launch minimized"
              description="Start the application minimized."
              configKey="launchMinimized"
            />
          </FieldSet>
        </FieldGroup>
      </SettingsContent>
    </Settings>
  );
}
