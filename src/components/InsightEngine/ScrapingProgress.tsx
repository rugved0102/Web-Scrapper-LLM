import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ScrapingProgressProps {
  currentUrl: string;
  progress: number;
  status: "scraping" | "analyzing" | "complete";
}

export const ScrapingProgress = ({ currentUrl, progress, status }: ScrapingProgressProps) => {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-card border border-border shadow-sm">
      <div className="flex items-center gap-3">
        {status === "complete" ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : (
          <Loader2 className="h-4 w-4 text-foreground animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {status === "scraping" && "Scraping websites..."}
            {status === "analyzing" && "Generating AI insights..."}
            {status === "complete" && "Analysis complete!"}
          </p>
          {currentUrl && status !== "complete" && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentUrl}</p>
          )}
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
};
