import React, { useState, useContext } from 'react';
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
  Image
} from 'react-native';
import { ArrowLeft, Camera, Send, FileText, Layers, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const CreateTicketScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SOFTWARE',
    priority: 'MEDIUM',
    attachmentUrl: null,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, attachmentUrl: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please enter title and description');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd upload the image first to Cloudinary and get the URL
      // For this migration, we'll send the data as is or mock the URL
      const ticketPayload = {
        ...formData,
        userId: userData.id,
        userName: userData.name,
        province: userData.province,
        district: userData.district
      };

      await API.post('/tickets', ticketPayload);
      Alert.alert('Success', 'Ticket submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const Selector = ({ label, options, value, onSelect, icon: Icon }) => (
    <View style={styles.selectorContainer}>
      <View style={styles.labelRow}>
        <Icon size={18} color={COLORS.textSecondary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity 
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionBtnActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Support Ticket</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Ticket Title</Text>
              <TextInput 
                style={styles.input}
                placeholder="Briefly describe the issue"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.title}
                onChangeText={(v) => setFormData({...formData, title: v})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Detailed Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Provide more details about the problem..."
                placeholderTextColor={COLORS.textSecondary}
                value={formData.description}
                onChangeText={(v) => setFormData({...formData, description: v})}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <Selector 
              label="Category" 
              options={['SOFTWARE', 'HARDWARE', 'NETWORK', 'OTHER']} 
              value={formData.category}
              onSelect={(v) => setFormData({...formData, category: v})}
              icon={Layers}
            />

            <Selector 
              label="Priority Level" 
              options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']} 
              value={formData.priority}
              onSelect={(v) => setFormData({...formData, priority: v})}
              icon={AlertCircle}
            />

            <View style={styles.attachmentSection}>
              <Text style={styles.label}>Attachment (Optional)</Text>
              <TouchableOpacity style={styles.attachmentBtn} onPress={pickImage}>
                {formData.attachmentUrl ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: formData.attachmentUrl }} style={styles.previewImage} />
                    <View style={styles.changeOverlay}>
                      <Camera size={20} color={COLORS.white} />
                      <Text style={styles.changeText}>Change Photo</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Camera size={32} color={COLORS.textSecondary} />
                    <Text style={styles.attachmentPlaceholder}>Add a screenshot or photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={COLORS.white} /> : (
                <>
                  <Text style={styles.submitBtnText}>Submit Ticket</Text>
                  <Send size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  form: {
    gap: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputWrapper: {
    gap: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    paddingHorizontal: SPACING.md,
    height: 55,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: SPACING.md,
  },
  selectorContainer: {
    gap: SPACING.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: ROUNDING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  optionTextActive: {
    color: COLORS.white,
  },
  attachmentSection: {
    gap: SPACING.sm,
  },
  attachmentBtn: {
    height: 150,
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  attachmentPlaceholder: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: ROUNDING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: SPACING.md,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
});

export default CreateTicketScreen;
