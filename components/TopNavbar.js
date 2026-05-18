"use client";
import SignOutDropdown from './SignOutDropdown';

export default function TopNavbar() {
  return (
    <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex flex-row justify-between items-center gap-3 px-4 py-2 sm:px-6 sm:py-3">
      <div className="flex items-center gap-3 w-auto">
        <h2 className="font-title-lg sm:font-headline-sm text-title-lg sm:text-headline-sm font-black text-primary">Attendance Portal</h2>
      </div>
      <div className="hidden lg:flex items-center gap-3 w-auto justify-end">
        <SignOutDropdown />
      </div>
    </header>
  );
}
