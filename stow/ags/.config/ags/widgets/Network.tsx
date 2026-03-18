// widgets/Network.tsx
import { Gtk } from "ags/gtk4";
import { createState, onCleanup, With } from "ags";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import { createEffect } from "ags";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface NetworkInterface {
  name: string;
  type:
    | "bridge"
    | "ethernet"
    | "wifi"
    | "vpn"
    | "wireguard"
    | "tailscale"
    | "veth"
    | "vlan"
    | "loopback"
    | "unknown";
  state: "up" | "down";
  ip4?: string;
  ip6?: string;
  master?: string;
}

interface WireGuardInfo {
  interface: string;
  publicKey?: string;
  endpoint?: string;
  latestHandshake?: string;
  transferRx?: string;
  transferTx?: string;
}

interface PiaVpnInfo {
  connected: boolean;
  ip?: string;
  port?: number;
  portStatus: "active" | "pending" | "inactive";
}

interface NetworkData {
  interfaces: NetworkInterface[];
  hasInternet: boolean;
  publicIp?: string;
  vpnActive: boolean;
  wgActive: boolean;
  tailscaleActive: boolean;
  wgInfo?: WireGuardInfo;
  piaInfo?: PiaVpnInfo;
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function runCommand(cmd: string): string {
  try {
    const proc = Gio.Subprocess.new(
      ["bash", "-c", cmd],
      Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE,
    );
    const [, stdout] = proc.communicate_utf8(null, null);
    return stdout?.trim() ?? "";
  } catch {
    return "";
  }
}

function getInterfaceType(name: string): NetworkInterface["type"] {
  if (name === "lo") return "loopback";
  if (name.startsWith("wg")) return "wireguard";
  if (name.startsWith("tailscale")) return "tailscale";
  if (name.startsWith("tun") || name.startsWith("tap")) return "vpn";
  if (name.startsWith("br")) return "bridge";
  if (name.startsWith("veth")) return "veth";
  if (name.includes("@") || name.startsWith("vlan")) return "vlan";
  if (name.startsWith("wl") || name.startsWith("wlan")) return "wifi";
  if (name.startsWith("en") || name.startsWith("eth")) return "ethernet";
  return "unknown";
}

function getInterfaceIcon(iface: NetworkInterface): string {
  if (iface.state === "down") return "󰲛";

  switch (iface.type) {
    case "wireguard":
      return "󰖂";
    case "tailscale":
      return "󱘖";
    case "vpn":
      return "󰦝";
    case "bridge":
      return "󰛳";
    case "ethernet":
      return "󰈀";
    case "wifi":
      return "󰖩";
    case "veth":
      return "󰕥";
    case "vlan":
      return "󰒍";
    case "loopback":
      return "󰑐";
    default:
      return "󰛵";
  }
}

function getStatusColor(iface: NetworkInterface): string {
  if (iface.state === "down") return "#ff6464";

  switch (iface.type) {
    case "wireguard":
    case "tailscale":
    case "vpn":
      return "#9ece6a";
    case "bridge":
    case "ethernet":
      return "#7aa2f7";
    case "wifi":
      return "#bb9af7";
    default:
      return "#a6a6a6";
  }
}

/* ─────────────────────────────────────────────
   HELPER: Convert hex color to rgba with alpha
───────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─────────────────────────────────────────────
   FETCH WIREGUARD INFO
───────────────────────────────────────────── */

function getWireGuardInfo(): WireGuardInfo | undefined {
  const wgShow = runCommand("sudo wg show wg0 2>/dev/null");
  if (!wgShow) return undefined;

  const info: WireGuardInfo = { interface: "wg0" };

  const lines = wgShow.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("public key:")) {
      info.publicKey = trimmed.split(":")[1]?.trim();
    } else if (trimmed.startsWith("endpoint:")) {
      info.endpoint = trimmed.split(":").slice(1).join(":").trim();
    } else if (trimmed.startsWith("latest handshake:")) {
      info.latestHandshake = trimmed.replace("latest handshake:", "").trim();
    } else if (trimmed.startsWith("transfer:")) {
      const transfer = trimmed.replace("transfer:", "").trim();
      const parts = transfer.split(",");
      if (parts.length >= 2) {
        info.transferRx = parts[0].trim();
        info.transferTx = parts[1].trim();
      }
    }
  }

  return info;
}

/* ─────────────────────────────────────────────
   FETCH PIA VPN INFO
───────────────────────────────────────────── */

function getPiaVpnInfo(): PiaVpnInfo {
  const vpnStatus = runCommand(
    "systemctl is-active pia-vpn.service 2>/dev/null",
  );
  const connected = vpnStatus === "active";

  if (!connected) {
    return { connected: false, portStatus: "inactive" };
  }

  const wgIp = runCommand(
    "ip -4 addr show wg0 2>/dev/null | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'",
  );

  const portfwdStatus = runCommand(
    "systemctl is-active pia-vpn-portforward.service 2>/dev/null",
  );

  let port: number | undefined;
  let portStatus: PiaVpnInfo["portStatus"] = "inactive";

  if (portfwdStatus === "active" || portfwdStatus === "activating") {
    const logs = runCommand(
      "journalctl -u pia-vpn-portforward.service -n 50 --no-pager 2>/dev/null | grep -oP 'port to \\K\\d+' | tail -1",
    );

    if (logs) {
      port = parseInt(logs);
      portStatus = "active";
    } else {
      portStatus = "pending";
    }
  }

  return {
    connected,
    ip: wgIp || undefined,
    port,
    portStatus,
  };
}

/* ─────────────────────────────────────────────
   FETCH NETWORK DATA
───────────────────────────────────────────── */

async function fetchNetworkData(): Promise<NetworkData> {
  const interfaces: NetworkInterface[] = [];

  const ipOutput = runCommand("ip -br addr");
  const lines = ipOutput.split("\n").filter(Boolean);

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const name = parts[0].split("@")[0];
    const state = parts[1].toLowerCase().includes("up") ? "up" : "down";

    if (name.startsWith("veth")) continue;

    const ips = parts.slice(2);
    const ip4 = ips.find((ip) => ip.includes(".") && !ip.includes(":"));
    const ip6 = ips.find((ip) => ip.includes(":") && !ip.startsWith("fe80"));

    const type = getInterfaceType(name);

    if (type === "loopback") continue;

    interfaces.push({
      name,
      type,
      state: state as "up" | "down",
      ip4: ip4?.split("/")[0],
      ip6: ip6?.split("/")[0],
    });
  }

  const pingResult = runCommand(
    "ping -c 1 -W 2 8.8.8.8 2>/dev/null && echo 'ok'",
  );
  const hasInternet = pingResult.includes("ok");

  let publicIp: string | undefined;
  if (hasInternet) {
    publicIp = runCommand(
      "curl -s --connect-timeout 2 ifconfig.me 2>/dev/null",
    );
    if (publicIp && publicIp.length > 20) publicIp = undefined;
  }

  const wgActive = interfaces.some(
    (i) => i.type === "wireguard" && i.state === "up",
  );
  const tailscaleActive = interfaces.some(
    (i) => i.type === "tailscale" && i.state === "up",
  );
  const vpnActive =
    wgActive ||
    tailscaleActive ||
    interfaces.some((i) => i.type === "vpn" && i.state === "up");

  const wgInfo = wgActive ? getWireGuardInfo() : undefined;
  const piaInfo = getPiaVpnInfo();

  return {
    interfaces,
    hasInternet,
    publicIp,
    vpnActive,
    wgActive,
    tailscaleActive,
    wgInfo,
    piaInfo,
  };
}

/* ─────────────────────────────────────────────
   PIA VPN CARD
───────────────────────────────────────────── */

function PiaVpnCard({
  piaInfo,
  wgInfo,
}: {
  piaInfo: PiaVpnInfo;
  wgInfo?: WireGuardInfo;
}) {
  const portStatusColor = {
    active: "#9ece6a",
    pending: "#ffc864",
    inactive: "#ff6464",
  }[piaInfo.portStatus];

  const portStatusText = {
    active: "Active",
    pending: "Activating...",
    inactive: "Inactive",
  }[piaInfo.portStatus];

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      css={`
        background: linear-gradient(
          to bottom,
          rgba(158, 206, 106, 0.08),
          rgba(158, 206, 106, 0.03)
        );
        border: 1px solid rgba(158, 206, 106, 0.25);
        border-radius: 12px;
        padding: 12px;
      `}
    >
      <box spacing={10}>
        <label label="󰖂" css="font-size: 20px; color: #9ece6a;" />
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            label="PIA VPN (wg0)"
            halign={Gtk.Align.START}
            css="font-size: 13px; font-weight: 700; color: rgba(255, 255, 255, 0.92);"
          />
          <label
            label={piaInfo.connected ? "Connected" : "Disconnected"}
            halign={Gtk.Align.START}
            css={`
              font-size: 10px;
              color: ${piaInfo.connected ? "#9ece6a" : "#ff6464"};
            `}
          />
        </box>
        <box
          css={`
            min-width: 10px;
            min-height: 10px;
            border-radius: 50%;
            background: ${piaInfo.connected ? "#9ece6a" : "#ff6464"};
            box-shadow: 0 0 8px
              ${piaInfo.connected
                ? "rgba(158, 206, 106, 0.5)"
                : "rgba(255, 100, 100, 0.5)"};
          `}
        />
      </box>

      {piaInfo.connected && (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
          {piaInfo.ip && (
            <box spacing={8}>
              <label
                label="󰩟"
                css="font-size: 12px; color: #7aa2f7; min-width: 20px;"
              />
              <label
                label="VPN IP"
                css="font-size: 11px; color: rgba(255, 255, 255, 0.45); min-width: 80px;"
              />
              <label
                label={piaInfo.ip}
                hexpand
                halign={Gtk.Align.END}
                css="font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.92);"
              />
            </box>
          )}

          <box spacing={8}>
            <label
              label="󰛳"
              css="font-size: 12px; color: #7aa2f7; min-width: 20px;"
            />
            <label
              label="Port Forward"
              css="font-size: 11px; color: rgba(255, 255, 255, 0.45); min-width: 80px;"
            />
            <box hexpand halign={Gtk.Align.END} spacing={6}>
              {piaInfo.port ? (
                <label
                  label={piaInfo.port.toString()}
                  css="font-size: 12px; font-weight: 700; color: #9ece6a;"
                />
              ) : (
                <label
                  label={portStatusText}
                  css={`
                    font-size: 11px;
                    color: ${portStatusColor};
                  `}
                />
              )}
              <box
                css={`
                  min-width: 6px;
                  min-height: 6px;
                  border-radius: 50%;
                  background: ${portStatusColor};
                `}
              />
            </box>
          </box>

          {wgInfo?.transferRx && wgInfo?.transferTx && (
            <box spacing={8} css="margin-top: 4px;">
              <label
                label="󰁆"
                css="font-size: 12px; color: #7aa2f7; min-width: 20px;"
              />
              <label
                label="Transfer"
                css="font-size: 11px; color: rgba(255, 255, 255, 0.45); min-width: 80px;"
              />
              <label
                label={`↓${wgInfo.transferRx} ↑${wgInfo.transferTx}`}
                hexpand
                halign={Gtk.Align.END}
                css="font-size: 10px; color: rgba(255, 255, 255, 0.45);"
              />
            </box>
          )}

          {wgInfo?.endpoint && (
            <box spacing={8}>
              <label
                label="󰒍"
                css="font-size: 12px; color: #7aa2f7; min-width: 20px;"
              />
              <label
                label="Endpoint"
                css="font-size: 11px; color: rgba(255, 255, 255, 0.45); min-width: 80px;"
              />
              <label
                label={wgInfo.endpoint}
                hexpand
                halign={Gtk.Align.END}
                css="font-size: 10px; color: rgba(255, 255, 255, 0.45);"
                ellipsize={3}
              />
            </box>
          )}
        </box>
      )}
    </box>
  );
}

/* ─────────────────────────────────────────────
   NETWORK POPUP
───────────────────────────────────────────── */

const [popupVisible, setPopupVisible] = createState(false);

function NetworkPopup({ data }: { data: NetworkData }) {
  const vpnInterfaces = data.interfaces.filter(
    (i) =>
      ["wireguard", "tailscale", "vpn"].includes(i.type) && i.state === "up",
  );
  const mainInterfaces = data.interfaces.filter(
    (i) => ["bridge", "ethernet", "wifi"].includes(i.type) && i.state === "up",
  );
  const otherInterfaces = data.interfaces.filter(
    (i) =>
      ![
        "wireguard",
        "tailscale",
        "vpn",
        "bridge",
        "ethernet",
        "wifi",
        "veth",
        "loopback",
      ].includes(i.type) && i.state === "up",
  );

  return (
    <box
      class="network-popup"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
      css={`
        background: linear-gradient(
          to bottom,
          rgba(28, 40, 38, 0.35),
          rgba(18, 28, 26, 0.35)
        );
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 16px;
        min-width: 340px;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.65);
      `}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
        <label label="󰛳" css="font-size: 24px; color: #7aa2f7;" />
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            label="Network Status"
            halign={Gtk.Align.START}
            css="font-size: 14px; font-weight: 700; color: rgba(255, 255, 255, 0.92);"
          />
          <label
            label={
              data.hasInternet
                ? "Connected to Internet"
                : "No Internet Connection"
            }
            halign={Gtk.Align.START}
            css={`
              font-size: 11px;
              color: ${data.hasInternet ? "#9ece6a" : "#ff6464"};
            `}
          />
        </box>
        <button
          css={`
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            padding: 4px 8px;
            color: rgba(255, 255, 255, 0.45);
          `}
          onClicked={() => setPopupVisible(false)}
        >
          <label label="󰅖" />
        </button>
      </box>

      {data.publicIp && (
        <box
          css={`
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 10px 12px;
          `}
          spacing={8}
        >
          <label label="󰩟" css="font-size: 14px; color: #7aa2f7;" />
          <label
            label="Public IP"
            css="color: rgba(255, 255, 255, 0.45); font-size: 11px;"
            hexpand
            halign={Gtk.Align.START}
          />
          <label
            label={data.publicIp}
            css="color: rgba(255, 255, 255, 0.92); font-size: 12px; font-weight: 600;"
          />
        </box>
      )}

      {data.piaInfo && data.piaInfo.connected && (
        <PiaVpnCard piaInfo={data.piaInfo} wgInfo={data.wgInfo} />
      )}

      {data.tailscaleActive && (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
          <label
            label="TAILSCALE"
            halign={Gtk.Align.START}
            css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.45); letter-spacing: 1px; margin-bottom: 4px;"
          />
          {data.interfaces
            .filter((i) => i.type === "tailscale" && i.state === "up")
            .map((iface) => (
              <NetworkInterfaceRow iface={iface} />
            ))}
        </box>
      )}

      {mainInterfaces.length > 0 && (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
          <label
            label="CONNECTIONS"
            halign={Gtk.Align.START}
            css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.45); letter-spacing: 1px; margin-bottom: 4px;"
          />
          {mainInterfaces.map((iface) => (
            <NetworkInterfaceRow iface={iface} />
          ))}
        </box>
      )}

      {otherInterfaces.length > 0 && (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
          <label
            label="OTHER"
            halign={Gtk.Align.START}
            css="font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.45); letter-spacing: 1px; margin-bottom: 4px;"
          />
          {otherInterfaces.map((iface) => (
            <NetworkInterfaceRow iface={iface} />
          ))}
        </box>
      )}
    </box>
  );
}

function NetworkInterfaceRow({ iface }: { iface: NetworkInterface }) {
  const icon = getInterfaceIcon(iface);
  const color = getStatusColor(iface);

  return (
    <box
      css={`
        background: rgba(255, 255, 255, 0.04);
        border-radius: 10px;
        padding: 10px 12px;
      `}
      spacing={10}
    >
      <label
        label={icon}
        css={`
          font-size: 18px;
          color: ${color};
          min-width: 24px;
        `}
      />
      <box orientation={Gtk.Orientation.VERTICAL} hexpand>
        <box spacing={8}>
          <label
            label={iface.name}
            halign={Gtk.Align.START}
            css="font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.92);"
          />
          <label
            label={iface.type.toUpperCase()}
            css={`
              font-size: 9px;
              font-weight: 600;
              color: ${color};
              background: ${hexToRgba(color, 0.13)};
              padding: 2px 6px;
              border-radius: 4px;
            `}
          />
        </box>
        {iface.ip4 && (
          <label
            label={iface.ip4}
            halign={Gtk.Align.START}
            css="font-size: 11px; color: rgba(255, 255, 255, 0.45); margin-top: 2px;"
          />
        )}
      </box>
      <box
        css={`
          min-width: 8px;
          min-height: 8px;
          border-radius: 50%;
          background: ${iface.state === "up" ? "#9ece6a" : "#ff6464"};
          box-shadow: 0 0 6px
            ${iface.state === "up"
              ? "rgba(158, 206, 106, 0.5)"
              : "rgba(255, 100, 100, 0.5)"};
        `}
      />
    </box>
  );
}

/* ─────────────────────────────────────────────
   MAIN NETWORK WIDGET
───────────────────────────────────────────── */

export function Network() {
  const networkData = createPoll<NetworkData>(
    {
      interfaces: [],
      hasInternet: false,
      vpnActive: false,
      wgActive: false,
      tailscaleActive: false,
    },
    5000,
    fetchNetworkData,
  );

  function getMainIcon(data: NetworkData): string {
    if (!data.hasInternet) return "󰲛";
    if (data.piaInfo?.connected) return "󰖂";
    if (data.tailscaleActive) return "󱘖";
    if (data.vpnActive) return "󰦝";

    const primary = data.interfaces.find(
      (i) =>
        ["bridge", "ethernet"].includes(i.type) && i.state === "up" && i.ip4,
    );
    if (primary) return "󰈀";

    const wifi = data.interfaces.find(
      (i) => i.type === "wifi" && i.state === "up",
    );
    if (wifi) return "󰖩";

    return "󰛳";
  }

  return (
    <button
      css={`
        background: transparent;
        padding: 2px 8px;
        border-radius: 8px;
        margin-right: 4px;
      `}
      onClicked={() => setPopupVisible(!popupVisible())}
      tooltipText={networkData((d) => {
        if (d.piaInfo?.connected) {
          const port = d.piaInfo.port ? ` :${d.piaInfo.port}` : "";
          return `PIA VPN${port}`;
        }
        if (d.tailscaleActive) return "Tailscale";
        return d.hasInternet ? "Connected" : "Disconnected";
      })}
    >
      <label
        label={networkData((d) => getMainIcon(d))}
        css={networkData(
          (d) =>
            `font-size: 14px; color: ${d.hasInternet ? (d.vpnActive ? "#9ece6a" : "#7aa2f7") : "#ff6464"};`,
        )}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────
   NETWORK POPUP WINDOW
───────────────────────────────────────────── */

export function NetworkPopupWindow({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  const networkData = createPoll<NetworkData>(
    {
      interfaces: [],
      hasInternet: false,
      vpnActive: false,
      wgActive: false,
      tailscaleActive: false,
    },
    5000,
    fetchNetworkData,
  );

  return (
    <window
      $={(self) => {
        createEffect(() => {
          self.visible = popupVisible();
        });
      }}
      visible={false}
      name="network-popup"
      gdkmonitor={gdkmonitor}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      application={app}
      css="background: transparent;"
    >
      <box
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}
        css="margin-top: 52px; margin-right: 80px;"
      >
        <With value={networkData}>
          {(data) => <NetworkPopup data={data} />}
        </With>
      </box>
    </window>
  );
}

export {
  popupVisible as networkPopupVisible,
  setPopupVisible as setNetworkPopupVisible,
};
