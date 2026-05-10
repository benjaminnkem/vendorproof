import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '../services/config-api';

const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  useQuery({
    queryFn: getAppConfig,
    queryKey: ['app', 'config'],
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 40 * 60 * 1000, // 40 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return <>{children}</>;
};

export default ConfigProvider;
