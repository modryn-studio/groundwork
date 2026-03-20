'use client';

import { useState } from 'react';

interface MarketTextInputProps {
  placeholder: string;
  prefix?: string;
  onSubmit: (value: string) => void;
}

export function MarketTextInput({ placeholder, prefix, onSubmit }: MarketTextInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="border-border flex items-center border-b py-4">
      {prefix && (
        <span className="text-muted font-mono text-sm mr-1 select-none">{prefix}</span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        autoFocus
        className="text-text placeholder:text-muted flex-1 bg-transparent text-sm outline-none"
      />
      {value.trim() && (
        <button
          type="button"
          onClick={handleSubmit}
          className="text-accent ml-4 text-sm font-medium"
        >
          set →
        </button>
      )}
    </div>
  );
}
