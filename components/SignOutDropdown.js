"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      localStorage.clear();
      sessionStorage.clear();

      const cookies = document.cookie.split(';');
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      console.log('[SECURITY] Session terminated at', new Date().toISOString());
      setIsDropdownOpen(false);

      setTimeout(() => {
        router.push('/');
      }, 300);
    } catch (error) {
      console.error('[ERROR] Sign-out failed:', error);
      router.push('/');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/50 relative hover:ring-2 hover:ring-secondary/20 transition-all bg-surface-container-highest flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-primary text-[20px]">logout</span>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsDropdownOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-outline-variant/30 py-2 z-[101] animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error-container/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
