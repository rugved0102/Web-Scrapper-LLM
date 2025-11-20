import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Search, ChevronDown, ExternalLink } from "lucide-react";
import { invokeFunctionLocally } from "@/lib/localFunctions";
import { toast } from "sonner";

interface SearchResult {
  answer: string;
  sources: {
    url: string;
    chunk: string;
    similarity: number;
  }[];
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
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {result.answer}
                      </p>
                    </div>

                    {result.sources && result.sources.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Sources:</h4>
                        <div className="space-y-3">
                          {result.sources.map((source, idx) => (
                            <Card key={idx} className="bg-muted/30">
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                                  >
                                    Source {idx + 1}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                <p className="text-sm text-muted-foreground italic">
                                  "{source.chunk}"
                                </p>
                              </CardContent>
                            </Card>
                          ))}
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
