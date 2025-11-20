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
    <Card className="mt-6 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Ask Questions About This Website
        </CardTitle>
        <CardDescription>
          Use AI to search and answer questions based on the analyzed content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="e.g., What does this website say about water toxicity?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Ask AI
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
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(source.similarity * 100)}% relevant
                                  </span>
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
