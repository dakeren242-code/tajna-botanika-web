import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RefreshCw, User, Bot, Clock, Eye, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChatPresence {
  conversation_id: string;
  is_online: boolean;
  last_seen_at: string | null;
  last_read_at: string | null;
  user_email: string | null;
}

interface Conversation {
  conversation_id: string;
  user_email: string | null;
  user_id: string | null;
  customer_name: string | null;
  order_count: number;
  last_message: string;
  last_time: string;
  unread: number;
  messages: Message[];
  presence?: ChatPresence;
}

interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'bot' | 'admin';
  message: string;
  created_at: string;
  user_email?: string | null;
  user_id?: string | null;
}

export default function SupportAdmin() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data) return;

      // Group by conversation_id
      const grouped: Record<string, Message[]> = {};
      for (const msg of data) {
        if (!grouped[msg.conversation_id]) grouped[msg.conversation_id] = [];
        grouped[msg.conversation_id].push(msg);
      }

      const convList: Conversation[] = Object.entries(grouped).map(([convId, msgs]) => {
        const userMsgs = msgs.filter(m => m.sender === 'user');
        const lastMsg = msgs[msgs.length - 1];
        const lastAdminReply = msgs.filter(m => m.sender === 'admin').pop();
        const unreadAfterAdmin = lastAdminReply
          ? userMsgs.filter(m => new Date(m.created_at) > new Date(lastAdminReply.created_at)).length
          : userMsgs.length;
        const firstUserMsg = userMsgs[0] as any;

        return {
          conversation_id: convId,
          user_email: firstUserMsg?.user_email || null,
          user_id: firstUserMsg?.user_id || null,
          customer_name: null,
          order_count: 0,
          last_message: lastMsg.message,
          last_time: lastMsg.created_at,
          unread: unreadAfterAdmin,
          messages: msgs,
        };
      });

      // Enrich with customer name + order count for logged-in users
      const userIds = convList.map(c => c.user_id).filter(Boolean) as string[];
      if (userIds.length > 0) {
        const [profilesRes, ordersRes] = await Promise.all([
          supabase.from('user_profiles').select('id, full_name').in('id', userIds),
          supabase.from('orders').select('user_id').in('user_id', userIds),
        ]);

        const profileMap: Record<string, string> = {};
        if (profilesRes.data) {
          for (const p of profilesRes.data) {
            if (p.full_name) profileMap[p.id] = p.full_name;
          }
        }

        const orderCountMap: Record<string, number> = {};
        if (ordersRes.data) {
          for (const o of ordersRes.data) {
            if (o.user_id) orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1;
          }
        }

        for (const conv of convList) {
          if (conv.user_id) {
            conv.customer_name = profileMap[conv.user_id] || null;
            conv.order_count = orderCountMap[conv.user_id] || 0;
          }
        }
      }

      // Fetch presence data
      const { data: presenceData } = await supabase
        .from('chat_presence')
        .select('*');

      const presenceMap: Record<string, ChatPresence> = {};
      if (presenceData) {
        for (const p of presenceData) {
          // Consider online if last_seen_at is within 60 seconds
          const isRecentlyOnline = p.last_seen_at && (Date.now() - new Date(p.last_seen_at).getTime()) < 60000;
          presenceMap[p.conversation_id] = { ...p, is_online: isRecentlyOnline ? p.is_online : false };
        }
      }

      // Attach presence to conversations
      for (const conv of convList) {
        conv.presence = presenceMap[conv.conversation_id];
      }

      // Sort by last message time, newest first
      convList.sort((a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime());
      setConversations(convList);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv, conversations]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    try {
      await supabase.from('support_messages').insert({
        conversation_id: selectedConv,
        sender: 'admin',
        message: reply.trim(),
      });
      setReply('');
      await loadConversations();
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  const selectedMessages = conversations.find(c => c.conversation_id === selectedConv)?.messages || [];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const time = d.toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' });
    return time;
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Zákaznická podpora</h3>
          {conversations.filter(c => c.unread > 0).length > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {conversations.filter(c => c.unread > 0).length} nové
            </span>
          )}
        </div>
        <button
          onClick={loadConversations}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex h-[500px]">
        {/* Conversation list */}
        <div className="w-1/3 border-r border-white/10 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Zatím žádné konverzace</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => setSelectedConv(conv.conversation_id)}
                className={`w-full p-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selectedConv === conv.conversation_id ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Online indicator */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      conv.presence?.is_online ? 'bg-green-400 shadow-sm shadow-green-400/50' : 'bg-gray-600'
                    }`} title={conv.presence?.is_online ? 'Online' : 'Offline'} />
                    <span className="text-sm font-semibold text-white truncate">
                      {conv.customer_name || conv.user_email || 'Anonymní návštěvník'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {conv.user_id && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        conv.order_count > 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {conv.order_count > 0 ? `Stálý (${conv.order_count}×)` : 'Nový'}
                      </span>
                    )}
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-600">{formatTime(conv.last_time)}</span>
                  </div>
                  {/* Read status - show if user has read admin messages */}
                  {conv.presence?.last_read_at && (
                    <div className="flex items-center gap-0.5" title={`Precteno: ${new Date(conv.presence.last_read_at).toLocaleString('cs-CZ')}`}>
                      <CheckCheck className="w-3 h-3 text-blue-400" />
                      <span className="text-[9px] text-blue-400">precteno</span>
                    </div>
                  )}
                  {conv.presence?.is_online && (
                    <span className="text-[9px] text-green-400 font-medium">online</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message view */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Selected conversation presence header */}
              {(() => {
                const selConv = conversations.find(c => c.conversation_id === selectedConv);
                if (!selConv) return null;
                return (
                  <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                    <span className={`w-2.5 h-2.5 rounded-full ${selConv.presence?.is_online ? 'bg-green-400 shadow-sm shadow-green-400/50 animate-pulse' : 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {selConv.customer_name || selConv.user_email || 'Anonymní návštěvník'}
                        </span>
                        {selConv.user_id && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            selConv.order_count > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {selConv.order_count > 0 ? `Stálý zákazník (${selConv.order_count} obj.)` : 'Nový zákazník'}
                          </span>
                        )}
                      </div>
                      {selConv.user_email && selConv.customer_name && (
                        <span className="text-[10px] text-gray-500">{selConv.user_email}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {selConv.presence?.is_online ? ' · Právě online' :
                          selConv.presence?.last_seen_at ? ` · Naposledy: ${formatTime(selConv.presence.last_seen_at)}` : ''}
                      </span>
                    </div>
                    {selConv.presence?.last_read_at && (
                      <div className="flex items-center gap-1 text-xs text-blue-400" title={`Precteno: ${new Date(selConv.presence.last_read_at).toLocaleString('cs-CZ')}`}>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Precetl/a zpravy</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%]`}>
                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3 h-3 text-blue-400" />
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          msg.sender === 'user'
                            ? 'bg-blue-500/20 text-white rounded-tl-sm'
                            : msg.sender === 'admin'
                            ? 'bg-emerald-500/20 text-white rounded-tr-sm'
                            : 'bg-white/5 text-gray-400 rounded-tr-sm italic'
                        }`}
                      >
                        {msg.sender === 'admin' && (
                          <span className="text-[10px] text-emerald-300 font-bold block mb-1">Admin</span>
                        )}
                        {msg.sender === 'bot' && (
                          <span className="text-[10px] text-gray-500 font-bold block mb-1">Auto-odpověď</span>
                        )}
                        {msg.message}
                        <span className="flex items-center gap-1 text-[10px] text-gray-600 mt-1">
                          {formatTime(msg.created_at)}
                          {msg.sender === 'admin' && (msg as any).read_by_user && (
                            <CheckCheck className="w-3 h-3 text-blue-400 ml-1" title="Precteno uzivatelem" />
                          )}
                        </span>
                      </div>
                      {msg.sender !== 'user' && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          msg.sender === 'admin' ? 'bg-emerald-500/20' : 'bg-white/10'
                        }`}>
                          {msg.sender === 'admin' ? (
                            <User className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Bot className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-3 border-t border-white/10">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendReply(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Odpovězte zákazníkovi..."
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Odeslat
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Vyberte konverzaci</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
