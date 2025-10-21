import { Plane } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
        <div className="relative bg-gradient-primary p-2 rounded-lg shadow-aviation">
          <Plane className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AirPlus
          </span>
          <span className="text-xs text-muted-foreground -mt-1">AAMS</span>
        </div>
      )}
    </div>
  );
};
