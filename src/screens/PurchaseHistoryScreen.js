import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { CATEGORIES } from '../constants/categories';

const PurchaseHistoryScreen = ({ navigation }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Login Required', 'Please log in to view your purchase history', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]);
        return;
      }

      const userPurchases = await productService.getPurchases();
      setPurchases(userPurchases);
    } catch (error) {
      Alert.alert('Error', 'Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPurchase = ({ item }) => {
    const category = CATEGORIES.find(cat => cat.id === item.category);
    
    return (
      <View style={styles.purchaseCard}>
        <View style={styles.purchaseImage}>
          <Text style={styles.imagePlaceholder}>📷</Text>
        </View>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.purchasePrice}>${item.price}</Text>
          <Text style={styles.purchaseCategory}>
            {category?.name || item.category}
          </Text>
          <Text style={styles.purchaseDate}>
            Purchased: {formatDate(item.purchasedAt)}
          </Text>
        </View>
        <View style={styles.purchaseStatus}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <Text style={styles.purchaseCount}>
          {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={purchases}
        renderItem={renderPurchase}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.purchasesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading purchase history...' : 'No purchases yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Your completed purchases will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  purchaseCount: {
    fontSize: 16,
    color: '#666',
  },
  purchasesList: {
    padding: 16,
  },
  purchaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  purchaseImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 24,
  },
  purchaseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  purchasePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  purchaseCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  purchaseDate: {
    fontSize: 12,
    color: '#999',
  },
  purchaseStatus: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: 'bold',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PurchaseHistoryScreen;
