import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Globe, Brain, Database, Search } from "lucide-react";
import { useEffect, useState } from "react";

export type ProgressStage = "fetching" | "parsing" | "analyzing" | "embedding" | "comparison" | "complete";

interface ScrapingProgressProps {
  currentUrl: string;
  progress: number;
  status: "scraping" | "analyzing" | "complete";
  stage?: ProgressStage;
  totalUrls?: number;
  currentUrlIndex?: number;
}

const stageInfo: Record<ProgressStage, { icon: typeof Globe; label: string; color: string }> = {
  fetching: { icon: Globe, label: "Fetching content", color: "text-blue-500" },
  parsing: { icon: Search, label: "Parsing data", color: "text-purple-500" },
  analyzing: { icon: Brain, label: "Analyzing with AI", color: "text-orange-500" },
  embedding: { icon: Database, label: "Creating embeddings", color: "text-green-500" },
  comparison: { icon: Brain, label: "Comparing sites", color: "text-pink-500" },
  complete: { icon: CheckCircle2, label: "Complete", color: "text-accent" },
};

export const ScrapingProgress = ({ 
  currentUrl, 
  progress, 
  status,
  stage = "fetching",
  totalUrls = 1,
  currentUrlIndex = 0
}: ScrapingProgressProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Estimate total time based on progress
      if (progress > 10 && progress < 100) {
        const estimated = Math.floor((elapsed / progress) * 100);
        setEstimatedTime(estimated);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [progress]);
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const StageIcon = stageInfo[stage].icon;
  const isComplete = status === "complete" || stage === "complete";
  
  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-lg bg-card border border-border shadow-sm">
      {/* Main status */}
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
        ) : (
          <Loader2 className="h-5 w-5 text-foreground animate-spin shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">
              {isComplete ? "Analysis complete!" : stageInfo[stage].label}
            </p>
            {totalUrls > 1 && !isComplete && (
              <span className="text-xs text-muted-foreground">
                ({currentUrlIndex + 1}/{totalUrls} URLs)
              </span>
            )}
          </div>
          {currentUrl && !isComplete && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{currentUrl}</p>
          )}
        </div>
        {!isComplete && (
          <div className="text-right shrink-0">
            <p className="text-xs font-medium text-foreground">{Math.round(progress)}%</p>
            <p className="text-xs text-muted-foreground">{formatTime(elapsedTime)}</p>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <Progress value={progress} className="h-2" />
      
      {/* Stage indicators */}
      {!isComplete && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          {(["fetching", "parsing", "analyzing", "embedding"] as const).map((s, idx) => {
            const Icon = stageInfo[s].icon;
            const isActive = s === stage;
            const isPast = ["fetching", "parsing", "analyzing", "embedding"].indexOf(s) < 
                          ["fetching", "parsing", "analyzing", "embedding"].indexOf(stage);
            
            return (
              <div 
                key={s} 
                className={`flex items-center gap-1.5 transition-all ${
                  isActive ? stageInfo[s].color + " scale-110" : 
                  isPast ? "text-accent" : "text-muted-foreground opacity-50"
                }`}
                title={stageInfo[s].label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">{stageInfo[s].label.split(" ")[0]}</span>
                {isPast && <CheckCircle2 className="h-3 w-3 text-accent" />}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Estimated time remaining */}
      {!isComplete && estimatedTime && estimatedTime > elapsedTime && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          Est. {formatTime(estimatedTime - elapsedTime)} remaining
        </p>
      )}
    </div>
  );
};
