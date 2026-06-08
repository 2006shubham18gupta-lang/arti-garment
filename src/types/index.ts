export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
  gradient: string;
}
