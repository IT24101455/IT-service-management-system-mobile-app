import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Eye,
  Info
} from 'lucide-react-native';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ManageLeavesScreen = ({ navigation }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchLeaves = async () => {
    try {
      const response = await API.get('/leaves');
      // Sort by pending first, then by date
      const sorted = response.data.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setLeaves(sorted);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      Alert.alert('Error', 'Failed to load leave requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    Alert.alert(
      `${status.charAt(0) + status.slice(1).toLowerCase()} Leave`,
      `Are you sure you want to ${status.toLowerCase()} this leave request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: status, 
          onPress: async () => {
            try {
              await API.put(`/leaves/${id}/status`, { status });
              Alert.alert('Success', `Leave request ${status.toLowerCase()}ed`);
              fetchLeaves();
            } catch (error) {
              Alert.alert('Error', 'Failed to update leave status');
            }
          }
        }
      ]
    );
  };

  const renderLeaveItem = ({ item }) => (
    <View style={styles.leaveCard}>
      <View style={styles.cardHeader}>
        <View style={styles.techInfo}>
          <View style={styles.avatarPlaceholder}>
            <User size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.techName}>{item.technicianName}</Text>
            <Text style={styles.requestDate}>Requested on {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'APPROVED' ? COLORS.success + '15' : 
                           item.status === 'PENDING' ? COLORS.accent + '15' : COLORS.error + '15'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'APPROVED' ? COLORS.success : 
                   item.status === 'PENDING' ? COLORS.accent : COLORS.error
          }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateBox}>
          <Calendar size={14} color={COLORS.primary} />
          <Text style={styles.dateLabel}>From:</Text>
          <Text style={styles.dateValue}>{new Date(item.startDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.dateBox}>
          <Calendar size={14} color={COLORS.primary} />
          <Text style={styles.dateLabel}>To:</Text>
          <Text style={styles.dateValue}>{new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.reasonBox}>
        <Info size={14} color={COLORS.textSecondary} />
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      {item.medicalReportUrl && (
        <TouchableOpacity 
          style={styles.medicalBtn} 
          onPress={() => setSelectedImage(item.medicalReportUrl)}
        >
          <FileText size={16} color={COLORS.primary} />
          <Text style={styles.medicalBtnText}>View Medical Report</Text>
          <Eye size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {item.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => handleStatusUpdate(item._id, 'REJECTED')}
          >
            <XCircle size={18} color={COLORS.error} />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]} 
            onPress={() => handleStatusUpdate(item._id, 'APPROVED')}
          >
            <CheckCircle size={18} color={COLORS.white} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderLeaveItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchLeaves}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={50} color={COLORS.border} />
              <Text style={styles.emptyText}>No leave requests found.</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedImage(null)}>
            <XCircle size={32} color={COLORS.white} />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
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
  listContent: {
    padding: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveCard: {
    backgroundColor: COLORS.white,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  techInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  requestDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: 20,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
  },
  reasonBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
    paddingHorizontal: 4,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  medicalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    padding: 12,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    gap: 10,
    marginBottom: SPACING.md,
  },
  medicalBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    borderRadius: ROUNDING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectBtnText: {
    color: COLORS.error,
    fontWeight: '700',
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
  },
  approveBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    gap: 10,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  closeModal: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  }
});

export default ManageLeavesScreen;
