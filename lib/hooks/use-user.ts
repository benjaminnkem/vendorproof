import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../services/user-api';
import { useAuthStore } from '../store/auth.store';

const useUser = () => {
  const { accessToken } = useAuthStore();

  const {
    data: user,
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: !!accessToken,
  });

  return { user, loading, refetch };
};

export default useUser;
