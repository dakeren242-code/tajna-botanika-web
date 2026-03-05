import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_type: 'customer' | 'admin' | 'system';
  sender_name: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  session_id: string;
  status: string;
  unread_customer_count: number;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generování nebo načtení session ID
  useEffect(() => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_session_id', sid);
    }
    setSessionId(sid);
    loadExistingConversation(sid);
  }, []);

  // Automatická uvítací zpráva po 2 minutách
  useEffect(() => {
    if (!conversationId && sessionId && !hasStartedChat) {
      welcomeTimerRef.current = setTimeout(() => {
        sendWelcomeMessage();
      }, 15 * 1000); // 15 sekund

      return () => {
        if (welcomeTimerRef.current) {
          clearTimeout(welcomeTimerRef.current);
        }
      };
    }
  }, [conversationId, sessionId, hasStartedChat]);

  // Načtení existující konverzace
  const loadExistingConversation = async (sid: string) => {
    try {
      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('session_id', sid)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const conv = conversations[0];
        setConversationId(conv.id);
        setHasStartedChat(true);
        setUnreadCount(conv.unread_customer_count || 0);
        loadMessages(conv.id);
        subscribeToMessages(conv.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Načtení zpráv
  const loadMessages = async (convId: string) => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Realtime odběr zpráv
  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`chat_${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Pokud je zpráva od admina nebo systému, zvýšit počet nepřečtených
          if (newMsg.sender_type !== 'customer' && !isOpen) {
            setUnreadCount((prev) => prev + 1);
          }

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Odeslání uvítací zprávy
  const sendWelcomeMessage = async () => {
    if (conversationId || hasStartedChat) return;

    try {
      // Vytvoření nové konverzace
      const { data: newConv } = await supabase
        .from('chat_conversations')
        .insert({
          session_id: sessionId,
          status: 'open',
        })
        .select()
        .single();

      if (newConv) {
        setConversationId(newConv.id);
        setHasStartedChat(true);

        // Odeslání uvítací zprávy
        await supabase.from('chat_messages').insert({
          conversation_id: newConv.id,
          sender_type: 'system',
          sender_name: 'Botanika',
          message: 'Zdravíme! Pokud byste chtěl s čímkoliv pomoci, neváhejte se na nás obrátit. Svou zásilku si můžete vyzvednout ještě dnes nebo ji nechat zaslat poštou. 🌿',
        });

        loadMessages(newConv.id);
        subscribeToMessages(newConv.id);
        setIsOpen(true);
        setUnreadCount(1);
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  // Vytvoření nové konverzace při první zprávě
  const createConversation = async () => {
    try {
      const { data: newConv } = await supabase
        .from('chat_conversations')
        .insert({
          session_id: sessionId,
          customer_name: customerName,
          customer_email: customerEmail,
          status: 'open',
        })
        .select()
        .single();

      if (newConv) {
        setConversationId(newConv.id);
        setHasStartedChat(true);
        subscribeToMessages(newConv.id);
        return newConv.id;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  // Odeslání zprávy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let convId = conversationId;

    // Pokud ještě neexistuje konverzace, vytvořit ji
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    try {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        sender_type: 'customer',
        sender_name: customerName || 'Zákazník',
        message: newMessage,
      });

      // Resetovat počítadlo nepřečtených zpráv pro zákazníka
      await supabase
        .from('chat_conversations')
        .update({ unread_customer_count: 0 })
        .eq('id', convId);

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Otevření chatu
  const handleOpen = async () => {
    setIsOpen(true);
    setIsMinimized(false);

    // Resetovat nepřečtené zprávy
    if (conversationId) {
      setUnreadCount(0);
      await supabase
        .from('chat_conversations')
        .update({ unread_customer_count: 0 })
        .eq('id', conversationId);
    }

    scrollToBottom();
  };

  // Scroll dolů
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Formátování času
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-2"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
          }}
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-zinc-900 rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
          }`}
          style={{
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div>
                <h3 className="font-bold text-white">Živý Chat</h3>
                <p className="text-xs text-emerald-100">Online • Odpovídáme rychle</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages area */}
              <div className="h-[440px] overflow-y-auto p-4 space-y-3 bg-black/20">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        msg.sender_type === 'customer'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : msg.sender_type === 'system'
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200'
                          : 'bg-zinc-800 text-white'
                      }`}
                    >
                      {msg.sender_type !== 'customer' && (
                        <p className="text-xs font-bold mb-1 opacity-70">
                          {msg.sender_name}
                        </p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                {!hasStartedChat && (
                  <div className="mb-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Vaše jméno"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email (volitelné)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Napište zprávu..."
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2 rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
