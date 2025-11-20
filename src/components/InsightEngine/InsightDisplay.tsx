import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { SearchInsideWebsite } from "./SearchInsideWebsite";

export interface InsightData {
  tldr: string;
  key_points: string[];
  deep_insights: string[];
  conflicts_across_sources?: string[];
  opportunities_or_gaps?: string[];
  recommendations: string[];
  domain_specific_insights?: string[];
}

interface InsightDisplayProps {
  insights: InsightData;
  purpose: string;
  analysisId?: string;
}

export const InsightDisplay = ({ insights, purpose, analysisId }: InsightDisplayProps) => {
  return (
    <div>
    <Accordion type="multiple" defaultValue={["summary"]} className="space-y-3">
      {/* TLDR Section - Open by default */}
      <AccordionItem value="summary" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileText className="h-4 w-4" />
            Summary
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-4">
          <p className="text-sm text-foreground leading-relaxed">{insights.tldr}</p>
        </AccordionContent>
      </AccordionItem>

      {/* Key Points */}
      <AccordionItem value="key-points" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CheckCircle className="h-4 w-4" />
            Key Points
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-4">
          <ul className="space-y-2.5">
            {insights.key_points.map((point, index) => (
              <li key={index} className="flex gap-2.5 text-sm text-foreground leading-relaxed">
                <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Deep Insights */}
      {insights.deep_insights.length > 0 && (
        <AccordionItem value="deep-insights" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Lightbulb className="h-4 w-4" />
              Deep Insights
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4">
            <div className="space-y-2.5">
              {insights.deep_insights.map((insight, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Conflicts */}
      {insights.conflicts_across_sources && insights.conflicts_across_sources.length > 0 && (
        <AccordionItem value="conflicts" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-base font-semibold text-destructive">
              <XCircle className="h-4 w-4" />
              Conflicts & Contradictions
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4">
            <ul className="space-y-2.5">
              {insights.conflicts_across_sources.map((conflict, index) => (
                <li key={index} className="flex gap-2.5 text-sm text-foreground leading-relaxed">
                  <span className="text-destructive shrink-0 mt-0.5">⚠</span>
                  <span>{conflict}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Opportunities */}
      {insights.opportunities_or_gaps && insights.opportunities_or_gaps.length > 0 && (
        <AccordionItem value="opportunities" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <TrendingUp className="h-4 w-4" />
              Opportunities & Gaps
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4">
            <ul className="space-y-2.5">
              {insights.opportunities_or_gaps.map((opportunity, index) => (
                <li key={index} className="flex gap-2.5 text-sm text-foreground leading-relaxed">
                  <span className="text-muted-foreground shrink-0 mt-0.5">→</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Recommendations */}
      <AccordionItem value="recommendations" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Target className="h-4 w-4" />
            Recommendations
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-4">
          <ul className="space-y-2.5">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-2.5 text-sm text-foreground leading-relaxed">
                <span className="text-muted-foreground shrink-0 mt-0.5">✓</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Domain Specific Insights */}
      {insights.domain_specific_insights && insights.domain_specific_insights.length > 0 && (
        <AccordionItem value="domain-insights" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4" />
              {purpose === "business" && "Business Intelligence"}
              {purpose === "research" && "Research Findings"}
              {purpose === "science" && "Scientific Analysis"}
              {purpose === "competitive" && "Competitive Intelligence"}
              {purpose === "market" && "Market Intelligence"}
              {purpose === "general" && "Additional Insights"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4">
            <div className="space-y-2.5">
              {insights.domain_specific_insights.map((insight, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
    
    {analysisId && <SearchInsideWebsite analysisId={analysisId} />}
  </div>
  );
};
