import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { z } from "zod";

const urlSchema = z.string().url({ message: "Please enter a valid URL" });

interface URLInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export const URLInput = ({ onSubmit, isLoading }: URLInputProps) => {
  const [urls, setUrls] = useState<string[]>([""]);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    
    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleSubmit = () => {
    // Validate all URLs
    const newErrors: { [key: number]: string } = {};
    const validUrls: string[] = [];

    urls.forEach((url, index) => {
      if (url.trim()) {
        const result = urlSchema.safeParse(url.trim());
        if (!result.success) {
          newErrors[index] = result.error.errors[0].message;
        } else {
          validUrls.push(url.trim());
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (validUrls.length === 0) {
      setErrors({ 0: "Please enter at least one URL" });
      return;
    }

    onSubmit(validUrls);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder={`Website URL ${index + 1}`}
                disabled={isLoading}
                className={`h-10 ${
                  errors[index] ? "border-destructive" : ""
                }`}
              />
              {errors[index] && (
                <p className="text-xs text-destructive mt-1.5">{errors[index]}</p>
              )}
            </div>
            {urls.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeUrlField(index)}
                disabled={isLoading}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addUrlField}
          disabled={isLoading}
          className="flex-1 h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add URL
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 h-10"
        >
          Analyze Websites
        </Button>
      </div>
    </div>
  );
};
