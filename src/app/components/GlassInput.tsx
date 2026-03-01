import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function GlassInput({ label, error, showPasswordToggle, type, ...props }: GlassInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-text-secondary mb-2 text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 rounded-[12px] bg-input-background border transition-all duration-300 text-text-primary placeholder:text-text-muted outline-none ${
            error
              ? 'border-soft-red glow-red'
              : isFocused
              ? 'border-neon-teal glow-teal'
              : 'border-glass-border'
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-neon-teal transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-soft-red text-xs mt-1">{error}</p>}
    </div>
  );
}