import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { toggleCC } from "../utils/controlCenter";

export function Clock() {
  const datetime = createPoll("", 1000, () => {
    const now   = GLib.DateTime.new_now_local();
    const day   = now.format("%A");
    const month = now.format("%B");
    const date  = now.format("%d");
    const year  = now.format("%Y");
    const time  = now.format("%H:%M:%S");
    return `${day}, ${month} ${date}, ${year}  │  ${time} EST`;
  });

  return (
    <button class="clock-button" onClicked={toggleCC}>
      <label class="clock" label={datetime} />
    </button>
  );
}
