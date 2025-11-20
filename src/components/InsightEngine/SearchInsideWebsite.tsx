import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Search, ChevronDown, ExternalLink, CheckCircle2 } from "lucide-react";
import { invokeFunctionLocally } from "@/lib/localFunctions";
import { toast } from "sonner";

interface SearchResult {
  answer: string;
  sources: {
    url: string;
    chunk: string;
    similarity: number;
    chunkId?: string;
    confidence: number;
  }[];
  citedSources?: number[];
}

interface SearchInsideWebsiteProps {
  analysisId: string;
}

export const SearchInsideWebsite = ({ analysisId }: SearchInsideWebsiteProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await invokeFunctionLocally("search-inside", {
        analysisId,
        query: query.trim(),
      });

      if (error) throw error;

      setResult(data as SearchResult);
      setIsOpen(true);
      toast.success("Search completed!");
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to search. Make sure the content has been analyzed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  const renderAnswerWithCitations = (answer: string, sources: SearchResult['sources']) => {
    // Split answer by citation markers [1], [2], etc.
    const parts = answer.split(/(\[\d+\])/);
    
    return (
      <TooltipProvider>
        <p className="text-muted-foreground leading-relaxed">
          {parts.map((part, idx) => {
            // Check if this part is a citation marker like [1]
            const citationMatch = part.match(/\[(\d+)\]/);
            if (citationMatch) {
              const sourceNum = parseInt(citationMatch[1]) - 1;
              const source = sources[sourceNum];
              
              if (source) {
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <sup className="cursor-help mx-0.5">
                        <a
                          href={`#source-${sourceNum}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`source-${sourceNum}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-primary hover:underline font-semibold text-sm"
                        >
                          {part}
                        </a>
                      </sup>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs mb-1 font-semibold">{source.url}</p>
                      <p className="text-xs italic">{source.chunk.slice(0, 150)}...</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {source.confidence}% confidence
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                );
              }
            }
            return <span key={idx}>{part}</span>;
          })}
        </p>
      </TooltipProvider>
    );
  };

  return (
    <Card className="mt-4 sm:mt-6 border-primary/20">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="hidden sm:inline">Ask Questions About This Website</span>
          <span className="sm:hidden">Ask Questions</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Use AI to search and answer questions based on the analyzed content
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">Searching</span>
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ask AI</span>
                <span className="sm:hidden">Ask</span>
              </>
            )}
          </Button>
        </div>

        {result && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Search Results</CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">Answer:</h4>
                      {renderAnswerWithCitations(result.answer, result.sources)}
                    </div>

                    {result.sources && result.sources.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                          Sources:
                          {result.citedSources && result.citedSources.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {result.citedSources.length} cited
                            </Badge>
                          )}
                        </h4>
                        <div className="space-y-3">
                          {result.sources.map((source, idx) => {
                            const isCited = result.citedSources?.includes(idx + 1);
                            return (
                              <Card 
                                key={idx} 
                                id={`source-${idx}`}
                                className={`${
                                  isCited 
                                    ? 'bg-primary/5 border-primary/30' 
                                    : 'bg-muted/30'
                                }`}
                              >
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                                      >
                                        [{idx + 1}] Source
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                      {isCited && (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Cited in answer</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                    <Badge 
                                      variant={source.confidence >= 70 ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {source.confidence}%
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground italic">
                                    "{source.chunk}"
                                  </p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
