import { createPoll, interval } from "ags/time";
import { createState } from "ags";
import { sh } from "../utils/helpers";
import { statsVisible, setStatsVisible } from "../windows/StatsPopup.tsx";

/* ─────────────────────────────────────────────
   CPU TOTAL USAGE (accurate /proc/stat method)
───────────────────────────────────────────── */

let prevIdle = 0;
let prevTotal = 0;

async function getCpuPercent(): Promise<string> {
  const stat = await sh("grep '^cpu ' /proc/stat", "");
  if (!stat) return "0%";

  const parts = stat.trim().split(/\s+/).slice(1).map(Number);
  const idle = parts[3];
  const total = parts.reduce((a, b) => a + b, 0);

  const idleDiff = idle - prevIdle;
  const totalDiff = total - prevTotal;

  prevIdle = idle;
  prevTotal = total;

  if (totalDiff === 0) return "0%";

  const usage = 100 * (1 - idleDiff / totalDiff);
  return `${Math.round(usage)}%`;
}

/* ─────────────────────────────────────────────
   RAM USAGE
───────────────────────────────────────────── */

async function getRamPercent(): Promise<string> {
  const val = await sh(
    "awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {printf \"%.0f\", (1-a/t)*100}' /proc/meminfo",
    "0",
  );
  return `${val}%`;
}

/* ─────────────────────────────────────────────
   CPU TEMP (k10temp - hwmon1)
───────────────────────────────────────────── */

async function getCpuTemp(): Promise<string> {
  const val = await sh(
    "cat $(grep -l k10temp /sys/class/hwmon/hwmon*/name 2>/dev/null | head -1 | xargs dirname)/temp1_input 2>/dev/null",
    "",
  );
  if (!val) return "──°";
  const temp = parseInt(val.trim());
  return isNaN(temp) ? "──°" : `${Math.round(temp / 1000)}°`;
}

/* ─────────────────────────────────────────────
   GPU USAGE (Radeon 680M - card1)
───────────────────────────────────────────── */

async function getGpuPercent(): Promise<string> {
  const val = await sh(
    "cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null | head -1",
    "0",
  );
  return `${val.trim()}%`;
}

/* ─────────────────────────────────────────────
   GPU TEMP (amdgpu - hwmon2)
───────────────────────────────────────────── */

async function getGpuTemp(): Promise<string> {
  const val = await sh(
    "cat $(grep -l amdgpu /sys/class/hwmon/hwmon*/name 2>/dev/null | head -1 | xargs dirname)/temp1_input 2>/dev/null",
    "",
  );
  if (!val) return "──°";
  const temp = parseInt(val.trim());
  return isNaN(temp) ? "──°" : `${Math.round(temp / 1000)}°`;
}

/* ─────────────────────────────────────────────
   HEAT COLOR HELPER (using hex for GTK CSS)
───────────────────────────────────────────── */

function heatColor(value: number): string {
  if (value > 85) return "#ff6464"; // hot red
  if (value > 65) return "#ffc864"; // warm gold
  if (value > 40) return "#a6a6a6"; // mild gray
  return "#7aa2f7"; // cool blue
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export function SystemStats() {
  // Polls for percentages (these work fine with createPoll)
  const cpu = createPoll("0%", 2000, getCpuPercent);
  const ram = createPoll("0%", 2000, getRamPercent);
  const gpu = createPoll("0%", 2000, getGpuPercent);

  // Manual state for temps (more reliable)
  const [cpuTemp, setCpuTemp] = createState("──°");
  const [gpuTemp, setGpuTemp] = createState("──°");

  // Update temps
  const updateTemps = async () => {
    const ct = await getCpuTemp();
    const gt = await getGpuTemp();
    console.log("Temps - CPU:", ct, "GPU:", gt);
    setCpuTemp(ct);
    setGpuTemp(gt);
  };

  // Initial fetch + interval
  updateTemps();
  interval(5000, updateTemps);

  return (
    <button
      class="stats-button"
      onClicked={() => setStatsVisible(!statsVisible())}
    >
      <box>
        <label class="stat-label" label="CPU" />
        <label class="stat-value" label={cpu} />
        <label
          class="stat-temp"
          label={cpuTemp((t) => t)}
          css={cpuTemp((t) => `color: ${heatColor(parseInt(t) || 0)};`)}
        />

        <label class="stat-separator" label="│" />

        <label class="stat-label" label="RAM" />
        <label class="stat-value" label={ram} />

        <label class="stat-separator" label="│" />

        <label class="stat-label" label="GPU" />
        <label class="stat-value" label={gpu} />
        <label
          class="stat-temp"
          label={gpuTemp((t) => t)}
          css={gpuTemp((t) => `color: ${heatColor(parseInt(t) || 0)};`)}
        />
      </box>
    </button>
  );
}
