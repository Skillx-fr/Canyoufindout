import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20",
            outline: "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
            ghost: "hover:bg-white/5 text-gray-300 hover:text-white",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
