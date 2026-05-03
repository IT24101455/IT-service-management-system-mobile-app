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
import { 
  User as UserIcon, 
  Briefcase, 
  MapPin, 
  Clock, 
  MessageCircle, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Shield
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const TechnicianProfileScreen = ({ route, navigation }) => {
  const { tech } = route.params;
  const { userData } = useContext(AuthContext);
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await API.get(`/tickets/user/${userData.id}`);
      // Only show PENDING tickets that haven't been assigned yet
      const pendingTickets = response.data.filter(t => t.status === 'PENDING' && !t.technicianId);
      setUserTickets(pendingTickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticket) => {
    Alert.alert(
      'Assign Ticket',
      `Are you sure you want to assign '${ticket.title}' to ${tech.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setAssigning(true);
            try {
              await API.patch(`/tickets/${ticket._id}/assign`, {
                technicianId: tech._id,
                technicianName: tech.name
              });
              Alert.alert('Success', 'Ticket assigned successfully!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to assign ticket');
            } finally {
              setAssigning(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Technician Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {tech.profilePicture ? (
              <Image source={{ uri: tech.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserIcon size={50} color={COLORS.primary} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{tech.name}</Text>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>{tech.specialization || 'General Specialist'}</Text>
          </View>

          <View style={[styles.availabilityBadge, { 
            backgroundColor: tech.isAvailable === false ? COLORS.error + '15' : COLORS.success + '15',
            marginTop: 8
          }]}>
            <View style={[styles.statusDot, { 
              backgroundColor: tech.isAvailable === false ? COLORS.error : COLORS.success 
            }]} />
            <Text style={[styles.availabilityText, { 
              color: tech.isAvailable === false ? COLORS.error : COLORS.success 
            }]}>
              {tech.isAvailable === false 
                ? (tech.onLeave ? 'On Leave' : 'Not Available') 
                : 'Available Now'}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Briefcase size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{tech.experienceYears || 0} Years</Text>
          </View>
          <View style={styles.infoCard}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{tech.district || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.detailRow}>
            <Clock size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {tech.workingDays || 'Mon-Fri'} • {tech.workingStartTime || '09:00'} - {tech.workingEndTime || '17:00'}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={() => navigation.navigate('Chat', { receiverId: tech._id, receiverName: tech.name })}
          >
            <MessageCircle size={20} color={COLORS.white} />
            <Text style={styles.actionBtnText}>Chat with Him</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.complaintBtn]}
            onPress={() => navigation.navigate('CreateComplaint', { techId: tech._id, techName: tech.name })}
          >
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.complaintBtnText}>File a Complaint</Text>
          </TouchableOpacity>
        </View>

        {userData?.role === 'ADMIN' && (tech.nicFrontUrl || tech.nicBackUrl) && (
          <View style={styles.section}>
            <View style={styles.adminHeader}>
              <Shield size={18} color={COLORS.accent} />
              <Text style={styles.adminTitle}>Verification Documents (Admin Only)</Text>
            </View>
            <View style={styles.nicGrid}>
              {tech.nicFrontUrl && (
                <View style={styles.nicContainer}>
                  <Text style={styles.nicLabel}>NIC Front</Text>
                  <Image source={{ uri: tech.nicFrontUrl }} style={styles.nicImage} resizeMode="cover" />
                </View>
              )}
              {tech.nicBackUrl && (
                <View style={styles.nicContainer}>
                  <Text style={styles.nicLabel}>NIC Back</Text>
                  <Image source={{ uri: tech.nicBackUrl }} style={styles.nicImage} resizeMode="cover" />
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Assign Your Ticket</Text>
          <Text style={styles.sectionSubtitle}>Select a pending ticket to assign to this technician</Text>

          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : userTickets.length === 0 ? (
            <View style={styles.emptyTickets}>
              <CheckCircle size={30} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No pending tickets available for assignment.</Text>
            </View>
          ) : (
            userTickets.map(ticket => (
              <TouchableOpacity 
                key={ticket._id} 
                style={styles.ticketItem}
                onPress={() => handleAssignTicket(ticket)}
                disabled={assigning}
              >
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                  <Text style={styles.ticketMeta}>{ticket.category} • {ticket.priority}</Text>
                </View>
                <View style={styles.assignBadge}>
                  <Text style={styles.assignText}>Assign</Text>
                </View>
              </TouchableOpacity>
            ))
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
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  specBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: ROUNDING.full,
  },
  specText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionButtons: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  actionBtn: {
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
  chatBtn: {
    backgroundColor: COLORS.primary,
  },
  complaintBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  complaintBtnText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  ticketsSection: {
    marginBottom: SPACING.xl,
  },
  emptyTickets: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  ticketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  ticketMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  assignBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ROUNDING.lg,
  },
  assignText: {
    color: COLORS.success,
    fontWeight: '800',
    fontSize: 12,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
    textTransform: 'uppercase',
  },
  nicGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nicContainer: {
    flex: 1,
  },
  nicLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  nicImage: {
    width: '100%',
    height: 100,
    borderRadius: ROUNDING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default TechnicianProfileScreen;
