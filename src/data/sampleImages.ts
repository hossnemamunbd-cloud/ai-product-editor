export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  url: string;
  transparentUrl: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sneaker',
    name: 'Retro Running Sneaker',
    category: 'Footwear',
    url: '/samples/sneaker.jpg',
    transparentUrl: '/samples/sneaker_transparent.png'
  },
  {
    id: 'watch',
    name: 'Minimalist Chronograph',
    category: 'Accessories',
    url: '/samples/watch.jpg',
    transparentUrl: '/samples/watch_transparent.png'
  },
  {
    id: 'headphones',
    name: 'Wireless Studio Headphones',
    category: 'Electronics',
    url: '/samples/headphones.jpg',
    transparentUrl: '/samples/headphones_transparent.png'
  }
];
