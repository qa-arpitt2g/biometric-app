import Link from 'next/link';
import Brand from './Brand';

export default function Sidebar() {
  const navItems = [
    { name: 'Upload', icon: 'cloud_upload', href: '/upload', active: true },
  ];

  return (
    <aside className="relative w-full lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-sidebar-width bg-primary shadow-[0px_4px_20px_rgba(26,43,76,0.05)] flex flex-col py-4 px-4 sm:px-5 z-50">
      <div className="mb-10 px-1">
        <Brand light={true} className="mb-2" />
        <p className="font-body-sm text-body-sm text-on-primary/70">Admin</p>
      </div>

      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-sm px-md py-sm transition-colors rounded-lg group ${item.active
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-primary/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary'
              }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
