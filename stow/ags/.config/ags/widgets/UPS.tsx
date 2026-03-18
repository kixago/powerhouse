import { createPoll } from "ags/time";
import { sh } from "../utils/helpers";

function upsIcon(status?: string | null) {
  const s = status ?? "";

  if (s.includes("OB")) return "󰂃"; // on battery
  if (s.includes("LB")) return "󱉝"; // low battery
  if (s.includes("OL")) return "󰂄"; // online/charging
  return "󰁹";
}

export function UPS() {
  const status = createPoll("OL", 10000, async () => {
    const v = await sh("upsc cyberpower@192.168.2.80 ups.status 2>/dev/null", "");
    return v?.trim() || "OL";
  });

  const load = createPoll("0%", 10000, async () => {
    const v = await sh("upsc cyberpower@192.168.2.80 ups.load 2>/dev/null", "");
    const cleaned = v?.trim();
    return cleaned ? `${cleaned}%` : "0%";
  });

  return (
    <box>
      <label class="stat-icon" label={status((s) => upsIcon(s ?? ""))} />
      <label class="stat-value" label={load((l) => l ?? "0%")} />
    </box>
  );
}
