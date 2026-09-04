'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  FlaskConical, 
  BookOpen, 
  User 
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  matchPrefix: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    matchPrefix: '/'
  },
  {
    name: 'Homework',
    href: '/homework',
    icon: FileText,
    matchPrefix: '/homework'
  },
  {
    name: 'Tests',
    href: '/tests',
    icon: FlaskConical,
    matchPrefix: '/test'
  },
  {
    name: 'Books',
    href: '/books',
    icon: BookOpen,
    matchPrefix: '/books'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    matchPrefix: '/profile'
  }
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on full-screen test examination mode or admin pages
  if (pathname?.startsWith('/admin') || (pathname?.startsWith('/test/') && !pathname?.includes('/result') && pathname !== '/tests')) {
    return null;
  }

  const isItemActive = (item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(item.matchPrefix);
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]"
    >
      <div className="max-w-md md:max-w-lg mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-150 select-none group ${
                  active 
                    ? 'text-indigo-600 font-bold' 
                    : 'text-slate-500 hover:text-indigo-600 font-medium'
                }`}
              >
                {/* Active Indicator Top Dot / Bar */}
                {active && (
                  <span className="absolute top-0 w-8 h-1 rounded-full bg-indigo-600 animate-in fade-in zoom-in duration-200" />
                )}

                <div className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-indigo-50 scale-105' : 'group-hover:bg-slate-50'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>

                <span className={`text-[11px] leading-tight tracking-tight transition-all ${
                  active ? 'font-bold text-indigo-700' : 'font-medium'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
