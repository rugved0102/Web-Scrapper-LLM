import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";

export type PurposeMode = 
  | "business" 
  | "research" 
  | "science" 
  | "competitive" 
  | "market" 
  | "general";

interface PurposeSelectorProps {
  value: PurposeMode;
  onChange: (value: PurposeMode) => void;
  disabled?: boolean;
}

export const PurposeSelector = ({ value, onChange, disabled }: PurposeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Target className="h-4 w-4" />
        What's Your Goal?
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as PurposeMode)} disabled={disabled}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="business">Business Intelligence</SelectItem>
          <SelectItem value="research">Academic Research</SelectItem>
          <SelectItem value="science">Scientific Summary</SelectItem>
          <SelectItem value="competitive">Competitive Analysis</SelectItem>
          <SelectItem value="market">Market Trends</SelectItem>
          <SelectItem value="general">General Information</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Choose your analysis focus to get tailored insights
      </p>
    </div>
  );
};
