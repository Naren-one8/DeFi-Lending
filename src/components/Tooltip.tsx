import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
}

export default function Tooltip({ content, title }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-slate-300 transition"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {show && (
        <div className="absolute z-50 w-64 p-3 bg-slate-900 border border-white/20 rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2">
          {title && <p className="font-semibold text-white text-sm mb-1">{title}</p>}
          <p className="text-slate-300 text-xs leading-relaxed">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-slate-900 border-r border-b border-white/20 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
