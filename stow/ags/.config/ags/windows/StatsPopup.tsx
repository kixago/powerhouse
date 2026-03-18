import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import { createState, createEffect, With } from "ags";
import { createPoll } from "ags/time";
import { sh } from "../utils/helpers";

const [statsVisibleState, setStatsVisibleState] = createState(false);

export const statsVisible = statsVisibleState;
export const setStatsVisible = setStatsVisibleState;

/* ─────────────────────────────────────────────
   HEAT COLOR HELPERS
───────────────────────────────────────────── */

function heatColor(value: number): string {
  if (value > 85) return "#ff6464";
  if (value > 65) return "#ffc864";
  if (value > 40) return "#a6a6a6";
  return "#7aa2f7";
}

function heatGlow(value: number): string {
  if (value > 85) return "#ff646480";
  if (value > 65) return "#ffc86480";
  if (value > 40) return "#a6a6a640";
  return "#7aa2f780";
}

function knightRiderBar(value: number, maxWidth: number = 180): string {
  const color = heatColor(value);
  const glow = heatGlow(value);
  const width = Math.max((value / 100) * maxWidth, 2);

  return `
    background: linear-gradient(to right, ${color}00, ${color}, ${color}00);
    box-shadow: 0 0 8px ${glow}, 0 0 16px ${glow};
    min-width: ${width}px;
    min-height: 2px;
    border-radius: 1px;
  `;
}

/* ─────────────────────────────────────────────
   UPS COLOR HELPERS (inverted - low is bad)
───────────────────────────────────────────── */

function batteryColor(value: number): string {
  if (value < 20) return "#ff6464"; // critical
  if (value < 40) return "#ffc864"; // warning
  if (value < 60) return "#a6a6a6"; // ok
  return "#9ece6a"; // good (green)
}

function batteryGlow(value: number): string {
  if (value < 20) return "#ff646480";
  if (value < 40) return "#ffc86480";
  if (value < 60) return "#a6a6a640";
  return "#9ece6a80";
}

function loadColor(value: number): string {
  // For load, higher is worse (like heat)
  if (value > 80) return "#ff6464";
  if (value > 60) return "#ffc864";
  if (value > 40) return "#a6a6a6";
  return "#7aa2f7";
}

function loadGlow(value: number): string {
  if (value > 80) return "#ff646480";
  if (value > 60) return "#ffc86480";
  if (value > 40) return "#a6a6a640";
  return "#7aa2f780";
}

function knightRiderBarBattery(value: number, maxWidth: number = 180): string {
  const color = batteryColor(value);
  const glow = batteryGlow(value);
  const width = Math.max((value / 100) * maxWidth, 2);

  return `
    background: linear-gradient(to right, ${color}00, ${color}, ${color}00);
    box-shadow: 0 0 8px ${glow}, 0 0 16px ${glow};
    min-width: ${width}px;
    min-height: 2px;
    border-radius: 1px;
  `;
}

function knightRiderBarLoad(value: number, maxWidth: number = 180): string {
  const color = loadColor(value);
  const glow = loadGlow(value);
  const width = Math.max((value / 100) * maxWidth, 2);

  return `
    background: linear-gradient(to right, ${color}00, ${color}, ${color}00);
    box-shadow: 0 0 8px ${glow}, 0 0 16px ${glow};
    min-width: ${width}px;
    min-height: 2px;
    border-radius: 1px;
  `;
}

/* ─────────────────────────────────────────────
   UPS STATUS HELPERS
───────────────────────────────────────────── */

function upsIcon(status: string): string {
  if (status.includes("OB")) return "󰂃"; // on battery
  if (status.includes("LB")) return "󱉝"; // low battery
  if (status.includes("CHRG")) return "󰂄"; // charging
  if (status.includes("OL")) return "󰁹"; // online
  return "󰁹";
}

function upsStatusText(status: string): string {
  if (status.includes("LB")) return "Low Battery!";
  if (status.includes("OB")) return "On Battery";
  if (status.includes("CHRG")) return "Charging";
  if (status.includes("OL")) return "Online";
  return status;
}

function upsStatusColor(status: string): string {
  if (status.includes("LB")) return "#ff6464";
  if (status.includes("OB")) return "#ffc864";
  return "#9ece6a";
}

/* ─────────────────────────────────────────────
   CPU CORE LOGIC
───────────────────────────────────────────── */

const prevCore: Record<number, { idle: number; total: number }> = {};

async function getCorePercents(): Promise<number[]> {
  const stat = await sh("grep '^cpu[0-9]' /proc/stat", "");
  if (!stat) return [];

  const lines = stat.trim().split("\n");
  const usages: number[] = [];

  lines.forEach((line, i) => {
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    const idle = parts[3];
    const total = parts.reduce((a, b) => a + b, 0);

    if (!prevCore[i]) {
      prevCore[i] = { idle, total };
      usages.push(0);
      return;
    }

    const idleDiff = idle - prevCore[i].idle;
    const totalDiff = total - prevCore[i].total;

    prevCore[i] = { idle, total };

    if (totalDiff === 0) {
      usages.push(0);
      return;
    }

    const usage = 100 * (1 - idleDiff / totalDiff);
    usages.push(Math.round(usage));
  });

  return usages;
}

/* ─────────────────────────────────────────────
   RAM
───────────────────────────────────────────── */

async function getRam(): Promise<{
  percent: number;
  used: string;
  total: string;
}> {
  const raw = await sh(
    "awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {printf \"%d %d\", t, a}' /proc/meminfo",
    "",
  );

  if (!raw) return { percent: 0, used: "0", total: "0" };

  const [total, avail] = raw.split(" ").map(Number);
  const used = total - avail;
  const percent = Math.round((used / total) * 100);

  return {
    percent,
    used: `${(used / 1024 / 1024).toFixed(1)}`,
    total: `${(total / 1024 / 1024).toFixed(1)}`,
  };
}

/* ─────────────────────────────────────────────
   GPU (combined into single poll)
───────────────────────────────────────────── */

async function getGpuStats(): Promise<{ load: number; temp: number }> {
  const loadVal = await sh(
    "cat /sys/class/drm/card1/device/gpu_busy_percent 2>/dev/null",
    "0",
  );
  const tempVal = await sh(
    "cat /sys/class/drm/card1/device/hwmon/hwmon*/temp1_input 2>/dev/null | head -n1",
    "",
  );

  return {
    load: parseInt(loadVal.trim()) || 0,
    temp: tempVal ? Math.round(parseInt(tempVal.trim()) / 1000) : 0,
  };
}

/* ─────────────────────────────────────────────
   UPS
───────────────────────────────────────────── */

interface UpsData {
  status: string;
  load: number;
  charge: number;
  runtime: string;
  inputVoltage: string;
  outputVoltage: string;
}

async function getUpsStats(): Promise<UpsData> {
  const [status, load, charge, runtime, inputV, outputV] = await Promise.all([
    sh("upsc cyberpower@192.168.2.80 ups.status 2>/dev/null", "OL"),
    sh("upsc cyberpower@192.168.2.80 ups.load 2>/dev/null", "0"),
    sh("upsc cyberpower@192.168.2.80 battery.charge 2>/dev/null", "100"),
    sh("upsc cyberpower@192.168.2.80 battery.runtime 2>/dev/null", "0"),
    sh("upsc cyberpower@192.168.2.80 input.voltage 2>/dev/null", "0"),
    sh("upsc cyberpower@192.168.2.80 output.voltage 2>/dev/null", "0"),
  ]);

  const runtimeSec = parseInt(runtime.trim()) || 0;
  const runtimeMin = Math.floor(runtimeSec / 60);

  return {
    status: status.trim(),
    load: parseInt(load.trim()) || 0,
    charge: parseInt(charge.trim()) || 100,
    runtime: runtimeMin > 0 ? `${runtimeMin} min` : "──",
    inputVoltage: `${parseFloat(inputV.trim()).toFixed(0)}V`,
    outputVoltage: `${parseFloat(outputV.trim()).toFixed(0)}V`,
  };
}

/* ─────────────────────────────────────────────
   CORE ROW COMPONENT
───────────────────────────────────────────── */

function CoreRow({ index, value }: { index: number; value: number }) {
  return (
    <box class="core-cell-inline" spacing={8} valign={Gtk.Align.CENTER}>
      <label
        class="core-label-inline"
        label={`C${index}`}
        css="min-width: 24px;"
      />
      <box css={knightRiderBar(value, 60)} />
      <label
        class="core-value-inline"
        label={`${value}%`}
        css={`
          color: ${heatColor(value)};
          min-width: 32px;
        `}
      />
    </box>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export function StatsPopup({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const cores = createPoll<number[]>([], 2000, getCorePercents);
  const ram = createPoll({ percent: 0, used: "0", total: "0" }, 2000, getRam);
  const gpu = createPoll({ load: 0, temp: 0 }, 2000, getGpuStats);
  const ups = createPoll<UpsData>(
    {
      status: "OL",
      load: 0,
      charge: 100,
      runtime: "──",
      inputVoltage: "0V",
      outputVoltage: "0V",
    },
    10000,
    getUpsStats,
  );

  return (
    <window
      $={(self) => {
        createEffect(() => {
          self.visible = statsVisible();
        });
      }}
      visible={false}
      name="stats-popup"
      gdkmonitor={gdkmonitor}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      application={app}
      css="background: transparent;"
    >
      <box
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}
        css="margin-top: 52px; margin-right: 140px;"
      >
        <box
          class="stats-dropdown"
          orientation={Gtk.Orientation.VERTICAL}
          spacing={16}
        >
          {/* ───────── CPU SECTION ───────── */}
          <box
            class="cc-section"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
          >
            <label
              class="dropdown-section-title"
              label="CPU"
              halign={Gtk.Align.START}
            />

            <With value={cores}>
              {(list) => {
                const items = list ?? [];

                return (
                  <box spacing={12}>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                      <CoreRow index={0} value={items[0] ?? 0} />
                      <CoreRow index={1} value={items[1] ?? 0} />
                      <CoreRow index={2} value={items[2] ?? 0} />
                      <CoreRow index={3} value={items[3] ?? 0} />
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                      <CoreRow index={4} value={items[4] ?? 0} />
                      <CoreRow index={5} value={items[5] ?? 0} />
                      <CoreRow index={6} value={items[6] ?? 0} />
                      <CoreRow index={7} value={items[7] ?? 0} />
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                      <CoreRow index={8} value={items[8] ?? 0} />
                      <CoreRow index={9} value={items[9] ?? 0} />
                      <CoreRow index={10} value={items[10] ?? 0} />
                      <CoreRow index={11} value={items[11] ?? 0} />
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                      <CoreRow index={12} value={items[12] ?? 0} />
                      <CoreRow index={13} value={items[13] ?? 0} />
                      <CoreRow index={14} value={items[14] ?? 0} />
                      <CoreRow index={15} value={items[15] ?? 0} />
                    </box>
                  </box>
                );
              }}
            </With>
          </box>

          {/* ───────── GPU SECTION ───────── */}
          <box
            class="cc-section"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
          >
            <label
              class="dropdown-section-title"
              label="GPU"
              halign={Gtk.Align.START}
            />

            <With value={gpu}>
              {(g) => (
                <box
                  orientation={Gtk.Orientation.HORIZONTAL}
                  spacing={16}
                  valign={Gtk.Align.CENTER}
                >
                  <box spacing={8} valign={Gtk.Align.CENTER}>
                    <label class="stat-inline-label" label="Load" />
                    <box css={knightRiderBar(g.load, 100)} />
                    <label
                      class="stat-inline-value"
                      label={`${g.load}%`}
                      css={`
                        color: ${heatColor(g.load)};
                      `}
                    />
                  </box>

                  <label class="stat-inline-sep" label="│" />

                  <box spacing={8} valign={Gtk.Align.CENTER}>
                    <label class="stat-inline-label" label="Temp" />
                    <box css={knightRiderBar(g.temp, 60)} />
                    <label
                      class="stat-inline-value"
                      label={`${g.temp}°C`}
                      css={`
                        color: ${heatColor(g.temp)};
                      `}
                    />
                  </box>
                </box>
              )}
            </With>
          </box>

          {/* ───────── MEMORY SECTION ───────── */}
          <box
            class="cc-section"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
          >
            <label
              class="dropdown-section-title"
              label="Memory"
              halign={Gtk.Align.START}
            />

            <With value={ram}>
              {(r) => (
                <box
                  orientation={Gtk.Orientation.HORIZONTAL}
                  spacing={8}
                  valign={Gtk.Align.CENTER}
                >
                  <label class="stat-inline-label" label="RAM" />
                  <box css={knightRiderBar(r.percent, 140)} />
                  <label
                    class="stat-inline-value"
                    label={`${r.used} / ${r.total} GB`}
                    css={`
                      color: ${heatColor(r.percent)};
                    `}
                  />
                  <label
                    class="stat-inline-pct"
                    label={`(${r.percent}%)`}
                    css={`
                      color: ${heatColor(r.percent)};
                      opacity: 0.6;
                    `}
                  />
                </box>
              )}
            </With>
          </box>

          {/* ───────── UPS SECTION ───────── */}
          <box
            class="cc-section"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
          >
            <label
              class="dropdown-section-title"
              label="UPS"
              halign={Gtk.Align.START}
            />

            <With value={ups}>
              {(u) => (
                <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                  {/* Status Row */}
                  <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={12}
                    valign={Gtk.Align.CENTER}
                  >
                    <label
                      class="ups-status-icon"
                      label={upsIcon(u.status)}
                      css={`
                        color: ${upsStatusColor(u.status)};
                        font-size: 20px;
                      `}
                    />
                    <label
                      class="ups-status-text"
                      label={upsStatusText(u.status)}
                      css={`
                        color: ${upsStatusColor(u.status)};
                        font-weight: 600;
                      `}
                    />
                    <box hexpand />
                    <label
                      class="stat-inline-value"
                      label={u.runtime}
                      css="opacity: 0.7;"
                    />
                  </box>

                  {/* Battery & Load Row */}
                  <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={16}
                    valign={Gtk.Align.CENTER}
                  >
                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <label class="stat-inline-label" label="Charge" />
                      <box css={knightRiderBarBattery(u.charge, 80)} />
                      <label
                        class="stat-inline-value"
                        label={`${u.charge}%`}
                        css={`
                          color: ${batteryColor(u.charge)};
                        `}
                      />
                    </box>

                    <label class="stat-inline-sep" label="│" />

                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <label class="stat-inline-label" label="Load" />
                      <box css={knightRiderBarLoad(u.load, 80)} />
                      <label
                        class="stat-inline-value"
                        label={`${u.load}%`}
                        css={`
                          color: ${loadColor(u.load)};
                        `}
                      />
                    </box>
                  </box>

                  {/* Voltage Row */}
                  <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={16}
                    valign={Gtk.Align.CENTER}
                  >
                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <label
                        class="stat-inline-label"
                        label="In"
                        css="min-width: 20px;"
                      />
                      <label
                        class="stat-inline-value"
                        label={u.inputVoltage}
                        css="color: #7aa2f7;"
                      />
                    </box>

                    <label class="stat-inline-sep" label="│" />

                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <label
                        class="stat-inline-label"
                        label="Out"
                        css="min-width: 24px;"
                      />
                      <label
                        class="stat-inline-value"
                        label={u.outputVoltage}
                        css="color: #7aa2f7;"
                      />
                    </box>
                  </box>
                </box>
              )}
            </With>
          </box>
        </box>
      </box>
    </window>
  );
}
