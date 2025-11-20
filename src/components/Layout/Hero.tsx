import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40">
      <div className="container max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Personal AI Assistant
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto">
              Fast. Smart. Reliable.
            </p>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Analyze websites, extract insights, and make better decisions with AI-powered intelligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="px-8" onClick={() => navigate(user ? '/app' : '/auth')}>
              {user ? 'Go to App' : 'Get Started'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8" onClick={() => window.open('https://github.com/rugved0102/Web-Scrapper-LLM', '_blank')}>
              <BookOpen className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            No credit card required • Fully open source
          </p>
        </div>
      </div>
    </section>
  );
};
