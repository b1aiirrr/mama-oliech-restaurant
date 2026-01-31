'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image - high-res food / tilapia */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1920&q=80"
          alt="Fresh grilled tilapia and Kenyan sides on a plate - Mama Oliech signature dish"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 container-wide section-padding text-center text-white">
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold max-w-4xl mx-auto leading-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          The Taste of Lake Victoria in the Heart of Nairobi
        </motion.h1>
        <motion.p
          className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          Fresh tilapia, ugali, and the warmth of home. A legendary Kenyan dining experience since day one.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <Link href="#menu" className="btn-primary w-full sm:w-auto">
            View Menu
          </Link>
          <Link
            href="#visit-us"
            className="btn-secondary bg-white text-charcoal border-white hover:bg-white/90 w-full sm:w-auto"
          >
            Visit Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
