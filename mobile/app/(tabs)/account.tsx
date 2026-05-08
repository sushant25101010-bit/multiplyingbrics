import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUser(profile);
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0f172a" /></View>;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Login to see your account details and history.</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.loginButtonText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.name}>{user.full_name || 'Buyer'}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <MenuItem title="My Enquiries" icon="✉️" onPress={() => router.push('/account/enquiries')} />
          <MenuItem title="Saved Vendors" icon="⭐" onPress={() => {}} />
          {user.role === 'vendor' && (
            <MenuItem title="Vendor Dashboard" icon="📊" onPress={() => router.push('/vendor/dashboard')} />
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ title, icon, onPress }: { title: string, icon: string, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuTitle}>{title}</Text>
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
    padding: 32,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  phone: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  chevron: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '900',
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
  },
  loginButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    lineHeight: 24,
  },
});
