"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useTemplatesStore } from "@/lib/stores/templates-store";
import { cn } from "@/lib/utils";
import { Template } from "@/types";
import Image from "next/image";

export default function SelectLanguage({
  initialTemplate,
  onDataSubmit,
}: {
  initialTemplate?: Template | null;
  onDataSubmit: (data: Template) => void;
}) {
  const { getActiveTemplates } = useTemplatesStore();
  const activeTemplates = getActiveTemplates();
  const [selectedLanguage, setSelectedLanguage] = useState<Template | null>(
    initialTemplate || null
  );
  const router = useRouter();

  // Update selected language when initial template changes (e.g., navigating back)
  useEffect(() => {
    if (initialTemplate && !selectedLanguage) {
      setSelectedLanguage(initialTemplate);
    }
  }, [initialTemplate]);

  useEffect(() => {
    if (selectedLanguage) {
      onDataSubmit(selectedLanguage);
    }
  }, [selectedLanguage, onDataSubmit]);

  return (
    <div id="select-template" className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Choose Your Programming Language
          </h1>
          <p className="text-muted-foreground">
            Pick the language you're most comfortable with:
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-3 gap-4">
          {activeTemplates.map((language) => (
            <Card
              key={language.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/5",
                selectedLanguage?.id === language.id &&
                  "border-primary bg-primary/5"
              )}
              onClick={() => setSelectedLanguage(language)}
            >
              <div className="flex flex-col items-center space-y-3">
                <Image
                  src={`/images/languages/${language.supported_language.toLowerCase()}.svg`}
                  alt={`${language.supported_language} logo`}
                  className="w-12 h-12 object-contain invert brightness-0"
                  width={48}
                  height={48}
                />
                <span className="font-medium capitalize">
                  {language.supported_language}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
