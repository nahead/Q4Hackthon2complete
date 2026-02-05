'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthHeaders } from '../../lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import SVG icons to avoid hydration issues
const Sparkles = dynamic(() => import('lucide-react').then(mod => mod.Sparkles), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
});

const Lightbulb = dynamic(() => import('lucide-react').then(mod => mod.Lightbulb), {
  ssr: false,
  loading: () => <div className="w-3 h-3" />
});

const CheckCircle2 = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle2), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
});

const CircleDot = dynamic(() => import('lucide-react').then(mod => mod.CircleDot), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
});

/**
 * Enhanced ChatPage Component
 * Implements a modern, animated AI chat interface with floating gradient container,
 * AI avatar with pulse animation, streaming responses, and smart user guidance
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Get user ID from authentication context
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Extract user ID from auth context
  const userId = user?.id || null;

  // Scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle command suggestions
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      document.getElementById('chat-input')?.focus();
    }, 100);
  };

  // Sample command suggestions
  const commandSuggestions = [
    'Create a task to buy groceries',
    'Show me my tasks',
    'Mark task #1 as completed',
    'Remind me to call John tomorrow'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !userId) return;

    // Hide suggestions after first message
    if (messages.length > 0) {
      setShowSuggestions(false);
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend API - using the proxy route with auth
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: inputValue,
          user_id: userId  // Backend validation requires this in the body
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat with typing effect simulation
      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: data.response,
        role: 'assistant' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Typing indicator animation
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 p-4"
    >
      <Avatar className="w-8 h-8 bg-ai-gradient-secondary">
        <AvatarFallback className="bg-ai-gradient-secondary text-white flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex space-x-1 p-2 bg-muted rounded-lg">
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header with floating effect */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-lg border-b border-border/50 glass-effect sticky top-0 z-20"
        >
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-ai-gradient rounded-full flex items-center justify-center animate-pulse-grow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-ai-gradient bg-clip-text text-transparent">
                  AI Todo Assistant
                </h1>
                <p className="text-xs text-muted-foreground">
                  {userId ? `User: ${user?.email || 'You'}` : 'Not logged in'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-ai-gradient-secondary text-white">
              <Lightbulb className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </motion.header>

        {/* Chat Messages Container - Floating Gradient Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-hidden p-4"
        >
          <Card className="h-full bg-background/60 backdrop-blur-lg border-border/50 glass-effect shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && showSuggestions ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-ai-gradient rounded-full flex items-center justify-center mx-auto animate-pulse-grow">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-ai-gradient-secondary rounded-full flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>

                    <h2 className="text-3xl font-bold bg-ai-gradient bg-clip-text text-transparent mb-2">
                      Welcome to AI Todo Assistant!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md">
                      Ask me to help you manage your tasks with natural language
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                      {commandSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full h-auto py-3 px-4 text-left justify-start border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <span className="text-sm">{suggestion}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-from-right`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3 relative overflow-hidden ${
                            message.role === 'user'
                              ? 'bg-ai-gradient text-white shadow-lg shadow-primary/20'
                              : 'bg-muted/50 text-foreground backdrop-blur-sm'
                          }`}
                        >
                          {/* Glow effect for user messages */}
                          {message.role === 'user' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-12 -z-10 animate-shimmer"></div>
                          )}

                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 pt-0.5">
                              {message.role === 'user' ? (
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                              ) : (
                                <Avatar className="w-8 h-8 bg-ai-gradient-secondary">
                                  <AvatarFallback className="bg-ai-gradient-secondary text-white flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium mb-1">
                                {message.role === 'user' ? 'You' : 'AI Assistant'}
                              </div>
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                              <div
                                className={`text-xs mt-2 ${
                                  message.role === 'user' ? 'text-primary/70' : 'text-muted-foreground'
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && <TypingIndicator />}
                  </AnimatePresence>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-border/50 p-4 bg-background/30 backdrop-blur-sm"
              >
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      id="chat-input"
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                      placeholder="Ask me to manage your tasks..."
                      className="flex-1 bg-background/50 backdrop-blur-sm border-0 focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl h-12"
                      aria-label="Type your message"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-ai-gradient hover:bg-ai-gradient-secondary h-12 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <RotateCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1 text-yellow-500" />
                      Try: "Create task", "Show tasks", "Complete task #1"
                    </div>
                  </div>
                </form>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}