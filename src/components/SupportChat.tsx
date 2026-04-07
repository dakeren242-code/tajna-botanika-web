import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'admin';
  timestamp: Date;
}

const AUTO_REPLIES: Record<string, string> = {
  'doručení': 'Doručení obvykle trvá 1-2 pracovní dny přes Zásilkovnu. Můžete si vybrat výdejní místo při objednávce.',
  'doprava': 'Doručení obvykle trvá 1-2 pracovní dny přes Zásilkovnu. Nad 1 000 Kč je doprava ZDARMA!',
  'platba': 'Přijímáme platbu kartou, bankovním převodem i dobírkou. Všechny platby jsou plně zabezpečené.',
  'vrácení': 'Nabízíme 30denní záruku spokojenosti. Pokud nejste spokojeni, kontaktujte nás a vyřešíme to.',
  'sleva': 'Při registraci získáte automaticky 15% slevu na první objednávku! Slevový kód najdete ve svém profilu.',
  'thc': 'THC-X je legální kanabinoid v České republice. Naše produkty splňují všechny zákonné požadavky a jsou laboratorně testovány.',
  'kontakt': 'Můžete nás kontaktovat na info@tajnabotanika.online nebo přímo přes tento chat. Odpovídáme obvykle do 2 hodin.',
  'legální': 'Ano, THC-X je plně legální v ČR. Jedná se o synteticky odvozený kanabinoid, který nespadá pod kontrolované látky.',
};

function getAutoReply(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, reply] of Object.entries(AUTO_REPLIES)) {
    if (lower.includes(keyword)) return reply;
  }
  return null;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load conversation from localStorage or create new
  useEffect(() => {
    const saved = localStorage.getItem('tb_chat_messages');
    const savedConvId = localStorage.getItem('tb_chat_conversation_id');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {}
    }
    if (savedConvId) {
      setConversationId(savedConvId);
    }

    // Show welcome message after 30s if no interaction
    const timer = setTimeout(() => {
      if (!saved || JSON.parse(saved).length === 0) {
        setHasNewMessage(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('tb_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for admin replies
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('support_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('sender', 'admin')
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          const existingAdminIds = messages.filter(m => m.sender === 'admin').map(m => m.id);
          const newAdminMessages = data.filter((m: any) => !existingAdminIds.includes(m.id));
          if (newAdminMessages.length > 0) {
            setMessages(prev => [
              ...prev,
              ...newAdminMessages.map((m: any) => ({
                id: m.id,
                text: m.message,
                sender: 'admin' as const,
                timestamp: new Date(m.created_at),
              })),
            ]);
            if (!isOpen) setHasNewMessage(true);
          }
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [conversationId, messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Ahoj! 👋 Jsem tu pro vás. Zeptejte se na cokoliv — doručení, platby, produkty nebo slevy.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');

    // Save to Supabase for admin view
    let convId = conversationId;
    if (!convId) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(convId);
      localStorage.setItem('tb_chat_conversation_id', convId);
    }

    try {
      await supabase.from('support_messages').insert({
        conversation_id: convId,
        sender: 'user',
        message: currentInput,
        user_email: user?.email || null,
        user_id: user?.id || null,
      });
    } catch {}

    // Auto-reply after short delay
    const autoReply = getAutoReply(currentInput);
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: autoReply || 'Děkujeme za zprávu! Náš tým vám odpoví co nejdříve. Obvykle odpovídáme do 2 hodin v pracovní době.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);

      // Save bot reply to Supabase too
      supabase.from('support_messages').insert({
        conversation_id: convId,
        sender: 'bot',
        message: botMsg.text,
      }).then(() => {});
    }, 800);
  };

  return (
    <>
      {/* Chat bubble */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              1
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[360px] max-h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Tajná Botanika</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-emerald-100 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="bg-zinc-900 h-[340px] overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : msg.sender === 'admin'
                      ? 'bg-purple-600/30 border border-purple-500/30 text-white rounded-bl-sm'
                      : 'bg-white/10 text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'admin' && (
                    <span className="text-[10px] text-purple-300 font-bold block mb-1">Zákaznická podpora</span>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-zinc-800 px-3 py-3 border-t border-white/10">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napište zprávu..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
