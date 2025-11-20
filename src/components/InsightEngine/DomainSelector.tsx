import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Layers, 
  ShoppingCart, 
  Newspaper, 
  Microscope, 
  Briefcase, 
  Home, 
  Smartphone, 
  BookOpen, 
  Globe 
} from "lucide-react";
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

// Map icon names to actual icon components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Newspaper,
  Microscope,
  Briefcase,
  Home,
  Smartphone,
  BookOpen,
  Globe,
};

export const DomainSelector = ({ value, onChange, disabled }: DomainSelectorProps) => {
  const domains = getAllDomains();

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Layers className="h-4 w-4" />
        What Type of Website?
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as DomainType)} disabled={disabled}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.id} value={domain.id}>
              <span className="flex items-center gap-2">
                {renderIcon(domain.iconName)}
                <span>{domain.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {domains.find(d => d.id === value)?.description || "Helps extract specific data like prices, reviews, etc."}
      </p>
    </div>
  );
};
