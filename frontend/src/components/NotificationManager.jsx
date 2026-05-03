import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ChatModal from './ChatModal';
import { getUser } from '../api/api';

export default function NotificationManager() {
    const { stompClient, isConnected } = useWebSocket();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chatRecipient, setChatRecipient] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // Use refs to access latest values in STOMP callbacks without re-triggering the subscription effect
    const isChatOpenRef = useRef(isChatOpen);
    const chatRecipientRef = useRef(chatRecipient);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
        chatRecipientRef.current = chatRecipient;
    }, [isChatOpen, chatRecipient]);

    const openChat = (sender) => {
        setChatRecipient(sender);
        setIsChatOpen(true);
    };

    const showNotification = async (msg) => {
        try {
            // Fetch sender info to show name
            const res = await getUser(msg.senderId);
            const sender = res.data;
            const formattedRole = sender.role
                ? sender.role.charAt(0).toUpperCase() + sender.role.slice(1).toLowerCase()
                : '';

            // Dispatch an event so Topbar can update its unread count
            window.dispatchEvent(new CustomEvent('newMessageReceived'));

            toast.info(
                <div onClick={() => openChat(sender)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 'bold' }}>🔔 New Message from {formattedRole} {sender.name}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{msg.content.substring(0, 50)}{msg.content.length > 50 ? '...' : ''}</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
        } catch (err) {
            console.error('Failed to show notification', err);
        }
    };

    useEffect(() => {
        if (!stompClient || !isConnected || !user) return;

        // CRITICAL FIX: Ensure the STOMP client is actually connected before subscribing
        // This prevents the "There is no underlying STOMP connection" crash during state transitions
        if (!stompClient.connected) {
            console.warn('STOMP client is not yet connected. Skipping subscriptions.');
            return;
        }

        console.log('Registering notification listener for user:', user.userId);

        let subscription;
        let notifSub;

        try {
            subscription = stompClient.subscribe(`/user/queue/messages`, (message) => {
                const msg = JSON.parse(message.body);
                console.log('Received real-time message:', msg);

                if (!isChatOpenRef.current || chatRecipientRef.current?.id !== msg.senderId) {
                    showNotification(msg);
                }
            });

            notifSub = stompClient.subscribe(`/user/queue/notifications`, (message) => {
                const notif = JSON.parse(message.body);
                console.log('Received system notification:', notif);

                const handleSystemClick = () => {
                    const title = notif.title || '';
                    const type = notif.type || '';

                    if (title.includes('Leave Request') || type === 'LEAVE_REQUEST') {
                        if (user.role === 'ADMIN') navigate('/admin/leaves');
                        else if (user.role === 'TECHNICIAN') navigate('/technician/schedule');
                    } else if (type === 'PAYMENT') {
                        navigate('/payments');
                    } else if (notif.ticketId) {
                        if (user.role === 'ADMIN') navigate('/admin/tickets');
                        else if (user.role === 'TECHNICIAN') navigate('/technician/tickets');
                        else navigate('/user/tickets');
                    } else {
                        navigate('/notifications');
                    }
                };

                toast.info(
                    <div onClick={handleSystemClick} style={{ cursor: 'pointer' }}>
                        <div style={{ fontWeight: 'bold' }}>{notif.title}</div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>{notif.message}</div>
                    </div>,
                    { position: "top-right", autoClose: 5000 }
                );

                window.dispatchEvent(new CustomEvent('notificationReceived'));
                window.dispatchEvent(new CustomEvent('newMessageReceived'));
            });
        } catch (error) {
            console.error('Error during WebSocket subscription:', error);
        }

        return () => {
            try {
                if (subscription && stompClient?.connected) subscription.unsubscribe();
                if (notifSub && stompClient?.connected) notifSub.unsubscribe();
            } catch (e) {
                // silently ignore unsubscribe errors during disconnection
            }
        };
    }, [stompClient, isConnected, user?.userId]);



    return (
        <>
            {isChatOpen && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipient={chatRecipient}
                />
            )}
        </>
    );
}
