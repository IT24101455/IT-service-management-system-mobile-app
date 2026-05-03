import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ChevronLeft, AlertCircle, Send } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const CreateComplaintScreen = ({ route, navigation }) => {
  const { techId, techName } = route.params;
  const { userData } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your complaint.');
      return;
    }

    Alert.alert(
      'Submit Complaint',
      'Are you sure you want to submit this complaint to the admin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              await API.post('/complaints', {
                userId: userData.id,
                userName: userData.name,
                technicianId: techId,
                technicianName: techName,
                description: description.trim()
              });
              Alert.alert('Success', 'Your complaint has been submitted. The admin will review it.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to submit complaint');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>File a Complaint</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.targetCard}>
            <AlertCircle size={24} color={COLORS.error} />
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Complaining Against:</Text>
              <Text style={styles.targetName}>{techName}</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Describe the issue</Text>
            <Text style={styles.inputSubtitle}>Please provide clear details about your concern so the admin can take appropriate action.</Text>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={8}
                placeholder="Type your complaint here..."
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Send size={20} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Submit to Admin</Text>
              </>
            )}
          </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  targetInfo: {
    marginLeft: SPACING.md,
  },
  targetLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  targetName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  formSection: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  inputSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  textAreaContainer: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 150,
    color: COLORS.text,
    fontSize: 14,
    padding: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: ROUNDING.xl,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default CreateComplaintScreen;
