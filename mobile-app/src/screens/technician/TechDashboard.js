import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Briefcase, Clock, CheckCircle, AlertCircle, Bell, ChevronRight, User, LogOut, CreditCard, Target, Calendar } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const TechDashboard = ({ navigation }) => {
  const { userData, logout, unreadCount } = useContext(AuthContext);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [stats, setStats] = useState({ active: 0, pending: 0, resolved: 0, slaBreached: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTechData = async () => {
    try {
      const response = await API.get(`/tickets/technician/${userData.id}`);
      const ticketData = response.data;
      setAssignedTickets(ticketData.slice(0, 5));

      const s = {
        active: ticketData.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length,
        pending: ticketData.filter(t => t.status === 'PENDING').length,
        resolved: ticketData.filter(t => t.status === 'RESOLVED').length,
        slaBreached: ticketData.filter(t => t.slaBreached).length,
      };
      setStats(s);
    } catch (error) {
      console.error('Error fetching technician dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTechData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTechData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const StatItem = ({ title, value, color }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileRow}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatar}>
              {userData?.profilePicture ? (
                <Image source={{ uri: userData.profilePicture }} style={styles.avatarImg} />
              ) : (
                <User size={24} color={COLORS.white} />
              )}
            </View>
            <View>
              <Text style={styles.welcomeText}>Technician Portal</Text>
              <Text style={styles.userName}>{userData?.name}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={20} color={COLORS.white} />
              {unreadCount > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <StatItem title="Active" value={stats.active} color={COLORS.primary} />
              <StatItem title="SLA Breach" value={stats.slaBreached} color={COLORS.error} />
              <StatItem title="Resolved" value={stats.resolved} color={COLORS.success} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.subCard}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={styles.subCardHeader}>
              <View style={styles.subIconContainer}>
                <CreditCard size={24} color={COLORS.primary} />
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subTitle}>Monthly Subscription</Text>
                <Text style={styles.subRef}>Ref: {userData?.technicianReference}</Text>
              </View>
              <ChevronRight size={24} color={COLORS.textSecondary} />
            </View>
            <View style={styles.subFooter}>
              <Text style={styles.subAmount}>LKR 1,500.00 / month</Text>
              <Text style={styles.subAction}>Manage Payment</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Tickets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
              <Text style={styles.viewAllText}>View Worklist</Text>
            </TouchableOpacity>
          </View>

          {assignedTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Briefcase size={40} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No assigned tickets at the moment.</Text>
            </View>
          ) : (
            assignedTickets.map((ticket) => (
              <TouchableOpacity 
                key={ticket._id} 
                style={styles.ticketCard}
                onPress={() => navigation.navigate('TicketDetail', { id: ticket._id })}
              >
                <View style={styles.ticketMain}>
                  <View style={styles.ticketTitleRow}>
                    <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                    {ticket.slaBreached && <AlertCircle size={16} color={COLORS.error} />}
                  </View>
                  <Text style={styles.ticketUser}>User: {ticket.userName}</Text>
                  <View style={styles.metaRow}>
                    <Clock size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>Due: {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleDateString() : 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.ticketSide}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: ticket.status === 'IN_PROGRESS' ? COLORS.primary + '20' : COLORS.accent + '20' 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: ticket.status === 'IN_PROGRESS' ? COLORS.primary : COLORS.accent 
                    }]}>{ticket.status}</Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionBtn}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <User size={20} color={COLORS.accent} />
                <Text style={styles.actionText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('RequestLeave')}
              >
                <Calendar size={20} color={COLORS.error} />
                <Text style={styles.actionText}>Request Leave</Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  mainContent: {
    paddingHorizontal: SPACING.md,
    marginTop: -40,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: ROUNDING.xl,
    borderBottomRightRadius: ROUNDING.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  logoutBtn: {
    width: 45,
    height: 45,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.lg,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subIconContainer: {
    width: 48,
    height: 48,
    borderRadius: ROUNDING.lg,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  subInfo: {
    flex: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  subRef: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  subAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  subAction: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  ticketMain: {
    flex: 1,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  ticketUser: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  ticketSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  quickActions: {
    marginTop: SPACING.xl,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TechDashboard;
