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
    <aside className="relative w-full lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-sidebar-width bg-primary shadow-[0px_4px_20px_rgba(26,43,76,0.05)] flex flex-col py-3 px-3 lg:py-4 lg:px-5 z-50">
      <div className="mb-2 lg:mb-10 px-1">
        <div className="flex items-center justify-between mb-3 lg:mb-6">
          <Brand light={true} />
          <div className="lg:hidden">
            <SignOutDropdown />
          </div>
        </div>

        <div className="flex items-center justify-between lg:block gap-3">
          <div className="flex-1 lg:flex-none flex items-center gap-3 p-2 lg:p-3 bg-on-primary/5 rounded-xl border border-on-primary/10">
            <div className="relative">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm lg:text-base shadow-sm">
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
              className={`flex items-center gap-sm px-md py-sm transition-colors rounded-lg group ${isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-primary/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md text-body-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
