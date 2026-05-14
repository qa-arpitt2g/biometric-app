"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call sign-out API to clear server-side session
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      // Clear all client-side session/auth data
      localStorage.clear();
      sessionStorage.clear();

      // Delete all cookies manually (including auth tokens)
      const cookies = document.cookie.split(';');
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Log sign-out for security audit
      console.log('[SECURITY] Session terminated at', new Date().toISOString());

      // Close dropdown before redirecting
      setIsDropdownOpen(false);

      // Redirect to login page with a delay to ensure cleanup
      setTimeout(() => {
        router.push('/');
      }, 300);
    } catch (error) {
      console.error('[ERROR] Sign-out failed:', error);
      // Still redirect to login on error
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:justify-between items-center gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3 w-full justify-between">
        <h2 className="font-headline-sm text-headline-sm font-black text-primary">Attendance Portal</h2>
      </div>
      <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
        {/* Profile Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/50 relative hover:ring-2 hover:ring-secondary/20 transition-all bg-surface-container-highest flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">logout</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Overlay to close dropdown on click outside */}
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsDropdownOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-outline-variant/30 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                  <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Administrator</p>
                </div>
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
      </div>
    </header>
  );
}
