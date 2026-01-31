'use client';

import { motion } from 'framer-motion';

const address = 'Marcus Garvey Road, Kilimani / Upper Hill, Nairobi';

// Google Maps embed: Marcus Garvey Road, Kilimani, Nairobi (replace with exact Mama Oliech pin if needed)
const EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.814284693752!2d36.78761431475393!3d-1.2920999999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d3e3e3e3e3%3A0x0!2zMcKwMTcnMzEuNiJTIDM2wrA0NycxNS40IkU!5e0!3m2!1sen!2ske!4v1706700000000!5m2!1sen!2ske';

const openingHours = [
  { days: 'Monday – Sunday', hours: '10:00 AM – 10:00 PM' },
];

export function VisitUs() {
  return (
    <section id="visit-us" className="section-padding bg-cream" aria-labelledby="visit-heading">
      <div className="container-wide">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="visit-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal">
            Visit Us
          </h2>
          <p className="mt-4 text-lg text-charcoal/80">
            Find us on Marcus Garvey Road. We can&apos;t wait to welcome you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className="font-display text-xl font-semibold text-charcoal">Address</h3>
              <p className="mt-2 text-lg text-charcoal/90">{address}</p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-charcoal">Opening hours</h3>
              <ul className="mt-2 space-y-1 text-lg text-charcoal/90">
                {openingHours.map((row) => (
                  <li key={row.days}>
                    <span className="font-medium">{row.days}</span>: {row.hours}
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Mama Oliech Restaurant Marcus Garvey Road Nairobi')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex min-h-[48px]"
            >
              Get Directions
            </a>
          </motion.div>

          <motion.div
            className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] rounded-2xl overflow-hidden shadow-lg border border-terracotta-100"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <iframe
              src={EMBED_SRC}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mama Oliech Restaurant location on Marcus Garvey Road, Nairobi"
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
