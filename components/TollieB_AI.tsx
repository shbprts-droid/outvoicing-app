
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { askTollieB } from '../services/geminiService';
import type { Invoice, Client } from '../types';

interface TollieAIProps {
    invoices: Invoice[];
    clients: Client[];
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export const TollieB_AI: React.FC<TollieAIProps> = ({ invoices, clients }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { sender: 'ai', text: "Hi! I'm TollieB, your AI assistant. How can I help you with your invoicing today? You can ask things like:\n\n- What's my total outstanding balance?\n- Which invoices are overdue?\n- Who is my top client by revenue?" }
            ]);
        }
    }, [isOpen]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await askTollieB(input, invoices, clients);
            const aiMessage: Message = { sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I couldn't connect to my brain. Please check your connection or try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-brand-accent hover:bg-amber-500 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
                aria-label="Open TollieB AI Assistant"
            >
                <div className="h-8 w-8">{ICONS.tollie}</div>
            </button>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                         <div className="h-6 w-6 text-brand-accent">{ICONS.tollie}</div>
                        <h2 className="text-lg font-bold text-gray-800">TollieB AI Assistant</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold leading-none" aria-label="Close">&times;</button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                                    msg.sender === 'user'
                                        ? 'bg-brand-secondary text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                                <span className="animate-pulse">TollieB is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask TollieB anything about your business..."
                            className="flex-1"
                            disabled={isLoading}
                            aria-label="Your message to TollieB"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            Send
                        </Button>
                    </form>
                </footer>
            </div>
        </div>
    );
};
