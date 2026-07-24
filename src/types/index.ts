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

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'rejected';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cod';
  status: OrderStatus;
  totalAmount: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferBanner {
  id: string;
  firestoreId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  priority: number;
  position?: string; // 'homepage' | 'hero' | 'top' | 'middle'
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  firestoreId?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

