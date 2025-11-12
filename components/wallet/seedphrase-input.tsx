"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
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
  const [words, setWords] = useState<string[]>(
    Array(wordCount).fill("")
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, wordCount);
  }, [wordCount]);

  // Parse external value into words
  useEffect(() => {
    if (value) {
      const parsedWords = value.trim().split(/\s+/);
      const newWords = Array(wordCount).fill("");

      parsedWords.forEach((word, index) => {
        if (index < wordCount) {
          newWords[index] = word;
        }
      });

      setWords(newWords);
    }
  }, [value, wordCount]);

  const handleWordChange = (index: number, newValue: string) => {
    // Remove spaces and special characters, allow only lowercase letters
    const sanitized = newValue.toLowerCase().trim().replace(/[^a-z]/g, "");

    const newWords = [...words];
    newWords[index] = sanitized;
    setWords(newWords);

    // Notify parent of complete seedphrase
    const seedphrase = newWords.filter(w => w).join(" ");
    onChange(seedphrase);

    // DO NOT auto-focus - let user control when to move to next field
    // User can use Space, Tab, or Enter to move to next field
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    // Handle backspace on empty field - go to previous
    if (e.key === "Backspace" && !words[index] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && input.selectionStart === 0 && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.setSelectionRange(
        inputRefs.current[index - 1]?.value.length || 0,
        inputRefs.current[index - 1]?.value.length || 0
      );
    }

    if (
      e.key === "ArrowRight" &&
      input.selectionStart === input.value.length &&
      index < wordCount - 1
    ) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.setSelectionRange(0, 0);
    }

    // Handle space - move to next field (only if current field has content)
    if (e.key === " ") {
      e.preventDefault();
      if (words[index] && index < wordCount - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Handle Tab - natural navigation (don't prevent default)
    // Browser will handle Tab naturally

    // Handle Enter - move to next empty field or submit if all filled
    if (e.key === "Enter") {
      const allFilled = words.every(w => w.length > 0);
      if (!allFilled) {
        e.preventDefault();
        // Find next empty field
        const nextEmpty = words.findIndex((w, i) => i > index && !w);
        if (nextEmpty !== -1) {
          inputRefs.current[nextEmpty]?.focus();
        }
      }
      // If all filled, let it propagate to parent form for submission
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    const pastedWords = pastedText
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => /^[a-z]+$/.test(word))
      .slice(0, wordCount);

    if (pastedWords.length > 0) {
      const newWords = [...words];

      pastedWords.forEach((word, i) => {
        const targetIndex = i;
        if (targetIndex < wordCount) {
          newWords[targetIndex] = word;
        }
      });

      setWords(newWords);

      // Notify parent
      const seedphrase = newWords.filter(w => w).join(" ");
      onChange(seedphrase);

      // Focus the next empty field or the last pasted field
      const nextEmptyIndex = newWords.findIndex((w, i) => i >= pastedWords.length && !w);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[Math.min(pastedWords.length, wordCount - 1)]?.focus();
      }
    }
  };

  const getFilledWordCount = () => {
    return words.filter(w => w.length > 0).length;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Recovery Phrase</Label>
        <span className={`text-xs font-medium ${
          getFilledWordCount() === wordCount
            ? 'text-green-600 dark:text-green-400'
            : 'text-muted-foreground'
        }`}>
          {getFilledWordCount()}/{wordCount} words
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: wordCount }).map((_, index) => (
          <div key={index} className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {index + 1}.
            </div>
            <Input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={words[index]}
              onChange={(e) => handleWordChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoFocus={autoFocus && index === 0}
              disabled={disabled}
              placeholder={`word ${index + 1}`}
              className="pl-8 text-sm font-mono lowercase"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Type each word and press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Space</kbd>, <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Tab</kbd>, or <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> to move to the next field. You can also paste all words at once.
      </p>
    </div>
  );
}
