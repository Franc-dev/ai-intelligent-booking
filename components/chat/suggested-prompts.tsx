"use client"

import { Button } from "@/components/ui/button"

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void
}

const SUGGESTED_PROMPTS = [
  "I'm feeling anxious and need someone to talk to",
  "I'm having relationship problems with my partner",
  "I need help managing work stress",
  "I want to improve my communication skills",
  "I'm dealing with depression and need support",
  "I need family therapy for my household",
]

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-sans font-semibold text-xs sm:text-sm text-muted-foreground">Common requests:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-left justify-start h-auto p-2 sm:p-3 border-2 border-black shadow-sm font-sans text-xs sm:text-sm bg-transparent"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
