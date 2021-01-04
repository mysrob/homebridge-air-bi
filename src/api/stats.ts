import { Logger } from 'homebridge';
import { request, RequestConfig } from '.';
import { DeviceStats } from '../model';

export async function getDeviceStats(url: string, logger: Logger): Promise<DeviceStats> {
  const config: RequestConfig = {
    url,
    method: 'GET',
  };

  const response = await request(config);
  logger.debug('Get Device Stats from ->', response.request.fromCache ? 'fromCache' : 'network');
  return response.data;
}
