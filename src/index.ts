import { Coords, getCoordsFromCity } from "./cityFetcher.js";
import { weatherData, getWeather } from "./weatherFetcher.js";

async function main() {
  const city = process.argv[2];

  if (!city) {
    console.error("Usage: node dist/index.js <city>");
    process.exit(1);
  }

  const coords: Coords = await getCoordsFromCity({ city: city });

  const weather: weatherData = await getWeather(coords);
  console.log(
    `${coords.display}: ${weather.temp}°C, wind ${weather.wind} km/h`,
  );
}

main();
