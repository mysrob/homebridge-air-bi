import {
  Service,
  PlatformAccessory,
  CharacteristicGetCallback,
} from 'homebridge';
import { getDeviceStats } from './api/stats';

import { Platform } from './platform';

export class HumiditySensorAccessory {
  private service: Service;

  private state = {
    humidity: 0,
  };

  private intervalId;

  constructor(
    private readonly platform: Platform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, 0);

    this.service =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.displayName,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on('get', this.getOn.bind(this));

    this.intervalId = setInterval(async () => {
      const { humidity } = await getDeviceStats(this.platform.log);
      this.state.humidity = humidity;
      this.platform.log.info('Updated Current Humidity ->', this.state.humidity);
    }, 60 * 1000);
  }

  getOn(callback: CharacteristicGetCallback) {
    const humidity = this.state.humidity;
    this.platform.log.debug('Get Characteristic Current Humidity ->', humidity);

    callback(null, humidity);
  }
}
