import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";
import { getAllDomains } from "@/lib/domainTemplates";

export type DomainType = 
  | "ecommerce"
  | "news"
  | "research"
  | "jobs"
  | "realestate"
  | "socialmedia"
  | "documentation"
  | "general";

interface DomainSelectorProps {
  value: DomainType;
  onChange: (value: DomainType) => void;
  disabled?: boolean;
}

export const DomainSelector = ({ value, onChange, disabled }: DomainSelectorProps) => {
  const domains = getAllDomains();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Website Type (Optional)
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as DomainType)} disabled={disabled}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.id} value={domain.id}>
              <span className="flex items-center gap-2">
                <span>{domain.icon}</span>
                <span>{domain.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {domains.find(d => d.id === value)?.description || "Select a template for optimized analysis"}
      </p>
    </div>
  );
};
