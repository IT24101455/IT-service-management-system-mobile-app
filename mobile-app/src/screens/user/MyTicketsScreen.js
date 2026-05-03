import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { ArrowLeft, Search, Filter, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const MyTicketsScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchTickets = async () => {
    try {
      const response = await API.get(`/tickets/user/${userData.id}`);
      setTickets(response.data);
      applyFilter(activeFilter, response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter, data = tickets) => {
    setActiveFilter(filter);
    if (filter === 'ALL') {
      setFilteredTickets(data);
    } else {
      setFilteredTickets(data.filter(t => t.status === filter));
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => navigation.navigate('TicketDetail', { id: item._id })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketCategory}>{item.category}</Text>
        <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.ticketTitle}>{item.title}</Text>
      
      <View style={styles.ticketFooter}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'RESOLVED' ? COLORS.success + '20' : 
                           item.status === 'PENDING' ? COLORS.accent + '20' : COLORS.primary + '20' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'RESOLVED' ? COLORS.success : 
                   item.status === 'PENDING' ? COLORS.accent : COLORS.primary 
          }]}>{item.status}</Text>
        </View>
        
        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, { 
            backgroundColor: item.priority === 'CRITICAL' || item.priority === 'HIGH' ? COLORS.error : COLORS.success 
          }]} />
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => (
            <TouchableOpacity 
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => applyFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No tickets found in this category.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// Re-using ScrollView for horizontal filters
import { ScrollView } from 'react-native-gesture-handler';

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
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  searchBtn: {
    padding: SPACING.xs,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: ROUNDING.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketCategory: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ticketDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default MyTicketsScreen;
