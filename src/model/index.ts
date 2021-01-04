import { AirQualitySensorAccessory } from '../airQualitySensorAccessory';
import { HumiditySensorAccessory } from '../humiditySensorAccessory';
import { TemperatureSensorAccessory } from '../temperatureSensorAccessory';

export interface DeviceStats {
  aqiPl: number;
  humidity: number;
  pm10: number;
  pm25: number;
  temperature: number;
}

export interface ApiConfig {
  name: string;
  url: string;
}

export interface Device {
  uniqueId: string;
  displayName: string;
  accessoryType: typeof AirQualitySensorAccessory | typeof HumiditySensorAccessory | typeof TemperatureSensorAccessory;
  apiUrl: string;
}
