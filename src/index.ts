import { Coords, getCoordsFromCity } from "./cityFetcher.js";
import {
  WeatherData,
  WeatherDayData,
  WeatherWeekData,
  getForecast,
  getWeather,
} from "./weatherFetcher.js";

async function main() {
  const city = process.argv[2];
  const scope = process.argv[3] ? process.argv[3] : "current";

  if (!city) {
    console.error("Usage: node dist/index.js <city>");
    process.exit(1);
  }

  const coords: Coords = await getCoordsFromCity({ city: city });

  if (scope === "current") {
    const weather: WeatherData = await getWeather(coords);

    console.log(
      `${coords.display}: ${weather.temp}°C, wind ${weather.wind} km/h`,
    );

    process.exit(1);
  } else if (scope === "forecast") {
    const forecast: WeatherWeekData = await getForecast(coords);

    console.log(`
      ${coords.display}:
      `);

    let day: WeatherDayData;

    for (let i = 0; i < forecast.days.length; i++) {
      day = forecast.days[i];

      console.log(
        `${day.date}: ${day.min}-${day.max}°C, windgusts ${day.gusts} km/h`,
      );
    }

    process.exit(1);
  }

  console.error("Usage: npm start <city> <current or forecast>");
  process.exit(1);
}

main();
