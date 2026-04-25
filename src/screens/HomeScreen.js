import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import routeService from '../services/route.service';
import storageService from '../services/storage.service';



const HomeScreen = ({ navigation, user }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPickup, setTotalPickup] = useState('');
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [shops, setShops] = useState([]);
  const [autototalPickup, setAutoTotalPickup] = useState('');

  useEffect(() => {
    loadRoute();
    loadProgress();
  }, []);

  const loadRoute = async () => {
    setLoading(true);
    try {
      setTotalPickup('');
      setPickupConfirmed(false);
      storageService.clearDeliveryProgress();
      storageService.clearAllShopData();

      const result = await routeService.getTodayRoute();

      if (result.success && result.route && result.route.length > 0) {
        if (result.route.length > 1) {
          Alert.alert('Multiple Routes', 'You have multiple routes scheduled for today. Please contact admin.');
          setLoading(false);
          return;
        }
        const todayRoute = result.route[0]; // or let user pick one
        setRoute(todayRoute);
        initializeShops(todayRoute.shops);
      } else {
        Alert.alert('No Route', result.message || 'No delivery scheduled for today');
        setRoute(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load route');

    } finally {
      setLoading(false);
    }
  };

  const initializeShops = (routeShops) => {
    const initializedShops = routeShops.map(shop => ({
      ...shop,
      status: 'pending',
      sellout: '',
      cashCollected: '',
      notes: '',
      pickup: shop.targetAmount || 0, // ✅ Pickup = Target
    }));
    setShops(initializedShops);

    // Auto-calculate total pickup from all shop targets
    const calculatedTotal = routeShops.reduce((sum, shop) => sum + (shop.targetAmount || 0), 0);
    setAutoTotalPickup(calculatedTotal.toString());
  };

  const loadProgress = async () => {
    const progress = await storageService.getDeliveryProgress();
    if (progress) {
      setTotalPickup(progress.totalPickup?.toString() || '');
      setPickupConfirmed(progress.pickupConfirmed || false);
      if (progress.shops) {
        setShops(progress.shops);
      }
    }
  };

  const reset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This action cannot be Undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive', onPress: () => {

            setRoute(null);


          }
        }
      ])


  };
  const saveProgress = async () => {
    await storageService.saveDeliveryProgress({
      totalPickup: parseInt(totalPickup) || 0,
      pickupConfirmed,
      shops,
    });
  };

  const handleConfirmPickup = () => {
    if (!totalPickup || parseInt(totalPickup) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid pickup quantity');
      return;
    }
    
    Alert.alert('Success', 'Do You want to Pickup quantity confirmed this action cannot be undone!',
      [{ text: 'Cancel', style: 'cancel' },
        , {
          text: 'Confirm', onPress: () => {
            setPickupConfirmed(true);
            saveProgress();
          }
      }]
    );
  };

  const handleShopPress = (shop, index) => {
    if (!pickupConfirmed) {
      Alert.alert('Confirm Pickup First', 'Please confirm your total pickup quantity before visiting shops');
      return;
    }

    navigation.navigate('ShopDetail', {
      
      shop,
      shopIndex: index,
      totalPickup: parseInt(totalPickup),
      onUpdate: (updatedShop) => {
        const updatedShops = [...shops];
        updatedShops[index] = updatedShop;
        setShops(updatedShops);
        saveProgress();
      },
    });
  };

  const getCompletedCount = () => {
    return shops.filter(s => s.status === 'completed').length;
  };

  const canSubmit = () => {
    return pickupConfirmed && getCompletedCount() === shops.length;
  };

  const handleSubmit = () => {
    if (!canSubmit()) {
      Alert.alert('Incomplete', 'Please complete all shops before submitting');
      return;
    }

    navigation.navigate('Summary', {
      onRefresh: ()=>setRoute(null),
      shops,
      totalPickup: parseInt(totalPickup),
      route,
    });
  };


  const onRefresh = async () => {
    setRoute(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading route...</Text>
      </View>
    );
  }

  if (!route) {
    return (

      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
        </View>

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Route Refresh</Text>
          <Text style={styles.emptyText}>You don't have any deliveries scheduled for today refresh to confirm!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadRoute}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}!</Text>
        <Text style={styles.routeName}>{route.routeName}</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>

      </View>

      <ScrollView
        style={styles.content}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      >
        {/* Pickup Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Pickup</Text>
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>Reset Route</Text>
            </TouchableOpacity>
          </View>

          {!pickupConfirmed ? (
            <>
              <Text style={styles.autoLabel}>{user?.name} Today Your target is</Text>
              <Text style={styles.autoValue}>{autototalPickup} units</Text>
              <Text style={styles.autoHint}>
                Based on all shop targets for today, you need to pick up more than this {autototalPickup} amount.
              </Text>
              <TextInput
                style={styles.pickupInput}
                placeholder="Enter total pickup quantity"
                value={totalPickup}
                onChangeText={setTotalPickup}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPickup}>
                <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.pickupConfirmed}>
              <Text style={styles.pickupQuantity}>{totalPickup} units</Text>
              <Text style={styles.pickupLabel}>Total Pickup Confirmed ✅</Text>
            </View>
          )}
        </View>


        {/* Progress */}
        {pickupConfirmed && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Progress: {getCompletedCount()} / {shops.length} shops completed
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(getCompletedCount() / shops.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Shop List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shops to Visit ({shops.length})</Text>
          {shops.map((shop, index) => (
            <TouchableOpacity
              key={shop._id || index}
              style={styles.shopCard}
              onPress={() => handleShopPress(shop, index)}
            >
              <View style={styles.shopHeader}>
                <Text style={styles.shopIcon}>{getStatusIcon(shop.status)}</Text>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.shopName}</Text>
                  <Text style={styles.shopAddress}>{shop.address}</Text>
                </View>
              </View>
              {shop.status === 'completed' && (
                <View style={styles.shopStats}>
                  <Text style={styles.shopStat}>Sellout: {shop.sellout}</Text>
                  <Text style={styles.shopStat}>Cash: Rs. {shop.cashCollected}</Text>
                </View>
              )}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shop.status) }]}>
                <Text style={styles.statusText}>
                  {shop.status === 'completed' ? 'Completed' :
                    shop.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        {canSubmit() && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>View Summary & Submit</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  pickupInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickupConfirmed: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  pickupQuantity: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  pickupLabel: {
    fontSize: 14,
    color: '#059669',
  },
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  shopCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  shopAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  shopStats: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  shopStat: {
    fontSize: 13,
    color: '#4B5563',
    marginRight: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  autoCalculatedCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 12,
  },
  autoLabel: {
    fontSize: 13,
    color: '#15803D',
    marginBottom: 4,
    fontWeight: '600',
  },
  autoValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },
  autoHint: {
    fontSize: 11,
    color: '#16A34A',
    fontStyle: 'italic',
  },

});

export default HomeScreen;