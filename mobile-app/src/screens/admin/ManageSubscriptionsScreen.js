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
  Image,
  Modal,
  TextInput
} from 'react-native';
import { 
  ChevronLeft, 
  Check, 
  X, 
  ExternalLink, 
  Calendar, 
  User, 
  CreditCard,
  Search
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ManageSubscriptionsScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await API.get('/technician-subscriptions/all');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscription requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    Alert.alert(
      'Approve Payment',
      'Have you verified the payment in the bank account?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Approve', 
          onPress: async () => {
            setActionLoading(true);
            try {
              await API.put(`/technician-subscriptions/${id}/approve?adminId=${userData.id}`);
              Alert.alert('Success', 'Subscription approved');
              fetchSubscriptions();
              setModalVisible(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to approve subscription');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await API.put(`/technician-subscriptions/${selectedSub._id}/reject?adminId=${userData.id}&reason=${rejectionReason}`);
      Alert.alert('Rejected', 'Subscription has been rejected');
      setRejectionModalVisible(false);
      setModalVisible(false);
      setRejectionReason('');
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const renderItem = (item) => (
    <TouchableOpacity 
      key={item._id} 
      style={styles.card}
      onPress={() => {
        setSelectedSub(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.techInfo}>
          <Text style={styles.techName}>{item.technicianName}</Text>
          <Text style={styles.techRef}>{item.technicianReference}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'APPROVED' ? COLORS.success + '20' : 
                           item.status === 'REJECTED' ? COLORS.error + '20' : COLORS.accent + '20' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'APPROVED' ? COLORS.success : 
                   item.status === 'REJECTED' ? COLORS.error : COLORS.accent 
          }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.detailItem}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.month} {item.year}</Text>
        </View>
        <View style={styles.detailItem}>
          <CreditCard size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>LKR {item.amount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{subscriptions.filter(s => s.status === 'PENDING').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{subscriptions.filter(s => s.status === 'APPROVED').length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Submissions</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : subscriptions.length === 0 ? (
          <Text style={styles.emptyText}>No subscription requests found.</Text>
        ) : (
          subscriptions.map(renderItem)
        )}
      </ScrollView>

      {/* Subscription Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Verification</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedSub && (
              <ScrollView>
                <View style={styles.modalBody}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Technician:</Text>
                    <Text style={styles.modalValue}>{selectedSub.technicianName}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Reference:</Text>
                    <Text style={styles.modalValue}>{selectedSub.technicianReference}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>For Month:</Text>
                    <Text style={styles.modalValue}>{selectedSub.month} {selectedSub.year}</Text>
                  </View>

                  <Text style={[styles.modalLabel, { marginTop: 15, marginBottom: 10 }]}>Payment Slip:</Text>
                  <TouchableOpacity style={styles.slipContainer}>
                    <Image 
                      source={{ uri: selectedSub.paymentSlipUrl }} 
                      style={styles.slipImage} 
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {selectedSub.status === 'PENDING' && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={[styles.modalBtn, styles.approveBtn]}
                        onPress={() => handleApprove(selectedSub._id)}
                        disabled={actionLoading}
                      >
                        <Check size={20} color={COLORS.white} />
                        <Text style={styles.modalBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalBtn, styles.rejectBtn]}
                        onPress={() => setRejectionModalVisible(true)}
                        disabled={actionLoading}
                      >
                        <X size={20} color={COLORS.white} />
                        <Text style={styles.modalBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rejectionModalVisible}
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Reject Subscription</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection..."
              multiline
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: COLORS.textSecondary }]}
                onPress={() => setRejectionModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.rejectBtn]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                <Text style={styles.modalBtnText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  techName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  techRef: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: ROUNDING.xl,
    borderTopRightRadius: ROUNDING.xl,
    maxHeight: '90%',
    padding: SPACING.lg,
  },
  smallModalContent: {
    backgroundColor: COLORS.white,
    margin: SPACING.xl,
    borderRadius: ROUNDING.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  slipContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: ROUNDING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slipImage: {
    width: '100%',
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: ROUNDING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  modalBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    height: 100,
    textAlignVertical: 'top',
    marginTop: SPACING.md,
    color: COLORS.text,
  }
});

export default ManageSubscriptionsScreen;
