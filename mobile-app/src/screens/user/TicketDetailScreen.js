import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput
} from 'react-native';
import { ArrowLeft, Clock, User, Shield, AlertTriangle, CheckCircle, MessageSquare, Play, FileText } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const TicketDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { userData } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [solution, setSolution] = useState('');
  const [showSolutionInput, setShowSolutionInput] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const response = await API.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'RESOLVED' && !showSolutionInput) {
      setShowSolutionInput(true);
      return;
    }

    if (newStatus === 'RESOLVED' && !solution.trim()) {
      Alert.alert('Required', 'Please provide a resolution note before closing the ticket.');
      return;
    }

    setUpdating(true);
    try {
      await API.put(`/tickets/${id}`, { 
        status: newStatus,
        solution: newStatus === 'RESOLVED' ? solution : undefined
      });
      Alert.alert('Success', `Ticket status updated to ${newStatus}`);
      fetchTicket();
      setShowSolutionInput(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'RESOLVED': return { bg: COLORS.success + '20', text: COLORS.success, icon: CheckCircle };
        case 'PENDING': return { bg: COLORS.accent + '20', text: COLORS.accent, icon: Clock };
        case 'IN_PROGRESS': return { bg: COLORS.primary + '20', text: COLORS.primary, icon: Clock };
        default: return { bg: COLORS.secondary + '20', text: COLORS.secondary, icon: AlertTriangle };
      }
    };
    const { bg, text, icon: Icon } = getStatusStyle();
    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Icon size={14} color={text} />
        <Text style={[styles.statusText, { color: text }]}>{status}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusRow}>
          <Text style={styles.ticketId}>ID: {ticket._id.substring(ticket._id.length - 8).toUpperCase()}</Text>
          <StatusBadge status={ticket.status} />
        </View>

        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.description}>{ticket.description}</Text>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <View style={styles.infoValueRow}>
              <Text style={styles.infoValue}>{ticket.category}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Priority</Text>
            <View style={styles.infoValueRow}>
              <View style={[styles.priorityDot, { 
                backgroundColor: ticket.priority === 'CRITICAL' ? COLORS.error : 
                                ticket.priority === 'HIGH' ? COLORS.error : 
                                ticket.priority === 'MEDIUM' ? COLORS.accent : COLORS.success 
              }]} />
              <Text style={styles.infoValue}>{ticket.priority}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created On</Text>
            <Text style={styles.infoValue}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>SLA Deadline</Text>
            <Text style={[styles.infoValue, ticket.slaBreached && { color: COLORS.error }]}>
              {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.techCard}>
          {ticket.technicianId ? (
            <>
              <View style={styles.techIcon}>
                <User size={24} color={COLORS.primary} />
              </View>
              <View style={styles.techInfo}>
                <Text style={styles.techName}>{ticket.technicianName}</Text>
                <Text style={styles.techRole}>Assigned Support Staff</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={styles.chatBtn}
                  onPress={() => {
                    const isTech = userData?.role === 'TECHNICIAN';
                    navigation.navigate('Chat', { 
                      receiverId: isTech ? ticket.userId : ticket.technicianId, 
                      receiverName: isTech ? ticket.userName : ticket.technicianName 
                    });
                  }}
                >
                  <MessageSquare size={20} color={COLORS.primary} />
                </TouchableOpacity>
                {userData?.role === 'ADMIN' && (
                  <TouchableOpacity 
                    style={[styles.chatBtn, { backgroundColor: COLORS.error + '15' }]}
                    onPress={() => {
                      Alert.alert(
                        'Reassign Ticket',
                        'Assign this ticket to a different technician?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Select New Tech', onPress: () => navigation.navigate('AdminDashboard') }
                        ]
                      );
                    }}
                  >
                    <ArrowLeft size={20} color={COLORS.error} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.unassignedContainer}>
              <Shield size={24} color={COLORS.textSecondary} />
              <Text style={styles.unassignedText}>Waiting for technician assignment...</Text>
              {userData?.role === 'ADMIN' && (
                <TouchableOpacity 
                  style={styles.assignNowBtn}
                  onPress={() => navigation.navigate('AdminDashboard')}
                >
                  <Text style={styles.assignNowText}>Assign Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {userData?.role === 'ADMIN' && ticket.slaBreached && (
          <View style={styles.slaWarningBox}>
            <AlertTriangle size={20} color={COLORS.error} />
            <View style={styles.slaWarningTextContainer}>
              <Text style={styles.slaWarningTitle}>SLA BREACH DETECTED</Text>
              <Text style={styles.slaWarningMsg}>This ticket has exceeded the resolution time. Please reassign to an available technician immediately.</Text>
            </View>
          </View>
        )}

        {ticket.attachmentUrl && (
          <>
            <Text style={styles.sectionTitle}>Attachment</Text>
            <TouchableOpacity style={styles.attachmentPreview}>
              <Image source={{ uri: ticket.attachmentUrl }} style={styles.attachmentImage} resizeMode="cover" />
            </TouchableOpacity>
          </>
        )}

        {ticket.solution && (
          <View style={styles.solutionContainer}>
            <Text style={styles.sectionTitle}>Resolution Notes</Text>
            <View style={styles.solutionCard}>
              <Text style={styles.solutionText}>{ticket.solution}</Text>
              <Text style={styles.resolvedDate}>Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}</Text>
            </View>
          </View>
        )}

        {userData?.role === 'TECHNICIAN' && ticket.technicianId === userData.id && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <View style={styles.techActionSection}>
            <Text style={styles.sectionTitle}>Update Working Stage</Text>
            
            <View style={styles.techActionRow}>
              {ticket.status === 'PENDING' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.progressBtn]}
                  onPress={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={updating}
                >
                  <Play size={18} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>Start Working</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.actionBtn, styles.resolveBtn]}
                onPress={() => handleUpdateStatus('RESOLVED')}
                disabled={updating}
              >
                <CheckCircle size={18} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Mark as Resolved</Text>
              </TouchableOpacity>
            </View>

            {showSolutionInput && (
              <View style={styles.solutionInputContainer}>
                <Text style={styles.label}>Resolution Note</Text>
                <TextInput 
                  style={styles.solutionInput}
                  value={solution}
                  onChangeText={setSolution}
                  placeholder="Explain what was done to fix the issue..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.confirmResolveBtn}
                  onPress={() => handleUpdateStatus('RESOLVED')}
                  disabled={updating}
                >
                  {updating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.confirmText}>Submit Resolution</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ticketId: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  infoItem: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  techCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  techIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  techRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unassignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  unassignedText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  attachmentPreview: {
    width: '100%',
    height: 200,
    borderRadius: ROUNDING.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  solutionContainer: {
    marginTop: SPACING.md,
  },
  solutionCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  solutionText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },
  resolvedDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  assignNowBtn: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
  },
  assignNowText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  slaWarningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  slaWarningTextContainer: {
    flex: 1,
  },
  slaWarningTitle: {
    color: COLORS.error,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 2,
  },
  slaWarningMsg: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
  techActionSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: ROUNDING.xl,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  techActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: ROUNDING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressBtn: {
    backgroundColor: COLORS.primary,
  },
  resolveBtn: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  solutionInputContainer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  solutionInput: {
    backgroundColor: COLORS.background,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: SPACING.xs,
  },
  confirmResolveBtn: {
    backgroundColor: COLORS.success,
    height: 50,
    borderRadius: ROUNDING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default TicketDetailScreen;
