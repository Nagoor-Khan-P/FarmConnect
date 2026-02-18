
"use client";

import { useState } from "react";
import { generateYieldDescription } from "@/ai/flows/yield-description-generator";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AiYieldDescriptionProps {
  yieldType: string;
  characteristics: string[];
  onGenerated: (description: string) => void;
}

export function AiYieldDescription({ yieldType, characteristics, onGenerated }: AiYieldDescriptionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!yieldType) {
      setError("Please specify a yield type first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateYieldDescription({
        yieldType,
        characteristics: characteristics.length > 0 ? characteristics : ["fresh", "organic", "locally grown"]
      });
      onGenerated(result.description);
    } catch (err) {
      console.error(err);
      setError("Failed to generate description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Yield Description</label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleGenerate}
          disabled={loading || !yieldType}
          className="h-8 gap-2 border-secondary text-secondary hover:bg-secondary/10"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Wand2 className="h-3 w-3" />
          )}
          Magic Write
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
