import { Product } from '@/types';

// Hardcoded demo products removed as per requirement.
// The application now displays exclusively real products from Firebase Firestore.
export const products: Product[] = [];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

export const getTrendingProducts = (): Product[] => {
  return products.filter(p => p.isTrending);
};

export const getNewArrivals = (): Product[] => {
  return products.filter(p => p.isNew);
};

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();
  return products.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
};

