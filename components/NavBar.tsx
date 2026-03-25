'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Pond {
  id: string;
  name: string;
  unread: number;
}

interface NavBarProps {
  userAlias?: string;
  userEmoji?: string;
  activePondId?: string;
  activePondName?: string;
  ponds?: Pond[];
  totalUnread?: number;
  role?: string;
}

export default function NavBar({
  userAlias,
  userEmoji = '✉',
  activePondId,
  activePondName = 'My Pond',
  ponds = [],
  totalUnread = 0,
  role,
}: NavBarProps) {
  const [pondDropdownOpen, setPondDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPondDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function switchPond(pondId: string) {
    await fetch('/api/users/me/active-pond', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pondId }),
    });
    setPondDropdownOpen(false);
    router.refresh();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <nav
      className="w-full h-14 flex items-center px-6 border-b border-sky-blue"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Wordmark */}
      <Link href="/dashboard" className="font-playfair text-xl text-deep-forest mr-auto">
        Pond Post
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/nest" className="font-lato text-sm text-slate-dark hover:text-moss-green transition-colors">
          The Nest
        </Link>
        <Link href="/compose" className="font-lato text-sm text-slate-dark hover:text-moss-green transition-colors">
          Send
        </Link>
        {(role === 'Guardian' || role === 'Keeper') && (
          <Link href="/mud-clearer" className="font-lato text-sm text-slate-dark hover:text-moss-green transition-colors">
            Mud-Clearer
          </Link>
        )}
        {role === 'Keeper' && (
          <Link href="/admin" className="font-lato text-sm text-slate-dark hover:text-moss-green transition-colors">
            Admin
          </Link>
        )}
        <Link href="/settings" className="font-lato text-sm text-slate-dark hover:text-moss-green transition-colors">
          Settings
        </Link>

        {/* Pond Switcher */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setPondDropdownOpen(!pondDropdownOpen)}
            className="flex items-center gap-1.5 font-lato text-sm text-slate-dark hover:text-moss-green transition-colors border border-pond-blue rounded-lg px-3 py-1.5"
          >
            <span>{activePondName}</span>
            {totalUnread > 0 && (
              <span className="flex items-center justify-center rounded-full text-white font-bold text-xs bg-wax-red"
                style={{ minWidth: 18, height: 18, padding: '0 4px' }}>
                {totalUnread}
              </span>
            )}
            <span className="text-xs">▾</span>
          </button>

          {pondDropdownOpen && (
            <div className="dropdown-enter absolute right-0 top-10 w-72 border border-pond-blue rounded-lg shadow-lg z-50"
              style={{ backgroundColor: '#FAFAFA' }}>
              {ponds.map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchPond(p.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sky-blue transition-colors font-lato text-sm text-slate-dark"
                  style={{ borderLeft: p.id === activePondId ? '3px solid #606C38' : '3px solid transparent' }}
                >
                  <span>{p.name}</span>
                  {p.unread > 0 && (
                    <span className="rounded-full bg-wax-red text-white text-xs font-bold px-2 py-0.5">
                      {p.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User alias badge */}
        {userAlias && (
          <div className="flex items-center gap-1.5 font-playfair text-sm text-deep-forest">
            <span>{userEmoji}</span>
            <span className="max-w-32 truncate">{userAlias}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="font-lato text-sm text-guardian-slate hover:text-wax-red transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1 p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <span className="w-5 h-0.5 bg-slate-dark block" />
        <span className="w-5 h-0.5 bg-slate-dark block" />
        <span className="w-5 h-0.5 bg-slate-dark block" />
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-off-white border-b border-sky-blue z-40 flex flex-col p-4 gap-3">
          <Link href="/nest" className="font-lato text-sm text-slate-dark" onClick={() => setMobileMenuOpen(false)}>The Nest</Link>
          <Link href="/compose" className="font-lato text-sm text-slate-dark" onClick={() => setMobileMenuOpen(false)}>Send</Link>
          {(role === 'Guardian' || role === 'Keeper') && (
            <Link href="/mud-clearer" className="font-lato text-sm text-slate-dark" onClick={() => setMobileMenuOpen(false)}>Mud-Clearer</Link>
          )}
          {role === 'Keeper' && (
            <Link href="/admin" className="font-lato text-sm text-slate-dark" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
          )}
          <Link href="/settings" className="font-lato text-sm text-slate-dark" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
          <button onClick={handleLogout} className="font-lato text-sm text-wax-red text-left">Leave Pond</button>
        </div>
      )}
    </nav>
  );
}
