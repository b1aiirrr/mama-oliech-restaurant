'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function OurStory() {
  return (
    <section id="our-story" className="section-padding bg-white" aria-labelledby="story-heading">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
              alt="Warm restaurant interior - Mama Oliech dining experience"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
          <div>
            <motion.h2
              id="story-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Story
            </motion.h2>
            <motion.div
              className="mt-6 space-y-4 text-lg text-charcoal/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p>
                Mama Oliech Restaurant is more than a place to eat — it&apos;s a piece of Nairobi&apos;s soul. For
                decades we&apos;ve been serving the taste of Lake Victoria right here in Kilimani: fresh tilapia,
                ugali, kachumbari, and the kind of warmth that keeps locals and visitors coming back.
              </p>
              <p>
                Our legacy is built on quality, tradition, and community. From famous faces to families and
                first-time visitors, everyone is welcome at our table. We honour Mama Oliech&apos;s name by
                keeping things authentic, generous, and rooted in Kenyan hospitality.
              </p>
              <p>
                No frills, no fuss — just great food and the buzz of a place that feels like home. That&apos;s
                Mama Oliech.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
