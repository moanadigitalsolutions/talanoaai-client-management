'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  CogIcon 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-neutral-200 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 bg-salesforce-600">
          <h1 className="text-xl font-semibold text-white">TalanoaAI</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded transition-colors
                  ${isActive 
                    ? 'bg-salesforce-50 text-salesforce-700 border-r-3 border-salesforce-600' 
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                  }
                `}
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 ${isActive ? 'text-salesforce-600' : 'text-neutral-500'}`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Mathew F</p>
              <p className="text-xs text-neutral-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
