import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/store/StoreContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProductProvider } from '@/store/ProductContext';
import { OrderProvider } from '@/store/OrderContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Arti Garment | Premium Clothing Store - Atarra, Banda',
  description: 'Discover premium traditional & modern clothing at Arti Garment, Atarra. Shop kurtas, sarees, lehengas, sherwanis, and kids wear. Quality fabrics, elegant designs, and affordable prices.',
  keywords: 'Indian clothing, kurta, saree, lehenga, sherwani, kids wear, Atarra, Banda, Uttar Pradesh, wedding collection, traditional wear, Arti Garment',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Arti Garment | Premium Clothing Store',
    description: 'Premium traditional & modern clothing for Men, Women, and Kids. Located in Atarra, Banda.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased text-slate-900 selection:bg-indigo-500/20 relative min-h-screen bg-slate-950">
        {/* Ambient Glowing Luxury Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Left Indigo Orb */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/15 to-purple-600/10 blur-[120px]" />
          {/* Top Right Rose Orb */}
          <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-600/10 to-rose-600/15 blur-[140px]" />
          {/* Center Gold Accent Orb */}
          <div className="absolute top-2/3 left-1/3 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-amber-500/8 to-yellow-600/5 blur-[160px]" />
          {/* Bottom Left Deep Purple Orb */}
          <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-900/20 to-violet-700/15 blur-[120px]" />
          {/* Geometric Luxury Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <AuthProvider>
          <ProductProvider>
            <StoreProvider>
              <OrderProvider>
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </OrderProvider>
            </StoreProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
