import React, { useState, useEffect, useRef } from 'react';
import { Wine, ChatMessage } from '../types';
import { getSommelierResponse } from '../services/geminiService';

interface SommelierChatProps {
  cellar: Wine[];
}

const SommelierChat: React.FC<SommelierChatProps> = ({ cellar }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getSommelierResponse(textToSend, cellar, messages);
      setMessages(prev => [...prev, { role: 'model', text: response, timestamp: Date.now() }]);
    } catch (err: any) {
      console.error("Chat Component Error:", err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `The sommelier is having trouble with the connection. (${err.message || 'Check your API Key'}).`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#1a1616] border border-[#2d2424] rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 bg-[#231d1d] border-b border-[#3a3030] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4a0e0e] flex items-center justify-center border border-[#c8a97e]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c8a97e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-serif text-[#c8a97e]">Cellar Rat Sommelier</h3>
          <p className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Expert advice on call</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[#c8a97e] font-serif text-lg mb-2">Good evening, collector.</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto italic">"A meal without wine is like a day without sunshine." How may I assist your palate tonight?</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => handleSend("What is a good way to describe red wines?")}
                className="text-xs px-3 py-2 bg-[#231d1d] border border-[#3a3030] rounded-full hover:border-[#c8a97e] transition-colors"
              >
                Describe Reds
              </button>
              <button 
                onClick={() => handleSend("What should I drink with roasted lamb tonight?")}
                className="text-xs px-3 py-2 bg-[#231d1d] border border-[#3a3030] rounded-full hover:border-[#c8a97e] transition-colors"
              >
                Pair with Lamb
              </button>
              <button 
                onClick={() => handleSend("Which wine in my cellar has the highest aging potential?")}
                className="text-xs px-3 py-2 bg-[#231d1d] border border-[#3a3030] rounded-full hover:border-[#c8a97e] transition-colors"
              >
                Aging Potential
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#c8a97e] text-black rounded-br-none' 
                : 'bg-[#231d1d] border border-[#3a3030] text-gray-200 rounded-bl-none shadow-lg'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#231d1d] border border-[#3a3030] p-3 rounded-lg flex gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 bg-[#c8a97e] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#c8a97e] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#c8a97e] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#231d1d] border-t border-[#3a3030]">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-[#1a1616] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] text-sm text-[#fdfcf0]"
            placeholder="Ask your sommelier..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-[#4a0e0e] text-[#c8a97e] px-4 rounded hover:bg-[#601212] transition-colors disabled:opacity-50 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SommelierChat;