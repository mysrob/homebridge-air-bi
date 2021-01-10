import {
  Service,
  PlatformAccessory,
  CharacteristicGetCallback,
} from 'homebridge';
import { getDeviceStats } from './api/stats';

import { Platform } from './platform';

export class TemperatureSensorAccessory {
  private service: Service;

  private state = {
    temperature: 0,
  };

  private intervalId;

  constructor(
    private readonly platform: Platform,
    private readonly accessory: PlatformAccessory,
    private readonly apiUrl: string,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.CurrentTemperature, 0);

    this.service =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.displayName,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .setProps({ minValue: -100 })
      .on('get', this.getOn.bind(this));

    this.intervalId = setInterval(async () => {
      const { temperature } = await getDeviceStats(this.apiUrl, this.platform.log);
      this.state.temperature = temperature;
      this.platform.log.info('Updated Current Temperature ->', this.state.temperature);
    }, 60 * 1000);
  }

  getOn(callback: CharacteristicGetCallback) {
    const temperature = this.state.temperature;
    this.platform.log.debug('Get Characteristic Current Temperature ->', temperature);

    callback(null, temperature);
  }
}
