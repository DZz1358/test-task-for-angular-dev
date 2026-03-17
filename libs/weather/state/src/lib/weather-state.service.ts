import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { take } from 'rxjs/operators';

import { FlatWeatherData, WeatherLocation, WeatherRequestStatus, WeatherSnapshot } from './weather-state.types';

const WEATHER_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'is_day',
] as const;

const DEFAULT_LOCATION: WeatherLocation = {
  name: 'Kyiv',
  country: 'Ukraine',
  latitude: 50.45,
  longitude: 30.51,
};

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const routes = {
  currentWeather: (location: WeatherLocation) =>
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=${WEATHER_FIELDS.join(',')}&timezone=auto&forecast_days=1`,
};

interface WeatherApiResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  current_units: {
    temperature_2m: string;
    apparent_temperature: string;
    relative_humidity_2m: string;
    precipitation: string;
    wind_speed_10m: string;
  };
}

function formatValue(value: number, unit: string): string {
  return `${value}${unit}`;
}

function describeWeatherCode(weatherCode: number): string {
  return WEATHER_CODE_LABELS[weatherCode] ?? 'Unknown conditions';
}

function mapResponse(body: WeatherApiResponse): WeatherSnapshot {
  return {
    observedAt: body.current.time,
    isDay: body.current.is_day === 1,
    temperature: body.current.temperature_2m,
    apparentTemperature: body.current.apparent_temperature,
    humidity: body.current.relative_humidity_2m,
    precipitation: body.current.precipitation,
    windSpeed: body.current.wind_speed_10m,
    weatherCode: body.current.weather_code,
    weatherSummary: describeWeatherCode(body.current.weather_code),
    units: {
      temperature: body.current_units.temperature_2m,
      humidity: body.current_units.relative_humidity_2m,
      precipitation: body.current_units.precipitation,
      windSpeed: body.current_units.wind_speed_10m,
    },
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeatherStateService {
  private readonly httpClient = inject(HttpClient);

  private readonly locationSignal = signal<WeatherLocation>(DEFAULT_LOCATION);
  private readonly statusSignal = signal<WeatherRequestStatus>('idle');
  private readonly weatherSignal = signal<WeatherSnapshot | null>(null);
  private readonly errorSignal = signal<string | null>(null);

  readonly location = this.locationSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly weather = this.weatherSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isLoading = computed(() => this.status() === 'loading');
  readonly hasError = computed(() => this.status() === 'error');
  readonly hasWeather = computed(() => this.status() === 'success' && this.weather() !== null);
  readonly locationLabel = computed(() => {
    const location = this.location();
    return `${location.name}, ${location.country}`;
  });
  readonly flatWeather = computed<FlatWeatherData | null>(() => {
    const location = this.location();
    const weather = this.weather();
    if (!weather) {
      return null;
    }

    return {
      location: `${location.name}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
      observedAt: weather.observedAt,
      conditions: weather.weatherSummary,
      temperature: formatValue(weather.temperature, weather.units.temperature),
      apparentTemperature: formatValue(weather.apparentTemperature, weather.units.temperature),
      humidity: formatValue(weather.humidity, weather.units.humidity),
      precipitation: formatValue(weather.precipitation, weather.units.precipitation),
      windSpeed: formatValue(weather.windSpeed, weather.units.windSpeed),
      dayPeriod: weather.isDay ? 'Day' : 'Night',
    };
  });

  load(): void {
    const location = this.location();

    this.statusSignal.set('loading');
    this.errorSignal.set(null);

    this.httpClient
      .get<WeatherApiResponse>(routes.currentWeather(location))
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.weatherSignal.set(mapResponse(response));
          this.statusSignal.set('success');
        },
        error: () => {
          this.statusSignal.set('error');
          this.errorSignal.set('Unable to load weather data right now.');
        },
      });
  }

  refresh(): void {
    this.load();
  }
}
