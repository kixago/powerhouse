// app.tsx
import app from "ags/gtk4/app";
import { css } from "./style";
import { Bar } from "./widgets/Bar";
import { ControlCenter } from "./windows/ControlCenter";
import { NotificationPopups } from "./windows/Notifications";
import { StatsPopup } from "./windows/StatsPopup";
import { NetworkPopupWindow } from "./widgets/Network";
import { VolumePopupWindow } from "./widgets/Volume";
// import { BluetoothPopup } from "./windows/BluetoothPopup";

app.start({
  css,
  main() {
    for (const monitor of app.get_monitors()) {
      if (monitor.connector === "HDMI-A-1") {
        Bar({ gdkmonitor: monitor });
        ControlCenter({ gdkmonitor: monitor });
        NotificationPopups({ gdkmonitor: monitor });
        StatsPopup({ gdkmonitor: monitor });
        NetworkPopupWindow({ gdkmonitor: monitor });
        VolumePopupWindow({ gdkmonitor: monitor });
        // BluetoothPopup({ gdkmonitor: monitor });
      }
    }
  },
});
