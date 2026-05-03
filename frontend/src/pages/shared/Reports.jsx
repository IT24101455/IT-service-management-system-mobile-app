// Import React hooks for lifecycle and state
import { useEffect, useState } from 'react';
// Import API methods to fetch report analytics data
import { getReportSummary, getCategoryBreakdown, getTechnicianPerformance, getPriorityBreakdown } from '../../api/api';
// Import the Topbar navigation component
import Topbar from '../../components/Topbar';
// Import StatCard component for showing key metrics
import StatCard from '../../components/StatCard';
// Import icons from the lucide-react library
import { Ticket, Users, CheckCircle, Clock } from 'lucide-react';
// Import charting components from recharts for data visualization
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

// Define standard colors for use in the dynamic charts
const COLORS = ['#1a6fc4', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4'];

// Define the Reports functional component as default export
export default function Reports() {
    // State to hold the high-level summary statistics
    const [summary, setSummary] = useState({});
    // State to hold data for the category breakdown bar chart
    const [categoryData, setCategoryData] = useState([]);
    // State to hold data for the technician performance chart and table
    const [techData, setTechData] = useState([]);
    // State to hold data for the pie chart showing priority breakdown
    const [priorityData, setPriorityData] = useState([]);
    // Boolean state tracking whether the dashboard data is still loading
    const [loading, setLoading] = useState(true);

    // useEffect hook to trigger initial data fetching
    useEffect(() => {
        // Run all API calls concurrently using Promise.all
        Promise.all([
            // Fetch general sumary numbers
            getReportSummary(),
            // Fetch grouping of tickets by category
            getCategoryBreakdown(),
            // Fetch metrics on each technician's workload and completion
            getTechnicianPerformance(),
            // Fetch grouping of tickets by their priority level
            getPriorityBreakdown(),
        ]).then(([s, c, t, p]) => {
            // Update summary state with the resulting data
            setSummary(s.data);
            // Format category data from an object mapping into an array of {name, count} objects
            setCategoryData(Object.entries(c.data).map(([name, count]) => ({ name, count })));
            // Update the technician performance state
            setTechData(t.data);
            // Format priority data into an array of {name, value} for the pie chart
            setPriorityData(Object.entries(p.data).map(([name, value]) => ({ name, value })));
        }).finally(() =>
            // Set loading to false once all requests finish or fail
            setLoading(false)
        );
    }, []); // Empty dependency array ensures this runs only once

    // Conditional render: If loading is true, display a loading screen instead of the dashboard
    if (loading) return (
        <>
            <Topbar title="Reports" subtitle="Analytics and insights" />
            <div className="page-content"><div className="loading-spinner" /></div>
        </>
    );

    // Main render block once data is loaded
    return (
        <>
            {/* Display the top navigation bar with titles */}
            <Topbar title="Reports & Analytics" subtitle="System performance and insights" />
            
            <div className="page-content">
                {/* Render the key performance indicator (KPI) cards in a CSS grid */}
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <StatCard label="Total Tickets" value={summary.totalTickets} icon={Ticket} color="blue" />
                    <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle} color="green" />
                    <StatCard label="Pending" value={summary.pending} icon={Clock} color="yellow" />
                    <StatCard label="Total Users" value={summary.totalUsers} icon={Users} color="purple" />
                </div>

                {/* Render a 2-column grid to hold the category bar chart and priority pie chart */}
                <div className="grid-2" style={{ marginBottom: 20 }}>
                    {/* Render Category Breakdown section inside a structured card layout */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">Tickets by Category</span></div>
                        <div className="card-body">
                            {/* Make chart width responsive to the parent container element */}
                            <ResponsiveContainer width="100%" height={240}>
                                {/* Instantiate BarChart bound to categoryData state array */}
                                <BarChart data={categoryData}>
                                    {/* Draw dotted grid lines behind the chart bars */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    {/* Display horizontal XAxis configured to read 'name' property directly */}
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    {/* Display vertical YAxis hiding any generated fractional/decimal levels */}
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    {/* Introduce basic interactive tooltip shown on hover */}
                                    <Tooltip />
                                    {/* Set primary bar color and mapping to dataKey 'count' mapping it visually with a rounded top edge */}
                                    <Bar dataKey="count" fill="#1a6fc4" radius={[6, 6, 0, 0]} name="Tickets" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Render Priority details inside structured card */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">Priority Distribution</span></div>
                        <div className="card-body">
                            {/* Check to ensure Priority pie-chart only attempts render when there is available data */}
                            {priorityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={priorityData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                                            label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                                            {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip /><Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="empty-state"><p>No data yet</p></div>}
                        </div>
                    </div>
                </div>

                {/* Provide detailed reporting context regarding Technician Performance showing composite graph plus standard data table view */}
                <div className="card">
                    <div className="card-header"><span className="card-title">Technician Performance</span></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Empty validation block ensures user explicitly sees feedback if data array doesn't exist yet */}
                        {techData.length === 0 ? (
                            <div className="empty-state"><p>No technician data</p></div>
                        ) : (
                            <>
                                {/* Render top visual aggregate snapshot component for the available array */}
                                <div style={{ padding: '16px 24px' }}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={techData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            {/* Render horizontal identifying references showing literal strings */}
                                            <XAxis dataKey="technicianName" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                            <Tooltip />
                                            {/* Multi-series configuration comparing assigned counts directly versus resolved counts sequentially grouped per identity  */}
                                            <Bar dataKey="totalAssigned" fill="#1a6fc4" name="Assigned" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Secondary format showing the literal numerical metrics within an ordered standard data-table */}
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Technician</th><th>Assigned</th><th>Resolved</th><th>In Progress</th><th>Resolution Rate</th></tr></thead>
                                        <tbody>
                                            {techData.map(t => (
                                                <tr key={t.technicianId}>
                                                    <td style={{ fontWeight: 600 }}>{t.technicianName}</td>
                                                    <td>{t.totalAssigned}</td>
                                                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{t.resolved}</td>
                                                    <td style={{ color: 'var(--primary)' }}>{t.inProgress}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {/* Draw static track baseline visual displaying full boundary capability line */}
                                                            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                                                                {/* Render dynamic color fill inner progress tracker proportionally bound calculating completion ratio */}
                                                                <div style={{
                                                                    height: '100%',
                                                                    width: `${t.totalAssigned ? Math.round((t.resolved / t.totalAssigned) * 100) : 0}%`,
                                                                    background: 'var(--success)', borderRadius: 3
                                                                }} />
                                                            </div>
                                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>
                                                                {/* Formatted explicit numerical completion percentage label  */}
                                                                {t.totalAssigned ? Math.round((t.resolved / t.totalAssigned) * 100) : 0}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
