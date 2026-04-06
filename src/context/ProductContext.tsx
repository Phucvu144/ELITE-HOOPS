import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Brand, Player } from '../types';
import productsData from '../data/products.json';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: Brand;
  setSelectedBrand: (brand: Brand) => void;
  selectedPlayer: Player;
  setSelectedPlayer: (player: Player) => void;
  clearFilters: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<Player>('All');

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setProducts(productsData as Product[]);
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      console.log('ProductProvider unmounted - cleaning up');
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
      const matchesPlayer = selectedPlayer === 'All' || product.name.toLowerCase().includes(selectedPlayer.toLowerCase());
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesBrand && matchesPlayer && matchesSearch;
    });
  }, [products, selectedBrand, selectedPlayer, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedPlayer('All');
  };

  const value = {
    products,
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedBrand,
    setSelectedBrand,
    selectedPlayer,
    setSelectedPlayer,
    clearFilters,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
