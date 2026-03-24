#!/usr/bin/env bash
# ~/.config/hypr/scripts/smart-focus.sh <l|r|u|d>

DIR="$1"
STATE_FILE="/tmp/hypr-fs-addr"

# Get current window address and fullscreen state without jq
ACTIVE_JSON=$(hyprctl activewindow -j)
ACTIVE_ADDR=$(printf '%s' "$ACTIVE_JSON" | grep -o '"address": *"[^"]*"' | head -1 | grep -o '"0x[^"]*"' | tr -d '"')
IS_FS=$(printf '%s' "$ACTIVE_JSON" | grep -o '"fullscreen": *[0-9]*' | grep -o '[0-9]*$')

# If currently fullscreen, save this window's address
if [ "${IS_FS:-0}" -gt 0 ]; then
  printf '%s' "$ACTIVE_ADDR" >"$STATE_FILE"
fi

# Move focus
hyprctl dispatch layoutmsg "focus $DIR"

# Check if we landed on the saved fullscreen window
if [ -f "$STATE_FILE" ]; then
  NEW_JSON=$(hyprctl activewindow -j)
  NEW_ADDR=$(printf '%s' "$NEW_JSON" | grep -o '"address": *"[^"]*"' | head -1 | grep -o '"0x[^"]*"' | tr -d '"')
  SAVED=$(cat "$STATE_FILE")

  if [ "$NEW_ADDR" = "$SAVED" ]; then
    NEW_FS=$(printf '%s' "$NEW_JSON" | grep -o '"fullscreen": *[0-9]*' | grep -o '[0-9]*$')
    if [ "${NEW_FS:-0}" -eq 0 ]; then
      hyprctl dispatch fullscreen 1
    fi
    rm -f "$STATE_FILE"
  fi
fi
