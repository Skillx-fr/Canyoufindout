import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabelWithTooltipProps {
    label: string;
    tooltip: string;
    className?: string;
}

export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({ label, tooltip, className }) => {
    return (
        <div className={cn("inline-flex items-center gap-1.5 group relative cursor-help", className)}>
            <span className="font-medium text-gray-300">{label}</span>
            <Info className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#445dea] transition-colors" />

            {/* Tooltip Popup */}
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 text-xs text-white bg-black/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
                {tooltip}
                {/* Arrow */}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-black/90 border-r border-b border-white/10 transform rotate-45"></div>
            </div>
        </div>
    );
};
