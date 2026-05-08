import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking,
  Alert,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Listing, Vendor } from '@/lib/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function init() {
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      try {
        // 1. Fetch vendor info
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*, owner:users(phone, email)')
          .eq('id', id)
          .single();

        // 2. Fetch listings
        const { data: listingData } = await supabase
          .from('listings')
          .select('*, material:materials(*)')
          .eq('vendor_id', id)
          .eq('in_stock', true);

        setVendor(vendorData);
        setListings(listingData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleCall = () => {
    if (!isLoggedIn) {
      router.push(`/auth?redirect=/vendor/${id}`);
      return;
    }
    const phone = vendor?.owner?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      router.push(`/auth?redirect=/vendor/${id}`);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('saved_vendors')
      .upsert({ buyer_id: user.id, vendor_id: id });

    if (!error) Alert.alert('Saved', 'Vendor added to your saved list.');
  };

  const handleShare = async () => {
    try {
      const url = `multiplyingbrics://vendor/${id}`;
      await Share.share({
        message: `Check out ${vendor?.business_name} on Multiplying Brics: ${url}`,
        url: url,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0f172a" /></View>;
  if (!vendor) return <View style={styles.center}><Text>Vendor not found.</Text></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: '', 
        headerTransparent: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleShare} style={{ marginRight: 20, backgroundColor: '#f8fafc', p: 8, borderRadius: 12 }}>
            <Text style={{ fontSize: 20 }}>📤</Text>
          </TouchableOpacity>
        )
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.businessName}>{vendor.business_name}</Text>
          <Text style={styles.address}>{vendor.address || 'Address not available'}</Text>
        </View>

        {/* Gated Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Details</Text>
          {isLoggedIn ? (
            <View style={styles.contactInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PHONE</Text>
                <Text style={styles.infoValue}>{vendor.owner?.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMAIL</Text>
                <Text style={styles.infoValue}>{vendor.owner?.email || 'N/A'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.lockedState}>
              <Text style={styles.lockedText}>Login required to view contact details.</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push(`/auth?redirect=/vendor/${id}`)}
              >
                <Text style={styles.loginButtonText}>Login to View</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleCall}>
            <Text style={styles.primaryActionText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleSave}>
            <Text style={styles.secondaryActionText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listingSection}>
          <Text style={styles.sectionTitle}>Material Prices</Text>
          {listings.map((item) => (
            <View key={item.id} style={styles.listingCard}>
              <View>
                <Text style={styles.materialName}>{item.material?.name}</Text>
                <Text style={styles.materialPincode}>📍 {item.pincode}</Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.price}>₹{item.price_per_unit}</Text>
                <Text style={styles.unit}>per {item.material?.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  businessName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
    lineHeight: 36,
  },
  address: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 20,
  },
  contactInfo: {
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  lockedState: {
    alignItems: 'flex-start',
    gap: 12,
  },
  lockedText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginButtonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
  },
  primaryAction: {
    flex: 2,
    backgroundColor: '#0f172a',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryActionText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  listingSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  listingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  materialName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  materialPincode: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 4,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  unit: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
});
