import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cartApi } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return null;
    }
    setLoading(true);
    try {
      const res = await cartApi.get();
      const items = res.data?.items || [];
      const count = items.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(count);
      return res.data;
    } catch {
      setCartCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{ cartCount, loading, refreshCart, setCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
