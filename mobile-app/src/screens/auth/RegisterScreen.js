import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { User, Mail, Lock, Phone, MapPin, Briefcase, Camera, ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { register, sendOtp } from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const { height } = Dimensions.get('window');

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
const DISTRICTS_BY_PROVINCE = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern': ['Galle', 'Matara', 'Hambantota'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva': ['Badulla', 'Monaragala'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle']
};

const CustomPicker = ({ visible, onClose, data, onSelect, title }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList 
          data={data}
          keyExtractor={(item) => item}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.modalItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
    province: '',
    district: '',
    specialization: '',
    otp: '',
    nicFrontUrl: null,
    nicBackUrl: null
  });

  const updateForm = (key, value) => {
    if (key === 'province') {
      // Reset district if province changes
      setFormData({ ...formData, [key]: value, district: '' });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      updateForm(field, result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.province || !formData.district) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long, and contain at least one uppercase letter, one number, and one special character.');
      return false;
    }
    if (formData.role === 'TECHNICIAN') {
      if (!formData.specialization) {
        Alert.alert('Missing Fields', 'Please select a specialization.');
        return false;
      }
      if (!formData.nicFrontUrl || !formData.nicBackUrl) {
        Alert.alert('Missing Fields', 'Please upload both front and back photos of your NIC.');
        return false;
      }
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await sendOtp(formData.email);
      setStep(2);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.otp || formData.otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.screenTitle}>Sign up</Text>
      
      <View style={styles.signInRow}>
        <Text style={styles.signInText}>Already Have An Account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.roleSelectionLabel}>Choose Account Type:</Text>
      <View style={styles.verticalRoleContainer}>
        {['USER', 'TECHNICIAN'].map((r) => (
          <TouchableOpacity 
            key={r}
            style={[styles.verticalRoleButton, formData.role === r && styles.verticalRoleButtonActive]}
            onPress={() => updateForm('role', r)}
          >
            <Text style={[styles.verticalRoleText, formData.role === r && styles.verticalRoleTextActive]}>
              {r === 'USER' ? 'Register as User' : 'Register as Technician'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Basic Information</Text>

      <View style={styles.inputWrapper}>
        <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput 
          style={styles.input}
          placeholder="Username / Full Name"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.name}
          onChangeText={(v) => updateForm('name', v)}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Mail size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput 
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.email}
          onChangeText={(v) => updateForm('email', v)}
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
          value={formData.password}
          onChangeText={(v) => updateForm('password', v)}
          secureTextEntry
        />
      </View>

      <View style={styles.inputWrapper}>
        <Phone size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput 
          style={styles.input}
          placeholder="Phone Number (e.g. 0771234567)"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.phone}
          onChangeText={(v) => updateForm('phone', v)}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: SPACING.sm }]}>Location</Text>
      
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowProvincePicker(true)}>
        <MapPin size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <Text style={[styles.pickerText, !formData.province && { color: COLORS.textSecondary }]}>
          {formData.province || 'Select Province'}
        </Text>
        <ChevronDown size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => {
          if (!formData.province) {
            Alert.alert('Notice', 'Please select a province first.');
            return;
          }
          setShowDistrictPicker(true);
        }}
      >
        <MapPin size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <Text style={[styles.pickerText, !formData.district && { color: COLORS.textSecondary }]}>
          {formData.district || 'Select District'}
        </Text>
        <ChevronDown size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {formData.role === 'TECHNICIAN' && (
        <View style={styles.technicianSection}>
          <Text style={styles.sectionTitle}>Technician Details</Text>
          
          <Text style={styles.label}>Specialization</Text>
          <View style={styles.horizontalSelectorContainer}>
            {['Software', 'Hardware'].map((spec) => (
              <TouchableOpacity 
                key={spec}
                style={[styles.horizontalSelectorButton, formData.specialization === spec && styles.horizontalSelectorButtonActive]}
                onPress={() => updateForm('specialization', spec)}
              >
                <Text style={[styles.horizontalSelectorText, formData.specialization === spec && styles.horizontalSelectorTextActive]}>{spec}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>NIC Documentation (Required)</Text>
          <View style={styles.imagePickerRow}>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('nicFrontUrl')}>
              {formData.nicFrontUrl ? (
                <Image source={{ uri: formData.nicFrontUrl }} style={styles.previewImage} />
              ) : (
                <>
                  <Camera size={24} color={COLORS.textSecondary} />
                  <Text style={styles.imagePickerText}>Front</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('nicBackUrl')}>
              {formData.nicBackUrl ? (
                <Image source={{ uri: formData.nicBackUrl }} style={styles.previewImage} />
              ) : (
                <>
                  <Camera size={24} color={COLORS.textSecondary} />
                  <Text style={styles.imagePickerText}>Back</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={[styles.primaryButton, { marginTop: SPACING.lg }]} onPress={handleSendOtp}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <Text style={styles.primaryButtonText}>Verify Email</Text>
        )}
      </TouchableOpacity>

      <CustomPicker 
        visible={showProvincePicker}
        onClose={() => setShowProvincePicker(false)}
        data={PROVINCES}
        onSelect={(val) => updateForm('province', val)}
        title="Select Province"
      />
      
      <CustomPicker 
        visible={showDistrictPicker}
        onClose={() => setShowDistrictPicker(false)}
        data={formData.province ? DISTRICTS_BY_PROVINCE[formData.province] : []}
        onSelect={(val) => updateForm('district', val)}
        title="Select District"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
        <ArrowLeft size={20} color={COLORS.textSecondary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.screenTitle, { marginTop: 10 }]}>Verification</Text>
      <Text style={styles.infoText}>We've sent an OTP to {formData.email}</Text>

      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.otp}
          onChangeText={(v) => updateForm('otp', v)}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <TouchableOpacity style={[styles.primaryButton, { marginTop: SPACING.xl }]} onPress={handleRegister}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <Text style={styles.primaryButtonText}>Complete Registration</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logo}
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
          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 1 ? renderStep1() : renderStep2()}
          </ScrollView>
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
    height: height * 0.35,
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
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  formContainer: {
    paddingBottom: SPACING.xxl,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  signInText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signInLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: ROUNDING.full,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    height: 56,
  },
  pickerText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
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
  roleSelectionLabel: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  verticalRoleContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  verticalRoleButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  verticalRoleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  verticalRoleText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  verticalRoleTextActive: {
    color: COLORS.white,
  },
  technicianSection: {
    marginTop: SPACING.md,
    backgroundColor: '#f8fafc',
    padding: SPACING.md,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  horizontalSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: ROUNDING.full,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  horizontalSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: ROUNDING.full,
  },
  horizontalSelectorButtonActive: {
    backgroundColor: COLORS.primary,
  },
  horizontalSelectorText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  horizontalSelectorTextActive: {
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: ROUNDING.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 16,
  },
  label: {
    color: '#000000',
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  imagePicker: {
    flex: 1,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.5,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#F5F5F5',
    borderRadius: ROUNDING.full,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default RegisterScreen;
