import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import { onCleanup } from "ags";

import { Clock } from "./Clock";
import { Weather } from "./Weather";
import { SystemStats } from "./SystemStats";
import { Volume } from "./Volume";
import { Network } from "./Network";
import { UPS } from "./UPS";
// import { BluetoothIndicator } from "./Bluetooth";
import { NightLight } from "./NightLight";
import { SystemTray } from "./SystemTray";

export function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let win: Astal.Window;
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  onCleanup(() => {
    win.destroy();
  });

  return (
    <window
      $={(self) => (win = self)}
      visible
      name="bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox class="bar-container">
        <box
          $type="start"
          class="section section-left"
          halign={Gtk.Align.START}
        ></box>

        <box
          $type="center"
          class="section-center-group"
          halign={Gtk.Align.CENTER}
        >
          <box class="section section-center">
            <Clock />
          </box>
          <box class="section section-weather">
            <Weather />
          </box>
        </box>

        <box $type="end" class="section section-right" halign={Gtk.Align.END}>
          <SystemStats />
          <label class="stat-separator" label="│" />
          <UPS />
          <label class="stat-separator" label="│" />
          <SystemTray />
          <label class="stat-separator" label="│" />
          <Network />
          {/* <BluetoothIndicator /> */}
          <NightLight />
          <Volume />
        </box>
      </centerbox>
    </window>
  );
}
