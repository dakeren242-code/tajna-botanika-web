import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Clock, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  customer_email: string | null;
  customer_name: string | null;
  session_id: string;
  status: string;
  last_message_at: string;
  unread_admin_count: number;
  created_at: string;
}

export default function ChatManagement() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminName] = useState('Podpora Botanika');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      subscribeToMessages(selectedConv.id);
      markAsRead(selectedConv.id);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    try {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('status', 'open')
        .order('last_message_at', { ascending: false });

      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('admin_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

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

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`admin_chat_${convId}`)
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
          scrollToBottom();

          // Aktualizovat conversation list
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (convId: string) => {
    try {
      await supabase
        .from('chat_conversations')
        .update({ unread_admin_count: 0 })
        .eq('id', convId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'admin',
        sender_name: adminName,
        message: newMessage,
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const closeConversation = async (convId: string) => {
    try {
      await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', convId);

      loadConversations();
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Před chvílí';
    if (minutes < 60) return `Před ${minutes} min`;
    if (hours < 24) return `Před ${hours} h`;
    if (days < 7) return `Před ${days} dny`;
    return date.toLocaleDateString('cs-CZ');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_admin_count || 0), 0);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Živý Chat</h2>
            <p className="text-sm text-gray-400">
              {conversations.length} aktivních konverzací
              {totalUnread > 0 && (
                <span className="ml-2 text-emerald-400 font-bold">
                  • {totalUnread} nepřečtených
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        {/* Conversations list */}
        <div className="col-span-4 bg-black/20 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-zinc-800/50 border-b border-zinc-700">
            <h3 className="font-bold text-white">Konverzace</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Žádné aktivní konverzace</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-4 text-left border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                    selectedConv?.id === conv.id ? 'bg-zinc-800/70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">
                        {conv.customer_name || 'Anonymní zákazník'}
                      </p>
                      {conv.customer_email && (
                        <p className="text-xs text-gray-500">{conv.customer_email}</p>
                      )}
                    </div>
                    {conv.unread_admin_count > 0 && (
                      <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread_admin_count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(conv.last_message_at)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="col-span-8 bg-black/20 rounded-xl overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-600 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">
                    {selectedConv.customer_name || 'Anonymní zákazník'}
                  </h3>
                  {selectedConv.customer_email && (
                    <p className="text-sm text-emerald-100">{selectedConv.customer_email}</p>
                  )}
                  <p className="text-xs text-emerald-200 mt-1">
                    Session: {selectedConv.session_id.slice(0, 20)}...
                  </p>
                </div>
                <button
                  onClick={() => closeConversation(selectedConv.id)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Uzavřít
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        msg.sender_type === 'admin'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : msg.sender_type === 'system'
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200'
                          : 'bg-zinc-800 text-white'
                      }`}
                    >
                      {msg.sender_type !== 'admin' && (
                        <p className="text-xs font-bold mb-1 opacity-70">
                          {msg.sender_name}
                        </p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs opacity-60">
                          {formatMessageTime(msg.created_at)}
                        </p>
                        {msg.sender_type === 'admin' && (
                          msg.read_at ? (
                            <CheckCheck className="w-3 h-3 text-emerald-300" />
                          ) : (
                            <Check className="w-3 h-3 opacity-60" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-zinc-800/50 border-t border-zinc-700">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Napište odpověď..."
                    className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl border border-zinc-700 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Odeslat
                  </button>
                </form>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      setNewMessage(
                        'Děkujeme za vaši zprávu! Jak vám můžeme pomoci?'
                      )
                    }
                    className="text-xs px-3 py-1 bg-zinc-700 text-gray-300 rounded-full hover:bg-zinc-600 transition-colors"
                  >
                    Rychlá odpověď 1
                  </button>
                  <button
                    onClick={() =>
                      setNewMessage(
                        'Vaši objednávku expedujeme do 24 hodin. Sledovací číslo vám zašleme emailem.'
                      )
                    }
                    className="text-xs px-3 py-1 bg-zinc-700 text-gray-300 rounded-full hover:bg-zinc-600 transition-colors"
                  >
                    Rychlá odpověď 2
                  </button>
                  <button
                    onClick={() =>
                      setNewMessage(
                        'Samozřejmě! V případě jakýchkoliv dotazů nás kontaktujte.'
                      )
                    }
                    className="text-xs px-3 py-1 bg-zinc-700 text-gray-300 rounded-full hover:bg-zinc-600 transition-colors"
                  >
                    Rychlá odpověď 3
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Vyberte konverzaci</p>
                <p className="text-sm">Pro zobrazení zpráv klikněte na konverzaci vlevo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
