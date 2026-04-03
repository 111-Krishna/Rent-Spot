import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { authApi } from "@/lib/api";

type UserRoleState = {
  role: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  userId: string | null;
};

/**
 * Hook to fetch the current user's role from the backend.
 * Returns role, isAdmin flag, and loading state.
 */
export const useUserRole = (): UserRoleState => {
  const { isSignedIn, getToken } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!isSignedIn) {
        setRole(null);
        setUserId(null);
        setIsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }
        const { user } = await authApi.getCurrentUser(token);
        setRole(user.role);
        setUserId(user._id);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [isSignedIn, getToken]);

  return {
    role,
    isAdmin: role === "admin",
    isLoading,
    userId,
  };
};
