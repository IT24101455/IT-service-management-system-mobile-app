import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import UserDashboard from '../screens/user/UserDashboard';
import CreateTicketScreen from '../screens/user/CreateTicketScreen';
import TicketDetailScreen from '../screens/user/TicketDetailScreen';
import MyTicketsScreen from '../screens/user/MyTicketsScreen';
import TechDashboard from '../screens/technician/TechDashboard';
import SubscriptionScreen from '../screens/technician/SubscriptionScreen';
import ChatScreen from '../screens/user/ChatScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import TechnicianProfileScreen from '../screens/user/TechnicianProfileScreen';
import CreateComplaintScreen from '../screens/user/CreateComplaintScreen';
import ManageSubscriptionsScreen from '../screens/admin/ManageSubscriptionsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManageTicketsScreen from '../screens/admin/ManageTicketsScreen';
import ManageComplaintsScreen from '../screens/admin/ManageComplaintsScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ProfileScreen from '../screens/user/ProfileScreen';
import RequestLeaveScreen from '../screens/technician/RequestLeaveScreen';
import ManageLeavesScreen from '../screens/admin/ManageLeavesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { userToken, userData, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {/* Depending on role, show different dashboards */}
            {userData?.role === 'ADMIN' ? (
               <Stack.Screen name="AdminHome" component={AdminDashboard} />
            ) : userData?.role === 'TECHNICIAN' ? (
               <Stack.Screen name="TechHome" component={TechDashboard} />
            ) : (
               <Stack.Screen name="UserHome" component={UserDashboard} />
            )}
            <Stack.Screen name="CreateTicket" component={CreateTicketScreen} /> 
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} />
            <Stack.Screen name="CreateComplaint" component={CreateComplaintScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="ManageSubscriptions" component={ManageSubscriptionsScreen} />
            <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
            <Stack.Screen name="ManageTickets" component={ManageTicketsScreen} />
            <Stack.Screen name="ManageComplaints" component={ManageComplaintsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="RequestLeave" component={RequestLeaveScreen} />
            <Stack.Screen name="ManageLeaves" component={ManageLeavesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
