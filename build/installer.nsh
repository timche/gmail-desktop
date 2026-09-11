!macro customInstall
  # Older installs registered under Software\Meru; drop it so Default apps shows one Meru
  DeleteRegKey HKCU "Software\Meru"

  WriteRegStr HKCU "Software\Clients\Mail\Meru" "" "Meru"
  WriteRegStr HKCU "Software\Clients\Mail\Meru\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Clients\Mail\Meru\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  WriteRegStr HKCU "Software\Clients\Mail\Meru\Capabilities" "ApplicationName" "Meru"
  WriteRegStr HKCU "Software\Clients\Mail\Meru\Capabilities" "ApplicationDescription" "The Gmail experience you deserve"
  WriteRegStr HKCU "Software\Clients\Mail\Meru\Capabilities\StartMenu" "Mail" "Meru"
  WriteRegStr HKCU "Software\Clients\Mail\Meru\Capabilities\URLAssociations" "mailto" "Meru.mailto"

  WriteRegStr HKCU "Software\Classes\Meru.mailto" "" "URL:mailto"
  WriteRegStr HKCU "Software\Classes\Meru.mailto" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\Meru.mailto\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Classes\Meru.mailto\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\RegisteredApplications" "Meru" "Software\Clients\Mail\Meru\Capabilities"

  # SHCNE_ASSOCCHANGED: Windows only rescans registered handlers on this notification.
  # No SHCNF_FLUSH: it blocks until every shell window has handled the event, and from
  # the installer's UI thread that deadlocked against Explorer and hung the install.
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Meru"
  DeleteRegKey HKCU "Software\Clients\Mail\Meru"
  DeleteRegKey HKCU "Software\Classes\Meru.mailto"
  DeleteRegValue HKCU "Software\RegisteredApplications" "Meru"

  # SHCNE_ASSOCCHANGED: Windows only rescans registered handlers on this notification.
  # No SHCNF_FLUSH: it blocks until every shell window has handled the event, and from
  # the installer's UI thread that deadlocked against Explorer and hung the install.
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
