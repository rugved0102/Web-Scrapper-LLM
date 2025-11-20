import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { InsightData } from "./InsightDisplay";
import { useToast } from "@/hooks/use-toast";
import { exportAsCSV, exportAsEnhancedText } from "@/lib/exportUtils";

interface ExportButtonProps {
  insights: InsightData;
  purpose: string;
}

export const ExportButton = ({ insights, purpose }: ExportButtonProps) => {
  const { toast } = useToast();

  const exportAsJSON = () => {
    const dataStr = JSON.stringify({ purpose, insights }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insights-${purpose}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as JSON", description: "File downloaded successfully" });
  };

  const exportAsText = () => {
    const text = exportAsEnhancedText(insights, purpose);
    const dataBlob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insights-${purpose}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Text", description: "File downloaded successfully" });
  };

  const handleExportCSV = () => {
    const csv = exportAsCSV(insights, purpose);
    const dataBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insights-${purpose}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as CSV", description: "File downloaded successfully" });
  };

  const exportAsMarkdown = () => {
    let md = `# Analysis Report\n\n`;
    md += `**Purpose:** ${purpose}\n\n`;
    md += `## Summary\n\n${insights.tldr}\n\n`;
    md += `## Key Points\n\n${insights.key_points.map(p => `- ${p}`).join("\n")}\n\n`;
    md += `## Deep Insights\n\n${insights.deep_insights.map((p, i) => `${i + 1}. ${p}`).join("\n\n")}\n\n`;
    if (insights.conflicts_across_sources?.length) {
      md += `## Conflicts & Contradictions\n\n${insights.conflicts_across_sources.map(p => `- ⚠️ ${p}`).join("\n")}\n\n`;
    }
    if (insights.opportunities_or_gaps?.length) {
      md += `## Opportunities & Gaps\n\n${insights.opportunities_or_gaps.map(p => `- ${p}`).join("\n")}\n\n`;
    }
    md += `## Recommendations\n\n${insights.recommendations.map((p, i) => `${i + 1}. ${p}`).join("\n\n")}\n\n`;
    if (insights.domain_specific_insights?.length) {
      md += `## Domain-Specific Insights\n\n${insights.domain_specific_insights.map(p => `- ${p}`).join("\n")}`;
    }

    const dataBlob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insights-${purpose}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as Markdown", description: "File downloaded successfully" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs sm:text-sm">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 sm:w-48">
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer text-xs sm:text-sm">
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText} className="cursor-pointer text-xs sm:text-sm">
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsMarkdown} className="cursor-pointer text-xs sm:text-sm">
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer text-xs sm:text-sm">
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
