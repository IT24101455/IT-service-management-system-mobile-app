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
  TextInput,
  Image
} from 'react-native';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  ChevronRight, 
  LogOut, 
  Search, 
  User as UserIcon,
  Filter
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const UserDashboard = ({ navigation }) => {
  const { userData, logout, unreadCount } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechs, setFilteredTechs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [ticketRes, techRes] = await Promise.all([
        API.get(`/tickets/user/${userData.id}`),
        API.get('/users/technicians/available')
      ]);

      const ticketData = ticketRes.data;
      setTickets(ticketData.slice(0, 5));

      setTechnicians(techRes.data);
      setFilteredTechs(techRes.data);

      const s = {
        pending: ticketData.filter(t => t.status === 'PENDING').length,
        inProgress: ticketData.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length,
        resolved: ticketData.filter(t => t.status === 'RESOLVED').length,
      };
      setStats(s);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTechs(technicians);
    } else {
      const filtered = technicians.filter(tech => 
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tech.specialization && tech.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTechs(filtered);
    }
  }, [searchQuery, technicians]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
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
                <UserIcon size={24} color={COLORS.white} />
              )}
            </View>
            <View>
              <Text style={styles.welcomeText}>Hello,</Text>
              <Text style={styles.userName}>{userData?.name}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity 
              style={styles.notificationBtn}
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
          <View style={styles.statsRow}>
            <StatCard title="Pending" value={stats.pending} icon={Clock} color={COLORS.accent} />
            <StatCard title="Active" value={stats.inProgress} icon={AlertCircle} color={COLORS.primary} />
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color={COLORS.success} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search technicians by name or category..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {searchQuery.length > 0 && (
            <View style={styles.techSearchSection}>
              <Text style={styles.sectionTitle}>Technician Results</Text>
              {filteredTechs.length === 0 ? (
                <Text style={styles.noResultsText}>No technicians found.</Text>
              ) : (
                filteredTechs.map((tech) => (
                  <TouchableOpacity 
                    key={tech._id} 
                    style={styles.techCard}
                    onPress={() => navigation.navigate('TechnicianProfile', { tech })}
                  >
                    <View style={styles.techAvatar}>
                      <UserIcon size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.techInfo}>
                      <Text style={styles.techName}>{tech.name}</Text>
                      <Text style={styles.techSpec}>{tech.specialization || 'General'} Specialist • {tech.technicianReference}</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

        <TouchableOpacity 
          style={styles.createTicketBtn}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Plus size={24} color={COLORS.white} />
          <Text style={styles.createTicketText}>New Support Ticket</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.createTicketBtn, { backgroundColor: COLORS.card, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <UserIcon size={24} color={COLORS.primary} />
          <Text style={[styles.createTicketText, { color: COLORS.primary }]}>Manage My Profile</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent tickets found.</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity 
              key={ticket._id} 
              style={styles.ticketCard}
              onPress={() => navigation.navigate('TicketDetail', { id: ticket._id })}
            >
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                <Text style={styles.ticketCategory}>{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.ticketStatusContainer}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: ticket.status === 'RESOLVED' ? COLORS.success + '20' : 
                                   ticket.status === 'PENDING' ? COLORS.accent + '20' : COLORS.primary + '20' 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: ticket.status === 'RESOLVED' ? COLORS.success : 
                           ticket.status === 'PENDING' ? COLORS.accent : COLORS.primary 
                  }]}>{ticket.status}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textSecondary} />
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  notificationBtn: {
    width: 45,
    height: 45,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    width: 45,
    height: 45,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  createTicketBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: ROUNDING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  createTicketText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ticketCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ticketStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    paddingHorizontal: SPACING.md,
    height: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  techSearchSection: {
    marginBottom: SPACING.xl,
  },
  noResultsText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginTop: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  techAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
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
  techSpec: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default UserDashboard;
