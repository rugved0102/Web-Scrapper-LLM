import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URLInput } from "@/components/InsightEngine/URLInput";
import { PurposeSelector, PurposeMode } from "@/components/InsightEngine/PurposeSelector";
import { ScrapingProgress } from "@/components/InsightEngine/ScrapingProgress";
import { InsightDisplay, InsightData } from "@/components/InsightEngine/InsightDisplay";
import { ExportButton } from "@/components/InsightEngine/ExportButton";
import { HistorySidebar } from "@/components/HistorySidebar";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunctionLocally } from "@/lib/localFunctions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<PurposeMode>("business");
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"scraping" | "analyzing" | "complete">("scraping");
  const [currentUrl, setCurrentUrl] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const saveToHistory = async (url: string, result: InsightData) => {
    if (!user) return;

    try {
      await supabase.from("analysis_history").insert([{
        user_id: user.id,
        url,
        result: result as any,
        purpose,
      }]);
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const handleAnalyze = async (urls: string[]) => {
    setIsLoading(true);
    setInsights(null);
    setAnalysisId(null);
    setProgress(0);
    setStatus("scraping");

    try {
      // Simulate progress for scraping
      for (let i = 0; i < urls.length; i++) {
        setCurrentUrl(urls[i]);
        setProgress(((i + 1) / urls.length) * 50);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setStatus("analyzing");
      setProgress(60);

      const { data, error } = await invokeFunctionLocally("analyze-websites", { urls, purpose });

      if (error) {
        if (error.message.includes("429")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again later.",
            variant: "destructive",
          });
        } else if (error.message.includes("402")) {
          toast({
            title: "Payment Required",
            description: "Please add credits to your Lovable AI workspace.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setProgress(100);
      setStatus("complete");
      setInsights(data.insights);
      setAnalysisId(data.analysisId || null);

      // Save to history
      await saveToHistory(urls[0], data.insights);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${urls.length} website${urls.length > 1 ? "s" : ""}`,
      });

      // Auto-scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze websites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: any) => {
    setPurpose(item.purpose || "business");
    setInsights(item.result);
    setCurrentUrl(item.url);
  };

  const handleNewAnalysis = () => {
    setInsights(null);
    setAnalysisId(null);
    setProgress(0);
    setCurrentUrl("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <HistorySidebar
        onSelectHistory={handleSelectHistory}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-foreground" />
              <h1 className="text-lg font-semibold text-foreground">InsightEngine</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6 flex-1" style={{ maxWidth: '900px' }}>
        {/* Input Section */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Analyze Websites
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter website URLs to extract insights and receive AI-powered recommendations.
            </p>
          </div>

          <div className="space-y-4">
            <PurposeSelector
              value={purpose}
              onChange={setPurpose}
              disabled={isLoading}
            />
            <URLInput onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>

        {/* Progress Section */}
        {isLoading && (
          <ScrapingProgress
            currentUrl={currentUrl}
            progress={progress}
            status={status}
          />
        )}

        {/* Results Section */}
        {insights && !isLoading && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Analysis Results</h2>
              <ExportButton insights={insights} purpose={purpose} />
            </div>
            <InsightDisplay insights={insights} purpose={purpose} analysisId={analysisId || undefined} />
            
            {/* Scroll to top button */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="gap-2"
              >
                ↑ Back to Top
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!insights && !isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Brain className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter website URLs above to begin your analysis
            </p>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default Index;
