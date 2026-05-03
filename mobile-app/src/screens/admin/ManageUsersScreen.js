import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  ChevronLeft, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle,
  MoreVertical
} from 'lucide-react-native';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ManageUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    const action = user.active ? 'Deactivate' : 'Activate';
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              await API.put(`/users/${user._id}/toggle-status`);
              Alert.alert('Success', `User ${action.toLowerCase()}d successfully`);
              fetchUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status');
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
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.userCount}>{filteredUsers.length} Users Found</Text>
          {filteredUsers.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <User size={24} color={COLORS.primary} />
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[styles.roleBadge, { 
                    backgroundColor: user.role === 'ADMIN' ? COLORS.error + '15' : 
                                     user.role === 'TECHNICIAN' ? COLORS.accent + '15' : COLORS.primary + '15' 
                  }]}>
                    <Text style={[styles.roleText, { 
                      color: user.role === 'ADMIN' ? COLORS.error : 
                             user.role === 'TECHNICIAN' ? COLORS.accent : COLORS.primary 
                    }]}>{user.role}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Mail size={12} color={COLORS.textSecondary} />
                  <Text style={styles.userDetail}>{user.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Phone size={12} color={COLORS.textSecondary} />
                  <Text style={styles.userDetail}>{user.phone || 'No phone'}</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: user.active ? COLORS.success : COLORS.textSecondary }]} />
                  <Text style={[styles.statusText, { color: user.active ? COLORS.success : COLORS.textSecondary }]}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleUserStatus(user)}>
                {user.active ? <XCircle size={24} color={COLORS.error} /> : <CheckCircle size={24} color={COLORS.success} />}
              </TouchableOpacity>
            </View>
          ))}
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
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: ROUNDING.xl,
    borderBottomRightRadius: ROUNDING.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: ROUNDING.lg,
    paddingHorizontal: SPACING.md,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  userCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDING.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    padding: SPACING.sm,
  }
});

export default ManageUsersScreen;
