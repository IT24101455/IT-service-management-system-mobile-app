import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { sendMessage, getConversation } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'react-toastify';

export default function ChatModal({ isOpen, onClose, recipient }) {
    const { user } = useAuth();
    const { stompClient, isConnected } = useWebSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && recipient) {
            fetchMessages();
        }
    }, [isOpen, recipient]);

    useEffect(() => {
        if (isOpen && recipient && stompClient && isConnected) {
            console.log('Subscribing to messages in ChatModal for:', user.userId);
            const subscription = stompClient.subscribe(`/user/queue/messages`, (message) => {
                const msg = JSON.parse(message.body);
            
                if (msg.senderId === recipient.id || msg.receiverId === recipient.id) {
                    setMessages(prev => {
                        
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [isOpen, recipient, stompClient, isConnected, user.userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await getConversation(user.userId, recipient.id);
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        const payload = {
            senderId: user.userId,
            receiverId: recipient.id,
            content: newMessage.trim()
        };
        console.log('Sending message:', payload);

        try {
            const res = await sendMessage(payload);
            console.log('Message sent successfully:', res.data);
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        
        } catch (error) {
            console.error('Failed to send message:', error.response?.data || error.message);
            toast.error('Failed to send message: ' + (error.response?.data || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', borderRadius: '16px',
                width: '100%', maxWidth: '450px', height: '600px',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--primary)', color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: 40, height: 40, border: '2px solid white' }}>
                            {recipient.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{recipient.name}</h3>
                            <span style={{ fontSize: '11px', opacity: 0.8 }}>
                                {recipient.role === 'ADMIN' ? 'Administrator' : 
                                 recipient.role === 'TECHNICIAN' ? 'Technician' : 
                                 recipient.role === 'USER' ? 'Customer' : 
                                 (user.role === 'TECHNICIAN' ? 'Customer' : 'Technician')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
                            <p>No messages yet. Say hello!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.senderId === user.userId ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                backgroundColor: msg.senderId === user.userId ? 'var(--primary)' : 'white',
                                color: msg.senderId === user.userId ? 'white' : 'var(--text-primary)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: msg.senderId === user.userId ? 'none' : '1px solid var(--border)'
                            }}>
                                {msg.content}
                                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: '24px',
                            border: '1px solid var(--border)', outline: 'none', fontSize: '14px'
                        }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            backgroundColor: 'var(--primary)', color: 'white',
                            border: 'none', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
