'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/login') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--dark-background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--sakay-yellow)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dark-background)]">
      <Sidebar />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--dark-background)]/80 backdrop-blur-sm border-b border-[var(--border-color)]">
          <div className="flex items-center justify-end px-6 py-4">
            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-xl hover:bg-[var(--elevated-surface)] transition-colors">
                <Bell size={20} className="text-[var(--secondary-text)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error-red)] rounded-full"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold">
                  A
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-[var(--primary-text)]">Admin</p>
                  <p className="text-xs text-[var(--tertiary-text)]">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
