import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";

export type TabKey =
  | "dashboard"
  | "adilet"
  | "ai-kmj-bzhb"
  | "ai-olympiad"
  | "courses-podcasts"
  | "qaz-quiz"
  | "methodology"
  | "whiteboard"
  | "library"
  | "subscriptions";


export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "teacher" | "admin";
}

interface AppState {
  // auth
  user: UserProfile | null;
  authReady: boolean;
  setAuthReady: (v: boolean) => void;
  setUser: (u: UserProfile | null) => void;
  logout: () => Promise<void>;

  // theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // navigation
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;

  // metrics (persisted in DB when logged in)
  points: number;
  setPoints: (n: number) => void;
  addPoints: (n: number) => Promise<void>;
  spendPoints: (n: number) => Promise<boolean>;
  students: number;
  lessonPlans: number;
  certificates: number;
  setCertificates: (n: number) => void;
  incrementCertificates: () => Promise<void>;

  // unlocked library/methodology items
  unlockedItems: string[];
  setUnlockedItems: (ids: string[]) => void;
  unlockItem: (id: string) => Promise<void>;

  // language

  lang: "kk" | "ru" | "en";
  setLang: (l: "kk" | "ru" | "en") => void;

  // subscription
  hasSubscription: boolean;
  setHasSubscription: (v: boolean) => void;
}


export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authReady: false,
      setAuthReady: (v) => set({ authReady: v }),
      setUser: (u) => set({ user: u }),
      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          activeTab: "dashboard",
          points: 0,
          certificates: 3,
          unlockedItems: [],
        });
      },

      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
        }
      },

      activeTab: "dashboard",
      setActiveTab: (t) => set({ activeTab: t }),

      points: 0,
      setPoints: (n) => set({ points: n }),
      addPoints: async (n) => {
        if (!get().hasSubscription) return;
        const next = get().points + n;
        set({ points: next });
        const uid = get().user?.id;
        if (uid) await supabase.from("profiles").update({ points: next }).eq("id", uid);
      },
      spendPoints: async (n) => {
        if (get().points < n) return false;
        const next = get().points - n;
        set({ points: next });
        const uid = get().user?.id;
        if (uid) await supabase.from("profiles").update({ points: next }).eq("id", uid);
        return true;
      },
      students: 112,
      lessonPlans: 18,
      certificates: 3,
      setCertificates: (n) => set({ certificates: n }),
      incrementCertificates: async () => {
        const next = get().certificates + 1;
        set({ certificates: next });
        const uid = get().user?.id;
        if (uid) await supabase.from("profiles").update({ certificates: next }).eq("id", uid);
      },

      unlockedItems: [],
      setUnlockedItems: (ids) => set({ unlockedItems: ids }),
      unlockItem: async (id) => {
        const cur = get().unlockedItems;
        if (cur.includes(id)) return;
        const next = [...cur, id];
        set({ unlockedItems: next });
        const uid = get().user?.id;
        if (uid) await supabase.from("profiles").update({ unlocked_items: next }).eq("id", uid);
      },

      lang: "kk",
      setLang: (l) => set({ lang: l }),

      hasSubscription: false,
      setHasSubscription: (v) => set({ hasSubscription: v }),
    }),
    {
      name: "qazaq-teachers-ai",
      partialize: (s) => ({
        theme: s.theme,
        lang: s.lang,
      }),
    },

  ),
);

// apply theme on load
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    const t = useAppStore.getState().theme;
    document.documentElement.classList.toggle("dark", t === "dark");
  });
}

// ---- Auth + profile sync ----
async function hydrateProfile(userId: string, email: string, fallbackName: string, avatarUrl?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, points, certificates, unlocked_items")
    .eq("id", userId)
    .maybeSingle();

  let profile = data;
  if (!profile && !error) {
    // ensure a row exists (in case trigger didn't fire)
    await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: fallbackName,
      avatar_url: avatarUrl ?? null,
    });
    const { data: again } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, points, certificates, unlocked_items")
      .eq("id", userId)
      .maybeSingle();
    profile = again;
  }

  const s = useAppStore.getState();
  s.setUser({
    id: userId,
    email,
    fullName: profile?.full_name || fallbackName,
    avatarUrl: profile?.avatar_url || avatarUrl,
    role: "teacher",
  });
  if (profile) {
    s.setPoints(profile.points ?? 0);
    s.setCertificates(profile.certificates ?? 3);
    s.setUnlockedItems(profile.unlocked_items ?? []);
  }
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const u = session.user;
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const name =
        (meta.full_name as string) ||
        (meta.name as string) ||
        (u.email ? u.email.split("@")[0] : "Ұстаз");
      const avatar = (meta.avatar_url as string) || (meta.picture as string);
      // defer to avoid auth deadlocks
      setTimeout(() => {
        hydrateProfile(u.id, u.email ?? "", name, avatar).finally(() =>
          useAppStore.getState().setAuthReady(true),
        );
      }, 0);
    } else {
      useAppStore.getState().setUser(null);
      useAppStore.getState().setAuthReady(true);
    }
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      supabase.auth.signOut().finally(() => {
        useAppStore.getState().setUser(null);
        useAppStore.getState().setAuthReady(true);
      });
      return;
    }

    if (!data.session) {
      useAppStore.getState().setAuthReady(true);
      return;
    }

    const u = data.session.user;
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const name =
      (meta.full_name as string) ||
      (meta.name as string) ||
      (u.email ? u.email.split("@")[0] : "Ұстаз");
    const avatar = (meta.avatar_url as string) || (meta.picture as string);

    hydrateProfile(u.id, u.email ?? "", name, avatar).finally(() =>
      useAppStore.getState().setAuthReady(true),
    );
  }).catch(() => {
    useAppStore.getState().setUser(null);
    useAppStore.getState().setAuthReady(true);
  });
}
