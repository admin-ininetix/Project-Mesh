"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-mesh-600 hover:text-mesh-700"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="4" fill="currentColor" opacity="0.9" />
              <circle cx="24" cy="8" r="4" fill="currentColor" opacity="0.7" />
              <circle cx="8" cy="24" r="4" fill="currentColor" opacity="0.7" />
              <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.9" />
              <line x1="8" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              <line x1="8" y1="24" x2="24" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              <line x1="8" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              <line x1="24" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              <line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <line x1="24" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            </svg>
            Project Mesh
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn btn-ghost text-sm">
              Feed
            </Link>
            <Link href="/communities" className="btn btn-ghost text-sm">
              Communities
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <>
                <Link href="/create" className="btn btn-primary btn-sm">
                  + Post
                </Link>
                <Link href="/notifications" className="btn btn-ghost btn-sm p-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Image
                      src={getAvatarUrl(session.user.image, session.user.username ?? session.user.name ?? "user")}
                      alt={session.user.name ?? "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-500">@{session.user.username}</p>
                      </div>
                      <Link
                        href={`/u/${session.user.username}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mein Profil
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Einstellungen
                      </Link>
                      {(session.user.role === "admin" || session.user.role === "moderator") && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-mesh-600 hover:bg-gray-50 font-medium"
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm">
                  Anmelden
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Registrieren
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Feed</Link>
            <Link href="/communities" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Communities</Link>
            {session ? (
              <>
                <Link href="/create" className="block px-4 py-2 text-sm text-mesh-600 font-medium hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>+ Post erstellen</Link>
                <Link href={`/u/${session.user.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Mein Profil</Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Einstellungen</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-lg">Abmelden</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Anmelden</Link>
                <Link href="/register" className="block px-4 py-2 text-sm text-mesh-600 font-medium hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Registrieren</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
