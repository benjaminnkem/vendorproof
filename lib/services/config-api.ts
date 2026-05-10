import { ApiResponse } from '../config/api';
import { publicApi } from '../config/axios';
import { IAppConfig } from '../types/app.types';

export const getAppConfig = async () => {
  const { data } = await publicApi.get<ApiResponse<IAppConfig>>('/config');
  return data.data;
};
