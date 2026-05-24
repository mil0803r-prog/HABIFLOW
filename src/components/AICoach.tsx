import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Trash2, Bot, User, Brain, Copy, Check } from 'lucide-react';
import { ChatMessage, Habit, Goal } from '../types';
import { dbService } from '../services/dbService';

interface AICoachProps {
  habits: Habit[];
  goals: Goal[];
  user: any; // Firebase user
}

export default function AICoach({ habits, goals, user }: AICoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persistent chat history from Firestore on login
  useEffect(() => {
    if (user) {
      dbService.getChatMessages()
        .then((history) => {
          setMessages(history);
        })
        .catch((err) => {
          console.error("Error al cargar historial de chat:", err);
        });
    } else {
      setMessages([]);
    }
  }, [user]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    // Update state & persist in Firestore
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    
    try {
      await dbService.saveChatMessage(userMsg);
    } catch (err) {
      console.error("Error guardando mensaje en Firestore:", err);
    }

    try {
      // Map history to simple role/text expected by backend
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          habits,
          goals
        })
      });

      if (!res.ok) {
        throw new Error('La respuesta de la IA no fue satisfactoria.');
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'model',
        text: data.text,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      await dbService.saveChatMessage(aiMsg);
    } catch (err: any) {
      console.error("Error al comunicarse con el Coach IA:", err);
      setError("No pude contactar a tu coach en este momento. Por favor, reintenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('¿Quieres reiniciar la memoria y vaciar la conversación con tu Coach IA?')) {
      try {
        await dbService.clearChatMessages();
        setMessages([]);
        setError(null);
      } catch (err) {
        console.error("Error al borrar el chat:", err);
      }
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Split system instruction or text with line breaks into nice paragraphs
  const renderMessageContent = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      // Inline rendering of bold text or bullet lines
      const lines = paragraph.split('\n').map((line, lIdx) => {
        let cleanLine = line.trim();
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          return (
            <li key={lIdx} className="ml-4 list-disc text-slate-300 text-xs my-0.5">
              {cleanLine.substring(2)}
            </li>
          );
        }
        return (
          <p key={lIdx} className="leading-relaxed">
            {cleanLine}
          </p>
        );
      });
      return (
        <div key={index} className="space-y-1 mb-2 last:mb-0">
          {lines}
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <motion.button
        id="ai-fab-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ffcc00] to-yellow-500 text-black flex items-center justify-center shadow-xl cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <X size={24} className="text-black font-black" />
        ) : (
          <div className="relative">
            <Bot size={26} className="text-black animate-pulse" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </div>
        )}
      </motion.button>

      {/* Floating Chat Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-bubble-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-10rem)] bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="bg-[#111] px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#ffcc00]/10 border border-[#ffcc00]/20 p-2 rounded-xl text-[#ffcc00]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    Coach IA Experto
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold block">
                    {goals.length} METAS • {habits.length} HÁBITOS
                  </p>
                </div>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reiniciar Memoria"
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 w-16 h-16 rounded-3xl flex items-center justify-center text-[#ffcc00]">
                    <Brain size={30} className="stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wider">Coach Personal Activo</h4>
                    <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed mt-1.5">
                      ¡Hola! Conozco todas tus metas y hábitos de la aplicación. 
                      Pregúntame cómo optimizar tu día, organizar tus tareas o mantener la motivación constante.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-[#222] border border-white/5 flex items-center justify-center text-[#ffcc00] shrink-0 mt-0.5">
                          <Bot size={14} />
                        </div>
                      )}
                      
                      <div className="max-w-[80%] flex flex-col gap-1">
                        <div
                          className={`px-4 py-3 rounded-2xl text-[12px] leading-relaxed ${
                            isUser
                              ? 'bg-[#ffcc00] text-black font-semibold'
                              : 'bg-[#141414] border border-white/5 text-slate-200'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            renderMessageContent(msg.text)
                          )}
                        </div>

                        {!isUser && (
                          <div className="flex items-center gap-2 pl-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.text, msg.id)}
                              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check size={10} className="text-emerald-400" />
                                  <span className="text-emerald-400 text-[9px] font-bold">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={10} />
                                  <span className="text-[9px] font-bold">Copiar</span>
                                </>
                              )}
                            </button>
                            <span className="text-[9px] text-slate-600 font-medium">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00] shrink-0 mt-0.5">
                          <User size={14} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex gap-2.5 items-start justify-start">
                  <div className="w-7 h-7 rounded-lg bg-[#222] border border-white/5 flex items-center justify-center text-[#ffcc00] shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-[#141414] border border-white/5 text-slate-200 px-4 py-3.5 rounded-2xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="bg-[#111] p-3 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pregúntale a tu Coach de metas..."
                disabled={isLoading}
                className="flex-1 bg-black/60 border border-white/5 rounded-2xl px-4 py-3 text-[12px] text-white focus:outline-none focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00]/30 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  inputValue.trim() && !isLoading
                    ? 'bg-[#ffcc00] text-black hover:scale-[1.03] active:scale-[0.97]'
                    : 'bg-white/5 text-slate-600'
                }`}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
