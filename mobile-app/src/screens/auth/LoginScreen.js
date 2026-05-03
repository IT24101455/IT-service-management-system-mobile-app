import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Animated,
  Easing
} from 'react-native';
import { Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading } = useContext(AuthContext);

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await login({ email: trimmedEmail, password, role });
      if (result && !result.success) {
        Alert.alert('Login Failed', result.message || 'Please check your credentials.');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Animated.Image 
              source={require('../../../assets/logo.png')} 
              style={[styles.logo, { transform: [{ rotateY: spin }] }]}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </View>
      
      <View style={styles.bottomSheet}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.formContainer}>
            <Text style={styles.loginTitle}>Login</Text>
            
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't Have An Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Mail size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.roleContainer}>
              {['USER', 'TECHNICIAN'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.roleButton, role === r && styles.roleButtonActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? (
                  <CheckSquare size={18} color={COLORS.primary} />
                ) : (
                  <Square size={18} color={COLORS.textSecondary} />
                )}
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  topSection: {
    height: height * 0.4,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  formContainer: {
    flex: 1,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  signUpText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: ROUNDING.full,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: ROUNDING.full,
    padding: 4,
    marginBottom: SPACING.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: ROUNDING.full,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  roleTextActive: {
    color: COLORS.white,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  forgotPassword: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: ROUNDING.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoginScreen;
