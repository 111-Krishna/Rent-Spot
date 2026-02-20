import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authApi } from '@/lib/api';

/**
 * Hook to sync Clerk user with MongoDB backend
 * Automatically syncs when user is authenticated
 */
export const useClerkSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !user) return;

      try {
        const token = await getToken();
        if (!token) return;

        console.log('Syncing Clerk user:', user.id);
        const response = await authApi.syncClerkUser(token);
        console.log('User synced to MongoDB:', response.user);
      } catch (error) {
        console.error('Error syncing user to MongoDB:', error);
      }
    };

    syncUser();
  }, [isSignedIn, user, getToken]);
};
