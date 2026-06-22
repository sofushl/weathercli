type Location = {
  city: string;
  state?: string;
  country?: string;
};

export type Coords = {
  lat: number;
  lon: number;
  display: string;
  city: string;
};

const apiLink = ({ city, state, country }: Location): string => {
  return `https://nominatim.openstreetmap.org/search?city=${city}&state=${state ? state : ""}&country=${country ? country : ""}&format=json&limit=5`;
};

export async function getCoordsFromCity({
  city,
  state = "",
  country = "",
}: Location): Promise<Coords> {
  const url = apiLink({ city, state, country });

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Weathercli.locationgetter",
    },
  });

  const data = await response.json();

  if (data.length === 0) throw new Error();

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name,
    city: city,
  };
}
