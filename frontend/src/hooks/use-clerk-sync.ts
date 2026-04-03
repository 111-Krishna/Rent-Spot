import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authApi } from '@/lib/api';

/**
 * Hook to sync Clerk user with MongoDB backend.
 * Sends the real Clerk user profile (name, email, avatar) so the DB
 * always has accurate data instead of fallback "Clerk User" values.
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

        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.username || 'User';
        const email = user.primaryEmailAddress?.emailAddress || '';

        console.log('Syncing Clerk user:', user.id, fullName, email);
        const response = await authApi.syncClerkUser(token, {
          name: fullName,
          email,
          firstName,
          lastName,
          profileImageUrl: user.imageUrl || null,
        });
        console.log('User synced to MongoDB:', response.user);
      } catch (error) {
        console.error('Error syncing user to MongoDB:', error);
      }
    };

    syncUser();
  }, [isSignedIn, user, getToken]);
};
