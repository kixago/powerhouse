// widgets/NightLight.tsx
import { Gtk } from "ags/gtk4";
import { createState, onCleanup, With } from "ags";
import Gio from "gi://Gio";
import { weather } from "../utils/weather";

/* ──────────────────────────────────────────────────────────────
   Constants
──────────────────────────────────────────────────────────────── */

const DAY_TEMP = 6500;
const DAY_TEMP_OVERCAST = 5500;
const NIGHT_TEMP = 3500;
const TRANSITION_MINS = 60;

// WMO codes that warrant a slightly warmer daytime temperature
const OVERCAST_CODES = new Set([
  2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81,
  82, 85, 86, 95, 96, 99,
]);

/* ──────────────────────────────────────────────────────────────
   State Shape
──────────────────────────────────────────────────────────────── */

interface NightLightState {
  enabled: boolean;
  manualOverride: boolean;
  currentTemp: number;
}

/* ──────────────────────────────────────────────────────────────
   Widget
──────────────────────────────────────────────────────────────── */

export function NightLight() {
  const [state, setState] = createState<NightLightState>({
    enabled: false,
    manualOverride: false,
    currentTemp: DAY_TEMP,
  });

  let manualOverrideTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Process Management ────────────────────────────────────────

  function killHyprsunset(): void {
    try {
      Gio.Subprocess.new(
        ["pkill", "-x", "hyprsunset"],
        Gio.SubprocessFlags.NONE,
      );
    } catch {
      /* may not be running */
    }
  }

  function applyTemperature(temp: number): void {
    const rounded = Math.round(temp);
    killHyprsunset();

    if (rounded >= DAY_TEMP) {
      setState({ ...state(), currentTemp: DAY_TEMP, enabled: false });
      console.log("[NightLight] Disabled (daytime)");
      return;
    }

    setTimeout(() => {
      try {
        Gio.Subprocess.new(
          ["bash", "-c", `nohup hyprsunset -t ${rounded} > /dev/null 2>&1 &`],
          Gio.SubprocessFlags.NONE,
        );
        setState({ ...state(), currentTemp: rounded, enabled: true });
        console.log(`[NightLight] Enabled at ${rounded}K`);
      } catch (e) {
        console.error("[NightLight] Failed to start hyprsunset:", e);
      }
    }, 200);
  }

  // ── Temperature Calculation ───────────────────────────────────

  function calculateTargetTemp(): number {
    const now = new Date();
    const timeDecimal = now.getHours() + now.getMinutes() / 60;
    const w = weather();
    const transHours = TRANSITION_MINS / 60;

    // Use a slightly warmer base on overcast/rainy/snowy days
    const dayBase =
      w?.weatherCode && OVERCAST_CODES.has(w.weatherCode)
        ? DAY_TEMP_OVERCAST
        : DAY_TEMP;

    if (w?.sunrise && w?.sunset) {
      const sunriseH = (() => {
        const d = new Date(w.sunrise);
        return d.getHours() + d.getMinutes() / 60;
      })();
      const sunsetH = (() => {
        const d = new Date(w.sunset);
        return d.getHours() + d.getMinutes() / 60;
      })();

      const sunriseStart = sunriseH - transHours;
      const sunriseEnd = sunriseH + transHours;
      const sunsetStart = sunsetH - transHours;
      const sunsetEnd = sunsetH + transHours;

      console.log(
        `[NightLight] t=${timeDecimal.toFixed(2)} rise=${sunriseH.toFixed(2)} set=${sunsetH.toFixed(2)} base=${dayBase}K`,
      );

      if (timeDecimal >= sunriseEnd && timeDecimal < sunsetStart) {
        console.log(`[NightLight] Full day → ${dayBase}K`);
        return dayBase;
      }
      if (timeDecimal >= sunsetEnd || timeDecimal < sunriseStart) {
        console.log(`[NightLight] Full night → ${NIGHT_TEMP}K`);
        return NIGHT_TEMP;
      }
      if (timeDecimal >= sunriseStart && timeDecimal < sunriseEnd) {
        const progress = (timeDecimal - sunriseStart) / (transHours * 2);
        const temp = NIGHT_TEMP + progress * (dayBase - NIGHT_TEMP);
        console.log(
          `[NightLight] Sunrise ${(progress * 100).toFixed(0)}% → ${Math.round(temp)}K`,
        );
        return temp;
      }
      if (timeDecimal >= sunsetStart && timeDecimal < sunsetEnd) {
        const progress = (timeDecimal - sunsetStart) / (transHours * 2);
        const temp = dayBase - progress * (dayBase - NIGHT_TEMP);
        console.log(
          `[NightLight] Sunset ${(progress * 100).toFixed(0)}% → ${Math.round(temp)}K`,
        );
        return temp;
      }
    }

    // Fallback fixed schedule
    console.log("[NightLight] Using fallback schedule");
    if (timeDecimal >= 20 || timeDecimal < 6) return NIGHT_TEMP;
    if (timeDecimal >= 18)
      return dayBase - ((timeDecimal - 18) / 2) * (dayBase - NIGHT_TEMP);
    if (timeDecimal < 8)
      return NIGHT_TEMP + ((timeDecimal - 6) / 2) * (dayBase - NIGHT_TEMP);
    return dayBase;
  }

  // ── Auto Logic ────────────────────────────────────────────────

  function autoApply(): void {
    const target = calculateTargetTemp();
    const targetEnabled = target < DAY_TEMP;

    if (state().manualOverride) {
      if (targetEnabled === state().enabled) {
        console.log("[NightLight] Auto and manual agree, resuming auto mode");
        setState({ ...state(), manualOverride: false });
      }
      return;
    }

    const diff = Math.abs(target - state().currentTemp);
    if (diff > 150) {
      console.log(
        `[NightLight] Auto: ${state().currentTemp}K → ${Math.round(target)}K`,
      );
      applyTemperature(target);
    }
  }

  // ── Startup & Interval ────────────────────────────────────────

  const initTimeout = setTimeout(() => autoApply(), 3000);

  const autoInterval = setInterval(() => autoApply(), 60_000);

  onCleanup(() => {
    clearTimeout(initTimeout);
    clearInterval(autoInterval);
  });

  // ── Manual Toggle ─────────────────────────────────────────────

  function toggle(): void {
    const target = calculateTargetTemp();
    const targetEnabled = target < DAY_TEMP;
    const nextEnabled = !state().enabled;

    // Toggling back to what auto wants right now - resume auto immediately
    if (nextEnabled === targetEnabled) {
      console.log("[NightLight] Matches auto, resuming auto mode");
      setState({ ...state(), manualOverride: false });
      applyTemperature(target);
      return;
    }

    // Diverging from auto - engage manual override
    console.log("[NightLight] Manual override");
    setState({ ...state(), manualOverride: true });
    applyTemperature(nextEnabled ? NIGHT_TEMP : DAY_TEMP);
  }

  // ── Tooltip ───────────────────────────────────────────────────

  function buildTooltip(s: NightLightState): string {
    const w = weather();
    const status = s.enabled ? "On" : "Off";
    const mode = s.manualOverride ? "Manual" : "Auto";
    const cond = w?.current.desc ? ` · ${w.current.desc}` : "";

    let sunInfo = "";
    if (w?.sunrise && w?.sunset) {
      const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      sunInfo = `\n☀ ${fmt(w.sunrise)}  🌙 ${fmt(w.sunset)}`;
    }

    return `Night Light: ${status}  ${s.currentTemp}K\nMode: ${mode}${cond}${sunInfo}`;
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <With value={state}>
      {(s) => (
        <button
          css="background: transparent; padding: 2px 8px; border-radius: 8px; margin-right: 4px;"
          onClicked={toggle}
          tooltipText={buildTooltip(s)}
        >
          <label
            label={s.enabled ? "󰖔" : "󰖕"}
            css={`
              font-size: 14px;
              color: ${s.enabled ? "#ffc864" : "rgba(255, 255, 255, 0.65)"};
            `}
          />
        </button>
      )}
    </With>
  );
}
