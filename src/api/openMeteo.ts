import { Coords } from "../cityFetcher.js";
import { HttpClient } from "./http.js";
import { z } from "zod";

export type Scope = "forecast" | "current";

export type CurrentData = {
  display?: string;
  time: number;
  temp: number;
  wind: number;
};

type DayData = {
  date: string;
  max: number;
  min: number;
  gusts: number;
};

export type ForecastData = {
  days: DayData[];
  time: number;
  display?: string;
};

type CurrentApiResponse = {
  current: { temperature_2m: number; wind_speed_10m: number };
};

const CurrentSchema = z.object({
  current: z.object({ temperature_2m: z.number(), wind_speed_10m: z.number() }),
});

type ForecastApiResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_gusts_10m_max: number[];
  };
};

const ForecastSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    wind_gusts_10m_max: z.array(z.number()),
  }),
});

export class OpenMeteoClient {
  constructor(private http: HttpClient) {}

  async getCurrent(coords: Coords): Promise<CurrentData> {
    const response: CurrentApiResponse = await this.fetchCurrent(coords);

    const data: CurrentApiResponse = CurrentSchema.parse(response);

    return this.convertCurrent(data, coords);
  }

  async getForecast(coords: Coords): Promise<ForecastData> {
    const response: ForecastApiResponse = await this.fetchForecast(coords);

    const data: ForecastApiResponse = ForecastSchema.parse(response);

    return this.convertForecast(data, coords);
  }

  private apiLink(
    { lat, lon }: Omit<Coords, "display" | "city">,
    scope: Scope,
  ): string {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${
      scope === "current"
        ? "current=temperature_2m,wind_speed_10m"
        : scope === "forecast"
          ? "daily=temperature_2m_max,temperature_2m_min,wind_gusts_10m_max"
          : ""
    }&timezone=auto`;
  }

  private async fetchCurrent(coords: Coords): Promise<CurrentApiResponse> {
    return this.http.get<CurrentApiResponse>(this.apiLink(coords, "current"));
  }

  private async fetchForecast(coords: Coords): Promise<ForecastApiResponse> {
    return this.http.get<ForecastApiResponse>(this.apiLink(coords, "forecast"));
  }

  private convertForecast(
    data: ForecastApiResponse,
    coords: Coords,
  ): ForecastData {
    let outWeatherData: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      outWeatherData.push({
        date: data.daily.time[i],

        max: Number(data.daily.temperature_2m_max[i]),

        min: Number(data.daily.temperature_2m_min[i]),

        gusts: Number(data.daily.wind_gusts_10m_max[i]),
      });
    }

    const out: ForecastData = {
      time: Date.now(),
      days: outWeatherData,
      display: coords.display,
    };

    return out;
  }

  private convertCurrent(
    data: CurrentApiResponse,
    coords: Coords,
  ): CurrentData {
    const out: CurrentData = {
      time: Date.now(),
      temp: Number(data.current.temperature_2m),
      wind: Number(data.current.wind_speed_10m),
      display: coords.display,
    };
    return out;
  }
}

export function printCurrent(data: CurrentData) {
  console.log(`${data.display}: ${data.temp}°C, wind ${data.wind} km/h`);
}

export function printForecast(data: ForecastData) {
  console.log(`
      ${data.display}:
      `);

  let day: DayData;

  for (let i = 0; i < data.days.length; i++) {
    day = data.days[i];

    console.log(
      `${day.date}: ${day.min}-${day.max}°C, windgusts ${day.gusts} km/h`,
    );
  }
}
