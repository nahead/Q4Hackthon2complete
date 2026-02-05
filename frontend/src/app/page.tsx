import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  MessageSquare,
  Zap,
  Brain,
  Palette
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Sparkles to avoid hydration issues
const Sparkles = dynamic(() => import('lucide-react').then(mod => mod.Sparkles), {
  ssr: false,
  loading: () => <div className="w-5 h-5" /> // Placeholder during loading
});

export default function HomePage() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Natural Language Processing",
      description: "Talk to your AI assistant in plain English to manage tasks"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Smart Task Management",
      description: "Intelligent task creation, tracking, and completion"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions and task organization"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Interface",
      description: "Modern, animated UI with smooth interactions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="relative">
              <div className="w-10 h-10 bg-ai-gradient rounded-full flex items-center justify-center animate-pulse-grow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <Badge variant="secondary" className="bg-ai-gradient-secondary text-white">
              AI-Powered
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-ai-gradient bg-clip-text text-transparent">
            AI Todo Assistant
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The future of task management is here. Communicate naturally with your AI assistant
            to organize, track, and accomplish your goals effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-ai-gradient hover:bg-ai-gradient-secondary text-white h-12 px-8 rounded-xl text-lg">
                Start Chatting
              </Button>
            </Link>
            <Link href="/tasks">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl text-lg">
                View Tasks
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index}>
                <Card className="h-full bg-background/60 backdrop-blur-lg border-border/50 glass-effect hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-ai-gradient to-ai-gradient-secondary text-white p-8 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Ready to Transform Your Productivity?</CardTitle>
              <CardDescription className="text-white/80">
                Join thousands of users who have revolutionized their task management with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-xl text-lg">
                  Start Your AI Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}