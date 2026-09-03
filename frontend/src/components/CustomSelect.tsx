import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#232F48] bg-[#0E1422] px-3.5 py-2.5 text-xs font-medium text-white shadow-sm transition-colors focus:outline-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`ml-2 h-4 w-4 text-[#94A3B8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-[#232F48] bg-[#161F30] shadow-xl">
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                value === ''
                  ? 'bg-[#232F48] text-[#C6FF00] font-medium'
                  : 'text-[#94A3B8] hover:bg-[#232F48] hover:text-[#C6FF00]'
              }`}
            >
              {placeholder}
            </button>
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#232F48] text-[#C6FF00] font-medium'
                      : 'text-[#94A3B8] hover:bg-[#232F48] hover:text-[#C6FF00]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
