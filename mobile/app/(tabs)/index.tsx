import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await AsyncStorage.getItem('search_history');
      if (history) setRecentSearches(JSON.parse(history));
    };
    loadHistory();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Construction materials,{"\n"}delivered locally.</Text>
          <Text style={styles.subtitle}>Find the best prices in your pincode.</Text>
        </View>

        <View style={styles.searchBox}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>MATERIAL</Text>
            <TextInput 
              placeholder="Select material..." 
              style={styles.input}
              placeholderTextColor="#cbd5e1"
            />
          </div>
          <View style={styles.divider} />
          <div style={styles.inputGroup}>
            <Text style={styles.label}>PINCODE</Text>
            <TextInput 
              placeholder="Enter 6-digit pincode" 
              style={styles.input}
              keyboardType="number-pad"
              placeholderTextColor="#cbd5e1"
            />
          </div>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search Prices</Text>
          </TouchableOpacity>
        </View>

        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
              {recentSearches.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.historyChip}
                  onPress={() => router.push({ pathname: '/search', params: { material_id: item.material_id, pincode: item.pincode }})}
                >
                  <Text style={styles.historyText}>{item.material_name}</Text>
                  <Text style={styles.historySubText}>📍 {item.pincode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.grid}>
            <CategoryCard name="Cement" icon="🏗️" />
            <CategoryCard name="Steel" icon="🏢" />
            <CategoryCard name="Bricks" icon="🧱" />
            <CategoryCard name="Sand" icon="🏜️" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({ name, icon }: { name: string, icon: string }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardName}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 40,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 12,
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    height: 48,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  searchButton: {
    backgroundColor: '#0f172a',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  section: {
    marginTop: 48,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 24,
  },
  historyScroll: {
    gap: 12,
  },
  historyChip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 140,
  },
  historyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  historySubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardIcon: {
    fontSize: 40,
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
});
