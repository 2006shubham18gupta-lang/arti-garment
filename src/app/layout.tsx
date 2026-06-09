import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/store/StoreContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProductProvider } from '@/store/ProductContext';
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
      <body className="antialiased">
        <AuthProvider>
          <ProductProvider>
            <StoreProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </StoreProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
