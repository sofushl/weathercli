import { Coords } from "./cityFetcher.js";

const apiLink = ({ lat, lon }: Coords): string => {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
};

export type weatherData = {
  display?: string;
  temp: number;
  wind: number;
};

export async function getWeather({
  lat,
  lon,
  display,
}: Coords): Promise<weatherData> {
  const response = await fetch(apiLink({ lat: lat, lon: lon }), {
    headers: {
      "User-Agent": "Weathercli.weathergetter",
    },
  }).catch();

  const data = await response.json();

  if (data.length === 0) throw new Error("Invalid location probably");

  return {
    temp: parseFloat(data.current.temperature_2m),
    wind: parseFloat(data.current.wind_speed_10m),
    display: display,
  };
}
