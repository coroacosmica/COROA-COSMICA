"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/?openCart=true`,
      },
    });
  };

  // Person icon SVG — used in ALL states
  const personIcon = (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white/40">
        {personIcon}
      </div>
    );
  }

  // Logged in state
  if (user) {
    return (
      <Link
        href="/dashboard"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white transition hover:text-accent-orange active:scale-95"
        title="Go to Dashboard"
      >
        {personIcon}
        <span className="hidden text-[10px] font-medium uppercase lg:block">Profile</span>
      </Link>
    );
  }

  // Not logged in
  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white transition hover:text-accent-orange active:scale-95"
      aria-label="Login with Google"
    >
      {personIcon}
      <span className="hidden text-[10px] font-medium uppercase lg:block">Login</span>
    </button>
  );
}
