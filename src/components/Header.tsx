'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CartButton } from './CartButton';

const navLinks = [
  { href: '#menu', label: 'Menu' },
  { href: '#our-story', label: 'Our Story' },
  { href: '#visit-us', label: 'Visit Us' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-terracotta-200/50">
      <nav className="container-wide px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Mama Oliech Restaurant Logo"
              width={80}
              height={80}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
            <span className="font-display text-lg sm:text-xl font-semibold text-charcoal">
              Mama Oliech Restaurant
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 mr-auto ml-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-charcoal font-medium hover:text-terracotta-600 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 rounded"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Global Actions (Always visible) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <Link href="#menu" className="btn-primary text-sm py-2 px-6">
                View Menu
              </Link>
            </div>

            <CartButton />

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-charcoal hover:bg-terracotta-100 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-terracotta-200/50"
            >
              <ul className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 px-4 text-charcoal font-medium hover:bg-terracotta-50 rounded-lg flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 sm:hidden">
                  <Link
                    href="#menu"
                    onClick={() => setMenuOpen(false)}
                    className="block btn-primary text-center w-full"
                  >
                    View Menu
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
