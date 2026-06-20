import { Coords } from "./cityFetcher.js";

const apiLink = ({ lat, lon }: Coords, scope: Scope): string => {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${
    scope === "current"
      ? "current=temperature_2m,wind_speed_10m"
      : scope === "forecast"
        ? "daily=temperature_2m_max,temperature_2m_min,wind_gusts_10m_max"
        : ""
  }&timezone=auto`;
};

export type Scope = "forecast" | "current";

export type WeatherData = {
  display?: string;
  temp: number;
  wind: number;
};

export type WeatherDayData = {
  date: string;
  max: number;
  min: number;
  gusts: number;
};

export type WeatherWeekData = {
  days: WeatherDayData[];
  display?: string;
};

type CurrentApiResponse = {
  current: { temperature_2m: number; wind_speed_10m: number };
};
type WeekApiResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_gusts_10m_max: number[];
  };
};

async function getData<T>(link: string): Promise<T> {
  const response = await fetch(link, {
    headers: {
      "User-Agent": "Weathercli.weathergetter",
    },
  }).catch();

  const data = await response.json();

  if (data.length === 0) throw new Error("Invalid location probably");

  return data as T;
}

export async function getWeather({
  lat,
  lon,
  display,
}: Coords): Promise<WeatherData> {
  const data = await getData<CurrentApiResponse>(
    apiLink({ lat: lat, lon: lon }, "current"),
  );

  return {
    temp: Number(data.current.temperature_2m),
    wind: Number(data.current.wind_speed_10m),
    display: display,
  };
}
export async function getForecast({
  lat,
  lon,
  display,
}: Coords): Promise<WeatherWeekData> {
  const data = await getData<WeekApiResponse>(
    apiLink({ lat: lat, lon: lon }, "forecast"),
  );

  let outWeatherData: WeatherDayData[] = [];

  for (let i = 0; i < 7; i++) {
    outWeatherData.push({
      date: data.daily.time[i],

      max: Number(data.daily.temperature_2m_max[i]),

      min: Number(data.daily.temperature_2m_min[i]),

      gusts: Number(data.daily.wind_gusts_10m_max[i]),
    });
  }
  return {
    days: outWeatherData,
    display: display,
  };
}
