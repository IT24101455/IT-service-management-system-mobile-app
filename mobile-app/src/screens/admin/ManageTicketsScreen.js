import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  ChevronLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Filter
} from 'lucide-react-native';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ManageTicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = tickets;
    if (filterStatus !== 'ALL') {
      result = result.filter(t => t.status === filterStatus);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredTickets(result);
  }, [searchQuery, filterStatus, tickets]);

  const fetchTickets = async () => {
    try {
      const response = await API.get('/tickets');
      setTickets(response.data);
      setFilteredTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return { color: COLORS.error, bg: COLORS.error + '15' };
      case 'IN_PROGRESS': return { color: COLORS.primary, bg: COLORS.primary + '15' };
      case 'RESOLVED': return { color: COLORS.success, bg: COLORS.success + '15' };
      default: return { color: COLORS.textSecondary, bg: COLORS.border };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Support Tickets</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by title or user..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterBtn, filterStatus === status && styles.filterBtnActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterBtnText, filterStatus === status && styles.filterBtnTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found matching your criteria.</Text>
            </View>
          ) : (
            filteredTickets.map((ticket) => {
              const statusStyle = getStatusStyle(ticket.status);
              return (
                <TouchableOpacity 
                  key={ticket._id} 
                  style={styles.ticketCard}
                  onPress={() => navigation.navigate('TicketDetail', { id: ticket._id })}
                >
                  <View style={styles.ticketInfo}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                      {ticket.slaBreached && <AlertTriangle size={16} color={COLORS.error} />}
                    </View>
                    <Text style={styles.userName}>Requested by: {ticket.userName}</Text>
                    <View style={styles.metaRow}>
                      <Clock size={12} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>
                        {ticket.status === 'RESOLVED' ? 'Resolved' : 'Created'}: {new Date(ticket.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ticketSide}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{ticket.status}</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
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
  filterSection: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: ROUNDING.lg,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ROUNDING.full,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ticketInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  userName: {
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
    fontWeight: '500',
  },
  ticketSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  }
});

export default ManageTicketsScreen;
