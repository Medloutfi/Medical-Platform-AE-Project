import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState, useRef } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconBgColor?: string;
  iconColor?: string;
  delay?: number;
}

function useCountUp(end: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return { count, ref };
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  delay = 0
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString());
  const isNumeric = !isNaN(numericValue);
  const { count } = useCountUp(isNumeric ? numericValue : 0, 1200, delay);

  return (
    <Card className="card-hover border-0 shadow-sm hover:shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isNumeric ? count : value}
            </h3>
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`${iconBgColor} p-3.5 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
      {/* Subtle gradient accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
