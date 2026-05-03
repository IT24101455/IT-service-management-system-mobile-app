import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { 
  Bell, 
  ChevronLeft, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  CreditCard,
  MessageCircle,
  Trash2
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const NotificationsScreen = ({ navigation }) => {
  const { userData, setUnreadCount } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const id = userData?.role === 'ADMIN' ? 'ADMIN' : userData?.id;
      const response = await API.get(`/notifications/user/${id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (item) => {
    // Mark as read first
    markAsRead(item._id);

    // Navigate based on type
    switch (item.type) {
      case 'CHAT':
        navigation.navigate('Chat', { 
          receiverId: item.relatedId, 
          receiverName: item.relatedName || 'User' 
        });
        break;
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_RESOLVED':
      case 'TICKET_UPDATED':
      case 'SLA_BREACH':
        if (item.relatedId || item.ticketId) {
          navigation.navigate('TicketDetail', { id: item.relatedId || item.ticketId });
        }
        break;
      case 'PAYMENT':
        if (userData?.role === 'ADMIN') {
          navigation.navigate('ManageSubscriptions');
        } else {
          navigation.navigate('Subscription');
        }
        break;
      default:
        console.log('No navigation defined for type:', item.type);
    }
  };

  const markAsRead = async (id) => {
    try {
      const notif = notifications.find(n => n._id === id);
      if (notif && !notif.read) {
        await API.put(`/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const id = userData?.role === 'ADMIN' ? 'ADMIN' : userData?.id;
      await API.post('/notifications/read-all', { userId: id });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'TICKET_CREATED': return { icon: Bell, color: COLORS.primary };
      case 'TICKET_ASSIGNED': return { icon: Info, color: COLORS.accent };
      case 'TICKET_RESOLVED': return { icon: CheckCircle, color: COLORS.success };
      case 'SLA_BREACH': return { icon: AlertTriangle, color: COLORS.error };
      case 'PAYMENT': return { icon: CreditCard, color: COLORS.success };
      case 'CHAT': return { icon: MessageCircle, color: COLORS.primary };
      default: return { icon: Info, color: COLORS.textSecondary };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((item) => {
              const { icon: Icon, color } = getIcon(item.type);
              return (
                <TouchableOpacity 
                  key={item._id} 
                  style={[styles.notifCard, !item.read && styles.unreadCard]}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Icon size={20} color={color} />
                  </View>
                  <View style={styles.notifInfo}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMsg}>{item.message}</Text>
                    <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
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
  markAllText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '05',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: ROUNDING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notifInfo: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  unreadTitle: {
    color: COLORS.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifMsg: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  }
});

export default NotificationsScreen;
