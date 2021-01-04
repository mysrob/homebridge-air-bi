import {
  Service,
  PlatformAccessory,
  CharacteristicGetCallback,
} from 'homebridge';
import { getDeviceStats } from './api/stats';

import { Platform } from './platform';

export class AirQualitySensorAccessory {
  private service: Service;

  private state = {
    airQuality: this.platform.Characteristic.AirQuality.UNKNOWN,
    pm10: 0,
    pm2_5:0,
  };

  private intervalId;

  constructor(
    private readonly platform: Platform,
    private readonly accessory: PlatformAccessory,
    private readonly apiUrl: string,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.AirQuality, this.platform.Characteristic.AirQuality.UNKNOWN)
      .setCharacteristic(this.platform.Characteristic.PM10Density, 0)
      .setCharacteristic(this.platform.Characteristic.PM2_5Density, 0);

    this.service =
      this.accessory.getService(this.platform.Service.AirQualitySensor) ||
      this.accessory.addService(this.platform.Service.AirQualitySensor);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.displayName,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.AirQuality)
      .on('get', this.getOnAirQuality.bind(this));
    this.service
      .getCharacteristic(this.platform.Characteristic.PM10Density)
      .on('get', this.getOnPM10Density.bind(this));
    this.service
      .getCharacteristic(this.platform.Characteristic.PM2_5Density)
      .on('get', this.getOnPM2_5Density.bind(this));

    this.intervalId = setInterval(async () => {
      const { aqiPl, pm10, pm25 } = await getDeviceStats(this.apiUrl, this.platform.log);
      this.state.airQuality = aqiPl;
      this.state.pm10 = pm10;
      this.state.pm2_5 = pm25;
      this.platform.log.info('Updated Current Air Quality ->', this.state.airQuality);
      this.platform.log.info('Updated Current PM10 Density ->', this.state.pm10);
      this.platform.log.info('Updated Current PM2.5 Density ->', this.state.pm2_5);
    }, 60 * 1000);
  }

  getOnAirQuality(callback: CharacteristicGetCallback) {
    const airQuality = this.state.airQuality;
    this.platform.log.debug('Get Characteristic Current Air Quality ->', airQuality);

    callback(null, airQuality);
  }

  getOnPM10Density(callback: CharacteristicGetCallback) {
    const pm10 = this.state.pm10;
    this.platform.log.debug('Get Characteristic Current PM10 Density ->', pm10);

    callback(null, pm10);
  }

  getOnPM2_5Density(callback: CharacteristicGetCallback) {
    const pm2_5 = this.state.pm2_5;
    this.platform.log.debug('Get Characteristic Current PM2.5 Density ->', pm2_5);

    callback(null, pm2_5);
  }
}
