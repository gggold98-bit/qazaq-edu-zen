import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabKey =
  | "dashboard"
  | "adilet"
  | "methodology"
  | "whiteboard"
  | "library"
  | "academy"
  | "subscriptions"
  | "admin";

export interface UserProfile {
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "teacher" | "admin";
}

interface AppState {
  // auth
  user: UserProfile | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginWithGoogle: () => void;
  register: (email: string, password: string, fullName: string) => { ok: boolean; error?: string };
  logout: () => void;

  // theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // navigation
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;

  // metrics
  points: number;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => boolean;
  students: number;
  lessonPlans: number;
  certificates: number;
  incrementCertificates: () => void;

  // unlocked library/methodology items
  unlockedItems: string[];
  unlockItem: (id: string) => void;

  // admin mode
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const MOCK_EMAIL = "karlygash@gmail.com";
const MOCK_PASS = "teacher2026";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email, password) => {
        if (email.trim().toLowerCase() === MOCK_EMAIL && password === MOCK_PASS) {
          set({
            user: {
              email: MOCK_EMAIL,
              fullName: "Суханберді Қарлығаш",
              role: "teacher",
            },
          });
          return { ok: true };
        }
        // accept any other valid-looking email for demo
        if (email.includes("@") && password.length >= 6) {
          set({
            user: {
              email,
              fullName: email.split("@")[0],
              role: "teacher",
            },
          });
          return { ok: true };
        }
        return { ok: false, error: "Қате email немесе құпиясөз" };
      },
      loginWithGoogle: () => {
        set({
          user: {
            email: MOCK_EMAIL,
            fullName: "Суханберді Қарлығаш",
            role: "teacher",
          },
        });
      },
      register: (email, password, fullName) => {
        if (!email.includes("@")) return { ok: false, error: "Жарамды email енгізіңіз" };
        if (password.length < 6) return { ok: false, error: "Құпиясөз кемінде 6 таңба" };
        set({ user: { email, fullName: fullName || email.split("@")[0], role: "teacher" } });
        return { ok: true };
      },
      logout: () => set({ user: null, activeTab: "dashboard", isAdminMode: false }),

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

      points: 450,
      addPoints: (n) => set({ points: get().points + n }),
      spendPoints: (n) => {
        if (get().points < n) return false;
        set({ points: get().points - n });
        return true;
      },
      students: 112,
      lessonPlans: 18,
      certificates: 3,
      incrementCertificates: () => set({ certificates: get().certificates + 1 }),

      unlockedItems: [],
      unlockItem: (id) => {
        if (!get().unlockedItems.includes(id)) {
          set({ unlockedItems: [...get().unlockedItems, id] });
        }
      },

      isAdminMode: false,
      toggleAdminMode: () => set({ isAdminMode: !get().isAdminMode }),
    }),
    {
      name: "qazaq-teachers-ai",
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        points: s.points,
        certificates: s.certificates,
        unlockedItems: s.unlockedItems,
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
