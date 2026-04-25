import React, { useState } from 'react';
import {
  Linking,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const ShopDetailScreen = ({ route, navigation }) => {
  const { shop, shopIndex, totalPickup, onUpdate } = route.params;

  const [sellout, setSellout] = useState(shop.sellout?.toString() || '');
  const [cashCollected, setCashCollected] = useState(shop.cashCollected?.toString() || '');
  const [notes, setNotes] = useState(shop.notes || '');

  const calculateRemaining = () => {
    // Pickup for this shop = shop's target amount (in units)
    const shopPickup = shop.targetAmount || 0;
    const selloutNum = parseInt(sellout) || 0;
    return Math.max(0, shopPickup - selloutNum);
  };

  const handleComplete = () => {
    const selloutNum = parseInt(sellout);
    const cashNum = parseFloat(cashCollected) || 0;

    if (!sellout || selloutNum < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid sellout quantity');
      return;
    }

    const updatedShop = {
      ...shop,
      status: 'completed',
      sellout: selloutNum,
      cashCollected: cashNum,
      notes,
      remaining: calculateRemaining(),
    };

    onUpdate(updatedShop);
    Alert.alert('Success', 'Shop marked as complete', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);

  };

  const openInMaps = async (address) => {
    if (!address) return;
    Alert.alert('Opening Maps', ` Do You want Open address in Map to ${address}...`,
      [{ text: 'Cancel', style: 'cancel' },
      {
        text: 'OK', onPress: async () => {

          // Encode the address for URL safety
          const encodedAddress = encodeURIComponent(address);
          const url =
            Platform.OS === 'ios'
              ? `maps://?daddr=${encodedAddress}` // Apple Maps for iOS
              : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`; // Google Maps for Android

          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Unable to open maps on this device.');
          }
        }
      }
      ]
    );



  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shop.shopName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Shop Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <TouchableOpacity onPress={() => openInMaps(shop.address)}>
              <Text style={[styles.infoText, { color: '#0baa00ff', textDecorationLine: 'underline' }]}>
                {shop.address}
              </Text>
            </TouchableOpacity>
          </View>
          {shop.contact && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${shop.contact}`)}
            >
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={[styles.infoText, {color: '#0a9000ff', textDecorationLine: 'underline'}]}>{shop.contact}</Text>
            </TouchableOpacity>
          )}
          {shop.targetAmount > 0 && (
            <View style={styles.infoRow}>

              <Text style={styles.infoIcon}>🎯</Text>
              <Text style={styles.infoText}>Target: Rs. {shop.targetAmount}</Text>
            </View>
          )}
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sellout Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter sellout quantity"
              value={sellout}
              onChangeText={setSellout}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>How many units were sold at this shop</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cash Collected (Rs)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount collected"
              value={cashCollected}
              onChangeText={setCashCollected}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>Total cash received from this shop</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes or comments..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          {sellout && parseInt(sellout) >= 0 && (
            <View
              style={[
                styles.remainingCard,
                calculateRemaining() === 0 && { backgroundColor: '#d1f7c4' }, // light green when achieved
              ]}
            >
              {calculateRemaining() === 0 ? (
                <>
                  <Text style={[styles.remainingLabel, { color: 'green', fontWeight: 'bold' }]}>
                    🎯 Target Achieved!
                  </Text>
                  <Text style={[styles.remainingValue, { color: 'green' }]}>
                    Nice - Job!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.remainingLabel}>Remaining Target Units</Text>
                  <Text style={styles.remainingValue}>{calculateRemaining()}</Text>
                </>
              )}
            </View>
          )}


        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>✓ Mark as Complete</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  remainingCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  remainingLabel: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  remainingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  completeButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ShopDetailScreen;