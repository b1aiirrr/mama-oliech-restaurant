const socialLinks = [
  { href: 'https://facebook.com/mamaoliech', label: 'Facebook', icon: 'facebook' },
  { href: 'https://instagram.com/mamaoliech', label: 'Instagram', icon: 'instagram' },
  { href: 'https://twitter.com/mamaoliech', label: 'Twitter', icon: 'twitter' },
  { href: 'https://wa.me/254700000000', label: 'WhatsApp', icon: 'whatsapp' },
];

function SocialIcon({ icon }: { icon: string }) {
  const path =
    icon === 'facebook'
      ? 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
      : icon === 'instagram'
        ? 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
        : icon === 'twitter'
          ? 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
          : 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.521 7.63c-1.907 0-3.776-.512-5.416-1.48L4 21.408l.883-3.047c-1.063-1.636-1.624-3.535-1.624-5.496 0-5.166 4.2-9.366 9.369-9.366 2.503 0 4.857.974 6.626 2.744 1.77 1.77 2.742 4.125 2.742 6.623 0 5.168-4.201 9.368-9.368 9.368m0-18.734C7.535 3.278 3.555 7.258 3.555 12.14c0 1.56.407 3.085 1.18 4.436L3 21.03l4.582-1.201c1.31.714 2.784 1.09 4.288 1.091h.004c4.881 0 8.859-3.98 8.862-8.861 0-2.365-.92-4.59-2.592-6.262C16.471 4.125 14.246 3.205 11.88 3.205z';

  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream pt-20 pb-10">
      <div className="container-wide px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/10">
          <div className="text-center md:text-left space-y-4">
            <p className="font-display text-3xl font-bold text-terracotta-500">Mama Oliech.</p>
            <p className="text-cream/60 max-w-xs mx-auto md:mx-0 leading-relaxed italic">
              "The taste of Lake Victoria in the heart of Nairobi. Authentic, fresh, and unforgettable."
            </p>
            <ul className="flex items-center justify-center md:justify-start gap-4 pt-4" aria-label="Social media links">
                {socialLinks.map((link) => (
                    <li key={link.href}>
                        <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 hover:bg-terracotta-600 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 group inline-flex"
                            aria-label={link.label}
                        >
                            <SocialIcon icon={link.icon} />
                        </a>
                    </li>
                ))}
            </ul>
          </div>

          <div className="text-center space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">Bank Deposits</h4>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                <p className="text-xs text-cream/40 uppercase tracking-tighter font-bold">I&M Bank</p>
                <p className="text-lg font-display text-terracotta-400">0150 7455 3861 50</p>
                <p className="text-xs text-cream/40 px-4 uppercase tracking-widest text-[10px]">Mama Oliech Restaurant</p>
                <div className="pt-2">
                    <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-white/60">Branch: Community, Nairobi</span>
                </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-4 font-medium">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">Contact Us</h4>
            <p className="text-cream/80">Marcus Garvey Rd, Nairobi</p>
            <p className="text-cream/80">+254 700 000 000</p>
            <a 
                href="mailto:mamaoliechrestaurant2026@gmail.com" 
                className="text-cream/80 hover:text-terracotta-400 transition-colors uppercase tracking-widest text-[10px] font-bold block overflow-hidden text-ellipsis"
            >
                mamaoliechrestaurant2026@gmail.com
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10 opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                &copy; {year} Mama Oliech Restaurant. Global Presence.
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-terracotta-500">Privacy</a>
                <a href="#" className="hover:text-terracotta-500">Terms</a>
                <a href="#" className="hover:text-terracotta-500">Sitemap</a>
            </div>
        </div>
      </div>
    </footer>
  );

}
