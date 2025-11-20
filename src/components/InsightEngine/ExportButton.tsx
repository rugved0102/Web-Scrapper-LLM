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
import jsPDF from "jspdf";

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

  const exportAsPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = 20;

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setFont("helvetica", "normal");
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Title
    addText("Analysis Report", 18, true);
    yPosition += 5;
    
    // Purpose
    addText(`Purpose: ${purpose}`, 12, true);
    yPosition += 5;

    // Date
    addText(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10);
    yPosition += 8;

    // Summary
    addText("EXECUTIVE SUMMARY", 14, true);
    yPosition += 2;
    addText(insights.tldr);
    yPosition += 5;

    // Key Points
    addText("KEY POINTS", 14, true);
    yPosition += 2;
    insights.key_points.forEach((point, idx) => {
      addText(`${idx + 1}. ${point}`);
    });
    yPosition += 5;

    // Deep Insights
    addText("DEEP INSIGHTS", 14, true);
    yPosition += 2;
    insights.deep_insights.forEach((insight, idx) => {
      addText(`${idx + 1}. ${insight}`);
      yPosition += 2;
    });
    yPosition += 5;

    // Conflicts
    if (insights.conflicts_across_sources?.length) {
      addText("CONFLICTS & CONTRADICTIONS", 14, true);
      yPosition += 2;
      insights.conflicts_across_sources.forEach((conflict) => {
        addText(`• ${conflict}`);
      });
      yPosition += 5;
    }

    // Opportunities
    if (insights.opportunities_or_gaps?.length) {
      addText("OPPORTUNITIES & GAPS", 14, true);
      yPosition += 2;
      insights.opportunities_or_gaps.forEach((opp) => {
        addText(`• ${opp}`);
      });
      yPosition += 5;
    }

    // Recommendations
    addText("RECOMMENDATIONS", 14, true);
    yPosition += 2;
    insights.recommendations.forEach((rec, idx) => {
      addText(`${idx + 1}. ${rec}`);
      yPosition += 2;
    });

    // Domain Insights
    if (insights.domain_specific_insights?.length) {
      yPosition += 5;
      addText("DOMAIN-SPECIFIC INSIGHTS", 14, true);
      yPosition += 2;
      insights.domain_specific_insights.forEach((insight) => {
        addText(`• ${insight}`);
      });
    }

    // Comparison (if exists)
    if (insights.comparison) {
      yPosition += 5;
      addText("MULTI-SITE COMPARISON", 14, true);
      yPosition += 2;
      addText(insights.comparison.summary);
      yPosition += 3;
      
      if (insights.comparison.similarities?.length) {
        addText("Similarities:", 12, true);
        insights.comparison.similarities.forEach(sim => addText(`• ${sim}`));
        yPosition += 2;
      }
      
      if (insights.comparison.differences?.length) {
        addText("Differences:", 12, true);
        insights.comparison.differences.forEach(diff => addText(`• ${diff}`));
      }
    }

    // Save PDF
    pdf.save(`insights-${purpose}-${Date.now()}.pdf`);
    toast({ title: "Exported as PDF", description: "File downloaded successfully" });
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
          📊 Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer text-xs sm:text-sm">
          📄 Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText} className="cursor-pointer text-xs sm:text-sm">
          📝 Export as Text
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsMarkdown} className="cursor-pointer text-xs sm:text-sm">
          📋 Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer text-xs sm:text-sm">
          💾 Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
