import { weather } from "../utils/weather";
import { toggleCC } from "../utils/controlCenter";

export function Weather() {
  return (
    <button class="weather-button" onClicked={toggleCC}>
      <box>
        <label
          class="weather-icon"
          label={weather((w) => w?.current.icon ?? "󰖐")}
        />
        <label
          class="weather-temp"
          label={weather((w) => w?.current.temp ?? "──°F (──°C)")}
        />
      </box>
    </button>
  );
}
