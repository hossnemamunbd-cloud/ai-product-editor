export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sneaker',
    name: 'Retro Running Sneaker',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'watch',
    name: 'Minimalist Chronograph',
    category: 'Accessories',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'headphones',
    name: 'Wireless Studio Headphones',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }
];
