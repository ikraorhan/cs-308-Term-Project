import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { cartAPI } from "../components/api";

const CartContext = createContext(null);
const STORAGE_KEY = "cart_items";

const saveToStorage = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const generateCartId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Convert backend cart item to frontend format
const backendToFrontendItem = (item) => ({
  id: item.product_id,
  name: item.product_name,
  price: item.price,
  quantity: item.quantity,
  image_url: item.image_url || '',
  description: item.description || '',
  cartItemId: item.id, // Backend cart item ID for updates
});

// Convert frontend cart item to backend format
const frontendToBackendItem = (item) => ({
  product_id: item.id,
  product_name: item.name,
  price: item.price,
  quantity: item.quantity,
  image_url: item.image_url || '',
  description: item.description || '',
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readFromStorage());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasMergedRef = useRef(false);
  
  const [notification, setNotification] = useState("");
  const [notificationTimer, setNotificationTimer] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('is_authenticated') === 'true';
      setIsAuthenticated(authStatus);
      return authStatus;
    };

    checkAuth();

    // Listen for auth changes
    const handleStorageChange = (e) => {
      if (e.key === 'is_authenticated') {
        const wasAuth = isAuthenticated;
        const nowAuth = checkAuth();
        
        // User just logged in - merge carts
        if (!wasAuth && nowAuth) {
          mergeCartsOnLogin();
        }
        // User logged out - clear backend sync
        else if (wasAuth && !nowAuth) {
          hasMergedRef.current = false;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const interval = setInterval(() => {
      const authStatus = checkAuth();
      if (authStatus && !hasMergedRef.current) {
        mergeCartsOnLogin();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Sync cart with backend when authenticated (only on mount or when auth changes)
  useEffect(() => {
    if (isAuthenticated && !isSyncing && !hasMergedRef.current) {
      syncCartFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveToStorage(cartItems);
  }, [cartItems]);

  // Merge local cart with backend cart on login
  const mergeCartsOnLogin = async () => {
    if (hasMergedRef.current || isSyncing) return;
    
    setIsSyncing(true);
    hasMergedRef.current = true;

    try {
      const localItems = readFromStorage();
      
      if (localItems.length > 0) {
        // Merge local cart with backend
        const response = await cartAPI.mergeCart(localItems);
        if (response.data && response.data.items) {
          const mergedItems = response.data.items.map(backendToFrontendItem);
          setCartItems(mergedItems);
          saveToStorage(mergedItems);
        }
      } else {
        // No local items, just fetch from backend
        await syncCartFromBackend();
      }
    } catch (error) {
      console.error('Failed to merge cart:', error);
      // If merge fails, just try to fetch from backend
      try {
        await syncCartFromBackend();
      } catch (fetchError) {
        console.error('Failed to fetch cart from backend:', fetchError);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync cart from backend
  const syncCartFromBackend = async () => {
    if (!isAuthenticated || isSyncing) return;

    setIsSyncing(true);
    try {
      const response = await cartAPI.getCart();
      if (response.data && response.data.items) {
        const backendItems = response.data.items.map(backendToFrontendItem);
        setCartItems(backendItems);
        saveToStorage(backendItems);
      }
    } catch (error) {
      console.error('Failed to sync cart from backend:', error);
      // If sync fails, keep local cart
    } finally {
      setIsSyncing(false);
    }
  };

  const showNotification = (message) => {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
    }
    setNotification(message);
    const timer = setTimeout(() => {
      setNotification("");
    }, 3000);
    setNotificationTimer(timer);
  };


  const addToCart = async (product) => {
    const newItem = {
      id: product.id ?? generateCartId(),
      name: product.name,
      price: product.price ?? 0,
      quantity: 1,
      image_url: product.image_url,
      description: product.description,
    };

    // Update local state immediately (optimistic update)
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item,
        );
      }
      return [...prev, newItem];
    });

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await cartAPI.addToCart(frontendToBackendItem(newItem));
        // Refresh from backend to get updated cart item ID
        await syncCartFromBackend();
      } catch (error) {
        console.error('Failed to sync add to cart:', error);
        // Keep local update even if backend fails
      }
    }

    showNotification(`${product.name} is added to your cart.`);
  };

  const removeFromCart = async (productId) => {
    const itemToRemove = cartItems.find((item) => item.id === productId);

    // Update local state immediately
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    
    // Sync with backend if authenticated
    if (isAuthenticated && itemToRemove && itemToRemove.cartItemId) {
      try {
        await cartAPI.removeFromCart(itemToRemove.cartItemId);
      } catch (error) {
        console.error('Failed to sync remove from cart:', error);
        // Re-add item if backend fails
        if (itemToRemove) {
          setCartItems((prev) => [...prev, itemToRemove]);
        }
      }
    }
    
    if (itemToRemove) {
      showNotification(`${itemToRemove.name} removed from cart.`);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const itemToUpdate = cartItems.find((item) => item.id === productId);
    
    // Update local state immediately
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Sync with backend if authenticated
    if (isAuthenticated && itemToUpdate && itemToUpdate.cartItemId) {
      try {
        await cartAPI.updateCartItem(itemToUpdate.cartItemId, newQuantity);
      } catch (error) {
        console.error('Failed to sync update quantity:', error);
        // Revert to old quantity if backend fails
        if (itemToUpdate) {
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === productId ? { ...item, quantity: itemToUpdate.quantity } : item
            )
          );
        }
      }
    }

    showNotification("Cart quantity updated.");
  };

  const clearCart = async () => {
    // Update local state immediately
    setCartItems([]);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
      } catch (error) {
        console.error('Failed to sync clear cart:', error);
        // Keep local clear even if backend fails
      }
    }

    showNotification("Cart has been cleared.");
  };

  const clearNotification = () => setNotification("");

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      notification, 
      clearNotification, 
    }),
    [cartItems, notification], 
  );
  

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}