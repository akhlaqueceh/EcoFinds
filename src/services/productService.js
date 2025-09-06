import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';
const CART_KEY = 'ecofinds_cart';
const PURCHASES_KEY = 'ecofinds_purchases';

export const productService = {
  // Get all products
  async getProducts(search = '', category = '') {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  },

  // Get product by ID
  async getProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  },

  // Create a new product
  async createProduct(productData) {
    try {
      const user = await authService.getCurrentUser();
      const productWithSeller = {
        ...productData,
        seller_id: user.id,
        id: Date.now(), // Generate a simple ID
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productWithSeller),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, product: data.product };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Update a product
  async updateProduct(productId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, product: data.product };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Delete a product
  async deleteProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Get products by seller
  async getProductsBySeller(sellerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/seller/${sellerId}`);
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Get seller products error:', error);
      return [];
    }
  },

  // Search products
  async searchProducts(query, category = null) {
    return await this.getProducts(query, category);
  },

  // Add to cart
  async addToCart(productId) {
    try {
      const cart = await this.getCart();
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const product = await this.getProduct(productId);
        if (product) {
          cart.push({ ...product, quantity: 1 });
        }
      }
      
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add to cart' };
    }
  },

  // Get cart
  async getCart() {
    try {
      const cartData = await AsyncStorage.getItem(CART_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Get cart error:', error);
      return [];
    }
  },

  // Remove from cart
  async removeFromCart(productId) {
    try {
      const cart = await this.getCart();
      const updatedCart = cart.filter(item => item.id !== productId);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove from cart' };
    }
  },

  // Purchase items in cart
  async purchaseCart() {
    try {
      const cart = await this.getCart();
      if (cart.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      const purchases = cart.map(item => ({
        ...item,
        purchaseDate: new Date().toISOString(),
        purchaseId: Date.now() + Math.random()
      }));

      // Add to purchase history
      const existingPurchases = await this.getPurchases();
      const updatedPurchases = [...existingPurchases, ...purchases];
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(updatedPurchases));

      // Clear cart
      await AsyncStorage.removeItem(CART_KEY);

      return { success: true, purchases };
    } catch (error) {
      return { success: false, error: 'Failed to complete purchase' };
    }
  },

  // Get purchase history
  async getPurchases() {
    try {
      const purchasesData = await AsyncStorage.getItem(PURCHASES_KEY);
      return purchasesData ? JSON.parse(purchasesData) : [];
    } catch (error) {
      console.error('Get purchases error:', error);
      return [];
    }
  },
};
