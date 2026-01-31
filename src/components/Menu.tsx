'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems, type MenuCategory, type MenuItem } from '@/data/menu';

const categories: { value: MenuCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fish', label: 'Fish' },
  { value: 'accompaniments', label: 'Accompaniments' },
  { value: 'drinks', label: 'Drinks' },
];

function formatPrice(price: number) {
  return `KES ${price.toLocaleString()}`;
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-terracotta-100 hover:shadow-2xl hover:border-terracotta-300 transition-all group cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta-600 transition-colors duration-300">{item.name}</h3>
            <p className="mt-1 text-charcoal/80 text-sm sm:text-base">{item.description}</p>
          </div>
          <p className="font-semibold text-terracotta-600 text-lg whitespace-nowrap sm:ml-4 group-hover:scale-110 transition-transform duration-300">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export function Menu() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" className="section-padding bg-cream" aria-labelledby="menu-heading">
      <div className="container-wide">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="menu-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal">
            Our Menu
          </h2>
          <p className="mt-4 text-lg text-charcoal/80">
            Fresh from the lake, made with love. Informational menu — order when you visit.
          </p>
        </motion.div>

        {/* Category filters - tap friendly */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`min-h-[48px] px-6 py-3 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 ${activeCategory === cat.value
                ? 'bg-terracotta-600 text-white'
                : 'bg-white text-charcoal border border-terracotta-200 hover:border-terracotta-400 hover:bg-terracotta-50'
                }`}
              aria-pressed={activeCategory === cat.value}
              aria-label={`Filter menu by ${cat.label}`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
