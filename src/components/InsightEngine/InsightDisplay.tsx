import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  GitCompare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { SearchInsideWebsite } from "./SearchInsideWebsite";

interface SiteComparison {
  url: string;
  title: string;
  strengths: string[];
  weaknesses: string[];
  unique_features: string[];
}

interface ComparisonData {
  summary: string;
  similarities: string[];
  differences: string[];
  site_comparisons: SiteComparison[];
  winner?: string;
  winner_reasoning?: string;
}

export interface InsightData {
  tldr: string;
  key_points: string[];
  deep_insights: string[];
  conflicts_across_sources?: string[];
  opportunities_or_gaps?: string[];
  recommendations: string[];
  domain_specific_insights?: string[];
  comparison?: ComparisonData;
  languages?: string[]; // Detected languages from analyzed URLs
}

interface InsightDisplayProps {
  insights: InsightData;
  purpose: string;
  analysisId?: string;
}

// Language code to name mapping
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  unknown: "Unknown"
};

export const InsightDisplay = ({ insights, purpose, analysisId }: InsightDisplayProps) => {
  return (
    <div>
    {/* Language badges */}
    {insights.languages && insights.languages.length > 0 && (
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Detected Languages:</span>
        {insights.languages.map((lang, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            🌐 {languageNames[lang] || lang}
          </Badge>
        ))}
      </div>
    )}
    
    <Accordion type="multiple" defaultValue={["summary"]} className="space-y-3">
      {/* TLDR Section - Open by default */}
      <AccordionItem value="summary" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
            <FileText className="h-4 w-4 shrink-0" />
            Summary
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm text-foreground leading-relaxed">{insights.tldr}</p>
        </AccordionContent>
      </AccordionItem>

      {/* Key Points */}
      <AccordionItem value="key-points" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Key Points
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
          <ul className="space-y-2 sm:space-y-2.5">
            {insights.key_points.map((point, index) => (
              <li key={index} className="flex gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed">
                <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Deep Insights */}
      {insights.deep_insights.length > 0 && (
        <AccordionItem value="deep-insights" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 shrink-0" />
              Deep Insights
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
            <div className="space-y-2 sm:space-y-2.5">
              {insights.deep_insights.map((insight, index) => (
                <div key={index} className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Conflicts */}
      {insights.conflicts_across_sources && insights.conflicts_across_sources.length > 0 && (
        <AccordionItem value="conflicts" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Conflicts & Contradictions</span>
              <span className="sm:hidden">Conflicts</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
            <ul className="space-y-2 sm:space-y-2.5">
              {insights.conflicts_across_sources.map((conflict, index) => (
                <li key={index} className="flex gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed">
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
        <AccordionItem value="opportunities" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Opportunities & Gaps</span>
              <span className="sm:hidden">Opportunities</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
            <ul className="space-y-2 sm:space-y-2.5">
              {insights.opportunities_or_gaps.map((opportunity, index) => (
                <li key={index} className="flex gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed">
                  <span className="text-muted-foreground shrink-0 mt-0.5">→</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Recommendations */}
      <AccordionItem value="recommendations" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
            <Target className="h-4 w-4 shrink-0" />
            Recommendations
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
          <ul className="space-y-2 sm:space-y-2.5">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed">
                <span className="text-muted-foreground shrink-0 mt-0.5">✓</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Domain Specific Insights */}
      {insights.domain_specific_insights && insights.domain_specific_insights.length > 0 && (
        <AccordionItem value="domain-insights" className="border border-border rounded-lg sm:rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {purpose === "business" && "Business Intelligence"}
                {purpose === "research" && "Research Findings"}
                {purpose === "science" && "Scientific Analysis"}
                {purpose === "competitive" && "Competitive Intelligence"}
                {purpose === "market" && "Market Intelligence"}
                {purpose === "general" && "Additional Insights"}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-4">
            <div className="space-y-2 sm:space-y-2.5">
              {insights.domain_specific_insights.map((insight, index) => (
                <div key={index} className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
    
    {/* Multi-Site Comparison */}
    {insights.comparison && (
      <div className="mt-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <CardTitle>Multi-Site Comparison</CardTitle>
            </div>
            <CardDescription>{insights.comparison.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Similarities */}
            {insights.comparison.similarities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Common Similarities
                </h4>
                <ul className="space-y-1.5">
                  {insights.comparison.similarities.map((similarity, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex gap-2">
                      <span>•</span>
                      <span>{similarity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differences */}
            {insights.comparison.differences.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-orange-500" />
                  Key Differences
                </h4>
                <ul className="space-y-1.5">
                  {insights.comparison.differences.map((difference, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex gap-2">
                      <span>•</span>
                      <span>{difference}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per-Site Comparison */}
            <div className="grid gap-4 sm:grid-cols-2">
              {insights.comparison.site_comparisons.map((site, idx) => (
                <Card key={idx} className={insights.comparison?.winner === site.url ? "border-green-500 bg-green-50/5" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {insights.comparison?.winner === site.url && (
                        <Badge variant="default" className="text-xs">Best</Badge>
                      )}
                      <span className="truncate">{site.title}</span>
                    </CardTitle>
                    <CardDescription className="text-xs truncate">{site.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Strengths */}
                    {site.strengths.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-xs font-medium">Strengths</span>
                        </div>
                        <ul className="space-y-1 ml-5">
                          {site.strengths.map((strength, sIdx) => (
                            <li key={sIdx} className="text-xs text-muted-foreground">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {site.weaknesses.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs font-medium">Weaknesses</span>
                        </div>
                        <ul className="space-y-1 ml-5">
                          {site.weaknesses.map((weakness, wIdx) => (
                            <li key={wIdx} className="text-xs text-muted-foreground">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Unique Features */}
                    {site.unique_features.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-xs font-medium">Unique Features</span>
                        </div>
                        <ul className="space-y-1 ml-5">
                          {site.unique_features.map((feature, fIdx) => (
                            <li key={fIdx} className="text-xs text-muted-foreground">• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Winner Reasoning */}
            {insights.comparison.winner && insights.comparison.winner_reasoning && (
              <div className="p-4 rounded-lg bg-green-50/10 border border-green-500/20">
                <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                  Overall Recommendation
                </h4>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {insights.comparison.winner_reasoning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )}
    
    {analysisId && <SearchInsideWebsite analysisId={analysisId} />}
  </div>
  );
};
