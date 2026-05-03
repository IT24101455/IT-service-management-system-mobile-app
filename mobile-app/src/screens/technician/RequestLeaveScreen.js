import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const RequestLeaveScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Personal'); // Personal, Sick, Vacation
  const [medicalReportUrl, setMedicalReportUrl] = useState('');

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) setEndDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadMedicalReport(result.assets[0].uri);
    }
  };

  const uploadMedicalReport = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', { uri, name: filename, type });

      const response = await API.post('/leaves/upload-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMedicalReportUrl(response.data.url);
      Alert.alert('Success', 'Medical report uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload medical report');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for your leave');
      return;
    }

    if (leaveType === 'Sick' && !medicalReportUrl) {
      Alert.alert('Required', 'A medical report is required for sick leave requests.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        technicianId: userData.id,
        technicianName: userData.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: `${leaveType}: ${reason}`,
        medicalReportUrl: leaveType === 'Sick' ? medicalReportUrl : null
      };

      await API.post('/leaves', payload);
      Alert.alert(
        'Success', 
        'Leave request submitted successfully for approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Leave</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Leave Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leave Type</Text>
            <View style={styles.typeSelector}>
              {['Personal', 'Sick', 'Vacation'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeBtn, leaveType === type && styles.typeBtnActive]}
                  onPress={() => setLeaveType(type)}
                >
                  <Text style={[styles.typeText, leaveType === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowStartPicker(true)}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowEndPicker(true)}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason / Notes</Text>
            <TextInput
              style={styles.textArea}
              value={reason}
              onChangeText={setReason}
              placeholder="Explain the reason for your leave request..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {leaveType === 'Sick' && (
            <View style={styles.uploadSection}>
              <Text style={[styles.label, { color: COLORS.error }]}>Medical Report (Required)</Text>
              <TouchableOpacity 
                style={[styles.uploadBox, medicalReportUrl && styles.uploadBoxSuccess]} 
                onPress={pickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : medicalReportUrl ? (
                  <>
                    <CheckCircle size={32} color={COLORS.success} />
                    <Text style={styles.uploadTextSuccess}>Report Uploaded Successfully</Text>
                    <Text style={styles.uploadSubtext}>Tap to change</Text>
                  </>
                ) : (
                  <>
                    <Upload size={32} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Select Medical Report Image</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG supported</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading || uploading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <CheckCircle size={20} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Submit Leave Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Clock size={20} color={COLORS.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Approval Required</Text>
            <Text style={styles.infoText}>Your leave request will be sent to the administrator for review. You will be notified once it is approved or rejected.</Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: ROUNDING.xl,
    padding: SPACING.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    height: 45,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 55,
    paddingHorizontal: SPACING.md,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 100,
  },
  uploadSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  uploadBox: {
    height: 140,
    borderRadius: ROUNDING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primary + '05',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadBoxSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
    borderStyle: 'solid',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  uploadTextSuccess: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  uploadSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: ROUNDING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: SPACING.md,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent + '15',
    padding: SPACING.md,
    borderRadius: ROUNDING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default RequestLeaveScreen;
