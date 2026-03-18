// windows/ControlCenter.tsx
import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import Gdk from "gi://Gdk?version=4.0";
import GLib from "gi://GLib";
import {
  onCleanup,
  createState,
  With,
  createComputed,
  createEffect,
} from "ags";
import { createPoll } from "ags/time";
import { sh } from "../utils/helpers";
import { weather } from "../utils/weather";
import type { WeatherData } from "../utils/weather";
import { ccVisible } from "../utils/controlCenter";

/* ─────────────────────────────────────────────
   Calendar Section
───────────────────────────────────────────── */

function CalendarSection() {
  const today = GLib.DateTime.new_now_local();
  const [year, setYear] = createState(today.get_year());
  const [month, setMonth] = createState(today.get_month());
  const todayDay = today.get_day_of_month();
  const todayM = today.get_month();
  const todayY = today.get_year();

  const MONTH_NAMES = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function prevMonth() {
    if (month() === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month() === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const cells = createComputed(() => {
    const y = year();
    const m = month();
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const arr: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);

    return arr;
  });

  return (
    <box class="cc-section cc-calendar" orientation={Gtk.Orientation.VERTICAL}>
      <box class="cal-header">
        <button class="cal-nav-btn" onClicked={prevMonth}>
          <label label="󰍞" />
        </button>

        <label
          class="cal-month-label"
          hexpand
          halign={Gtk.Align.CENTER}
          label={month((m) => `${MONTH_NAMES[m]} ${year()}`)}
        />

        <button class="cal-nav-btn" onClicked={nextMonth}>
          <label label="󰍟" />
        </button>
      </box>

      <box class="cal-dow-row">
        {DAY_HEADERS.map((d) => (
          <label class="cal-dow" hexpand label={d} halign={Gtk.Align.CENTER} />
        ))}
      </box>

      <With value={cells}>
        {(arr) => {
          const rows: JSX.Element[] = [];

          for (let r = 0; r < arr.length / 7; r++) {
            rows.push(
              <box class="cal-row">
                {arr.slice(r * 7, r * 7 + 7).map((d) => {
                  const isToday =
                    d !== null &&
                    d === todayDay &&
                    month() === todayM &&
                    year() === todayY;

                  return (
                    <label
                      hexpand
                      halign={Gtk.Align.CENTER}
                      class={`cal-day${d === null ? " cal-empty" : ""}${isToday ? " cal-today" : ""}`}
                      label={d !== null ? String(d) : ""}
                    />
                  );
                })}
              </box>,
            );
          }

          return <box orientation={Gtk.Orientation.VERTICAL}>{rows}</box>;
        }}
      </With>
    </box>
  );
}

/* ─────────────────────────────────────────────
   Weather Section (UPDATED — NO POLLING HERE)
───────────────────────────────────────────── */

function WeatherLoading() {
  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      valign={Gtk.Align.CENTER}
      hexpand
      vexpand
    >
      <label
        class="cc-loading"
        label="Fetching weather…"
        halign={Gtk.Align.CENTER}
      />
    </box>
  );
}

function WeatherLoaded({ w }: { w: WeatherData }) {
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <box class="weather-current">
        <label class="weather-big-icon" label={w.current.icon} />
        <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
          <label class="weather-big-temp" label={w.current.temp} />
          <label class="weather-big-desc" label={w.current.desc} />
        </box>
      </box>

      <box class="weather-details">
        <box
          class="weather-detail-item"
          orientation={Gtk.Orientation.VERTICAL}
          hexpand
        >
          <label class="detail-icon" label="󰖖" />
          <label class="detail-val" label={w.current.feelsLike} />
          <label class="detail-lbl" label="Feels like" />
        </box>

        <box
          class="weather-detail-item"
          orientation={Gtk.Orientation.VERTICAL}
          hexpand
        >
          <label class="detail-icon" label="󰖑" />
          <label class="detail-val" label={w.current.humidity} />
          <label class="detail-lbl" label="Humidity" />
        </box>

        <box
          class="weather-detail-item"
          orientation={Gtk.Orientation.VERTICAL}
          hexpand
        >
          <label class="detail-icon" label="󰖝" />
          <label
            class="detail-val"
            label={`${w.current.windSpeed} ${w.current.windDir}`}
          />
          <label class="detail-lbl" label="Wind" />
        </box>
      </box>

      <box class="weather-forecast">
        {w.forecast.map((day) => (
          <box
            class="forecast-day"
            orientation={Gtk.Orientation.VERTICAL}
            hexpand
          >
            <label
              class="forecast-dow"
              label={day.date}
              halign={Gtk.Align.CENTER}
            />
            <label
              class="forecast-icon"
              label={day.icon}
              halign={Gtk.Align.CENTER}
            />
            <label
              class="forecast-hi"
              label={day.high}
              halign={Gtk.Align.CENTER}
            />
            <label
              class="forecast-lo"
              label={day.low}
              halign={Gtk.Align.CENTER}
            />
          </box>
        ))}
      </box>
    </box>
  );
}

function WeatherSection() {
  return (
    <box
      class="cc-section cc-weather"
      orientation={Gtk.Orientation.VERTICAL}
      hexpand
    >
      <With value={weather}>
        {(w: WeatherData | null) =>
          w ? <WeatherLoaded w={w} /> : <WeatherLoading />
        }
      </With>
    </box>
  );
}

/* ─────────────────────────────────────────────
   (System / Volume / UPS Sections unchanged)
   You can leave the rest of your file exactly
   as it already was.
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Control Center Window
───────────────────────────────────────────── */

export function ControlCenter({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let win: Astal.Window;
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  onCleanup(() => win?.destroy());

  return (
    <window
      $={(self) => {
        win = self;
        createEffect(() => {
          self.visible = ccVisible();
        });
      }}
      visible={false}
      name="control-center"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
      css="background: transparent;"
      keymode={Astal.Keymode.ON_DEMAND}
    >
      <box halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
        <box
          class="cc-root"
          orientation={Gtk.Orientation.VERTICAL}
          css="margin-top: 8px;"
        >
          <box class="cc-top-row">
            <CalendarSection />
            <WeatherSection />
          </box>
        </box>
      </box>
    </window>
  );
}
