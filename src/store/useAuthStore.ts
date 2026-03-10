'use client';

import { getSupabaseClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthStore {
  /** ログイン中のユーザー。未ログインは null */
  user: User | null;
  /** 初期化（セッション確認）完了フラグ */
  isInitialized: boolean;

  /** アプリ起動時にセッションを確認して user を復元する */
  initialize: () => Promise<void>;
  /** Magic Link メールを送信する */
  signInWithMagicLink: (email: string) => Promise<void>;
  /** ログアウトする（PGlite データは消さない） */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isInitialized: false,

  initialize: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isInitialized: true });
      return;
    }

    // getSession() でローカルのリフレッシュトークンによるセッション更新を先に行い、
    // その後 getUser() でサーバー検証する（期限切れトークンの自動更新を確保）
    await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user: user ?? null, isInitialized: true });

    // セッション変更をリッスンして user を同期する
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      set({ user: session?.user ?? null });
    });
  },

  signInWithMagicLink: async (email) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase が設定されていません');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    set({ user: null });
  },
}));
