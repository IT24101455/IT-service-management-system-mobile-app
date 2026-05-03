// Import the useState and useEffect hooks from the React library for state and lifecycle management
import { useState, useEffect } from 'react';
// Import the getComplaints and resolveComplaint asynchronous API functions from the local api module
import { getComplaints, resolveComplaint } from '../../api/api';
// Import the Topbar UI component to display the page header
import Topbar from '../../components/Topbar';
// Import the toast notification function from the react-toastify library to show UI alerts
import { toast } from 'react-toastify';
// Import the CheckCircle and Clock icons from the lucide-react icon pack
import { CheckCircle, Clock } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

// Define the AdminComplaints functional component and export it as the default module export
export default function AdminComplaints() {
    // Initialize the complaints state as an empty array to store the fetched complaints
    const [complaints, setComplaints] = useState([]);
    // Initialize the loading state as true to show a loading spinner during initial data fetch
    const [loading, setLoading] = useState(true);
    // Initialize the resolvingId state as null to track which complaint is currently being resolved
    const [resolvingId, setResolvingId] = useState(null);
    // Initialize the resolveNotes state as an empty string to store the admin's resolution notes
    const [resolveNotes, setResolveNotes] = useState('');

    // Define the fetchComplaints asynchronous function to retrieve complaints from the backend
    const fetchComplaints = async () => {
        // Start a try block to handle potential network or API errors
        try {
            // Await the response from the getComplaints API call
            const res = await getComplaints();
            // Update the complaints state with the data returned from the API
            setComplaints(res.data);
        // Catch any errors that occur during the API call
        } catch {
            // Display an error toast notification to the user if the fetch fails
            toast.error('Failed to load complaints');
        // Execute the finally block regardless of success or failure
        } finally {
            // Set the loading state to false to hide the loading spinner
            setLoading(false);
        }
    };

    // Use the useEffect hook to trigger the initial data fetch when the component mounts
    useEffect(() => {
        // Call the fetchComplaints function
        fetchComplaints();
    // Pass an empty dependency array so this effect runs only once on mount
    }, []);

    const { subscribe, isConnected } = useWebSocket();
    const { user } = useWebSocket(); // Actually useAuth has user, but let's check context

    useEffect(() => {
        if (isConnected) {
            const sub = subscribe('/topic/complaints/refresh', () => {
                fetchComplaints();
            });
            return () => sub?.unsubscribe();
        }
    }, [isConnected, subscribe]);

    // Define the handleResolve asynchronous function, taking the complaint id as an argument
    const handleResolve = async (id) => {
        // Start a try block to handle potential errors during the resolution process
        try {
            // Await the response from the resolveComplaint API call, passing the id and resolution notes
            await resolveComplaint(id, resolveNotes);
            // Display a success toast notification if the API call succeeds
            toast.success('Complaint resolved successfully!');
            // Reset the resolvingId state to null to close the resolution input UI
            setResolvingId(null);
            // Reset the resolveNotes state to an empty string to clear the input field
            setResolveNotes('');
            // Re-fetch the complaints list to reflect the updated status
            fetchComplaints();
        // Catch any errors that occur during the resolution API call
        } catch {
            // Display an error toast notification if the resolution fails
            toast.error('Failed to resolve complaint');
        }
    };

    // Return the JSX to render the UI for the AdminComplaints component
    return (
        // Use a React fragment to group multiple top-level elements
        <>
            {/* Render the Topbar component with specific title and subtitle props */}
            <Topbar title="Admin Complaints" subtitle="Manage user complaints about technicians" />
            {/* Render the main page content wrapper div */}
            <div className="page-content">
                {/* Render the card container div for the complaints table */}
                <div className="card">
                    {/* Render the card header div containing the table title */}
                    <div className="card-header"><span className="card-title">All Complaints</span></div>
                    {/* Render the card body div with 0 padding */}
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Conditionally render: if loading is true, show the spinner; else, show the table wrapper */}
                        {loading ? <div className="loading-spinner" /> : (
                            /* Render the div that wraps and allows scrolling for the table */
                            <div className="table-wrapper">
                                {/* Render the HTML table element */}
                                <table>
                                    {/* Render the table header section */}
                                    <thead>
                                        {/* Render a single table row for headers */}
                                        <tr>
                                            {/* Render the Date column header */}
                                            <th>Date</th>
                                            {/* Render the User column header */}
                                            <th>User</th>
                                            {/* Render the Technician column header */}
                                            <th>Technician</th>
                                            {/* Render the Description column header */}
                                            <th>Description</th>
                                            {/* Render the Status column header */}
                                            <th>Status</th>
                                            {/* Render the Actions column header */}
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    {/* Render the table body section */}
                                    <tbody>
                                        {/* Map over the complaints array to render a row for each complaint */}
                                        {complaints.map(c => (
                                            /* Render a table row with a unique key based on the complaint id */
                                            <tr key={c.id}>
                                                {/* Render a table data cell for the creation date, formatted and styled */}
                                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                                {/* Render a table data cell for the user name */}
                                                <td>{c.userName}</td>
                                                {/* Render a table data cell for the technician name */}
                                                <td>{c.technicianName}</td>
                                                {/* Render a table data cell for the description, with wrapping constraints */}
                                                <td style={{ maxWidth: '250px', whiteSpace: 'normal' }}>{c.description}</td>
                                                {/* Render a table data cell containing the status badge */}
                                                <td>
                                                    {/* Render the span element for the status badge, with dynamic classes */}
                                                    <span className={`badge ${c.status === 'PENDING' ? 'badge-yellow' : 'badge-green'}`}>
                                                        {/* Output the complaint status text inside the badge */}
                                                        {c.status}
                                                    </span>
                                                </td>
                                                {/* Render a table data cell for the action buttons/notes */}
                                                <td>
                                                    {/* Conditionally render: if status is PENDING, show actions; else, show notes */}
                                                    {c.status === 'PENDING' ? (
                                                        /* Conditionally render: if this complaint is being resolved, show input form; else, show resolve button */
                                                        resolvingId === c.id ? (
                                                            /* Render a flex container for the resolution input and buttons */
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                {/* Render a text input field for the resolution notes */}
                                                                <input
                                                                    // Define the input type as text
                                                                    type="text"
                                                                    // Apply standard form control styling
                                                                    className="form-control"
                                                                    // Provide placeholder text for the input
                                                                    placeholder="Notes (optional)"
                                                                    // Bind the input value to the resolveNotes state
                                                                    value={resolveNotes}
                                                                    // Update the resolveNotes state on input change
                                                                    onChange={(e) => setResolveNotes(e.target.value)}
                                                                    // Apply inline styling to set a fixed width
                                                                    style={{ width: '150px' }}
                                                                />
                                                                {/* Render the Save button, which triggers the handleResolve function */}
                                                                <button className="btn btn-primary" onClick={() => handleResolve(c.id)}>
                                                                    {/* Text label for the Save button */}
                                                                    Save
                                                                </button>
                                                                {/* Render the Cancel button, which resets the resolution state */}
                                                                <button className="btn btn-secondary" onClick={() => { setResolvingId(null); setResolveNotes(''); }}>
                                                                    {/* Text label for the Cancel button */}
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            /* Render the initial Resolve button to enter resolution mode */
                                                            <button className="btn btn-secondary" onClick={() => setResolvingId(c.id)}>
                                                                {/* Render the CheckCircle icon with a size of 14 */}
                                                                <CheckCircle size={14} /> Resolve
                                                            </button>
                                                        )
                                                    ) : (
                                                        /* Render a span element for displaying the resolution notes or a default resolved message */
                                                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                            {/* Conditionally render the resolution notes if they exist, otherwise just 'Resolved' */}
                                                            {c.resolutionNotes ? `Notes: ${c.resolutionNotes}` : 'Resolved'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Conditionally render a placeholder row if the complaints array is empty */}
                                        {complaints.length === 0 && (
                                            /* Render a table row containing a single cell that spans all 6 columns */
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No complaints found.</td></tr>
                                        )}
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
