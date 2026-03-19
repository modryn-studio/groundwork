'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Textarea } from '@/components/ui/textarea';

export interface DumpedIdea {
  id: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = 'groundwork_ideas';

function loadIdeas(): DumpedIdea[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveIdeas(ideas: DumpedIdea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

interface IdeaDumpProps {
  /** Called whenever the stored idea list changes — lets parent read ideas for pipeline submit */
  onIdeasChange?: (ideas: DumpedIdea[]) => void;
}

export function IdeaDump({ onIdeasChange }: IdeaDumpProps) {
  const [content, setContent] = useState('');
  const [ideas, setIdeas] = useState<DumpedIdea[]>([]);
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadIdeas();
    setIdeas(stored);
    onIdeasChange?.(stored);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Voice input setup
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    setSpeechSupported(true);
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setContent(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  const toggleListening = () => {
    const r = recognitionRef.current;
    if (!r) return;
    if (isListening) {
      r.stop();
      setIsListening(false);
    } else {
      setContent('');
      r.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const next: DumpedIdea = {
      id: crypto.randomUUID(),
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...ideas];
    setIdeas(updated);
    saveIdeas(updated);
    onIdeasChange?.(updated);
    setContent('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const deleteIdea = (id: string) => {
    const updated = ideas.filter((i) => i.id !== id);
    setIdeas(updated);
    saveIdeas(updated);
    onIdeasChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input area */}
      <div className="border-border bg-surface border">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'listening…' : "what's on your mind?"}
          className="text-text placeholder:text-muted/50 h-32 w-full resize-none border-none bg-transparent p-4 text-[15px] focus:outline-none focus-visible:ring-0"
        />
        <div className="border-border/50 flex items-center justify-between border-t px-3 py-2">
          <div>
            {speechSupported && (
              /* Exception: circular icon button — raw <button> per design system rules */
              <button
                type="button"
                onClick={toggleListening}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isListening
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-muted hover:bg-surface hover:text-text'
                )}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="text-muted hover:text-text font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          >
            {saved ? 'saved' : 'dump'}
          </button>
        </div>
      </div>

      {/* Saved ideas list */}
      {ideas.length > 0 && (
        <ul className="flex flex-col gap-1">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              onMouseEnter={() => setHoveredId(idea.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group hover:border-border hover:bg-surface flex items-start justify-between gap-3 border border-transparent px-3 py-2.5"
            >
              <span className="text-text/80 text-[14px] leading-relaxed">{idea.content}</span>
              <button
                type="button"
                onClick={() => deleteIdea(idea.id)}
                aria-label="Delete idea"
                className={cn(
                  'text-muted mt-0.5 flex-shrink-0 transition-opacity',
                  hoveredId === idea.id ? 'opacity-100' : 'opacity-0',
                  'hover:text-text'
                )}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Web Speech API — minimal types for browser compat
interface SpeechRecognitionEvent {
  results: { length: number; [i: number]: { 0: { transcript: string } } };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
