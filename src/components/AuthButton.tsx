"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="h-6 w-6 animate-pulse rounded-full bg-white/20"></div>;
  }

  if (user) {
    return (
      <div className="relative group">
        <button
          onClick={(e) => {
            e.currentTarget.nextElementSibling?.classList.toggle('hidden');
            e.currentTarget.nextElementSibling?.classList.toggle('flex');
          }}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white transition hover:text-accent-orange overflow-hidden rounded-full border border-transparent hover:border-white/20 p-1"
          title={user.email}
        >
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>
        
        {/* Dropdown menu */}
        <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 lg:group-hover:flex z-50">
          <Link href="/dashboard" className="rounded px-4 py-2 text-olive-900 hover:bg-olive-50">
            Dashboard
          </Link>
          <button onClick={handleSignOut} className="rounded px-4 py-2 text-left text-red-600 hover:bg-red-50">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white transition hover:text-accent-orange active:scale-95"
      aria-label="Login with Google"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <span className="hidden text-[10px] font-medium uppercase lg:block">Login</span>
    </button>
  );
}
