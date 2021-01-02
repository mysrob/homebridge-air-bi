import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { IAxiosCacheAdapterOptions, setup } from 'axios-cache-adapter';

export type RequestConfig = AxiosRequestConfig & {
  cache?: IAxiosCacheAdapterOptions;
};
export type RequestMethod = Method;

export interface MyResponse extends AxiosResponse {
  ok: boolean;
  status: number;
}

export const api = setup({
  cache: {
    maxAge: 15 * 60 * 1000,
    exclude: { query: false },
  },
});

export const request = async (config: RequestConfig): Promise<MyResponse> => {
  const response = await api.request(config);

  return {
    ok: response.status >= 200 && response.status < 400,
    ...response,
  };
};
