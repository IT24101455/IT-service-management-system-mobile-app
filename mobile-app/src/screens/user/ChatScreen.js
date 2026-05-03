import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft, Send, User } from 'lucide-react-native';
import io from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const SOCKET_URL = 'http://10.71.226.205:8081'; // Match your backend IP

const ChatScreen = ({ route, navigation }) => {
  const { receiverId, receiverName } = route.params;
  const { userData } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const flatListRef = useRef();

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      if (!userData?.id || !receiverId) return;
      try {
        const response = await API.get(`/chat/conversation?user1=${userData.id}&user2=${receiverId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.id && receiverId) {
      fetchMessages();
    } else {
      setLoading(false);
    }

    // Setup Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join', userData.id);

    socketRef.current.on('chat_message', (message) => {
      if (message.senderId === receiverId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [receiverId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageData = {
      senderId: userData.id,
      receiverId: receiverId,
      content: inputText,
      timestamp: new Date()
    };

    try {
      // Optimistic update
      setMessages((prev) => [...prev, messageData]);
      setInputText('');
      
      // Save to DB via API
      await API.post('/chat/send', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === userData.id;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && (
          <View style={styles.miniAvatar}>
            <User size={12} color={COLORS.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.content}</Text>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{receiverName}</Text>
          {receiverId ? (
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          ) : (
            <Text style={[styles.onlineText, { color: COLORS.error }]}>Invalid User Connection</Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {!receiverId ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>We couldn't identify the person you want to chat with. Please try opening the chat from the ticket details or technician profile.</Text>
          <TouchableOpacity style={styles.backBtnAction} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  onlineText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '85%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: ROUNDING.lg,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: COLORS.white,
  },
  theirText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirTimestamp: {
    color: COLORS.textSecondary,
  },
  inputArea: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.full,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: SPACING.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  backBtnAction: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: ROUNDING.full,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ChatScreen;
