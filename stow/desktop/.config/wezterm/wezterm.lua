local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- 🔤 FONT
config.font = wezterm.font('ZedMono Nerd Font')
config.font_size = 14.0

-- 🎨 COLORS - Catppuccin Mocha with pure black background
config.color_scheme = 'Catppuccin Mocha'
config.colors = {
    background = '#000000',
}

-- 🪟 WINDOW
config.window_decorations = "NONE"
config.window_padding = {
    left = '0.5cell',
    right = '0.5cell',
    top = '0.25cell',
    bottom = '0.25cell',
}

-- 👀 OPACITY + BLUR (KDE/Hyprland)
config.window_background_opacity = 0.95
config.kde_window_background_blur = true

-- Dim when unfocused
wezterm.on('window-focus-changed', function(window, pane)
    local overrides = window:get_config_overrides() or {}
    if window:is_focused() then
        overrides.window_background_opacity = 0.95
    else
        overrides.window_background_opacity = 0.75
    end
    window:set_config_overrides(overrides)
end)

-- 📑 TABS
config.hide_tab_bar_if_only_one_tab = true
config.tab_bar_at_bottom = false
config.use_fancy_tab_bar = true
config.tab_max_width = 32

-- 🔔 BELL
config.audible_bell = "Disabled"
config.visual_bell = {
    fade_in_duration_ms = 75,
    fade_out_duration_ms = 75,
    target = 'CursorColor',
}

-- ⚙️ GENERAL
config.automatically_reload_config = true
config.initial_cols = 180
config.initial_rows = 38
config.scrollback_lines = 10000
config.enable_scroll_bar = false

-- 📍 CURSOR
config.default_cursor_style = 'BlinkingBar'
config.cursor_blink_rate = 500
config.cursor_blink_ease_in = 'Constant'
config.cursor_blink_ease_out = 'Constant'

-- 🖱️ MOUSE
config.mouse_bindings = {
    -- Right click paste
    {
        event = { Down = { streak = 1, button = 'Right' } },
        mods = 'NONE',
        action = wezterm.action.PasteFrom 'Clipboard',
    },
}

-- ⌨️ KEYBINDINGS
config.keys = {
    -- Fullscreen toggle
    { key = 'n', mods = 'SHIFT|CTRL', action = wezterm.action.ToggleFullScreen },
    
    -- Tab management
    { key = 't', mods = 'CTRL|SHIFT', action = wezterm.action.SpawnTab 'CurrentPaneDomain' },
    { key = 'w', mods = 'CTRL|SHIFT', action = wezterm.action.CloseCurrentTab { confirm = true } },
    { key = 'Tab', mods = 'CTRL', action = wezterm.action.ActivateTabRelative(1) },
    { key = 'Tab', mods = 'CTRL|SHIFT', action = wezterm.action.ActivateTabRelative(-1) },
    
    -- Pane splitting
    { key = '|', mods = 'CTRL|SHIFT', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },
    { key = '_', mods = 'CTRL|SHIFT', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
    
    -- Pane navigation
    { key = 'h', mods = 'CTRL|SHIFT', action = wezterm.action.ActivatePaneDirection 'Left' },
    { key = 'l', mods = 'CTRL|SHIFT', action = wezterm.action.ActivatePaneDirection 'Right' },
    { key = 'k', mods = 'CTRL|SHIFT', action = wezterm.action.ActivatePaneDirection 'Up' },
    { key = 'j', mods = 'CTRL|SHIFT', action = wezterm.action.ActivatePaneDirection 'Down' },
    
    -- Font size
    { key = '+', mods = 'CTRL|SHIFT', action = wezterm.action.IncreaseFontSize },
    { key = '-', mods = 'CTRL', action = wezterm.action.DecreaseFontSize },
    { key = '0', mods = 'CTRL', action = wezterm.action.ResetFontSize },
}

return config
