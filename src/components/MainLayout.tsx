'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartProvider } from '@/contexts/CartContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages that should show the full-screen immersive UI (no global header/footer)
    const isImmersivePage = pathname?.startsWith('/checkout') ||
        pathname?.startsWith('/payment') ||
        pathname?.startsWith('/order-confirmation');

    return (
        <CartProvider>
            {!isImmersivePage && <Header />}
            <main className={`flex-1 ${isImmersivePage ? 'pt-0' : 'pt-0'}`}>
                {children}
            </main>
            {!isImmersivePage && <Footer />}
        </CartProvider>
    );
}
