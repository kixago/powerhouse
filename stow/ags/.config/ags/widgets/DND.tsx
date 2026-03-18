// widgets/DND.tsx
import { Gtk } from "ags/gtk4";
import { createState, onCleanup } from "ags";
import Notifd from "gi://AstalNotifd";

export function DNDIndicator() {
  const notifd = Notifd.get_default();
  const [dnd, setDnd] = createState(notifd.dont_disturb);

  const handler = notifd.connect("notify::dont-disturb", () => {
    setDnd(notifd.dont_disturb);
  });

  onCleanup(() => notifd.disconnect(handler));

  function toggle() {
    notifd.dont_disturb = !notifd.dont_disturb;
  }

  return (
    <button class="dnd-button" onClicked={toggle}>
      <label class="icon" label={dnd((v) => (v ? "󰂛" : "󰂚"))} />
    </button>
  );
}
