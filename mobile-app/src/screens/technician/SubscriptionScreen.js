import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  Upload,
  Copy,
  Info
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const SubscriptionScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUrl, setSlipUrl] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await API.get(`/technician-subscriptions/technician/${userData.id}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadSlip(result.assets[0].uri);
    }
  };

  const uploadSlip = async (uri) => {
    setUploadingSlip(true);
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'slip.jpg',
    });

    try {
      const response = await API.post('/technician-subscriptions/upload-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSlipUrl(response.data.url);
      Alert.alert('Success', 'Payment slip uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload payment slip. Please check your internet connection.');
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleSubmitSubscription = async () => {
    if (!slipUrl) {
      Alert.alert('Error', 'Please upload your payment slip first');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      await API.post('/technician-subscriptions/submit', {
        technicianId: userData.id,
        technicianName: userData.name,
        technicianReference: userData.technicianReference,
        paymentSlipUrl: slipUrl,
        month: monthNames[now.getMonth()],
        year: now.getFullYear(),
        amount: 1500
      });

      Alert.alert('Success', 'Subscription submitted for approval!');
      setSlipUrl(null);
      fetchHistory();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: COLORS.success + '20', text: COLORS.success, icon: CheckCircle };
      case 'REJECTED': return { bg: COLORS.error + '20', text: COLORS.error, icon: AlertCircle };
      default: return { bg: COLORS.accent + '20', text: COLORS.accent, icon: Clock };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Your Unique Reference Number</Text>
          <View style={styles.refRow}>
            <Text style={styles.refValue}>{userData?.technicianReference}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Copied', 'Reference number copied to clipboard')}>
              <Copy size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Info size={20} color={COLORS.primary} />
            <Text style={styles.bankTitle}>Payment Details</Text>
          </View>
          <View style={styles.bankInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Name:</Text>
              <Text style={styles.infoVal}>Tharaniya Jeyapalan</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account No:</Text>
              <Text style={styles.infoVal}>67890976</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank:</Text>
              <Text style={styles.infoVal}>Bank of Ceylon (BOC)</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={[styles.infoVal, { color: COLORS.primary, fontSize: 18 }]}>LKR 1,500.00</Text>
            </View>
          </View>
          <Text style={styles.bankNote}>* Please include your reference number in the payment description.</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload Payment Slip</Text>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={pickImage}
            disabled={uploadingSlip}
          >
            {uploadingSlip ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : slipUrl ? (
              <Image source={{ uri: slipUrl }} style={styles.previewImage} />
            ) : (
              <>
                <Upload size={30} color={COLORS.textSecondary} />
                <Text style={styles.uploadPlaceholder}>Tap to upload bank slip</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, (!slipUrl || submitting) && styles.disabledBtn]}
            onPress={handleSubmitSubscription}
            disabled={!slipUrl || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Subscription</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : history.length === 0 ? (
            <Text style={styles.emptyText}>No previous payments found.</Text>
          ) : (
            history.map((item) => {
              const status = getStatusStyle(item.status);
              return (
                <View key={item._id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyMonth}>{item.month} {item.year}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <status.icon size={12} color={status.text} />
                      <Text style={[styles.statusText, { color: status.text }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.historyBody}>
                    <Text style={styles.historyDate}>Submitted: {new Date(item.submissionDate).toLocaleDateString()}</Text>
                    <Text style={styles.historyAmount}>LKR {item.amount.toFixed(2)}</Text>
                  </View>
                  {item.rejectionReason && (
                    <Text style={styles.rejectionText}>Reason: {item.rejectionReason}</Text>
                  )}
                </View>
              );
            })
          )}
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
  refCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  refLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  bankCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  bankInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoVal: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  bankNote: {
    fontSize: 11,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  uploadSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  uploadBox: {
    height: 180,
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: ROUNDING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledBtn: {
    backgroundColor: COLORS.textSecondary,
    elevation: 0,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  historySection: {
    marginBottom: SPACING.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  rejectionText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 8,
    fontStyle: 'italic',
  }
});

export default SubscriptionScreen;
