import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface BuyerEnquiry {
  id: string;
  message: string;
  status: 'open' | 'responded' | 'closed';
  created_at: string;
  vendor: {
    business_name: string;
  };
  listing: {
    pincode: string;
    material: {
      name: string;
      unit: string;
    };
  } | null;
}

export default function BuyerEnquiriesScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<BuyerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        vendor:vendors(business_name),
        listing:listings(
          pincode, 
          material:materials(name, unit)
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setEnquiries(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const renderItem = ({ item }: { item: BuyerEnquiry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.vendorName}>{item.vendor?.business_name}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>{item.status === 'open' ? 'SENT' : item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.listingInfo}>
        <Text style={styles.materialName}>
          {item.listing?.material.name} ({item.listing?.material.unit})
        </Text>
        <Text style={styles.pincode}>📍 Destination: {item.listing?.pincode}</Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>YOUR MESSAGE</Text>
        <Text style={styles.messageText}>"{item.message}"</Text>
      </View>
      
      {item.status === 'responded' && (
        <View style={styles.responseNotice}>
          <Text style={styles.responseNoticeText}>Vendor has responded to your lead! Check your phone for calls/messages.</Text>
        </View>
      )}
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0f172a" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={enquiries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You haven't sent any enquiries yet. Start searching for materials to send your first lead!</Text>
            <TouchableOpacity 
              style={styles.searchBtn}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.searchBtnText}>Start Searching</Text>
            </TouchableOpacity>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  vendorName: {
    fontSize: 18,
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
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  responded: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    color: '#166534',
  },
  closed: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    color: '#92400e',
  },
  listingInfo: {
    marginBottom: 16,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  pincode: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 20,
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
  responseNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  responseNoticeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
    lineHeight: 18,
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
    marginBottom: 24,
  },
  searchBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});
