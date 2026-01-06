// components/ChatbotWidget.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CHATBOT_API_URL = 'http://192.168.0.108:5000/chat';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for chatbot icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "👋 Hello! I'm GearGenie, your vehicle service advisor. I can help you with vehicle service information, cost estimates, and repair details. How can I assist you today?",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared! How can I help you?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Chatbot Icon */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={['#00e5ff', '#007aff']}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons name="robot" size={28} color="#001a22" />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            {/* Header */}
            <LinearGradient
              colors={['#001a22', '#003344']}
              style={styles.chatHeader}
            >
              <View style={styles.headerLeft}>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons name="robot" size={24} color="#00e5ff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>GearGenie</Text>
                  <Text style={styles.headerSubtitle}>Vehicle Service Advisor</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
                  <MaterialCommunityIcons name="broom" size={20} color="#87a4b6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerButton}>
                  <MaterialCommunityIcons name="close" size={24} color="#87a4b6" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Messages Area */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  {message.sender === 'bot' && (
                    <View style={styles.botIconContainer}>
                      <MaterialCommunityIcons name="robot" size={18} color="#00e5ff" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageContent,
                      message.sender === 'user' ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.timestamp,
                        message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp,
                      ]}
                    >
                      {message.timestamp}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.botIconContainer}>
                    <MaterialCommunityIcons name="robot" size={18} color="#00e5ff" />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#00e5ff" />
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask about vehicle services..."
                  placeholderTextColor="#6b8494"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={sendMessage}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  style={styles.sendButton}
                  disabled={!inputText.trim() || isLoading}
                >
                  <LinearGradient
                    colors={inputText.trim() && !isLoading ? ['#00e5ff', '#007aff'] : ['#27323f', '#27323f']}
                    style={styles.sendGradient}
                  >
                    <MaterialCommunityIcons
                      name="send"
                      size={20}
                      color={inputText.trim() && !isLoading ? '#001a22' : '#6b8494'}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = {
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    elevation: 8,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '85%',
    backgroundColor: '#001a22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27323f',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#003344',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#87a4b6',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#001a22',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  botBubble: {
    justifyContent: 'flex-start',
  },
  botIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003344',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#00e5ff',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#003344',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#001a22',
  },
  botMessageText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#003344',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#87a4b6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    backgroundColor: '#003344',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#87a4b6',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#002733',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#27323f',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#003344',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default ChatbotWidget;