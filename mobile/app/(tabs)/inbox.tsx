import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Notifications from 'expo-notifications';

interface EnquiryData {
  id: string;
  message: string;
  status: 'open' | 'responded' | 'closed';
  created_at: string;
  buyer: {
    full_name: string | null;
    phone: string | null;
  };
  listing: {
    pincode: string;
    material: {
      name: string;
      unit: string;
    };
  } | null;
}

export default function VendorInboxScreen() {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVendor, setIsVendor] = useState(false);

  const fetchEnquiries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is vendor
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'vendor') {
      setIsVendor(false);
      setLoading(false);
      return;
    }
    setIsVendor(true);

    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor) return;

    const { data } = await supabase
      .from('enquiries')
      .select(`
        *,
        buyer:users(full_name, phone),
        listing:listings(
          pincode, 
          material:materials(name, unit)
        )
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    if (data) setEnquiries(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
    
    // 1. Setup Realtime Subscription
    const channel = supabase
      .channel('vendor-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enquiries' },
        async (payload) => {
          // Trigger local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Lead Received! 🏗️",
              body: "A buyer is interested in your materials. Tap to view.",
              data: { enquiryId: payload.new.id },
            },
            trigger: null,
          });
          fetchEnquiries();
        }
      )
      .subscribe();

    const interval = setInterval(fetchEnquiries, 60000); // Reduce polling to 60s as we have Realtime
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: 'responded' | 'closed') => {
    const { error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', id);

    if (!error) fetchEnquiries();
  };

  const handleCall = (phone: string | null) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0f172a" /></View>;

  if (!isVendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This inbox is for registered vendors only.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: EnquiryData }) => (
    <View style={[styles.card, item.status === 'open' && styles.activeCard]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.buyerName}>{item.buyer?.full_name || 'Anonymous Buyer'}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.listingInfo}>
        <Text style={styles.materialLabel}>INTERESTED IN</Text>
        <Text style={styles.materialName}>
          {item.listing?.material.name} ({item.listing?.material.unit})
        </Text>
        <Text style={styles.pincode}>📍 Pincode: {item.listing?.pincode}</Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>MESSAGE</Text>
        <Text style={styles.messageText}>"{item.message}"</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCall(item.buyer?.phone)}
        >
          <Text style={styles.callButtonText}>Call Buyer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => updateStatus(item.id, 'responded')}
          disabled={item.status === 'responded'}
        >
          <Text style={styles.doneButtonText}>Mark Responded</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={enquiries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your inbox is empty. New leads will appear here.</Text>
          </View>
        }
      />
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
    padding: 32,
  },
  listContent: {
    padding: 24,
    gap: 20,
  },
  card: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeCard: {
    borderColor: '#0f172a',
    borderWidth: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  buyerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  open: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    color: '#92400e',
  },
  responded: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    color: '#166534',
  },
  closed: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  listingInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  materialLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  materialName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  pincode: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  messageBox: {
    marginBottom: 24,
  },
  messageLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  doneButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    lineHeight: 24,
  },
});
