import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { HumiditySensorAccessory } from './humiditySensorAccessory';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { TemperatureSensorAccessory } from './temperatureSensorAccessory';

export class Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {

    const devices = [
      {
        uniqueId: 'bi-temperature-sensor-1',
        displayName: 'BI Temperature Sensor',
        accessoryType: TemperatureSensorAccessory,
      },
      {
        uniqueId: 'bi-humidity-sensor-1',
        displayName: 'BI Humidity Sensor',
        accessoryType: HumiditySensorAccessory,
      },
    ];

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.uniqueId);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        if (device) {
          this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

          new device.accessoryType(this, existingAccessory);
          this.api.updatePlatformAccessories([existingAccessory]);
        } else if (!device) {
          this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        }
      } else {
        this.log.info('Adding new accessory:', device.displayName);

        const accessory = new this.api.platformAccessory(device.displayName, uuid);
        accessory.context.device = device;

        new device.accessoryType(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
