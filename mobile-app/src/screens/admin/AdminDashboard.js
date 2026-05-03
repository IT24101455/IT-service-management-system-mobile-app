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
  Dimensions,
  Alert,
  TextInput,
  Image
} from 'react-native';
import { 
  Shield, 
  Users, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  Settings, 
  LogOut,
  Search,
  User as UserIcon,
  CreditCard,
  Bell,
  Calendar
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const { userData, logout, unreadCount } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeUsers: 0,
    pendingComplaints: 0,
    totalAssets: 0
  });
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechs, setFilteredTechs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      // In a real app, you'd have a specific admin stats endpoint
      // For now, we'll fetch from multiple endpoints or use mock for structure
      const [tickets, users, complaints, assets, techs] = await Promise.all([
        API.get('/tickets'),
        API.get('/users'),
        API.get('/complaints'),
        API.get('/assets'),
        API.get('/users/technicians/available')
      ]);

      setStats({
        totalTickets: tickets.data.length,
        activeUsers: users.data.length,
        pendingComplaints: complaints.data.filter(c => c.status === 'PENDING').length,
        totalAssets: assets.data.length
      });

      setTechnicians(techs.data);
      setFilteredTechs(techs.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
    fetchAdminData();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const AdminCard = ({ title, value, icon: Icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuLink = ({ title, subtitle, icon: Icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconBox}>
        <Icon size={20} color={COLORS.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
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
              <Text style={styles.welcomeText}>System Admin</Text>
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
        <View style={styles.statsGrid}>
          <AdminCard 
            title="Total Tickets" 
            value={stats.totalTickets} 
            icon={TrendingUp} 
            color={COLORS.primary} 
          />
          <AdminCard 
            title="Active Users" 
            value={stats.activeUsers} 
            icon={Users} 
            color={COLORS.success} 
          />
          <AdminCard 
            title="Complaints" 
            value={stats.pendingComplaints} 
            icon={AlertCircle} 
            color={COLORS.error} 
          />
          <AdminCard 
            title="Assets" 
            value={stats.totalAssets} 
            icon={Package} 
            color={COLORS.accent} 
          />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Quick search technicians..."
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.techName}>{tech.name}</Text>
                      {(tech.nicFrontUrl || tech.nicBackUrl) && (
                        <View style={styles.docBadge}>
                          <Shield size={10} color={COLORS.success} />
                          <Text style={styles.docBadgeText}>Docs</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.techSpec}>{tech.specialization || 'General'} Specialist • {tech.technicianReference}</Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Management</Text>
        <View style={styles.menuList}>
          <MenuLink 
            title="User Management" 
            subtitle="Manage roles, approvals, and profiles" 
            icon={Users} 
            onPress={() => navigation.navigate('ManageUsers')}
          />
          <MenuLink 
            title="Asset Inventory" 
            subtitle="Track hardware and software assets" 
            icon={Package} 
            onPress={() => {}}
          />
          <MenuLink 
            title="Subscription Requests" 
            subtitle="Verify and approve technician payments" 
            icon={CreditCard} 
            onPress={() => navigation.navigate('ManageSubscriptions')}
          />
          <MenuLink 
            title="Service Requests" 
            subtitle="Monitor and assign all support tickets" 
            icon={TrendingUp} 
            onPress={() => navigation.navigate('ManageTickets')}
          />
          <MenuLink 
            title="System Complaints" 
            subtitle="Review and resolve user complaints" 
            icon={AlertCircle} 
            onPress={() => navigation.navigate('ManageComplaints')}
          />
          <MenuLink 
            title="Technician Leaves" 
            subtitle="Approve or reject leave requests" 
            icon={Calendar} 
            onPress={() => navigation.navigate('ManageLeaves')}
          />
          <MenuLink 
            title="Global Settings" 
            subtitle="System configurations and logs" 
            icon={Settings} 
            onPress={() => {}}
          />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>TechNova ITSM v2.0 (MERN)</Text>
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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
    gap: 4,
    marginBottom: 4,
  },
  adminBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: (width - SPACING.md * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: ROUNDING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  menuList: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: ROUNDING.md,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: SPACING.xl,
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDING.sm,
    gap: 2,
  },
  docBadgeText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default AdminDashboard;
