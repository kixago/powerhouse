// utils/notifications.ts
import Notifd from "gi://AstalNotifd";

const notifd = Notifd.get_default();

export function dismissAllNotifications() {
  for (const notif of notifd.get_notifications()) {
    notif.dismiss();
  }
}

export function toggleDND() {
  notifd.dont_disturb = !notifd.dont_disturb;
}

export function getDND() {
  return notifd.dont_disturb;
}
