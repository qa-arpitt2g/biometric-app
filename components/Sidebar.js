import Link from 'next/link';
import Brand from './Brand';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '#', active: false },
    { name: 'Upload', icon: 'cloud_upload', href: '/upload', active: true },
    { name: 'Attendance Records', icon: 'event_available', href: '#', active: false },
    { name: 'Reports', icon: 'assessment', href: '#', active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-primary shadow-[0px_4px_20px_rgba(26,43,76,0.05)] flex flex-col py-md px-sm z-50">
      <div className="mb-xl px-xs">
        <Brand light={true} className="mb-2" />
        <p className="font-body-sm text-body-sm text-on-primary/70">Enterprise Admin</p>
      </div>
      
      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-sm px-md py-sm transition-colors rounded-lg group ${
              item.active
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-primary/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-md space-y-xs">
        <button className="w-full mb-md py-sm px-md bg-secondary text-on-secondary rounded-lg font-bold shadow-md hover:bg-secondary-fixed-dim/90 transition-all active:scale-[0.98]">
          Generate Report
        </button>
      </div>
    </aside>
  );
}
