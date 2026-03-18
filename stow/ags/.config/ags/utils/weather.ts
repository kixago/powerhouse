// utils/weather.ts
import { fetch, URL } from "ags/fetch";
import { interval } from "ags/time";
import { createState } from "ags";

/* ──────────────────────────────────────────────────────────────
   Types (keep your existing types)
──────────────────────────────────────────────────────────────── */

export interface CurrentWeather {
  temp: string;
  feelsLike: string;
  humidity: string;
  windSpeed: string;
  windDir: string;
  desc: string;
  icon: string;
}

export interface ForecastDay {
  date: string;
  high: string;
  low: string;
  desc: string;
  icon: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  sunrise: string;
  sunset: string;
  weatherCode: number;
}

/* ──────────────────────────────────────────────────────────────
   Location Configuration
──────────────────────────────────────────────────────────────── */

const LATITUDE = 32.19;
const LONGITUDE = -80.88;
const TIMEZONE = "America/New_York";

/* ──────────────────────────────────────────────────────────────
   WMO Maps (keep your existing maps)
──────────────────────────────────────────────────────────────── */

const WMO_ICONS: Record<number, string> = {
  0: "󰖙", 1: "󰖙", 2: "󰖕", 3: "󰖐",
  45: "󰖑", 48: "󰖑",
  51: "󰖗", 53: "󰖗", 55: "󰖗", 56: "󰖗", 57: "󰖗",
  61: "󰖗", 63: "󰖔", 65: "󰖔", 66: "󰖗", 67: "󰖔",
  71: "󰖘", 73: "󰖘", 75: "󰖘", 77: "󰖘",
  80: "󰖗", 81: "󰖔", 82: "󰖔", 85: "󰖘", 86: "󰖘",
  95: "󰖓", 96: "󰖓", 99: "󰖓",
};

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Dense freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm with hail",
};

/* ──────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────────── */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function wmoIcon(code: number): string {
  return WMO_ICONS[code] ?? "󰖐";
}
function wmoDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Unknown";
}
function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}
function degreesToCompass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/* ──────────────────────────────────────────────────────────────
   Fetch using AGS's native fetch
──────────────────────────────────────────────────────────────── */

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // Build URL manually to avoid double-encoding commas
    const url = 
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LATITUDE}` +
      `&longitude=${LONGITUDE}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
      `&timezone=${encodeURIComponent(TIMEZONE)}` +
      `&forecast_days=5`;

    console.log("Weather: fetching from", url);

    const res = await fetch(url);

    if (!res.ok) {
      console.error("Weather: HTTP error", res.status);
      return null;
    }

    const json = await res.json();

    if (json.error) {
      console.error("Weather: API error", json.reason);
      return null;
    }

    const cur = json.current;
    const weatherCode: number = cur.weather_code;

    const current: CurrentWeather = {
      temp: `${cToF(cur.temperature_2m)}°F (${Math.round(cur.temperature_2m)}°C)`,
      feelsLike: `${cToF(cur.apparent_temperature)}°F (${Math.round(cur.apparent_temperature)}°C)`,
      humidity: `${cur.relative_humidity_2m}%`,
      windSpeed: `${kmhToMph(cur.wind_speed_10m)} mph`,
      windDir: degreesToCompass(cur.wind_direction_10m),
      desc: wmoDescription(weatherCode),
      icon: wmoIcon(weatherCode),
    };

    const daily = json.daily;
    const forecast: ForecastDay[] = daily.time
      .slice(0, 5)
      .map((dateStr: string, i: number) => {
        const code = daily.weather_code[i];
        return {
          date: DAY_NAMES[new Date(dateStr + "T00:00:00").getDay()],
          high: `${cToF(daily.temperature_2m_max[i])}°F`,
          low: `${cToF(daily.temperature_2m_min[i])}°F`,
          desc: wmoDescription(code),
          icon: wmoIcon(code),
        };
      });

    console.log("Weather: success, temp =", current.temp);

    return {
      current,
      forecast,
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0],
      weatherCode,
    };
  } catch (e) {
    console.error("Weather: fetch error", e);
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────
   State & Polling using interval()
──────────────────────────────────────────────────────────────── */

const [weather, setWeather] = createState<WeatherData | null>(null);

async function updateWeather(): Promise<void> {
  const data = await fetchWeather();
  if (data) {
    setWeather(data);
  }
}

// interval() fires IMMEDIATELY then every N ms
// This handles the "network not ready" case with retries
async function initWeather(): Promise<void> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`Weather: init attempt ${attempt}/6`);
    const data = await fetchWeather();
    if (data) {
      setWeather(data);
      console.log("Weather: initialized successfully");
      break;  // Success, exit loop
    }
    if (attempt < 6) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  
  // Start interval AFTER init completes (success or failure)
  interval(600_000, updateWeather);
}

initWeather();

// Run init
initWeather();

// Then poll every 10 minutes - interval fires immediately AND every interval
// But since we already did init, we start the interval after a delay
setTimeout(() => {
  interval(600_000, updateWeather);
}, 600_000);

export { weather };
