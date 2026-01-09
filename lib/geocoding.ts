type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1"
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "friends-place/0.1"
    }
  });

  if (!response.ok) {
    return null;
  }

  const data: Array<{ lat: string; lon: string; display_name: string }> = await response.json();

  if (!data.length) {
    return null;
  }

  const first = data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    displayName: first.display_name
  };
}
