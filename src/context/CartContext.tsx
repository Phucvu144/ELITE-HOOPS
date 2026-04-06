import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; delta: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      let updatedItems;

      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: updatedItems, totalAmount, totalQuantity };
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: updatedItems, totalAmount, totalQuantity };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const newQuantity = Math.max(1, item.quantity + action.payload.delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: updatedItems, totalAmount, totalQuantity };
    }

    case 'CLEAR_CART':
      return { items: [], totalAmount: 0, totalQuantity: 0 };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persistence (Optional Nike Style - LocalStorage)
  useEffect(() => {
    const savedCart = localStorage.getItem('elite-hoops-cart');
    if (savedCart) {
      // Logic to load saved cart could go here if needed
      // dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
    
    return () => {
      console.log('CartProvider unmounted - cleaning up');
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('elite-hoops-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product: Product) => dispatch({ type: 'ADD_TO_CART', payload: product });
  const removeFromCart = (id: number) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const updateQuantity = (id: number, delta: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, delta } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
