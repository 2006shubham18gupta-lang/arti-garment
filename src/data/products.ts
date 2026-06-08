import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Royal Navy Silk Kurta',
    price: 1899,
    originalPrice: 2999,
    category: 'men',
    subcategory: 'Kurta',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy Blue', 'Black', 'Maroon'],
    images: ['/images/products/kurta-navy.png'],
    description: 'Exquisite navy blue silk kurta with traditional gold embroidery on the neckline and cuffs. Crafted from premium art silk fabric with a luxurious feel. Perfect for festive occasions, weddings, and celebrations. Features a mandarin collar with button placket and side slits for ease of movement.',
    rating: 4.5,
    reviews: 128,
    isNew: true,
    isTrending: true,
    discount: 37,
    inStock: true,
  },
  {
    id: 'prod-002',
    name: 'Banarasi Silk Saree - Crimson',
    price: 3499,
    originalPrice: 5999,
    category: 'women',
    subcategory: 'Saree',
    sizes: ['Free Size'],
    colors: ['Red', 'Green', 'Blue'],
    images: ['/images/products/saree-red.png'],
    description: 'Magnificent Banarasi silk saree in rich crimson with intricate gold zari work throughout. Features traditional paisley and floral motifs with a heavy pallu. Comes with matching blouse piece. An heirloom-quality piece perfect for weddings and festive occasions.',
    rating: 4.8,
    reviews: 256,
    isTrending: true,
    discount: 42,
    inStock: true,
  },
  {
    id: 'prod-003',
    name: 'Emerald Embroidered Kurti',
    price: 1299,
    originalPrice: 1999,
    category: 'women',
    subcategory: 'Kurti',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Green', 'Blue', 'Pink'],
    images: ['/images/products/kurti-green.png'],
    description: 'Elegant emerald green kurti with exquisite paisley embroidery in gold thread. Features a round neckline with button placket, three-quarter sleeves, and straight cut silhouette. Made from premium cotton silk blend for comfort and elegance.',
    rating: 4.3,
    reviews: 89,
    isNew: true,
    discount: 35,
    inStock: true,
  },
  {
    id: 'prod-004',
    name: 'Royal Ivory Sherwani',
    price: 7999,
    originalPrice: 12999,
    category: 'men',
    subcategory: 'Sherwani',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ivory', 'Gold', 'Silver'],
    images: ['/images/products/sherwani-ivory.png'],
    description: 'Magnificent ivory sherwani with elaborate gold zardozi embroidery. Features a mandarin collar, front opening with ornamental buttons, and full-length design. Crafted from premium raw silk with intricate paisley and floral motifs. Includes matching churidar. A regal choice for weddings and celebrations.',
    rating: 4.9,
    reviews: 312,
    isTrending: true,
    discount: 38,
    inStock: true,
  },
  {
    id: 'prod-005',
    name: 'Bridal Pink Lehenga Set',
    price: 9999,
    originalPrice: 15999,
    category: 'women',
    subcategory: 'Lehenga',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pink', 'Red', 'Maroon'],
    images: ['/images/products/lehenga-pink.png'],
    description: 'Stunning pink bridal lehenga choli set with heavy gold sequin and embroidery work. Features a semi-stitched blouse with elaborate design, flared lehenga with traditional motifs, and matching net dupatta with scattered sequins and gold border. Perfect for brides and wedding occasions.',
    rating: 4.7,
    reviews: 198,
    isNew: true,
    isTrending: true,
    discount: 37,
    inStock: true,
  },
  {
    id: 'prod-006',
    name: 'Kids Maroon Kurta Set',
    price: 899,
    originalPrice: 1499,
    category: 'kids',
    subcategory: 'Kurta Set',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['Maroon', 'Blue', 'White'],
    images: ['/images/products/kids-kurta.png'],
    description: 'Adorable maroon kurta pajama set for kids with traditional gold embroidered neckline and cuffs. Made from soft, comfortable art silk that is gentle on young skin. Features easy button closures and elastic waistband on pajama for comfort.',
    rating: 4.4,
    reviews: 67,
    isNew: true,
    discount: 40,
    inStock: true,
  },
  {
    id: 'prod-007',
    name: 'Royal Purple Silk Dupatta',
    price: 1499,
    originalPrice: 2499,
    category: 'women',
    subcategory: 'Dupatta',
    sizes: ['Free Size'],
    colors: ['Purple', 'Red', 'Green'],
    images: ['/images/products/dupatta-purple.png'],
    description: 'Luxurious purple silk dupatta with elaborate gold zari work featuring traditional paisley patterns and intricate borders. Perfect as a standalone accessory or paired with any ethnic outfit to elevate your look. Made from premium Banarasi silk.',
    rating: 4.6,
    reviews: 145,
    isTrending: true,
    discount: 40,
    inStock: true,
  },
  {
    id: 'prod-008',
    name: 'Classic White Cotton Kurta',
    price: 799,
    originalPrice: 1299,
    category: 'men',
    subcategory: 'Kurta',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Sky Blue', 'Beige'],
    images: ['/images/products/kurta-navy.png'],
    description: 'Timeless white cotton kurta with subtle chikankari embroidery. Light and breathable fabric perfect for daily wear and casual occasions. Features a mandarin collar, full sleeves, and straight cut design for a classic look.',
    rating: 4.2,
    reviews: 203,
    discount: 38,
    inStock: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
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
