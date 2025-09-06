import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { CATEGORIES } from '../constants/categories';

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      const cart = await productService.getCart(user.id);
      setInCart(cart.some(item => item.productId === product.id));
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    if (product.sellerId === currentUser.id) {
      Alert.alert('Error', 'Cannot add your own product to cart');
      return;
    }

    if (!product.isAvailable) {
      Alert.alert('Error', 'This product is no longer available');
      return;
    }

    try {
      const result = await productService.addToCart(product.id);
      
      if (result.success) {
        setInCart(true);
        Alert.alert('Success', 'Product added to cart!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const result = await productService.removeFromCart(product.id);
      
      if (result.success) {
        setInCart(false);
        Alert.alert('Success', 'Product removed from cart');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove product from cart');
    }
  };

  const category = CATEGORIES.find(cat => cat.id === product.category);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.productImage}>
          <Text style={styles.imagePlaceholder}>📷</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={styles.category}>{category?.name || product.category}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.status,
            product.isAvailable ? styles.statusAvailable : styles.statusSold
          ]}>
            {product.isAvailable ? 'Available' : 'Sold'}
          </Text>
        </View>

        {product.isAvailable && product.sellerId !== currentUser?.id && (
          <View style={styles.actionContainer}>
            {inCart ? (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveFromCart}
              >
                <Text style={styles.removeButtonText}>Remove from Cart</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {product.sellerId === currentUser?.id && (
          <View style={styles.ownerContainer}>
            <Text style={styles.ownerText}>This is your product</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 48,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  category: {
    fontSize: 16,
    color: '#333',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusAvailable: {
    color: '#2e7d32',
  },
  statusSold: {
    color: '#f44336',
  },
  actionContainer: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ownerContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ownerText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
