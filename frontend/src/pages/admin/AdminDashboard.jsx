// Import the useEffect and useState hooks from React
import { useEffect, useState } from 'react';
// Import the asynchronous API functions to fetch stats, tickets, and user data
import { getTicketStats, getTickets, getUsersByRole } from '../../api/api';
// Import the Topbar component for the page header
import Topbar from '../../components/Topbar';
// Import the StatCard component to display summary metrics
import StatCard from '../../components/StatCard';
// Import the StatusBadge and PriorityBadge components for styling ticket statuses
import { StatusBadge, PriorityBadge } from '../../components/Badges';
// Import various icons from the lucide-react library
import { Ticket, Users, Monitor, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// Import charting components from the recharts library
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// Define an array of color hex codes to be used for the charts
const COLORS = ['#f59e0b', '#1a6fc4', '#10b981', '#64748b'];

// Define and export the AdminDashboard component as the default export
export default function AdminDashboard() {
    // Initialize the stats state as an empty object to store ticket statistics
    const [stats, setStats] = useState({});
    // Initialize the tickets state as an empty array to store the list of tickets
    const [tickets, setTickets] = useState([]);
    // Initialize the userCount state to 0 to store the number of standard users
    const [userCount, setUserCount] = useState(0);
    // Initialize the techCount state to 0 to store the number of technicians
    const [techCount, setTechCount] = useState(0);
    // Initialize the loading state to true to indicate data is being fetched
    const [loading, setLoading] = useState(true);

    // Use the useEffect hook to fetch all required dashboard data on component mount
    useEffect(() => {
        // Execute multiple API calls in parallel using Promise.all
        Promise.all([
            // Fetch ticket statistics
            getTicketStats(),
            // Fetch all tickets
            getTickets(),
            // Fetch users with the 'USER' role
            getUsersByRole('USER'),
            // Fetch users with the 'TECHNICIAN' role
            getUsersByRole('TECHNICIAN'),
        // Once all promises resolve, destructure the results array
        ]).then(([s, t, u, tech]) => {
            // Set the stats state with the ticket stats data
            setStats(s.data);
            // Set the tickets state with the array of tickets
            setTickets(t.data);
            // Set the userCount state based on the length of the users array
            setUserCount(u.data.length);
            // Set the techCount state based on the length of the technicians array
            setTechCount(tech.data.length);
        // Execute the finally block after success or failure
        }).finally(() =>
            // Set the loading state to false since the fetching operations are complete
            setLoading(false)
        );
    // Empty dependency array ensures this effect runs only once when mounted
    }, []);

    // Prepare the data array for the PieChart component representing ticket statuses
    const pieData = [
        // Map the pending tickets count, defaulting to 0 if undefined
        { name: 'Pending', value: stats.pending || 0 },
        // Map the in-progress tickets count, defaulting to 0
        { name: 'In Progress', value: stats.inProgress || 0 },
        // Map the resolved tickets count, defaulting to 0
        { name: 'Resolved', value: stats.resolved || 0 },
        // Map the closed tickets count, defaulting to 0
        { name: 'Closed', value: stats.closed || 0 },
    ];

    // Prepare the data array for the BarChart component by counting tickets per category
    const catData = ['SOFTWARE', 'HARDWARE', 'NETWORK', 'OTHER'].map(cat => ({
        // Assign the category name
        name: cat,
        // Calculate the count of tickets that match this category
        count: tickets.filter(t => t.category === cat).length,
    }));

    // Generate an array of the most recent tickets to display in the table
    const recent = [...tickets]
        // Sort the cloned array in descending order based on the creation date
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        // Slice the sorted array to keep only the top 6 most recent tickets
        .slice(0, 6);

    // Return the JSX representing the Admin Dashboard UI
    return (
        // Use a React fragment to encapsulate top-level elements without adding extra DOM nodes
        <>
            {/* Render the Topbar component with appropriate title and subtitle */}
            <Topbar title="Admin Dashboard" subtitle="System overview and management" />
            {/* Render the main container div for the page content */}
            <div className="page-content">
                {/* Render the grid layout div for the top stat cards */}
                <div className="stats-grid">
                    {/* Render a StatCard for total tickets */}
                    <StatCard label="Total Tickets" value={stats.total} icon={Ticket} color="blue" />
                    {/* Render a StatCard for pending tickets */}
                    <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
                    {/* Render a StatCard for in-progress tickets */}
                    <StatCard label="In Progress" value={stats.inProgress} icon={AlertCircle} color="blue" />
                    {/* Render a StatCard for resolved tickets */}
                    <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                    {/* Render a StatCard for the total user count */}
                    <StatCard label="Users" value={userCount} icon={Users} color="purple" />
                    {/* Render a StatCard for the total technician count */}
                    <StatCard label="Technicians" value={techCount} icon={Monitor} color="cyan" />
                </div>

                {/* Render a two-column grid layout div for the charts */}
                <div className="grid-2" style={{ marginBottom: 20 }}>
                    {/* Render the card div for the BarChart */}
                    <div className="card">
                        {/* Render the card header identifying the chart */}
                        <div className="card-header"><span className="card-title">Tickets by Category</span></div>
                        {/* Render the card body holding the chart component */}
                        <div className="card-body">
                            {/* Use ResponsiveContainer to ensure the chart fits the card width */}
                            <ResponsiveContainer width="100%" height={220}>
                                {/* Render the BarChart bound to the catData array */}
                                <BarChart data={catData}>
                                    {/* Render the Cartesian grid lines for the chart background */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    {/* Render the X-axis bound to the 'name' key */}
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    {/* Render the Y-axis, configuring it to only show whole numbers */}
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    {/* Include the Tooltip component for interactive data point details */}
                                    <Tooltip />
                                    {/* Render the Bar graphic element bound to the 'count' key */}
                                    <Bar dataKey="count" fill="#1a6fc4" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Render the card div for the PieChart */}
                    <div className="card">
                        {/* Render the card header identifying the pie chart */}
                        <div className="card-header"><span className="card-title">Ticket Status Distribution</span></div>
                        {/* Render the card body holding the pie chart component */}
                        <div className="card-body">
                            {/* Use ResponsiveContainer to ensure the chart fits the card width */}
                            <ResponsiveContainer width="100%" height={220}>
                                {/* Render the PieChart component */}
                                <PieChart>
                                    {/* Render the Pie graphic element bound to the pieData array */}
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                                        // Configure the label to show the name and percentage, only if the slice value > 0
                                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                                        {/* Map over the pieData to dynamically assign colors to each slice cell */}
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    {/* Include the Tooltip component for hover details */}
                                    <Tooltip />
                                    {/* Include the Legend component to list the data keys */}
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Render the card div for the recent tickets table */}
                <div className="card">
                    {/* Render the card header identifying the table section */}
                    <div className="card-header"><span className="card-title">Recent Tickets</span></div>
                    {/* Render the card body with 0 padding for the table container */}
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Conditionally render: show spinner if loading, else show the table */}
                        {loading ? <div className="loading-spinner" /> : (
                            /* Render the horizontally scrolling wrapper div for the table */
                            <div className="table-wrapper">
                                {/* Render the HTML table element */}
                                <table>
                                    {/* Render the table header section */}
                                    <thead><tr><th>Title</th><th>User</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                                    {/* Render the table body section */}
                                    <tbody>
                                        {/* Iterate over the recent tickets array to render the table rows */}
                                        {recent.map(t => (
                                            /* Render the table row element uniquely keyed by the ticket ID */
                                            <tr key={t.id}>
                                                {/* Render the title cell with bold text formatting */}
                                                <td style={{ fontWeight: 600 }}>{t.title}</td>
                                                {/* Render the user name cell */}
                                                <td>{t.userName}</td>
                                                {/* Render the category cell with subdued text color */}
                                                <td style={{ color: 'var(--text-secondary)' }}>{t.category}</td>
                                                {/* Render the cell containing the customized PriorityBadge component */}
                                                <td><PriorityBadge priority={t.priority} /></td>
                                                {/* Render the cell containing the customized StatusBadge component */}
                                                <td><StatusBadge status={t.status} /></td>
                                                {/* Render the date cell with localized formatting and subdued style */}
                                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
