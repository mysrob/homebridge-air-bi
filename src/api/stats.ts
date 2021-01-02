import { Logger } from 'homebridge';
import { request, RequestConfig } from '.';
import { DeviceStats } from '../model';

export async function getDeviceStats(logger: Logger): Promise<DeviceStats> {
  const config: RequestConfig = {
    url: 'http://air.beskidinstruments.com/api/rest/201707250005/?token=1b60169caa7589435f66d1f11af8fe1c',
    method: 'GET',
  };

  const response = await request(config);
  logger.debug('Get Device Stats from ->', response.request.fromCache ? 'fromCache' : 'network');
  return response.data;
}
