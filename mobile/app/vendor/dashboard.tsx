import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface DashboardStats {
  listings: number;
  pincodes: number;
  enquiries: number;
}

export default function VendorDashboardScreen() {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. Fetch vendor profile and rejection notes
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*, rejection_note')
        .eq('user_id', user.id)
        .single();

      if (!vendorData) return;
      setVendor(vendorData);

      // 2. Fetch stats
      const [listingsRes, pincodesRes, enquiriesRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorData.id),
        supabase.from('vendor_pincodes').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorData.id),
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorData.id).eq('status', 'open')
      ]);

      setStats({
        listings: listingsRes.count || 0,
        pincodes: pincodesRes.count || 0,
        enquiries: enquiriesRes.count || 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0f172a" /></View>;
  if (!vendor) return <View style={styles.center}><Text>Vendor profile not found.</Text></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Vendor Dashboard</Text>
          <View style={[styles.statusBadge, styles[vendor.status as keyof typeof styles]]}>
            <Text style={styles.statusText}>{vendor.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Rejection / Pending Feedback */}
        {vendor.status === 'rejected' && (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionTitle}>Application Rejected</Text>
            <Text style={styles.rejectionNote}>"{vendor.rejection_note || 'Please contact support for details.'}"</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => Alert.alert('Update Info', 'Please visit the website to update your documents.')}>
              <Text style={styles.retryButtonText}>Update Documents</Text>
            </TouchableOpacity>
          </View>
        )}

        {vendor.status === 'pending' && (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingTitle}>Under Review</Text>
            <Text style={styles.pendingNote}>Our team is currently verifying your documents. We'll notify you once your account is active.</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Listings" value={stats?.listings || 0} icon="📋" />
          <StatCard title="Pincodes" value={stats?.pincodes || 0} icon="📍" />
          <StatCard title="New Leads" value={stats?.enquiries || 0} icon="✉️" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ActionItem 
            title="Manage Pricing" 
            desc="Update rates for your materials" 
            onPress={() => {}} 
            disabled={vendor.status !== 'approved'}
          />
          <ActionItem 
            title="View Leads" 
            desc="Respond to interested buyers" 
            onPress={() => router.push('/(tabs)/inbox')} 
          />
          <ActionItem 
            title="Business Profile" 
            desc="Edit address and GST details" 
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title.toUpperCase()}</Text>
    </View>
  );
}

function ActionItem({ title, desc, onPress, disabled }: { title: string, desc: string, onPress: () => void, disabled?: boolean }) {
  return (
    <TouchableOpacity 
      style={[styles.actionItem, disabled && styles.actionDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Text style={styles.chevron}>→</Text>
    </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  approved: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    color: '#166534',
  },
  pending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    color: '#92400e',
  },
  rejected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    color: '#991b1b',
  },
  rejectionBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 32,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#991b1b',
    marginBottom: 8,
  },
  rejectionNote: {
    fontSize: 14,
    color: '#b91c1c',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  retryButtonText: {
    color: '#991b1b',
    fontWeight: '900',
    fontSize: 14,
  },
  pendingBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 32,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  pendingNote: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '900',
  },
});
