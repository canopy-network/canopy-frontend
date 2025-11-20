"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SeedphraseInputProps {
  value: string;
  onChange: (value: string) => void;
  wordCount?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function SeedphraseInput({
  value,
  onChange,
  wordCount = 12,
  autoFocus = false,
  disabled = false,
}: SeedphraseInputProps) {
  const handleChange = (inputValue: string) => {
    // User can type with spaces, but we'll pass the value as-is to parent
    // The parent will handle removing spaces when needed
    onChange(inputValue);
  };

  const countWords = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(w => w).length;
  };

  const currentWordCount = countWords(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="block">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="Enter your password"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        className="h-11 rounded-xl"
      />
      <p className="text-xs text-muted-foreground">
        Your password is your seed phrase without spaces
      </p>
    </div>
  );
}
