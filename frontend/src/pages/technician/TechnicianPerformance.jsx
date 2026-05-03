import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTicketsByTechnician } from '../../api/api';
import Topbar from '../../components/Topbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../../components/StatCard';
import { CheckCircle, Clock, TrendingUp, Ticket } from 'lucide-react';

const COLORS = ['#1a6fc4', '#f59e0b', '#10b981', '#6366f1'];

export default function TechnicianPerformance() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        getTicketsByTechnician(user.userId)
            .then(res => setTickets(res.data))
            .catch(() => { });
    }, [user]);

    const stats = {
        total: tickets.length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        rate: tickets.length ? Math.round((tickets.filter(t => t.status === 'RESOLVED').length / tickets.length) * 100) : 0,
    };

    const categoryData = ['SOFTWARE', 'HARDWARE', 'NETWORK', 'OTHER'].map(cat => ({
        name: cat,
        count: tickets.filter(t => t.category === cat).length,
    }));

    const priorityData = [
        { name: 'Low', value: tickets.filter(t => t.priority === 'LOW').length },
        { name: 'Medium', value: tickets.filter(t => t.priority === 'MEDIUM').length },
        { name: 'High', value: tickets.filter(t => t.priority === 'HIGH').length },
        { name: 'Critical', value: tickets.filter(t => t.priority === 'CRITICAL').length },
    ].filter(d => d.value > 0);

    return (
        <>
            <Topbar title="My Performance" subtitle="View your resolution stats and metrics" />
            <div className="page-content">
                <div className="stats-grid">
                    <StatCard label="Total Assigned" value={stats.total} icon={Ticket} color="blue" />
                    <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                    <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="yellow" />
                    <StatCard label="Resolution Rate" value={`${stats.rate}%`} icon={TrendingUp} color="purple" />
                </div>

                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><span className="card-title">Tickets by Category</span></div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#1a6fc4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><span className="card-title">Priority Distribution</span></div>
                        <div className="card-body">
                            {priorityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="empty-state"><p>No data yet</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
