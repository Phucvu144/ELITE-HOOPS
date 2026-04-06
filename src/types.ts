export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  description: string;
  sizes: number[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export type Brand = 'All' | 'Nike' | 'Jordan' | 'Adidas';
export type Player = 'All' | 'LeBron' | 'KD' | 'Ja' | 'Tatum' | 'Luka' | 'Giannis' | 'Ant';
