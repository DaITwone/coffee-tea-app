import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* ================= TYPES ================= */

export type UserProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type AuthContextType = {
  user: UserProfile | null;
  userId: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>; // ✅ thêm
};


/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  isLoggedIn: false,
  loading: true,
  refreshUser: async () => {},
});

/* ================= PROVIDER ================= */

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id ?? null;

    if (!userId) {
      setUser(null);
      return;
    }

    await fetchUserProfile(userId);
  };

  /* ===== FETCH USER PROFILE ===== */
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url, email")
      .eq("id", userId)
      .single();

    if (!error) {
      setUser(data);
    } else {
      setUser(null);
    }
  };

  /* ===== INIT + LISTEN AUTH ===== */
  useEffect(() => {
    // 1️⃣ Lấy session ban đầu
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user?.id ?? null;

      if (userId) {
        await fetchUserProfile(userId);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // 2️⃣ Lắng nghe thay đổi đăng nhập / đăng xuất
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id ?? null;

      if (userId) {
        await fetchUserProfile(userId);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ================= PROVIDER VALUE ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id ?? null,
        isLoggedIn: !!user,
        loading, refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => useContext(AuthContext);
