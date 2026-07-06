"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Brand from './Brand';
import SignOutDropdown from './SignOutDropdown';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Employee', icon: 'groups', href: '/employees' },
    { name: 'Attendance', icon: 'event_available', href: '/attendance' },
  ];

  return (
    <aside className="relative w-full lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-sidebar-width bg-primary shadow-[0px_4px_20px_rgba(26,43,76,0.05)] flex flex-col py-3 px-3 lg:py-3 lg:px-3 z-50 overflow-hidden">
      <div className="mb-2 lg:mb-6 px-0.5">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <Brand light={true} compact />
          <div className="lg:hidden">
            <SignOutDropdown />
          </div>
        </div>

        <div className="flex items-center justify-between lg:block gap-3">
          <div className="flex-1 lg:flex-none flex items-center gap-2 p-2 lg:p-2.5 bg-on-primary/5 rounded-xl border border-on-primary/10 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm shadow-sm">
                A
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-on-primary text-sm leading-none">Admin</span>
            </div>
          </div>

          <nav className="flex lg:hidden flex-1 justify-end">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 transition-colors rounded-lg group ${isActive
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-primary/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-body-sm text-body-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <nav className="hidden lg:flex flex-1 flex-col space-y-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 transition-colors rounded-lg group ${isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-primary/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-body-sm text-body-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
