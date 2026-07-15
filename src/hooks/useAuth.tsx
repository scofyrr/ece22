import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  dni: string;
  full_name: string;
  grade: string;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  max_points?: number;
  level: number;
};

type BanInfo = { reason: string; until: string | null } | null;

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isTeacher: boolean;
  ban: BanInfo;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  isTeacher: false,
  ban: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [ban, setBan] = useState<BanInfo>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const [{ data: p }, { data: roles }, { data: bans }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase
        .from("user_bans" as never)
        .select("reason, until, active")
        .eq("user_id", uid)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    setProfile(p as Profile | null);
    const roleList = (roles ?? []).map((r: { role: string }) => r.role);
    setIsAdmin(roleList.includes("admin"));
    setIsTeacher(roleList.includes("docente") || roleList.includes("admin"));
    const activeBan = (bans ?? [])[0] as
      | { reason: string; until: string | null }
      | undefined;
    if (
      activeBan &&
      (!activeBan.until || new Date(activeBan.until) > new Date())
    ) {
      setBan({ reason: activeBan.reason, until: activeBan.until });
    } else {
      setBan(null);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsTeacher(false);
        setBan(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isTeacher,
        ban,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
