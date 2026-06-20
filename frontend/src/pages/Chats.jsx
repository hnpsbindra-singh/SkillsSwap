import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, User, Award, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { apiUrl } from '../config/api';

function timeFormat(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return time;
  if (diffDays === 1) return 'Yesterday ' + time;
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + time;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time;
}

export default function Chats() {
  const location = useLocation();
  const navigate = useNavigate();
  const startChatWith = location.state?.startChatWith;
  const { token, user } = useAuth();
  const { sendMessage: wsSend, subscribe } = useWebSocket();
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch chat list
  useEffect(() => {
    fetchChatList();
  }, []);

  useEffect(() => {
    if (loadingList) return;
    if (startChatWith) {
      // Clear location state to prevent running multiple times
      navigate(location.pathname, { replace: true, state: {} });

      const existing = chatList.find((c) => c.otherUserId === startChatWith.id);
      if (existing) {
        openChat(existing);
      } else {
        const currentUserId = user?.id || '';
        const otherUserId = startChatWith.id;
        const sortedRoomKey = [currentUserId, otherUserId].sort().join('_');
        
        const tempChat = {
          roomKey: sortedRoomKey,
          otherUserId: otherUserId,
          otherUserName: startChatWith.name,
          lastMessage: '',
          lastMessageTime: null,
          isTemp: true,
        };
        setChatList((prev) => [tempChat, ...prev.filter(c => c.otherUserId !== otherUserId)]);
        openChat(tempChat);
      }
    }
  }, [loadingList, startChatWith, chatList, user?.id, navigate, location.pathname]);

  const fetchChatList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(apiUrl('/api/chat'), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setChatList(data);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open a chat
  const openChat = (chat) => {
    setActiveChat(chat);
    setMobileShowChat(true);
  };

  // Sync messages and WebSocket subscription with activeChat
  useEffect(() => {
    if (!activeChat) return;

    let isCurrent = true;
    let unsubscribe = null;

    const setupChat = async () => {
      setLoadingMessages(true);
      setMessages([]);

      try {
        if (activeChat.isTemp) {
          if (isCurrent) {
            setMessages([]);
            setLoadingMessages(false);
          }
        } else {
          const res = await fetch(apiUrl(`/api/chat/${activeChat.roomKey}/messages`), {
            headers: { 'Authorization': 'Bearer ' + token },
          });
          if (res.ok) {
            const data = await res.json();
            if (isCurrent) {
              setMessages(data);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        if (isCurrent && !activeChat.isTemp) {
          setLoadingMessages(false);
        }
      }

      if (subscribe && isCurrent) {
        unsubscribe = subscribe(activeChat.roomKey, (incoming) => {
          if (!isCurrent) return;
          setMessages((prev) => [...prev, incoming]);
          setChatList((prev) =>
            prev.map((c) =>
              c.roomKey === activeChat.roomKey
                ? { ...c, lastMessage: incoming.content, lastMessageTime: incoming.sentAt, isTemp: false }
                : c
            )
          );
        });
      }
    };

    setupChat();

    return () => {
      isCurrent = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeChat?.roomKey, subscribe, token]);

  const handleSend = async () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeChat) return;

    setSending(true);
    try {
      if (wsSend) {
        wsSend(activeChat.otherUserId, trimmed);
        setMessageInput('');
        if (activeChat.isTemp) {
          setChatList(prev => prev.map(c => c.roomKey === activeChat.roomKey ? { ...c, isTemp: false } : c));
          setActiveChat(prev => ({ ...prev, isTemp: false }));
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const goBackToList = () => {
    setMobileShowChat(false);
  };

  const openOtherUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const currentUserName = user?.name;

  return (
    <div className="page-wrapper" style={{ height: 'calc(100vh - 64px)', padding: 0 }}>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Left Panel: Chat List */}
        <div
          className="chat-list-panel"
          style={{
            width: '340px', minWidth: '280px',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={22} style={{ color: 'var(--accent-blue)' }} />
              Messages
            </h2>
          </div>

          {/* Chat list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {loadingList ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '0.85rem', width: '60%', borderRadius: '0.4rem', marginBottom: '0.4rem' }} />
                    <div className="skeleton" style={{ height: '0.7rem', width: '80%', borderRadius: '0.4rem' }} />
                  </div>
                </div>
              ))
            ) : chatList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <MessageSquare size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>No conversations yet</p>
              </div>
            ) : (
              chatList.map((chat) => (
                <div
                  key={chat.roomKey}
                  onClick={() => openChat(chat)}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: '0.6rem',
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    background: activeChat?.roomKey === chat.roomKey ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    borderLeft: activeChat?.roomKey === chat.roomKey ? '3px solid var(--accent-blue)' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (activeChat?.roomKey !== chat.roomKey)
                      e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeChat?.roomKey !== chat.roomKey)
                      e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, color: '#fff',
                  }}>
                    {chat.otherUserName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {chat.otherUserName}
                      </span>
                      {chat.lastMessageTime && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {timeFormat(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p style={{
                        margin: '0.15rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div
          className="chat-messages-panel"
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-primary)',
          }}
        >
          {!activeChat ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <MessageSquare size={56} style={{ color: 'var(--border-default)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 0.5rem' }}>Select a conversation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Choose a chat from the left to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
              }}>
                <button
                  onClick={goBackToList}
                  className="btn-ghost chat-back-btn"
                  style={{ padding: '0.4rem', display: 'none' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <div
                  onClick={() => openOtherUserProfile(activeChat.otherUserId)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 700, color: '#fff',
                  }}>
                    {activeChat.otherUserName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline' }}>
                      {activeChat.otherUserName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {loadingMessages ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                      <div className="skeleton" style={{
                        height: '2.2rem', width: `${120 + Math.random() * 100}px`,
                        borderRadius: '1rem',
                      }} />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isOwn = msg.senderName === currentUserName;
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        animation: 'fadeIn 0.2s ease',
                      }}>
                        <div style={{
                          maxWidth: '70%', padding: '0.65rem 1rem', borderRadius: '1rem',
                          borderBottomRightRadius: isOwn ? '0.25rem' : '1rem',
                          borderBottomLeftRadius: isOwn ? '1rem' : '0.25rem',
                          background: isOwn
                            ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                            : 'var(--bg-secondary)',
                          border: isOwn ? 'none' : '1px solid var(--border-subtle)',
                        }}>
                          {!isOwn && (
                            <p style={{ margin: '0 0 0.15rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-link)' }}>
                              {msg.senderName}
                            </p>
                          )}
                          <p style={{ margin: 0, color: isOwn ? '#fff' : 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {msg.content}
                          </p>
                          <p style={{
                            margin: '0.25rem 0 0', fontSize: '0.65rem',
                            color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                            textAlign: 'right',
                          }}>
                            {msg.sentAt ? timeFormat(msg.sentAt) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <textarea
                    className="input-field"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{
                      flex: 1, resize: 'none', minHeight: '42px', maxHeight: '120px',
                      paddingTop: '0.6rem', paddingBottom: '0.6rem',
                    }}
                  />
                  <button
                    onClick={handleSend}
                    className="btn-primary"
                    disabled={!messageInput.trim() || sending}
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0, flexShrink: 0,
                      opacity: !messageInput.trim() ? 0.5 : 1,
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>



      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .chat-list-panel {
            width: 100% !important;
            min-width: 100% !important;
            display: ${mobileShowChat ? 'none' : 'flex'} !important;
          }
          .chat-messages-panel {
            display: ${mobileShowChat ? 'flex' : 'none'} !important;
          }
          .chat-back-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
