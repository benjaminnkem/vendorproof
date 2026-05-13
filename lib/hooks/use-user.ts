import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../services/user-api';

const useUser = () => {
  const {
    data: user,
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  return { user, loading, refetch };
};

export default useUser;
