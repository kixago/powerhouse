// windows/BluetoothPopup.tsx
import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import { createState, onCleanup, With, For, createEffect } from "ags";
import Bluetooth from "gi://AstalBluetooth";

const bluetooth = Bluetooth.get_default();
const [visible, setVisible] = createState(false);

export function toggleBluetoothPopup() {
  setVisible((v) => !v);
}

function DeviceIcon(device: Bluetooth.Device): string {
  const iconName = device.icon;
  const name = (device.alias || device.name || "").toLowerCase();

  // Override misclassified devices based on name patterns
  const nameOverrides: Array<[RegExp, string]> = [
    // Mice
    [
      /mouse|mice|mx master|mx anywhere|g pro|g502|g903|deathadder|viper|basilisk|aerox|pulsefire|model o|model d|xlite|superlight/i,
      "󰍽",
    ],
    // Keyboards
    [/keyboard|keychron|k[0-9]+|ducky|anne pro|nuphy|hhkb|realforce/i, "󰌌"],
    // Controllers
    [
      /controller|gamepad|xbox|playstation|dualsense|dualshock|pro controller|joycon/i,
      "󰊗",
    ],
    // Headphones
    [
      /headphone|airpod|buds|earbuds|wh-1000|wf-1000|momentum|qc35|qc45|px7|aerpex/i,
      "󰋋",
    ],
    // Headsets
    [/headset|arctis|hyperx cloud|kraken|blackshark|void/i, "󰋎"],
    // Phones
    [
      /phone|iphone|pixel|galaxy|oneplus|xiaomi|poco|redmi|huawei|oppo|vivo|pad|tablet/i,
      "󰏲",
    ],
    // Watches
    [/watch|band|fitbit|garmin/i, "󰖉"],
    // Speakers
    [/speaker|soundbar|soundcore|jbl|bose|sonos|homepod|echo/i, "󰓃"],
  ];

  // Check name-based overrides first
  for (const [pattern, icon] of nameOverrides) {
    if (pattern.test(name)) {
      return icon;
    }
  }

  // Fall back to BlueZ-reported icon
  const icons: Record<string, string> = {
    "input-mouse": "󰍽",
    "input-keyboard": "󰌌",
    "input-gaming": "󰊗",
    "audio-headphones": "󰋋",
    "audio-headset": "󰋎",
    "audio-card": "󰓃",
    phone: "󰏲",
    computer: "󰍹",
    "video-display": "󰍺",
    tablet: "󰓶",
  };

  return icons[iconName] || "󰂯";
}

// Helper function to get deduplicated paired devices
function getUniquePairedDevices(): Bluetooth.Device[] {
  const allDevices = bluetooth.get_devices().filter((d) => d.paired);
  const seen = new Set<string>();
  return allDevices.filter((d) => {
    if (seen.has(d.address)) return false;
    seen.add(d.address);
    return true;
  });
}

function DeviceRow({ device }: { device: Bluetooth.Device }) {
  const [isConnecting, setIsConnecting] = createState(device.connecting);
  const [isConnected, setIsConnected] = createState(device.connected);
  const [batteryPercentage, setBatteryPercentage] = createState(
    device.battery_percentage,
  );

  const onConnecting = device.connect("notify::connecting", () => {
    setIsConnecting(device.connecting);
  });

  const onConnected = device.connect("notify::connected", () => {
    setIsConnected(device.connected);
  });

  const onBattery = device.connect("notify::battery-percentage", () => {
    setBatteryPercentage(device.battery_percentage);
  });

  onCleanup(() => {
    device.disconnect(onConnecting);
    device.disconnect(onConnected);
    device.disconnect(onBattery);
  });

  function toggleConnection() {
    if (device.connected) {
      device.disconnect_device(null, null);
    } else {
      device.connect_device(null, null);
    }
  }

  return (
    <box class="bt-device-row">
      <label class="bt-device-icon" label={DeviceIcon(device)} />
      <box orientation={Gtk.Orientation.VERTICAL} hexpand>
        <label
          class="bt-device-name"
          label={device.alias || device.name}
          halign={Gtk.Align.START}
          ellipsize={3}
        />
        <box>
          <label
            class={isConnected(
              (c) => `bt-device-status ${c ? "connected" : ""}`,
            )}
            label={isConnecting((connecting) =>
              connecting
                ? "Connecting..."
                : isConnected()
                  ? "Connected"
                  : "Paired",
            )}
            halign={Gtk.Align.START}
          />
          <With value={batteryPercentage}>
            {(battery) =>
              battery >= 0 ? (
                <label class="bt-device-battery" label={` · ${battery}%`} />
              ) : (
                <box />
              )
            }
          </With>
        </box>
      </box>
      <button
        class={isConnected((c) => `bt-connect-btn ${c ? "disconnect" : ""}`)}
        onClicked={toggleConnection}
      >
        <label
          label={isConnecting((connecting) =>
            connecting ? "󰦖" : isConnected() ? "󰂭" : "󰂯",
          )}
        />
      </button>
    </box>
  );
}

function PopupContent() {
  const [powered, setPowered] = createState(bluetooth.is_powered);
  const [devices, setDevices] = createState<Bluetooth.Device[]>(
    getUniquePairedDevices(),
  );
  const [scanning, setScanning] = createState(
    bluetooth.adapter?.discovering || false,
  );

  const onPowered = bluetooth.connect("notify::is-powered", () => {
    setPowered(bluetooth.is_powered);
  });

  const onDeviceAdded = bluetooth.connect("device-added", () => {
    setDevices(getUniquePairedDevices());
  });

  const onDeviceRemoved = bluetooth.connect("device-removed", () => {
    setDevices(getUniquePairedDevices());
  });

  // Also listen for paired status changes on existing devices
  const onDeviceChanged = bluetooth.connect("notify", () => {
    setDevices(getUniquePairedDevices());
  });

  let scanSignal: number | null = null;
  const adapter = bluetooth.adapter;
  if (adapter) {
    scanSignal = adapter.connect("notify::discovering", () => {
      setScanning(adapter.discovering);
    });
  }

  onCleanup(() => {
    bluetooth.disconnect(onPowered);
    bluetooth.disconnect(onDeviceAdded);
    bluetooth.disconnect(onDeviceRemoved);
    bluetooth.disconnect(onDeviceChanged);
    if (adapter && scanSignal) {
      adapter.disconnect(scanSignal);
    }
  });

  function togglePower() {
    bluetooth.toggle();
  }

  function toggleScan() {
    const adapter = bluetooth.adapter;
    if (!adapter) return;
    if (adapter.discovering) {
      adapter.stop_discovery();
    } else {
      adapter.start_discovery();
    }
  }

  return (
    <box class="bt-popup" orientation={Gtk.Orientation.VERTICAL}>
      <box class="bt-header">
        <label
          class="bt-title"
          label="Bluetooth"
          hexpand
          halign={Gtk.Align.START}
        />
        <button class="bt-close-btn" onClicked={() => setVisible(false)}>
          <label label="󰅖" />
        </button>
        <button
          class={powered((p) => `bt-power-btn ${p ? "on" : "off"}`)}
          onClicked={togglePower}
        >
          <label label={powered((p) => (p ? "󰂯" : "󰂲"))} />
        </button>
      </box>

      <With value={powered}>
        {(isPowered) =>
          isPowered ? (
            <box orientation={Gtk.Orientation.VERTICAL}>
              <box class="bt-actions">
                <button
                  class={scanning((s) => `bt-scan-btn ${s ? "scanning" : ""}`)}
                  onClicked={toggleScan}
                  hexpand
                >
                  <label
                    label={scanning((s) => (s ? "󰦖 Scanning..." : "󰍉 Scan"))}
                  />
                </button>
              </box>

              <label
                class="bt-section-title"
                label="Paired Devices"
                halign={Gtk.Align.START}
              />

              <With value={devices}>
                {(list) =>
                  list.length > 0 ? (
                    <box
                      class="bt-device-list"
                      orientation={Gtk.Orientation.VERTICAL}
                    >
                      <For each={devices}>
                        {(device) => <DeviceRow device={device} />}
                      </For>
                    </box>
                  ) : (
                    <label class="bt-no-devices" label="No paired devices" />
                  )
                }
              </With>
            </box>
          ) : (
            <box
              class="bt-disabled"
              hexpand
              vexpand
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
            >
              <label label="Bluetooth is off" />
            </box>
          )
        }
      </With>
    </box>
  );
}

export function BluetoothPopup({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let win: Astal.Window;
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  onCleanup(() => win?.destroy());

  return (
    <window
      $={(self) => {
        win = self;
        createEffect(() => {
          self.visible = visible();
        });
      }}
      visible={false}
      name="bluetooth-popup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
      css="background: transparent;"
      keymode={Astal.Keymode.ON_DEMAND}
    >
      <box halign={Gtk.Align.END} valign={Gtk.Align.START}>
        <box
          class="bt-popup-wrapper"
          orientation={Gtk.Orientation.VERTICAL}
          css="margin-top: 8px; margin-right: 80px;"
        >
          <PopupContent />
        </box>
      </box>
    </window>
  );
}
