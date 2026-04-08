import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronRight, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'admin';
  timestamp: Date;
  imageUrl?: string;
}

const QUICK_REPLIES = [
  { label: '📦 Doručení', keyword: 'doručení' },
  { label: '💳 Platba', keyword: 'platba' },
  { label: '🎁 Slevy', keyword: 'sleva' },
  { label: '🌿 Produkty', keyword: 'thc' },
];

const AUTO_REPLIES: Record<string, string> = {
  'doručení': '📦 Doručení zvládneme do 1 2 pracovních dnů přes Zásilkovnu! Vyberete si výdejní místo přímo při objednávce. Nad 1 000 Kč máte dopravu ZDARMA 🎉',
  'doprava': '🚚 Posíláme přes Zásilkovnu a doručíme do 1 2 pracovních dnů. Nad 1 000 Kč je doprava zdarma! Výdejní místo si vyberete pohodlně při objednávce 📍',
  'platba': '💳 Platit můžete kartou, převodem i dobírkou. Všechny platby jsou plně zabezpečené šifrováním SSL 🔒',
  'vrácení': '✅ Máme 30denní záruku spokojenosti! Pokud vám cokoliv nevyhovuje, napište nám a najdeme řešení. Vaše spokojenost je pro nás priorita 💚',
  'sleva': '🎁 Super tip: při registraci dostanete automaticky 15% slevu na první objednávku! Slevový kód najdete ve svém profilu hned po přihlášení ✨',
  'thc': '🌿 THC-X je plně legální kanabinoid v České republice. Všechny naše produkty jsou laboratorně testované a splňují veškeré zákonné požadavky 🔬',
  'kontakt': '📧 Můžete nám napsat na info@tajnabotanika.online nebo přímo sem do chatu. Obvykle odpovíme do 5 minut! ⚡',
  'legální': '✅ Ano, THC-X je plně legální v ČR. Jedná se o synteticky odvozený kanabinoid, který nespadá pod kontrolované látky. Naše produkty mají laboratorní certifikáty 📋',
  'objednávka': '🛒 Stačí vybrat produkt, přidat do košíku a dokončit objednávku. Celý proces zabere asi 2 minuty! Pokud potřebujete pomoct, jsme tu pro vás 😊',
  'kvalita': '🔬 Každý náš produkt prochází laboratorním testováním. Garantujeme prémiovou kvalitu a čistotu. Certifikáty najdete u každého produktu na stránce ✅',
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
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tb_chat_messages');
    const savedConvId = localStorage.getItem('tb_chat_conversation_id');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (parsed.length > 1) setShowQuickReplies(false);
      } catch {}
    }
    if (savedConvId) {
      setConversationId(savedConvId);
    }

    // Gentle notification after 25s
    const timer = setTimeout(() => {
      if (!saved || JSON.parse(saved).length === 0) {
        setHasNewMessage(true);
      }
    }, 25000);
    return () => clearTimeout(timer);
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('tb_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Smooth scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Track user presence (invisible to user, visible to admin)
  useEffect(() => {
    if (!conversationId) return;
    const updatePresence = () => {
      supabase.from('chat_presence').upsert({
        conversation_id: conversationId,
        user_email: user?.email || null,
        user_id: user?.id || null,
        is_online: true,
        last_seen_at: new Date().toISOString(),
        last_read_at: isOpen ? new Date().toISOString() : undefined,
      }, { onConflict: 'conversation_id' }).then(() => {});
    };
    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    // Mark offline on unmount
    return () => {
      clearInterval(interval);
      supabase.from('chat_presence').upsert({
        conversation_id: conversationId,
        is_online: false,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'conversation_id' }).then(() => {});
    };
  }, [conversationId, isOpen, user]);

  // Mark messages as read when chat is open
  useEffect(() => {
    if (!isOpen || !conversationId) return;
    supabase.from('support_messages')
      .update({ read_by_user: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('sender', 'admin')
      .eq('read_by_user', false)
      .then(() => {});
  }, [isOpen, conversationId, messages]);

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

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasNewMessage(false);
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Ahoj! 👋 Vítejte v Tajné Botanice!\n\nJsem tu pro vás a rád pomohu s čímkoliv. Zeptejte se na produkty, doručení, platby nebo slevy 💚\n\nObvykle odpovíme do 5 minut ⚡',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [messages.length]);

  const processMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setShowQuickReplies(false);

    // Save to Supabase
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
        message: text.trim(),
        user_email: user?.email || null,
        user_id: user?.id || null,
      });
    } catch {}

    // Show typing indicator
    setIsTyping(true);

    const autoReply = getAutoReply(text);
    const delay = autoReply ? 600 + Math.random() * 400 : 800 + Math.random() * 600;

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: autoReply || 'Děkujeme za zprávu! 😊 Náš tým se na to hned podívá. Obvykle odpovíme do 5 minut ⚡\n\nMůžete zatím pokračovat v prohlížení, jakmile odpovíme, dáme vám vědět!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);

      supabase.from('support_messages').insert({
        conversation_id: convId,
        sender: 'bot',
        message: botMsg.text,
      }).then(() => {});
    }, delay);
  }, [conversationId, user]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await processMessage(text);
  }, [input, processMessage]);

  const handleQuickReply = useCallback((keyword: string) => {
    processMessage(keyword);
  }, [processMessage]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      processMessage('Soubor je příliš velký (max 10 MB)');
      return;
    }

    setUploading(true);
    setShowQuickReplies(false);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `chat/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        // If bucket doesn't exist, try product-images bucket as fallback
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('product-images')
          .upload(`chat/${fileName}`, file, { contentType: file.type });

        if (fallbackError) throw fallbackError;

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(`chat/${fileName}`);
        await sendImageMessage(urlData.publicUrl, file.name);
      } else {
        const { data: urlData } = supabase.storage.from('support-attachments').getPublicUrl(fileName);
        await sendImageMessage(urlData.publicUrl, file.name);
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Show image as local preview even if upload fails
      const localUrl = URL.createObjectURL(file);
      await sendImageMessage(localUrl, file.name);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const sendImageMessage = useCallback(async (imageUrl: string, fileName: string) => {
    const userMsg: ChatMessage = {
      id: `user_img_${Date.now()}`,
      text: `📎 ${fileName}`,
      sender: 'user',
      timestamp: new Date(),
      imageUrl,
    };
    setMessages(prev => [...prev, userMsg]);

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
        message: `[Obrázek] ${imageUrl}`,
        user_email: user?.email || null,
        user_id: user?.id || null,
      });
    } catch {}

    // Auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `bot_${Date.now()}`,
        text: 'Děkujeme za obrázek! 📸 Náš tým se na něj podívá. Jakmile platbu ověříme, dáme vám ihned vědět 💚',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }, 800);
  }, [conversationId, user]);

  return (
    <>
      {/* Chat bubble button */}
      <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <button
          onClick={handleOpen}
          className="group relative flex items-center"
          aria-label="Otevřít chat podpory"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 w-14 h-14 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />

          {/* Main button */}
          <span className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:shadow-emerald-500/40 group-hover:shadow-xl transition-all duration-300">
            <MessageCircle className="w-6 h-6" />
          </span>

          {/* Notification badge */}
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
              1
            </span>
          )}

          {/* Tooltip */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white text-gray-800 text-sm font-semibold px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            Potřebujete pomoct? 💬
            <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 shadow-sm" />
          </span>
        </button>
      </div>

      {/* Chat window */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)' }}>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 py-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-[15px] leading-tight">Tajná Botanika</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-300 shadow-sm shadow-green-300/50" />
                    <span className="text-white/80 text-xs font-medium">Online · odpovíme do 5 min ⚡</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 h-[360px] overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-chat`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-emerald-500/10'
                      : msg.sender === 'admin'
                      ? 'bg-gradient-to-br from-purple-500/15 to-violet-500/15 border border-purple-500/20 text-gray-100 rounded-2xl rounded-bl-md'
                      : 'bg-white/[0.07] text-gray-200 rounded-2xl rounded-bl-md border border-white/5'
                  }`}
                >
                  {msg.sender === 'admin' && (
                    <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Zákaznická podpora
                    </span>
                  )}
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1.5">
                      <img src={msg.imageUrl} alt="Příloha" className="max-w-full max-h-48 rounded-lg border border-white/10" />
                    </a>
                  )}
                  {!msg.imageUrl && msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-chat">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="bg-white/[0.07] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {showQuickReplies && messages.length <= 1 && (
            <div className="bg-zinc-950 px-4 pb-2 pt-1">
              <p className="text-[11px] text-gray-500 font-medium mb-2">Rychlé dotazy</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.keyword}
                    onClick={() => handleQuickReply(qr.keyword)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.05] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-full text-[13px] text-gray-300 hover:text-emerald-300 transition-all duration-200"
                  >
                    {qr.label}
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-3 border-t border-white/5">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploading && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs text-emerald-300">Nahrávám obrázek...</span>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2 items-center"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 text-gray-400 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-200 disabled:opacity-30 flex-shrink-0"
                title="Přiložit obrázek nebo screenshot"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napište zprávu..."
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!input.trim() && !uploading}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-2">
              Chráněno šifrováním 🔒 · tajnabotanika.online
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-chat {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-chat {
          animation: fade-in-chat 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
