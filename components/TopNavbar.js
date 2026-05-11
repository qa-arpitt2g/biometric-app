"use client";
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    // Redirect to login page
    router.push('/');
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center h-xl px-lg">
      <div className="flex items-center gap-lg">
        <h2 className="font-headline-sm text-headline-sm font-black text-primary">Attendance Portal</h2>
      </div>
      <div className="flex items-center gap-md">
        <button className="p-xs hover:bg-surface-container-highest rounded-full transition-all">
          <span className="material-symbols-outlined text-primary">apps</span>
        </button>
        
        {/* Profile Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/50 relative hover:ring-2 hover:ring-secondary/20 transition-all"
          >
            <Image
              alt="Admin Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9qhZOj6bBNPOVD34oiJ3WviYx84Ej_RgfwD049W_p4axw4QWS1t2jOqafmg8p3fUg7ZLinbQgZsx9BTD6w7y2kabvH39XbvroeGYf5gKjgejNB1CM4ZwbXOezxgavB8CrJqr6g-TVw3bWY0UxXPN0pOkYxYZrtl_NrA8QONPpJ-dnVHj8TaMcA4X3GlGfNT2dDEkOsTJOPg4znkIAXYSUkNYMBP0IAqdOcBJKOn7SAh1ju-je8l8-6yq1jlYpGGWi4LQDlGfSG2c"
              fill
              sizes="32px"
              className="object-cover"
            />
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
