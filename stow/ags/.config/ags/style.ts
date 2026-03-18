// ── Design Tokens ────────────────────────────────────────────────────────────

export const colors = {
  // Primary accent colors (solid)
  accent: "#7aa2f7",
  blue: "#7aa2f7",
  purple: "#bb9af7",

  // Primary accent colors (with alpha - using rgba)
  accentSoft: "rgba(122, 162, 247, 0.22)",
  accentGlow: "rgba(122, 162, 247, 0.45)",
  accentHalf: "rgba(122, 162, 247, 0.50)",

  // White scale
  white: "rgba(255, 255, 255, 0.92)",
  whiteSoft: "rgba(255, 255, 255, 0.65)",
  whiteDim: "rgba(255, 255, 255, 0.45)",
  whiteFaint: "rgba(255, 255, 255, 0.18)",
  whitePure: "#ffffff",

  // Status colors (solid for icons/text)
  gold: "#ffc864",
  red: "#ff6464",
  green: "#9ece6a",
  freezing: "#78beff",

  // Status colors (with alpha)
  goldAlpha: "rgba(255, 200, 100, 0.95)",
  redAlpha: "rgba(255, 100, 100, 0.95)",
  greenAlpha: "rgba(158, 206, 106, 0.95)",
  freezingAlpha: "rgba(120, 190, 255, 0.95)",

  // Glass backgrounds
  glassTop: "rgba(28, 40, 38, 0.35)",
  glassBottom: "rgba(18, 28, 26, 0.35)",
  glassLightTop: "rgba(255, 255, 255, 0.05)",
  glassLightBottom: "rgba(255, 255, 255, 0.02)",

  // Dark backgrounds
  darkBg: "rgba(20, 35, 30, 0.92)",
  darkBgAlt: "rgba(45, 25, 30, 0.92)",

  // Common utility colors
  transparent: "transparent",
  black45: "rgba(0, 0, 0, 0.45)",
  black65: "rgba(0, 0, 0, 0.65)",

  // Border colors
  borderLight: "rgba(255, 255, 255, 0.07)",
  borderAccent: "rgba(122, 162, 247, 0.20)",
  borderRed: "rgba(255, 100, 100, 0.70)",

  // Overlay/interaction colors
  overlay4: "rgba(255, 255, 255, 0.04)",
  overlay5: "rgba(255, 255, 255, 0.05)",
  overlay6: "rgba(255, 255, 255, 0.06)",
  overlay8: "rgba(255, 255, 255, 0.08)",
  overlay10: "rgba(255, 255, 255, 0.10)",
  overlay12: "rgba(255, 255, 255, 0.12)",
  overlay15: "rgba(122, 162, 247, 0.15)",
  overlay20: "rgba(122, 162, 247, 0.20)",
  overlay25: "rgba(255, 100, 100, 0.25)",
  overlay30: "rgba(122, 162, 247, 0.30)",

  // Text shadows
  shadowRed: "rgba(255, 100, 100, 0.60)",
  shadowBlue: "rgba(122, 162, 247, 0.60)",
  shadowGold: "rgba(255, 200, 100, 0.50)",
  shadowFreezing: "rgba(120, 190, 255, 0.50)",

  // Slider gradient colors (for highlight gradients)
  accentDim: "rgba(122, 162, 247, 0.50)",
  greenDim: "rgba(158, 206, 106, 0.50)",
  purpleDim: "rgba(187, 154, 247, 0.50)",
  redDim: "rgba(255, 100, 100, 0.50)",
};

export const radius = {
  xl: "22px",
  lg: "18px",
  md: "14px",
  sm: "10px",
  xs: "8px",
  xxs: "6px",
  round: "50%",
};

export const font = {
  family: '"CaskaydiaCove Nerd Font", "JetBrainsMono Nerd Font", monospace',
  familyReadable:
    '"Atkinson Hyperlegible", "Inter", "SF Pro Display", sans-serif',
  sm: "10px",
  md: "11px",
  base: "12px",
  lg: "13px",
  xl: "14px",
  xxl: "15px",
  icon: "13px",
  iconLg: "14px",
  iconXl: "16px",
  iconXxl: "18px",
};

export const spacing = {
  barMargin: "6px 12px",
  pillPadding: "4px 8px",
  btnPadding: "2px 8px",
};

export const shadow = {
  sm: `0 4px 14px ${colors.black45}`,
  md: `0 8px 28px ${colors.black45}`,
  lg: `0 20px 55px ${colors.black65}`,
  xl: `0 18px 48px ${colors.black65}`,
  insetLight: `inset 0 1px 0 ${colors.overlay5}`,
  insetLightAlt: `inset 0 1px 0 ${colors.overlay6}`,
};

export const transition = {
  fast: "120ms ease",
  normal: "200ms ease",
  slow: "400ms ease",
  smooth: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
};

// ── CSS ───────────────────────────────────────────────────────────────────────

export const css = `
* {
  font-family: ${font.family};
}

/* ════════════════════════════════════════════════════════════════
   BAR FOUNDATION
   ════════════════════════════════════════════════════════════════ */

window#bar {
  background: ${colors.transparent};
}

.bar-container,
.section-left {
  background: ${colors.transparent};
}

.section {
  background: ${colors.transparent};
  border-radius: ${radius.md};
  padding: 4px 8px;
}

.section-center-group,
.section-right {
  background: linear-gradient(to bottom, ${colors.glassTop}, ${colors.glassBottom});
  border-radius: 0 0 ${radius.lg} ${radius.lg};
  padding: 6px 16px 10px 16px;
  margin-top: -6px;
  border: 1px solid ${colors.overlay6};
  box-shadow: ${shadow.md}, ${shadow.insetLight};
}

.section-center {
  margin-right: 8px;
}

.section-weather {
  padding: 4px 12px;
}

/* ── Bar Buttons ── */

.section-left button,
.section-right button,
.section-center button,
.section-weather button {
  background: ${colors.transparent};
  padding: ${spacing.btnPadding};
  border-radius: ${radius.sm};
  transition: background ${transition.fast}, transform ${transition.fast}, box-shadow ${transition.fast};
}

.section-left button:hover,
.section-right button:hover,
.section-center button:hover,
.section-weather button:hover {
  background: ${colors.accentSoft};
  transform: translateY(-1px);
  box-shadow: ${shadow.sm};
}

/* ── Clock ── */

.clock {
  font-size: ${font.base};
  color: ${colors.white};
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* ════════════════════════════════════════════════════════════════
   WEATHER
   ════════════════════════════════════════════════════════════════ */

.weather-icon {
  font-size: ${font.iconLg};
  color: ${colors.accent};
  margin-right: 6px;
  transition: color ${transition.normal}, text-shadow ${transition.normal};
}

.weather-temp {
  font-size: ${font.base};
  font-weight: 600;
  color: ${colors.white};
  letter-spacing: 0.2px;
}

.weather-hot {
  color: ${colors.red};
  text-shadow: 0 0 6px ${colors.shadowRed};
}

.weather-cold {
  color: ${colors.accent};
  text-shadow: 0 0 6px ${colors.shadowBlue};
}

/* ════════════════════════════════════════════════════════════════
   SYSTEM STATS (BAR)
   ════════════════════════════════════════════════════════════════ */

.stat-icon {
  font-size: ${font.icon};
  color: ${colors.accent};
  margin-right: 4px;
}

.stat-label {
  font-size: ${font.sm};
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${colors.whiteDim};
  margin-right: 4px;
}

.stat-detail-label {
  font-size: ${font.base};
  color: ${colors.whiteDim};
}

.stat-detail-value {
  font-size: ${font.base};
  font-weight: 600;
  color: ${colors.white};
}

.stat-value {
  font-size: ${font.md};
  font-weight: 700;
  color: ${colors.white};
  min-width: 30px;
}

.stat-temp {
  font-size: ${font.sm};
  font-weight: 600;
  margin-left: 4px;
  margin-right: 6px;
  transition: color ${transition.normal}, text-shadow ${transition.normal};
}

.stat-separator {
  color: ${colors.whiteFaint};
  margin: 0 6px;
  opacity: 0.6;
}

/* ── Heat Scaling ── */

.temp-freezing {
  color: ${colors.freezing};
  text-shadow: 0 0 6px ${colors.shadowFreezing};
}

.temp-cold {
  color: ${colors.accent};
}

.temp-mild {
  color: ${colors.whiteSoft};
}

.temp-warm {
  color: ${colors.gold};
  text-shadow: 0 0 6px ${colors.shadowGold};
}

.temp-hot {
  color: ${colors.red};
  text-shadow: 0 0 8px ${colors.shadowRed};
}

.heat-cool  { color: ${colors.accent}; }
.heat-mild  { color: ${colors.whiteSoft}; }
.heat-warm  { color: ${colors.gold}; }
.heat-hot   { color: ${colors.red}; }

/* ════════════════════════════════════════════════════════════════
   SYSTEM TRAY
   ════════════════════════════════════════════════════════════════ */

.system-tray {
  background: ${colors.transparent};
  margin: 0 4px;
}

.tray-item {
  background: ${colors.transparent};
  padding: 4px;
  border-radius: ${radius.xs};
  min-width: 24px;
  min-height: 24px;
}

.tray-item:hover {
  background: ${colors.overlay10};
}

.tray-item image {
  -gtk-icon-style: symbolic;
}

.tray-item popover {
  background: ${colors.darkBg};
  border: 1px solid ${colors.overlay30};
  border-radius: ${radius.md};
}

.tray-item popover modelbutton {
  padding: 8px 12px;
  border-radius: ${radius.xs};
}

.tray-item popover modelbutton:hover {
  background: ${colors.overlay20};
}

/* ════════════════════════════════════════════════════════════════
   VOLUME
   ════════════════════════════════════════════════════════════════ */

.icon {
  font-size: ${font.iconLg};
  color: ${colors.blue};
}

.volume-value {
  font-size: ${font.md};
  color: ${colors.white};
  margin-left: 6px;
  min-width: 28px;
}

/* ── Volume Sliders ── */

.volume-slider {
  min-height: 32px;
  margin: 4px 0;
}

.volume-slider trough {
  background: ${colors.overlay12};
  border-radius: ${radius.xs};
  min-height: 14px;
  min-width: 200px;
}

.volume-slider highlight {
  border-radius: ${radius.xs};
  min-height: 14px;
}

.volume-slider slider {
  background: linear-gradient(to bottom, ${colors.whitePure}, #e8e8e8);
  border-radius: ${radius.round};
  min-width: 24px;
  min-height: 24px;
  margin: -5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);
}

.volume-slider slider:hover {
  background: linear-gradient(to bottom, ${colors.whitePure}, #f0f0f0);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.50);
}

.volume-slider slider:active {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.50);
}

/* Blue slider (output) */
.volume-slider-blue highlight {
  background: linear-gradient(to right, ${colors.accentDim}, ${colors.accent});
}

.volume-slider-blue slider {
  border: 2px solid ${colors.accent};
}

.volume-slider-blue slider:hover {
  background: ${colors.accent};
  border-color: ${colors.whitePure};
}

/* Green slider (input) */
.volume-slider-green highlight {
  background: linear-gradient(to right, ${colors.greenDim}, ${colors.green});
}

.volume-slider-green slider {
  border: 2px solid ${colors.green};
}

.volume-slider-green slider:hover {
  background: ${colors.green};
  border-color: ${colors.whitePure};
}

/* Purple slider (streams) */
.volume-slider-purple highlight {
  background: linear-gradient(to right, ${colors.purpleDim}, ${colors.purple});
}

.volume-slider-purple slider {
  border: 2px solid ${colors.purple};
}

.volume-slider-purple slider:hover {
  background: ${colors.purple};
  border-color: ${colors.whitePure};
}

/* Muted slider */
.volume-slider-muted highlight {
  background: linear-gradient(to right, ${colors.redDim}, ${colors.red});
}

.volume-slider-muted slider {
  border: 2px solid ${colors.red};
}

.volume-slider-muted slider:hover {
  background: ${colors.red};
  border-color: ${colors.whitePure};
}

/* Stream sliders (smaller) */
.stream-slider {
  min-height: 24px;
}

.stream-slider trough {
  background: ${colors.overlay10};
  border-radius: ${radius.xxs};
  min-height: 10px;
}

.stream-slider highlight {
  border-radius: ${radius.xxs};
  min-height: 10px;
}

.stream-slider slider {
  min-width: 18px;
  min-height: 18px;
  margin: -4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.31);
}

.stream-slider slider:hover {
  background: ${colors.whitePure};
}

/* ════════════════════════════════════════════════════════════════
   NETWORK
   ════════════════════════════════════════════════════════════════ */

.network-button {
  margin-right: 4px;
}

/* ════════════════════════════════════════════════════════════════
   NIGHT LIGHT
   ════════════════════════════════════════════════════════════════ */

.nightlight-button {
  margin-right: 4px;
}

/* ════════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ════════════════════════════════════════════════════════════════ */

.notifications-container {
  background: ${colors.transparent};
}

.notification {
  background: ${colors.darkBg};
  border-radius: ${radius.md};
  padding: 14px;
  min-width: 320px;
  border: 1px solid ${colors.borderAccent};
}

.notification-critical {
  border: 2px solid ${colors.borderRed};
  background: ${colors.darkBgAlt};
}

.notif-header,
.notif-header-bar,
.notif-actions {
  background: ${colors.transparent};
}

.notif-header-title {
  font-size: ${font.base};
  font-weight: 600;
  color: ${colors.whiteSoft};
}

.notif-clear-all {
  background: ${colors.overlay15};
  border-radius: ${radius.xxs};
  padding: 4px 8px;
  font-size: ${font.sm};
  color: ${colors.red};
}

.notif-clear-all:hover {
  background: ${colors.overlay25};
}

.notif-app-icon {
  margin-right: 8px;
  opacity: 0.8;
}

.notif-summary {
  font-family: ${font.familyReadable};
  font-size: ${font.xl};
  font-weight: 700;
  color: ${colors.white};
  letter-spacing: 0.2px;
}

.notif-body {
  font-family: ${font.familyReadable};
  font-size: ${font.lg};
  font-weight: 400;
  color: ${colors.whiteSoft};
  margin-top: 8px;
  line-height: 1.5;
}

.notif-close {
  background: ${colors.overlay5};
  border-radius: ${radius.xxs};
  padding: 2px 8px;
  color: ${colors.whiteDim};
  font-size: ${font.base};
}

.notif-close:hover {
  background: ${colors.overlay25};
  color: ${colors.white};
}

.notif-progress-container {
  background: ${colors.overlay8};
  border-radius: 2px;
  min-height: 3px;
  margin: 8px 0;
}

.notif-progress-spacer {
  background: ${colors.transparent};
  min-height: 3px;
}

.notif-progress-bar {
  background: linear-gradient(to right, ${colors.accentSoft}, ${colors.accent}, ${colors.accent}, ${colors.accentSoft});
  border-radius: 2px;
  min-height: 3px;
  transition: min-width 50ms linear;
}

.notif-action-btn {
  background: ${colors.overlay15};
  border-radius: ${radius.xs};
  padding: 6px 12px;
  color: ${colors.accent};
  font-size: ${font.md};
  font-weight: 500;
}

.notif-action-btn:hover {
  background: ${colors.overlay30};
}

/* ════════════════════════════════════════════════════════════════
   CONTROL CENTER
   ════════════════════════════════════════════════════════════════ */

.cc-root {
  min-width: 900px;
  background: linear-gradient(to bottom, ${colors.glassTop}, ${colors.glassBottom});
  border-radius: ${radius.xl};
  padding: 24px;
  border: 1px solid ${colors.overlay8};
  box-shadow: ${shadow.lg}, ${shadow.insetLightAlt};
  transition: opacity ${transition.slow}, transform ${transition.smooth};
}

.cc-section {
  background: linear-gradient(to bottom, ${colors.glassLightTop}, ${colors.glassLightBottom});
  border-radius: ${radius.lg};
  border: 1px solid ${colors.borderLight};
  padding: 20px;
  margin: 10px;
  box-shadow: ${shadow.insetLight};
  transition: background ${transition.normal}, transform ${transition.normal};
}

.cc-section:hover {
  background: linear-gradient(to bottom, ${colors.overlay6}, ${colors.glassLightBottom});
  transform: translateY(-1px);
}

.cc-section-title {
  font-size: ${font.sm};
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${colors.whiteDim};
  margin-bottom: 14px;
  opacity: 0.8;
}

.cc-loading {
  color: ${colors.whiteDim};
  font-size: ${font.base};
  font-weight: 500;
  opacity: 0.7;
}

.cc-top-row,
.cc-bottom-row {
  background: ${colors.transparent};
}

/* ── Calendar ── */

.cc-calendar {
  min-width: 300px;
}

.cal-header {
  background: ${colors.transparent};
  margin-bottom: 8px;
}

.cal-month-label {
  font-size: ${font.xl};
  font-weight: 600;
  color: ${colors.white};
}

.cal-nav-btn {
  background: ${colors.overlay6};
  border-radius: ${radius.xs};
  padding: 2px 10px;
  color: ${colors.whiteSoft};
  font-size: ${font.iconXl};
}

.cal-nav-btn:hover {
  background: ${colors.overlay20};
  color: ${colors.accent};
}

.cal-dow-row {
  background: ${colors.transparent};
  margin-bottom: 4px;
}

.cal-dow {
  font-size: ${font.sm};
  font-weight: 600;
  color: ${colors.whiteFaint};
  letter-spacing: 0.5px;
}

.cal-row {
  background: ${colors.transparent};
}

.cal-day {
  font-size: ${font.base};
  color: ${colors.whiteSoft};
  padding: 4px 0;
  border-radius: ${radius.xs};
  min-width: 32px;
}

.cal-empty {
  color: ${colors.transparent};
}

.cal-today {
  background: ${colors.overlay30};
  color: ${colors.accent};
  font-weight: 700;
}

/* ── Weather Control Center ── */

.weather-current {
  background: ${colors.transparent};
  margin-bottom: 12px;
}

.weather-big-icon {
  font-size: 52px;
  color: ${colors.accent};
  margin-right: 16px;
}

.weather-big-temp {
  font-size: 36px;
  font-weight: 700;
  color: ${colors.white};
}

.weather-big-desc {
  font-size: ${font.lg};
  color: ${colors.whiteDim};
  margin-top: 2px;
}

.weather-details {
  background: ${colors.glassLightBottom};
  border-radius: ${radius.sm};
  padding: 10px 0;
  margin-bottom: 14px;
}

.weather-detail-item {
  padding: 0 8px;
}

.detail-icon {
  font-size: ${font.iconXxl};
  color: ${colors.accent};
  margin-bottom: 4px;
}

.detail-val {
  font-size: ${font.lg};
  font-weight: 600;
  color: ${colors.white};
}

.detail-lbl {
  font-size: ${font.sm};
  color: ${colors.whiteDim};
  margin-top: 2px;
}

.weather-forecast {
  background: ${colors.transparent};
}

.forecast-day {
  padding: 8px 4px;
  border-radius: ${radius.sm};
}

.forecast-day:hover {
  background: ${colors.overlay5};
}

.forecast-dow {
  font-size: ${font.md};
  font-weight: 600;
  color: ${colors.whiteDim};
  margin-bottom: 4px;
}

.forecast-icon {
  font-size: 20px;
  color: ${colors.accent};
  margin-bottom: 4px;
}

.forecast-hi {
  font-size: ${font.lg};
  font-weight: 600;
  color: ${colors.white};
}

.forecast-lo {
  font-size: ${font.md};
  color: ${colors.whiteDim};
  margin-top: 1px;
}

/* ── UPS ── */

.cc-ups {
  min-width: 860px;
}

.cc-ups-row {
  background: ${colors.transparent};
}

.ups-status-row {
  background: ${colors.transparent};
  margin-bottom: 12px;
}

.ups-status-label {
  font-size: ${font.xxl};
  font-weight: 600;
  color: ${colors.green};
}

.ups-charge-big {
  font-size: ${font.xxl};
  font-weight: 700;
  color: ${colors.white};
}

.ups-grid {
  background: ${colors.glassLightBottom};
  border-radius: ${radius.sm};
  padding: 10px 0;
}

.ups-stat {
  padding: 0 12px;
  border-right: 1px solid ${colors.overlay6};
}

.ups-stat-val {
  font-size: ${font.xl};
  font-weight: 700;
  color: ${colors.accent};
  margin-bottom: 2px;
}

.ups-stat-lbl {
  font-size: ${font.sm};
  color: ${colors.whiteDim};
  letter-spacing: 0.5px;
}

/* ═══════════════════════════════════════════════════════════════
   STATS POPUP
   ═══════════════════════════════════════════════════════════════ */

.stats-dropdown {
  min-width: 420px;
  padding: 20px;
  background: linear-gradient(to bottom, ${colors.glassTop}, ${colors.glassBottom});
  border-radius: ${radius.lg};
  border: 1px solid ${colors.overlay8};
  box-shadow: ${shadow.xl}, ${shadow.insetLightAlt};
}

.stats-dropdown .cc-section {
  background: linear-gradient(to bottom, ${colors.overlay5}, ${colors.glassLightBottom});
  border-radius: ${radius.md};
  padding: 14px;
}

.stats-dropdown .dropdown-section-title,
.stats-dropdown .core-label {
  color: ${colors.whiteDim};
}

.dropdown-title,
.dropdown-section-title {
  font-size: ${font.md};
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colors.whiteDim};
  margin-bottom: 10px;
}

.dropdown-section-title {
  font-size: ${font.sm};
  letter-spacing: 1.2px;
  margin-bottom: 8px;
}

.core-cell {
  padding: 6px 10px;
  border-radius: ${radius.xs};
  background: ${colors.overlay6};
  transition: background 150ms ease, transform 150ms ease;
}

.core-cell:hover {
  background: ${colors.overlay15};
  transform: translateY(-1px);
}

.core-cell-inline {
  padding: 4px 6px;
  border-radius: ${radius.xxs};
  background: ${colors.overlay4};
}

.core-cell-inline:hover {
  background: ${colors.overlay8};
}

.core-label,
.core-label-inline {
  font-size: ${font.sm};
  font-weight: 600;
  color: ${colors.whiteDim};
  letter-spacing: 0.3px;
}

.core-value,
.core-value-inline {
  font-size: ${font.md};
  font-weight: 700;
}

.stat-inline-label {
  font-size: ${font.md};
  font-weight: 600;
  color: ${colors.whiteDim};
  min-width: 36px;
}

.stat-inline-value {
  font-size: ${font.base};
  font-weight: 700;
  min-width: 48px;
}

.stat-inline-pct {
  font-size: ${font.sm};
  font-weight: 500;
}

.stat-inline-sep {
  color: ${colors.whiteFaint};
  font-size: ${font.sm};
}

/* ═══════════════════════════════════════════════════════════════
   GTK SCALE & PROGRESS FIXES
   ═══════════════════════════════════════════════════════════════ */

scale {
  min-height: 32px;
  min-width: 100px;
  padding: 4px;
}

scale trough {
  background: ${colors.overlay8};
  border-radius: ${radius.xs};
  min-height: 8px;
  min-width: 8px;
}

scale trough highlight {
  background: linear-gradient(to right, ${colors.accentSoft}, ${colors.accent});
  border-radius: ${radius.xs};
  min-height: 8px;
  min-width: 8px;
}

scale slider {
  background: ${colors.whitePure};
  border-radius: ${radius.round};
  min-width: 20px;
  min-height: 20px;
  margin: 0px;
}

scale slider:hover {
  background: ${colors.accent};
}

scale fill,
progressbar,
progressbar trough,
progressbar progress,
levelbar,
levelbar trough,
levelbar block,
levelbar block.filled,
levelbar block.empty {
  min-width: 8px;
  min-height: 8px;
}

scale,
scale trough,
scale highlight,
scale fill,
scale slider {
  min-width: 8px;
  min-height: 8px;
}

/* Progress bar minimum sizes */
.notif-progress-container,
.notif-progress-bar,
.notif-progress-spacer {
  min-width: 0px;
  min-height: 3px;
}
`;
