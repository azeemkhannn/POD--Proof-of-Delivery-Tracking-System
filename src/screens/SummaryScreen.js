import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import reportService from '../services/report.service';
import storageService from '../services/storage.service';



const SummaryScreen = ({ route, navigation }) => {
  const { shops, totalPickup, route: deliveryRoute } = route.params;
  const { onRefresh } = route.params; 

  const [finalNotes, setFinalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calculateTotals = () => {
    const totalSellout = shops.reduce((sum, shop) => sum + (shop.sellout || 0), 0);
    const totalCash = shops.reduce((sum, shop) => sum + (shop.cashCollected || 0), 0);
    const totalRemaining = totalPickup - totalSellout;

    return { totalSellout, totalCash, totalRemaining };
  };

  const { totalSellout, totalCash, totalRemaining } = calculateTotals();

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Prepare report data
      const reportData = {
        shops: shops.map(shop => {
          const shopPickup = shop.targetAmount || 0; // ✅ Use target as pickup
          return {
            shopId: shop._id,
            shopName: shop.shopName,
            pickup: shopPickup,
            sellout: shop.sellout || 0,
            remaining: (shop.targetAmount) - (shop.sellout || 0),
            notes: shop.notes || '',


          }
        }),
        notes: finalNotes,
        status: 'completed',
        totalPickup: totalPickup,
      };

      const result = await reportService.submitReport(reportData);

      
   
      if (result.success) {
        // Clear local storage
          onRefresh();
          
        // Show success and navigate
        Alert.alert(
          'Success! 🎉',
          'Your delivery report has been submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('History'),
            },
          ]
        );
      } else {
        Alert.alert('Submission Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Summary</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusText}>
            All {shops.length} shops completed
          </Text>
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pickup</Text>
            <Text style={styles.totalValue}>{totalPickup} units</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Sellout</Text>
            <Text style={[styles.totalValue, { color: '#10B981' }]}>
              {totalSellout} units
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remaining</Text>
            <Text style={[styles.totalValue, { color: '#F59E0B' }]}>
              {totalRemaining} units
            </Text>
          </View>

          <View style={[styles.totalRow, styles.cashRow]}>
            <Text style={styles.totalLabel}>💰 Total Cash</Text>
            <Text style={[styles.totalValue, { color: '#4F46E5' }]}>
              Rs. {totalCash.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Shop Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop-wise Details</Text>
          {shops.map((shop, index) => (
            <View key={index} style={styles.shopItem}>
              <View style={styles.shopHeader}>
                <Text style={styles.shopNumber}>#{index + 1}</Text>
                <Text style={styles.shopName}>{shop.shopName}</Text>
              </View>
              <View style={styles.shopDetails}>
                <View style={styles.shopStat}>
                  <Text style={styles.shopStatLabel}>Sellout</Text>
                  <Text style={styles.shopStatValue}>{shop.sellout}</Text>
                </View>
                <View style={styles.shopStat}>
                  <Text style={styles.shopStatLabel}>Cash</Text>
                  <Text style={styles.shopStatValue}>Rs. {shop.cashCollected}</Text>
                </View>
              </View>
              {shop.notes && (
                <Text style={styles.shopNotes}>Note: {shop.notes}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Final Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Final Report Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any final notes about today's delivery..."
            value={finalNotes}
            onChangeText={setFinalNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              📤 Submit Final Report
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#F0FDF4',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
  },
  totalsCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cashRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  shopItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopNumber: {
    backgroundColor: '#4F46E5',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  shopDetails: {
    flexDirection: 'row', 
    gap: 16,
  },
  shopStat: {
    flex: 1,
  },
  shopStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  shopStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  shopNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SummaryScreen;