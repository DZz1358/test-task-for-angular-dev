export type WeatherRequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherUnits {
  temperature: string;
  humidity: string;
  precipitation: string;
  windSpeed: string;
}

export interface WeatherSnapshot {
  observedAt: string;
  isDay: boolean;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  weatherSummary: string;
  units: WeatherUnits;
}

export type FlatWeatherData = Readonly<Record<string, string | number>>;
