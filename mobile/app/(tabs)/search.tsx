import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Modal,
  Share,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Listing, Material, Category } from '@/lib/types';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [pincode, setPincode] = useState(params.pincode as string || '');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc'>('price_asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    async function fetchData() {
      const [matRes, catRes] = await Promise.all([
        supabase.from('materials').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ]);

      if (matRes.data) {
        setMaterials(matRes.data);
        if (params.material_id) {
          const mat = matRes.data.find(m => m.id === params.material_id);
          if (mat) setSelectedMaterial(mat);
        }
      }
      if (catRes.data) setCategories(catRes.data);
    }
    fetchData();
  }, []);

  const filteredMaterials = selectedCategory 
    ? materials.filter(m => m.category_id === selectedCategory.id)
    : materials;

  const processedListings = results?.listings 
    ? [...results.listings]
        .filter(l => {
          const price = l.price_per_unit;
          const min = parseFloat(priceRange.min) || 0;
          const max = parseFloat(priceRange.max) || Infinity;
          return price >= min && price <= max;
        })
        .sort((a, b) => {
          if (sortBy === 'price_asc') return a.price_per_unit - b.price_per_unit;
          return b.price_per_unit - a.price_per_unit;
        })
    : [];

  const handleSearch = async () => {
    if (!selectedMaterial || pincode.length !== 6) return;

    setLoading(true);
    try {
      // 1. Perform Search
      const { data, error } = await supabase.functions.invoke('search-listings', {
        body: { material_id: selectedMaterial.id, pincode },
      });

      if (error) throw error;
      setResults(data);

      // 2. Save to History
      const historyJson = await AsyncStorage.getItem('search_history');
      let history = historyJson ? JSON.parse(historyJson) : [];
      
      const newEntry = { 
        material_id: selectedMaterial.id, 
        material_name: selectedMaterial.name, 
        pincode 
      };

      // Deduplicate and limit to 5 entries
      history = [newEntry, ...history.filter((h: any) => 
        h.material_id !== newEntry.material_id || h.pincode !== newEntry.pincode
      )].slice(0, 5);

      await AsyncStorage.setItem('search_history', JSON.stringify(history));

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if params are present
  useEffect(() => {
    if (params.material_id && params.pincode) {
      handleSearch();
    }
  }, [selectedMaterial]);

  const shareListing = async (item: any) => {
    try {
      const url = `multiplyingbrics://vendor/${item.vendor_id}?material_id=${item.material_id}`;
      await Share.share({
        message: `Check out ${item.material?.name} prices at ${item.vendor?.business_name} on Multiplying Brics: ${url}`,
        url: url, // iOS only
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const renderItem = ({ item }: { item: Listing & { vendor: { business_name: string }, material: { unit: string } } }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/vendor/${item.vendor_id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.vendorInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.businessName}>{item.vendor?.business_name}</Text>
            <TouchableOpacity onPress={() => shareListing(item)} style={styles.shareIcon}>
              <Text style={{ fontSize: 16 }}>📤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.location}>📍 {item.pincode}</Text>
        </div>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>PRICE</Text>
          <Text style={styles.price}>₹{item.price_per_unit}</Text>
          <Text style={styles.unit}>per {item.material?.unit}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.enquireButton}>
          <Text style={styles.enquireButtonText}>Enquire Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <TouchableOpacity 
          style={styles.pickerTrigger} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.label}>MATERIAL</Text>
          <Text style={styles.pickerText}>
            {selectedMaterial ? selectedMaterial.name : 'Select material...'}
          </Text>
        </TouchableOpacity>

        <View style={styles.pincodeInputContainer}>
          <Text style={styles.label}>PINCODE</Text>
          <TextInput
            style={styles.pincodeInput}
            placeholder="6-digit code"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={(val) => setPincode(val.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          style={[styles.searchButton, (!selectedMaterial || pincode.length !== 6) && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={loading || !selectedMaterial || pincode.length !== 6}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>Search</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity 
              style={[styles.filterTag, !selectedCategory && styles.filterTagActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.filterTagText, !selectedCategory && styles.filterTagTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.filterTag, selectedCategory?.id === cat.id && styles.filterTagActive]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setSelectedMaterial(null);
                }}
              >
                <Text style={[styles.filterTagText, selectedCategory?.id === cat.id && styles.filterTagTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.sortFilterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {results?.fallback_pincode && (
        <View style={styles.fallbackNotice}>
          <Text style={styles.fallbackText}>
            No results in {pincode}. Showing nearby in {results.fallback_area}.
          </Text>
        </View>
      )}

      <FlatList
        data={processedListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        windowSize={5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {results ? 'No listings match your current filters.' : 'Select a material and enter pincode to see prices.'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Sort & Price Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sheetContent}>
            <Text style={styles.sectionLabel}>SORT BY PRICE</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, sortBy === 'price_asc' && styles.toggleBtnActive]}
                onPress={() => setSortBy('price_asc')}
              >
                <Text style={[styles.toggleText, sortBy === 'price_asc' && styles.toggleTextActive]}>Low to High</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, sortBy === 'price_desc' && styles.toggleBtnActive]}
                onPress={() => setSortBy('price_desc')}
              >
                <Text style={[styles.toggleText, sortBy === 'price_desc' && styles.toggleTextActive]}>High to Low</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PRICE RANGE</Text>
            <View style={styles.rangeRow}>
              <View style={styles.rangeInput}>
                <Text style={styles.inputLabel}>MIN (₹)</Text>
                <TextInput 
                  placeholder="0"
                  keyboardType="number-pad"
                  value={priceRange.min}
                  onChangeText={(val) => setPriceRange(prev => ({ ...prev, min: val }))}
                  style={styles.sheetInput}
                />
              </View>
              <View style={styles.rangeInput}>
                <Text style={styles.inputLabel}>MAX (₹)</Text>
                <TextInput 
                  placeholder="No limit"
                  keyboardType="number-pad"
                  value={priceRange.max}
                  onChangeText={(val) => setPriceRange(prev => ({ ...prev, max: val }))}
                  style={styles.sheetInput}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.resetBtn}
              onPress={() => {
                setPriceRange({ min: '', max: '' });
                setSortBy('price_asc');
              }}
            >
              <Text style={styles.resetText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Simple Material Picker Modal */}
      <Modal visible={showPicker} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Material</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredMaterials}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.materialOption}
                onPress={() => {
                  setSelectedMaterial(item);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.materialOptionText}>{item.name}</Text>
                <Text style={styles.materialUnitText}>{item.unit}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTrigger: {
    flex: 2,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pincodeInputContainer: {
    flex: 1.5,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  pincodeInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    padding: 0,
  },
  searchButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTagActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTagTextActive: {
    color: '#fff',
  },
  sortFilterButton: {
    padding: 12,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetHeader: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  sheetContent: {
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#fff',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rangeInput: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
  },
  sheetInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetBtn: {
    marginTop: 32,
    alignItems: 'center',
  },
  resetText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },
  fallbackNotice: {
    padding: 12,
    backgroundColor: '#fffbeb',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  fallbackText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vendorInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  shareIcon: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  unit: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 16,
  },
  enquireButton: {
    backgroundColor: '#f8fafc',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  enquireButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeButton: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  materialOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  materialUnitText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
