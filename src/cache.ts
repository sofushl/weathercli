import {
  getForecast,
  getWeather,
  printForecast,
  printWeather,
  Scope,
  WeatherData,
  WeatherWeekData,
} from "./weatherFetcher.js";
import { Coords, getCoordsFromCity } from "./cityFetcher.js";

import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { time } from "console";

type Cache = {
  current: { [cities: string]: WeatherData };
  forecast: { [cities: string]: WeatherWeekData };
};

let cache: Cache;

const filePath = resolve("./.cache.json");

async function loadCache(): Promise<Cache> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return {
      current: {},
      forecast: {},
    };
  }
}

async function saveCache(cache: Cache): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(cache, null, 2), "utf-8");
}

export async function putCache(
  scope: Scope,
  city: string,
  data: WeatherWeekData | WeatherData,
) {
  cache[scope][city] = data;
  await saveCache(cache);
}

async function doRequest(city: string, scope: Scope) {
  const coords: Coords = await getCoordsFromCity({ city: city });

  switch (scope) {
    case "forecast":
      getForecast(coords);
      break;

    case "current":
      getWeather(coords);
      break;

    default:
      throw new Error("invalid scope: " + scope);
  }
}

export async function cacheFirst(
  city: string,
  scope: Scope,
): Promise<undefined> {
  if (!cache[scope][city]) {
    console.log("No cached data, fetching...");
    doRequest(city, scope);
    return;
  }

  const outdatedTimeForecast: number = 4 * 60 * 60 * 1000;
  const outdatedTimeCurrent: number = 10 * 60 * 1000;
  let timeLeft: number;

  switch (scope) {
    case "forecast":
      timeLeft = cache.forecast[city].time + outdatedTimeForecast - Date.now();
      if (timeLeft < 0) {
        console.log("Cache outdated, fetching...");
        const coords: Coords = await getCoordsFromCity({ city: city });
        getForecast(coords);
        return;
      }

      console.log(
        "Printing from cache, outdated in: (hours) " +
          Math.ceil(timeLeft / (60 * 600)) / 100,
      );
      printForecast(cache.forecast[city]);
      return;

    case "current":
      timeLeft = cache.current[city].time + outdatedTimeCurrent - Date.now();
      if (timeLeft < 0) {
        console.log("Cache outdated, fetching...");
        const coords: Coords = await getCoordsFromCity({ city: city });
        getWeather(coords);
        return;
      }

      console.log(
        "Printing from cache, outdated in: (minutes) " +
          Math.ceil(timeLeft / 600) / 100,
      );
      printWeather(cache.current[city]);
      return;

    default:
      throw new Error("invalid scope: " + scope);
  }
}

try {
  cache = await loadCache();
  console.log("Loaded cache");
} catch (e) {
  console.error(e);
}
