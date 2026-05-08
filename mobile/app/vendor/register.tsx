import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    address: '',
    gst_number: '',
    pan_number: '',
  });

  const [docs, setDocs] = useState<{ gst?: any; pan?: any }>({});

  const pickDocument = async (type: 'gst' | 'pan') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled) {
        setDocs(prev => ({ ...prev, [type]: result.assets[0] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadFile = async (file: any, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // On mobile, we need to fetch the file content as a blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('vendor-documents')
      .upload(filePath, blob);

    if (error) throw error;
    return filePath;
  };

  const handleSubmit = async () => {
    if (!form.business_name || !form.gst_number || !docs.gst || !docs.pan) {
      Alert.alert('Missing Information', 'Please fill all fields and upload both GST and PAN documents.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upload documents
      const [gstPath, panPath] = await Promise.all([
        uploadFile(docs.gst, 'gst'),
        uploadFile(docs.pan, 'pan')
      ]);

      // 2. Create vendor record via Edge Function or direct (if RLS allows)
      const { error } = await supabase.from('vendors').insert({
        user_id: user.id,
        business_name: form.business_name,
        address: form.address,
        gst_number: form.gst_number,
        pan_number: form.pan_number,
        gst_doc_url: gstPath,
        pan_doc_url: panPath,
        status: 'pending'
      });

      if (error) throw error;

      Alert.alert('Success', 'Application submitted! We will review your documents soon.', [
        { text: 'OK', onPress: () => router.replace('/vendor/dashboard') }
      ]);

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Register as Vendor</Text>
            <Text style={styles.subtitle}>Fill in your business details to start selling.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS NAME</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Sharma Building Materials"
                value={form.business_name}
                onChangeText={(val) => setForm(prev => ({ ...prev, business_name: val }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS ADDRESS</Text>
              <TextInput 
                style={[styles.input, { height: 80 }]}
                placeholder="Complete address with city & state"
                multiline
                value={form.address}
                onChangeText={(val) => setForm(prev => ({ ...prev, address: val }))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>GST NUMBER</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="22AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  value={form.gst_number}
                  onChangeText={(val) => setForm(prev => ({ ...prev, gst_number: val.toUpperCase() }))}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>PAN NUMBER</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  value={form.pan_number}
                  onChangeText={(val) => setForm(prev => ({ ...prev, pan_number: val.toUpperCase() }))}
                />
              </View>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Document Uploads</Text>
              
              <TouchableOpacity 
                style={[styles.uploadBox, docs.gst && styles.uploadBoxActive]}
                onPress={() => pickDocument('gst')}
              >
                <Text style={styles.uploadIcon}>{docs.gst ? '✅' : '📄'}</Text>
                <View>
                  <Text style={styles.uploadLabel}>GST Certificate</Text>
                  <Text style={styles.uploadSub}>{docs.gst ? docs.gst.name : 'PDF or Image'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.uploadBox, docs.pan && styles.uploadBoxActive]}
                onPress={() => pickDocument('pan')}
              >
                <Text style={styles.uploadIcon}>{docs.pan ? '✅' : '🆔'}</Text>
                <View>
                  <Text style={styles.uploadLabel}>PAN Card</Text>
                  <Text style={styles.uploadSub}>{docs.pan ? docs.pan.name : 'PDF or Image'}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Application</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadSection: {
    marginTop: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    padding: 20,
  },
  uploadBoxActive: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  uploadSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#0f172a',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
