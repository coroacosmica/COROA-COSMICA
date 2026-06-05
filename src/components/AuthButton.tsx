"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
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
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white transition hover:text-accent-orange active:scale-95"
          title={user.email || "Profile"}
        >
          {personIcon}
          <span className="hidden text-[10px] font-medium uppercase lg:block">Profile</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 z-[9999]">
            <Link
              href="/dashboard"
              className="block rounded px-4 py-2 text-olive-900 hover:bg-olive-50"
              onClick={() => setDropdownOpen(false)}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded px-4 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
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
