import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { AirQualitySensorAccessory } from './airQualitySensorAccessory';
import { HumiditySensorAccessory } from './humiditySensorAccessory';
import { TemperatureSensorAccessory } from './temperatureSensorAccessory';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ApiConfig, Device } from './model';

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
      this.discoverDevices(this.config.api as Array<ApiConfig>);
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices(api: ApiConfig[]) {

    const devices: Device[] = []; 
    api.forEach(apiItem => {
      devices.push({
        uniqueId: `bi-temperature-sensor-${apiItem.name.toLowerCase()}`,
        displayName: `BI Temperature Sensor ${apiItem.name}`,
        accessoryType: TemperatureSensorAccessory,
        apiUrl: apiItem.url,
      });
      devices.push({
        uniqueId: `bi-humidity-sensor-${apiItem.name.toLowerCase()}`,
        displayName: `BI Humidity Sensor ${apiItem.name}`,
        accessoryType: HumiditySensorAccessory,
        apiUrl: apiItem.url,
      });
      devices.push({
        uniqueId: `bi-air-quality-sensor-${apiItem.name.toLowerCase()}`,
        displayName: `BI Air Quality Sensor ${apiItem.name}`,
        accessoryType: AirQualitySensorAccessory,
        apiUrl: apiItem.url,
      });
    });

    for (const accessory of this.accessories) {
      const deviceExists = devices.some(d => this.api.hap.uuid.generate(d.uniqueId) === accessory.UUID);
      if (!deviceExists) {
        this.log.info('Removing existing accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.uniqueId);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        existingAccessory.displayName = device.displayName;
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        new device.accessoryType(this, existingAccessory, device.apiUrl);
        this.api.updatePlatformAccessories([existingAccessory]);
      } else {
        this.log.info('Adding new accessory:', device.displayName);

        const accessory = new this.api.platformAccessory(device.displayName, uuid);
        accessory.context.device = device;

        new device.accessoryType(this, accessory, device.apiUrl);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
