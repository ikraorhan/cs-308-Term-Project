import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SupportChat.css';
import { productManagerAPI, cartAPI, wishlistAPI } from '../api';

const API_BASE_URL = 'http://localhost:8000/api/support';

function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wasAuthenticatedRef = useRef(false);
  const wsRef = useRef(null); // Use ref to always have current WebSocket
  
  // Customer info states
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [infoLoading, setInfoLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when chat opens - always create fresh
  useEffect(() => {
    if (isOpen) {
      // Always clear old conversation and create new one when chat opens
      setConversationId(null);
      setMessages([]);
      // Small delay to ensure state is cleared before creating new conversation
      setTimeout(() => {
        createConversation();
      }, 100);
    } else {
      // When chat closes, clear everything
      setConversationId(null);
      setMessages([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  }, [isOpen]);


  // WebSocket connection
  useEffect(() => {
    if (!conversationId || !isOpen) {
      // Close WebSocket if conversationId is cleared or chat is closed
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Close existing WebSocket if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }

    // Use the current conversationId from the dependency
    const currentConversationId = conversationId;
    const wsUrl = `ws://localhost:8000/ws/support/chat/${currentConversationId}/`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' || data.type === 'new_message') {
          // Handle both data.data and data.message formats
          const newMessage = data.data || data.message;
          
          if (!newMessage) {
            console.error('No message data received:', data);
            return;
          }
          
          console.log('[SUPPORT CHAT] Received message:', {
            id: newMessage.id,
            is_from_agent: newMessage.is_from_agent,
            sender_name: newMessage.sender_name,
            content: newMessage.content?.substring(0, 30)
          });
          
          // Only add message if it doesn't already exist
          setMessages(prev => {
            // Check if message already exists by ID
            if (newMessage.id && prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            
            // Also check by content + timestamp + is_from_agent (for messages without IDs or duplicate IDs)
            // For guest users, sender is null, so we need to check differently
            const isDuplicate = prev.some(msg => {
              const sameContent = msg.content === newMessage.content;
              const sameSender = (msg.sender === newMessage.sender) || (!msg.sender && !newMessage.sender && !msg.is_from_agent && !newMessage.is_from_agent);
              const sameAgent = msg.is_from_agent === newMessage.is_from_agent;
              
              // Safe date parsing - handle both ISO strings and Date objects
              try {
                const msgDate = new Date(msg.created_at);
                const newMsgDate = new Date(newMessage.created_at);
                const timeDiff = Math.abs(msgDate.getTime() - newMsgDate.getTime());
                return sameContent && sameSender && sameAgent && timeDiff < 2000; // Within 2 seconds
              } catch (e) {
                // If date parsing fails, only check content and sender
                return sameContent && sameSender && sameAgent;
              }
            });
            
            if (isDuplicate) {
              console.log('Duplicate message detected, skipping');
              return prev;
            }
            
            // Ensure is_from_agent is boolean - handle all possible values
            let isAgent = false;
            if (newMessage.is_from_agent === true || newMessage.is_from_agent === 'true' || newMessage.is_from_agent === 1 || newMessage.is_from_agent === '1') {
              isAgent = true;
            }
            
            let updatedMessage = { ...newMessage };
            updatedMessage.is_from_agent = isAgent;
            
            // CRITICAL FIX: Override sender_name based on is_from_agent
            // If is_from_agent is FALSE, it MUST be a customer message, show "You"
            // If is_from_agent is TRUE, it MUST be an agent message, show "Support Agent"
            if (isAgent) {
              // Agent message - ALWAYS show "Support Agent"
              updatedMessage.sender_name = 'Support Agent';
            } else {
              // Customer message - ALWAYS show "You" (because customer only sees their own messages)
              updatedMessage.sender_name = 'You';
            }
            
            return [...prev, updatedMessage];
          });
      } else if (data.type === 'history') {
        // Ignore history - always start with empty conversation
        // This prevents showing old messages from previous users/sessions after logout
        // Don't set messages here, let them remain empty
      } else if (data.type === 'typing') {
        setIsTyping(data.is_typing);
      }
      // Removed agent_joined handling - no need to show system message
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, event.data);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = websocket;

    return () => {
      websocket.close();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId, isOpen]);

  // Track authentication status on mount
  useEffect(() => {
    const wasAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    wasAuthenticatedRef.current = wasAuthenticated;
  }, []);

  const loadCustomerInfo = useCallback(async () => {
    try {
      setInfoLoading(true);
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) {
        return;
      }

      // Load orders
      try {
        const ordersResponse = await productManagerAPI.getOrderHistory(userEmail);
        if (ordersResponse.data && ordersResponse.data.orders) {
          setOrders(ordersResponse.data.orders.slice(0, 5)); // Show last 5 orders
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      }

      // Load cart
      try {
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.data && cartResponse.data.items) {
          setCartItems(cartResponse.data.items);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }

      // Load wishlist
      try {
        const wishlistResponse = await wishlistAPI.getWishlist();
        if (wishlistResponse.data && wishlistResponse.data.items) {
          setWishlistItems(wishlistResponse.data.items);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    } catch (err) {
      console.error('Failed to load customer info:', err);
    } finally {
      setInfoLoading(false);
    }
  }, []);

  // Load customer info when chat opens and user is authenticated
  useEffect(() => {
    if (isOpen) {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      if (isAuthenticated) {
        loadCustomerInfo();
      }
    }
  }, [isOpen, loadCustomerInfo]);

  // Reload customer info when info panel is opened
  useEffect(() => {
    if (showInfoPanel && isOpen) {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      if (isAuthenticated) {
        loadCustomerInfo();
      }
    }
  }, [showInfoPanel, isOpen, loadCustomerInfo]);

  // Listen for cart and wishlist update events
  useEffect(() => {
    const handleCartUpdate = () => {
      // Only refresh if info panel is open and user is authenticated
      if (showInfoPanel && isOpen) {
        const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
        if (isAuthenticated) {
          loadCustomerInfo();
        }
      }
    };

    const handleWishlistUpdate = () => {
      // Only refresh if info panel is open and user is authenticated
      if (showInfoPanel && isOpen) {
        const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
        if (isAuthenticated) {
          loadCustomerInfo();
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [showInfoPanel, isOpen, loadCustomerInfo]);

  // Close chat on logout (only when transitioning from authenticated to unauthenticated)
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      const wasAuthenticated = wasAuthenticatedRef.current;

      // Only close chat if user was authenticated and now is not (logout happened)
      if (wasAuthenticated && !isAuthenticated) {
        // User logged out, close chat and disconnect completely
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        setIsOpen(false);
        setConversationId(null);
        setMessages([]);
        setInputMessage('');
        setIsConnected(false);
        setIsTyping(false);
        // Clear guest session ID so new conversation is created for guest user
        sessionStorage.removeItem('guest_session_id');
      }
      
      // Always clear conversation if user is not authenticated (prevent showing old messages)
      if (!isAuthenticated && conversationId) {
        setConversationId(null);
        setMessages([]);
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        setIsConnected(false);
        setIsTyping(false);
      }

      // Update ref for next check
      wasAuthenticatedRef.current = isAuthenticated;
    };

    // Handle logout event (same tab)
    const handleLogout = () => {
      // Immediately close chat when logout event is received
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsOpen(false);
      setConversationId(null);
      setMessages([]);
      setInputMessage('');
      setIsConnected(false);
      setIsTyping(false);
      sessionStorage.removeItem('guest_session_id');
      wasAuthenticatedRef.current = false;
    };

    // Listen for storage changes (logout in different tab)
    const handleStorageChange = (e) => {
      if (e.key === 'is_authenticated' || e.key === null) {
        checkAuthStatus();
      }
    };

    // Listen for focus (in case logout happened in same tab)
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, [isOpen]);

  const createConversation = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const guestSessionId = !userId ? getOrCreateSessionId() : null;

      console.log('[CREATE CONVERSATION] Guest session ID:', guestSessionId);

      // Always create a fresh conversation - don't reuse old ones
      const response = await fetch(`${API_BASE_URL}/conversations/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          guest_session_id: guestSessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.id);
        
        // Start with empty messages - never show old messages from previous sessions
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getOrCreateSessionId = () => {
    // Get existing session ID if available, otherwise create new one
    let sessionId = sessionStorage.getItem('guest_session_id');
    if (!sessionId) {
      // Generate a new session ID for guest users
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: text,
      is_from_agent: false,
      message_type: 'text',
      created_at: new Date().toISOString(),
      sender_name: 'System'
    }]);
  };

  const sendMessage = async () => {
    if (!wsRef.current || !isConnected) return;

    const messageContent = inputMessage;
    setInputMessage(''); // Clear input immediately for better UX

    // Send via WebSocket - message will be added to UI when received from server
    // Don't add optimistic update to avoid duplicates
    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: messageContent
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageContent); // Restore message on error
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!conversationId) {
      alert('Please wait for conversation to initialize');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId.toString());
    
    // Add guest_session_id if user is not authenticated
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    if (!isAuthenticated) {
      const guestSessionId = getOrCreateSessionId();
      formData.append('guest_session_id', guestSessionId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        credentials: 'include',
        body: formData
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
        // Explicitly don't set headers to let browser handle multipart/form-data
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        // Message will be received via WebSocket
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        console.error('Upload error:', errorData);
        alert(`File upload failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error.message}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button 
          className="support-chat-button"
          onClick={() => setIsOpen(true)}
          title="Need help? Chat with support"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="support-chat-window">
          <div className="support-chat-header">
            <h3>Support Chat</h3>
            <div className="support-chat-status">
              <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
            {localStorage.getItem('is_authenticated') === 'true' && (
              <button 
                className="info-button"
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                title="View my orders, cart, and wishlist"
              >
                ℹ️
              </button>
            )}
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="support-chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <p>Start a conversation with our support team!</p>
              </div>
            )}
            {messages.map((message) => {
              // CRITICAL: Determine if message is from agent
              const rawValue = message.is_from_agent;
              let isAgent = false;
              
              if (rawValue === true || rawValue === 'true' || rawValue === 1 || rawValue === '1') {
                isAgent = true;
              }
              
              // Debug: Log first message
              if (messages.indexOf(message) === 0) {
                console.error('[SUPPORT CHAT DEBUG]', {
                  messageId: message.id,
                  raw_is_from_agent: rawValue,
                  type: typeof rawValue,
                  isAgent,
                  sender_name: message.sender_name,
                  content: message.content?.substring(0, 20)
                });
              }
              
              // SIMPLE: Use inline styles
              // Agent messages: right side, white background
              // Customer messages: left side, purple background
              const wrapperStyle = isAgent 
                ? { 
                    textAlign: 'right',
                    marginBottom: '16px',
                    clear: 'both'
                  }
                : { 
                    textAlign: 'left',
                    marginBottom: '16px',
                    clear: 'both'
                  };
              
              const messageStyle = isAgent 
                ? { 
                    display: 'inline-block',
                    maxWidth: '80%',
                    textAlign: 'left',
                    marginLeft: 'auto',
                    marginRight: '0'
                  }
                : { 
                    display: 'inline-block',
                    maxWidth: '80%',
                    textAlign: 'left',
                    marginLeft: '0',
                    marginRight: 'auto'
                  };
              
              const contentStyle = isAgent
                ? { background: 'white', color: '#1f2937', border: '1px solid #e5e7eb', padding: '10px 14px', borderRadius: '8px' }
                : { background: '#5c0f4e', color: 'white', padding: '10px 14px', borderRadius: '8px' };
              
              return (
              <div 
                key={message.id} 
                className={`message ${isAgent ? 'agent-message' : 'customer-message'}`}
                style={wrapperStyle}
              >
                <div style={messageStyle}>
                  <div className="message-header">
                    <span className="sender-name">{message.sender_name}</span>
                    <span className="message-time">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content" style={contentStyle}>
                  {message.message_type === 'file' && message.attachments && message.attachments.length > 0 ? (
                    message.attachments.map((attachment) => (
                      <div key={attachment.id} className="file-attachment">
                        {attachment.file_type === 'image' ? (
                          <img src={attachment.file_url} alt={attachment.file_name} className="attachment-image" />
                        ) : (
                          <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                            📎 {attachment.file_name}
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>{message.content}</p>
                  )}
                  </div>
                </div>
              </div>
              );
            })}
            {isTyping && (
              <div className="typing-indicator">
                <span>Agent is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Customer Info Panel */}
          {showInfoPanel && localStorage.getItem('is_authenticated') === 'true' && (
            <div className="customer-info-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>My Information</span>
                <button
                  onClick={loadCustomerInfo}
                  disabled={infoLoading}
                  style={{
                    padding: '4px 8px',
                    background: '#5c0f4e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: infoLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    opacity: infoLoading ? 0.6 : 1
                  }}
                  title="Refresh"
                >
                  {infoLoading ? '...' : '↻'}
                </button>
              </div>
              {infoLoading ? (
                <div className="info-loading">Loading...</div>
              ) : (
                <ul className="info-list-inline">
                  <li className="info-list-item">
                    <span className="info-list-label">Recent Orders ({orders.length})</span>
                    {orders.length > 0 ? (
                      <ul className="info-sublist">
                        {orders.map((order) => (
                          <li key={order.delivery_id || order.id} className="info-sublist-item">
                            <span className="info-item-title">{order.delivery_id || `Order #${order.id}`}</span>
                            <span className="info-item-status">{order.status || 'N/A'}</span>
                            <span>{new Date(order.order_date || order.created_at).toLocaleDateString()}</span>
                            <span>{parseFloat(order.total_price || 0).toFixed(2)} TRY</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="info-empty">No orders yet</p>
                    )}
                  </li>

                  <li className="info-list-item">
                    <span className="info-list-label">Carts ({cartItems.length})</span>
                    {cartItems.length > 0 ? (
                      <ul className="info-sublist">
                        {cartItems.map((item) => (
                          <li key={item.id} className="info-sublist-item">
                            <span className="info-item-title">{item.product_name}</span>
                            <span className="info-item-quantity">Qty: {item.quantity}</span>
                            <span>{parseFloat(item.price).toFixed(2)} TRY</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="info-empty">Cart is empty</p>
                    )}
                  </li>

                  <li className="info-list-item">
                    <span className="info-list-label">Wishlist ({wishlistItems.length})</span>
                    {wishlistItems.length > 0 ? (
                      <ul className="info-sublist">
                        {wishlistItems.map((item) => (
                          <li key={item.id} className="info-sublist-item">
                            <span className="info-item-title">{item.product_name}</span>
                            <span>{parseFloat(item.price).toFixed(2)} TRY</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="info-empty">Wishlist is empty</p>
                    )}
                  </li>
                </ul>
              )}
            </div>
          )}

          <div className="support-chat-input">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept="image/*,video/*,.pdf"
            />
            <button 
              className="file-button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              📎
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!isConnected}
            />
            <button 
              onClick={sendMessage}
              disabled={!isConnected}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SupportChat;

