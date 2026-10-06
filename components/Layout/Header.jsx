'use client';

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
  }, [menuOpen]);

  const isInner = pathname !== '/' && !pathname.startsWith('/signup');
  const firstName = session?.user?.name?.split(' ')[0] || '';

  const innerLinks = [
    { href: '/simple', label: 'Simple Mode' },
    { href: '/simulator', label: 'Engineering Workspace' },
    { href: '/learning-hub', label: 'Learning Hub' },
    { href: '/guide', label: 'Help' },
  ].filter(link => link.href !== pathname);

  const landingLinks = [
    { href: '/#modes', label: 'Modes' },
    { href: '/#process', label: 'How It Works' },
    { href: '/#why', label: 'Why BioSim' },
    { href: '/learning-hub', label: 'Learning Hub' },
    { href: '/guide', label: 'Guide' },
  ];

  const links = isInner ? innerLinks : landingLinks;

  return (
    <header className="bs-nav">

      <a href="/" className="bs-nav-logo">
        Bio<span className="bs-accent">Sim</span>
      </a>

      {/* Hamburger — mobile only */}
      <button
        className={`bs-hamburger ${menuOpen ? 'bs-hamburger-active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Nav links */}
      <nav className={`bs-nav-links ${menuOpen ? 'bs-nav-open' : ''}`}>
        {links.map(link => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}

        {/* Mobile only buttons */}
        <div className="bs-nav-mobile-btns">
          {isInner && session ? (
            <>
              <div className="bs-nav-mobile-user">
                <div className="bs-nav-avatar-sm">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <span>{firstName}</span>
              </div>
              <button
                className="bs-nav-btn-out"
                onClick={() => { signOut({ callbackUrl: '/' }); closeMenu(); }}
              >
                Sign Out
              </button>
            </>
          ) : !isInner ? (
            <>
              <a href="/signup" className="bs-nav-btn-out" onClick={closeMenu}>Log in</a>
              <a href="/signup" className="bs-nav-btn-solid" onClick={closeMenu}>Get Started</a>
            </>
          ) : null}
        </div>
      </nav>

      {/* Desktop right side */}
      <div className="bs-nav-btns">
        {isInner && session ? (
          <div className="bs-nav-user">
            <div className="bs-nav-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span className="bs-nav-username">{firstName}</span>
            <button
              className="bs-nav-signout"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </button>
          </div>
        ) : !isInner ? (
          <>
            <a href="/signup" className="bs-nav-btn-out">Log in</a>
            <a href="/signup" className="bs-nav-btn-solid">Get Started</a>
          </>
        ) : null}
      </div>

      {/* Mobile overlay */}
      <div
        className={`bs-nav-overlay ${menuOpen ? 'bs-nav-overlay-active' : ''}`}
        onClick={closeMenu}
      ></div>

    </header>
  );
};

export default Header;