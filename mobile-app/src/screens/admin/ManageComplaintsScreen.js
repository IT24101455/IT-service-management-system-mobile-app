import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  ChevronLeft, 
  AlertCircle, 
  User, 
  MessageSquare,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ManageComplaintsScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await API.get('/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grievance Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBar}>
        <AlertCircle size={20} color={COLORS.error} />
        <Text style={styles.infoText}>{complaints.length} Total Complaints Filed</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {complaints.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No complaints have been filed yet.</Text>
            </View>
          ) : (
            complaints.map((item) => (
              <View key={item._id} style={styles.complaintCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.authorInfo}>
                    <User size={14} color={COLORS.textSecondary} />
                    <Text style={styles.authorName}>By: {item.userName}</Text>
                  </View>
                  <View style={styles.dateInfo}>
                    <Clock size={12} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View style={styles.targetSection}>
                  <Text style={styles.targetLabel}>Against Technician:</Text>
                  <Text style={styles.targetName}>{item.technicianName}</Text>
                </View>

                <View style={styles.contentSection}>
                  <Text style={styles.complaintText}>{item.description}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => {
                      // Navigate to technician profile for action
                      navigation.navigate('TechnicianProfile', { 
                        tech: { _id: item.technicianId, name: item.technicianName } 
                      });
                    }}
                  >
                    <Text style={styles.actionBtnText}>Review Technician Profile</Text>
                    <ChevronRight size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    gap: 8,
  },
  infoText: {
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 14,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  complaintCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  targetSection: {
    marginBottom: SPACING.md,
  },
  targetLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  contentSection: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: ROUNDING.lg,
    marginBottom: SPACING.md,
  },
  complaintText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: '600',
  }
});

export default ManageComplaintsScreen;
