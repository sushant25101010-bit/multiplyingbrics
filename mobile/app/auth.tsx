import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ phone: fullPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (token.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      if (data.session) {
        // Automatically handled by Expo Secure Store adapter in lib/supabase.ts
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>Multiplying{"\n"}Brics</Text>
          <Text style={styles.subtitle}>
            {step === 'phone' 
              ? 'Enter your phone number to continue' 
              : `Enter the code sent to +91 ${phone}`}
          </Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
            </View>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="123456"
                keyboardType="number-pad"
                value={token}
                onChangeText={setToken}
                placeholderTextColor="#94a3b8"
                maxLength={6}
                autoFocus
              />
            </View>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setStep('phone')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    padding: 32,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 64,
    paddingHorizontal: 20,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
  },
  button: {
    backgroundColor: '#0f172a',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  backButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
