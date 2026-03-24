#!/usr/bin/env bash

# Use hyprctl to get the active window class in JSON format (fastest)
active_class=$(hyprctl activewindow -j | jq -r '.class')

if [ "$active_class" = "firefox" ]; then
  # Trigger Sidebery/Vertical Tabs (Ctrl+Alt+Z)
  wtype -M ctrl -M alt -k z -m alt -m ctrl
else
  # Fallback for all other apps (Ctrl+Alt+/)
  wtype -M ctrl -M alt -k slash -m alt -m ctrl
fi
