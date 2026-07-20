import { useEffect, useState } from "react";

export interface AppUser {
  id: number;
  email: string;
  full_name?: string;
  type?: string;
  role?: string;
  territory?: string;
  region?: string;
}

export const useCurrentAppUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin = user?.type === "admin" || user?.role === "admin";
  const isManager = user?.type === "supervisor" || user?.role === "manager";
  return { user, loading, isAdmin, isManager };
};
