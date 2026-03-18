// widgets/Bluetooth.tsx
import { Gtk } from "ags/gtk4";
import { createState, onCleanup } from "ags";
import Bluetooth from "gi://AstalBluetooth";
import { toggleBluetoothPopup } from "../windows/BluetoothPopup";

const bluetooth = Bluetooth.get_default();

export function BluetoothIndicator() {
  const [powered, setPowered] = createState(bluetooth.is_powered);
  const [connected, setConnected] = createState(bluetooth.is_connected);

  const onPowered = bluetooth.connect("notify::is-powered", () => {
    setPowered(bluetooth.is_powered);
  });

  const onConnected = bluetooth.connect("notify::is-connected", () => {
    setConnected(bluetooth.is_connected);
  });

  onCleanup(() => {
    bluetooth.disconnect(onPowered);
    bluetooth.disconnect(onConnected);
  });

  function getIcon(isPowered: boolean, isConnected: boolean) {
    if (!isPowered) return "󰂲";
    if (isConnected) return "󰂱";
    return "󰂯";
  }

  function handleClick() {
    // print("Bluetooth button clicked");
    toggleBluetoothPopup();
  }

  return (
    <button class="bluetooth-button" onClicked={handleClick}>
      <label class="icon" label={powered((p) => getIcon(p, connected()))} />
    </button>
  );
}
