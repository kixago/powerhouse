// windows/Notifications.tsx
import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import Notifd from "gi://AstalNotifd";
import { onCleanup, createState, For } from "ags";

const notifd = Notifd.get_default();

const Urgency = {
  LOW: 0,
  NORMAL: 1,
  CRITICAL: 2,
};

/* ─────────────────────────────────────────────
   TIMEOUT CONFIGURATION
───────────────────────────────────────────── */

const DEFAULT_TIMEOUT = 8000;

const FAST_APPS = [
  "blueman",
  "bluetooth",
  "blueberry",
  "networkmanager",
  "nm-applet",
  "network",
  "pulseaudio",
  "pavucontrol",
  "volume",
  "brightness",
  "power",
  "upower",
  "systemd",
  "notify-send",
];
const FAST_TIMEOUT = 3000;

const SLOW_APPS = [
  "matrix",
  "element",
  "signal",
  "whatsapp",
  "telegram",
  "discord",
  "slack",
  "thunderbird",
  "evolution",
  "geary",
  "mailspring",
  "sms",
  "messages",
  "chatty",
];
const SLOW_TIMEOUT = 15000;

function getTimeoutForApp(appName: string | null): number {
  const appLower = (appName || "").toLowerCase();

  if (FAST_APPS.some((fast) => appLower.includes(fast))) {
    return FAST_TIMEOUT;
  }

  if (SLOW_APPS.some((slow) => appLower.includes(slow))) {
    return SLOW_TIMEOUT;
  }

  return DEFAULT_TIMEOUT;
}

/* ─────────────────────────────────────────────
   DEDUPLICATION
───────────────────────────────────────────── */

const recentNotifs = new Map<
  string,
  { id: number; bodyLength: number; time: number }
>();

function getNotifKey(notif: Notifd.Notification): string {
  return `${notif.appName || ""}:${notif.summary || ""}`;
}

function getContentScore(notif: Notifd.Notification): number {
  let score = 0;
  if (notif.body) score += notif.body.length;
  if (notif.appIcon) score += 10;
  if (notif.actions && notif.actions.length > 0) score += 20;
  return score;
}

interface DedupeResult {
  isDuplicate: boolean;
  replaceId: number | null;
}

function checkDuplicate(notif: Notifd.Notification): DedupeResult {
  const key = getNotifKey(notif);
  const now = Date.now();
  const existing = recentNotifs.get(key);
  const newScore = getContentScore(notif);

  for (const [k, data] of recentNotifs.entries()) {
    if (now - data.time > 5000) {
      recentNotifs.delete(k);
    }
  }

  if (existing && now - existing.time < 2000) {
    if (newScore > existing.bodyLength) {
      recentNotifs.set(key, { id: notif.id, bodyLength: newScore, time: now });
      return { isDuplicate: false, replaceId: existing.id };
    } else {
      return { isDuplicate: true, replaceId: null };
    }
  }

  recentNotifs.set(key, { id: notif.id, bodyLength: newScore, time: now });
  return { isDuplicate: false, replaceId: null };
}

/* ─────────────────────────────────────────────
   NOTIFICATION CARD
───────────────────────────────────────────── */

function NotificationCard({
  notif,
  onForceRemove,
}: {
  notif: Notifd.Notification;
  onForceRemove: (id: number) => void;
}) {
  const [progress, setProgress] = createState(100);
  const [paused, setPaused] = createState(false);
  const isCritical = notif.urgency === Urgency.CRITICAL;

  const appTimeout = getTimeoutForApp(notif.appName);
  const timeout = Math.max(
    notif.expireTimeout > 0 ? notif.expireTimeout : appTimeout,
    2000,
  );

  const cleanBody = (() => {
    let body = notif.body || "";

    if (/<[^>]+>/.test(body)) {
      body = body
        .replace(/<a[^>]*>.*?<\/a>/g, "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n+/g, " ")
        .trim();
    }

    return body;
  })();

  function dismiss() {
    try {
      notif.dismiss();
    } catch {
      // Notification might already be gone
    }
    onForceRemove(notif.id);
  }

  if (!isCritical) {
    let elapsed = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    intervalId = setInterval(() => {
      if (paused()) return;

      elapsed += 50;
      const remaining = Math.max(0, 100 - (elapsed / timeout) * 100);
      setProgress(remaining);

      if (elapsed >= timeout) {
        if (intervalId) clearInterval(intervalId);
        dismiss();
      }
    }, 50);

    onCleanup(() => {
      if (intervalId) clearInterval(intervalId);
    });
  }

  const hoverController = new Gtk.EventControllerMotion();
  hoverController.connect("enter", () => setPaused(true));
  hoverController.connect("leave", () => setPaused(false));

  return (
    <box
      class={`notification ${isCritical ? "notification-critical" : ""}`}
      orientation={Gtk.Orientation.VERTICAL}
      $={(self) => self.add_controller(hoverController)}
    >
      <box class="notif-header">
        {notif.appIcon && (
          <image
            class="notif-app-icon"
            iconName={notif.appIcon}
            pixelSize={16}
          />
        )}
        <label
          class="notif-summary"
          label={notif.summary || "Notification"}
          hexpand
          halign={Gtk.Align.START}
          ellipsize={3}
        />
        <button class="notif-close" onClicked={dismiss}>
          <label label="󰅖" />
        </button>
      </box>

      {!isCritical && (
        <box class="notif-progress-container">
          <box
            class="notif-progress-spacer"
            css={progress((p) => `min-width: ${((100 - p) / 2) * 2.8}px;`)}
          />
          <box
            class="notif-progress-bar"
            hexpand
            css={progress((p) => `min-width: ${p * 2.8}px;`)}
          />
          <box
            class="notif-progress-spacer"
            css={progress((p) => `min-width: ${((100 - p) / 2) * 2.8}px;`)}
          />
        </box>
      )}

      {cleanBody && (
        <label
          class="notif-body"
          label={cleanBody}
          halign={Gtk.Align.START}
          wrap
          maxWidthChars={45}
        />
      )}

      {notif.actions && notif.actions.length > 0 && (
        <box class="notif-actions" spacing={8}>
          {notif.actions.map((action) => (
            <button
              class="notif-action-btn"
              hexpand
              onClicked={() => {
                notif.invoke(action.id);
                dismiss();
              }}
            >
              <label label={action.label} />
            </button>
          ))}
        </box>
      )}
    </box>
  );
}

/* ─────────────────────────────────────────────
   NOTIFICATION POPUPS WINDOW
───────────────────────────────────────────── */

export function NotificationPopups({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const [notifications, setNotifications] = createState<Notifd.Notification[]>([]);

  function forceRemove(id: number) {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }

  const onNotified = notifd.connect("notified", (_, id, replaced) => {
    const notif = notifd.get_notification(id);
    if (!notif) return;

    const result = checkDuplicate(notif);

    if (result.isDuplicate) {
      notif.dismiss();
      return;
    }

    if (result.replaceId !== null) {
      const oldNotif = notifd.get_notification(result.replaceId);
      if (oldNotif) {
        try {
          oldNotif.dismiss();
        } catch {
          // Ignore
        }
      }
      forceRemove(result.replaceId);

      setNotifications((list) => [
        notif,
        ...list.filter((n) => n.id !== result.replaceId),
      ]);
      return;
    }

    if (replaced) {
      setNotifications((list) => list.map((n) => (n.id === id ? notif : n)));
    } else {
      setNotifications((list) => [notif, ...list]);
    }
  });

  const onResolved = notifd.connect("resolved", (_, id) => {
    forceRemove(id);
  });

  onCleanup(() => {
    notifd.disconnect(onNotified);
    notifd.disconnect(onResolved);
  });

  return (
    <window
      class="NotificationPopups"
      gdkmonitor={gdkmonitor}
      visible={notifications((ns) => ns.length > 0)}
      anchor={TOP | RIGHT}
      application={app}
    >
      <box
        class="notifications-container"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        css="margin-top: 8px; margin-right: 12px;"
      >
        <For each={notifications}>
          {(notif) => (
            <NotificationCard notif={notif} onForceRemove={forceRemove} />
          )}
        </For>
      </box>
    </window>
  );
}

export function dismissAll() {
  for (const notif of notifd.get_notifications()) {
    try {
      notif.dismiss();
    } catch {
      // Ignore
    }
  }
}
