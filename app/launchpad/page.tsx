"use client";

import SelectLanguage from "@/components/launchpad/select-language";
import { useInitializeTemplates } from "@/lib/stores/templates-store";
import { useState } from "react";
import { Template } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Language() {
  // Initialize templates on mount
  useInitializeTemplates();

  const [newChain, setNewChain] = useState<{
    template: Template | null;
  }>({
    template: null,
  });
  return (
    <>
      <div>
        <SelectLanguage
          onDataSubmit={(data) => setNewChain({ ...newChain, template: data })}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-8">
        <Button
          onClick={() => setNewChain({ ...newChain, template: null })}
          className="gap-2"
          size="lg"
        >
          Back
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button onClick={handleContinue} className="gap-2" size="lg">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
