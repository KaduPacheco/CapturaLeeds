import { LucideIcon } from "lucide-react";
import { DashboardKpi } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface KpiCardProps {
  metric?: DashboardKpi;
  icon: LucideIcon;
  isLoading?: boolean;
  errorMessage?: string;
  variant?: "default" | "compact";
}

const toneStyles: Record<DashboardKpi["tone"], string> = {
  neutral: "from-primary/12 via-primary/5 to-transparent text-primary",
  positive: "from-secondary/15 via-secondary/5 to-transparent text-secondary",
  warning: "from-amber-500/15 via-amber-500/5 to-transparent text-amber-600",
  danger: "from-destructive/15 via-destructive/5 to-transparent text-destructive",
};

const helperToneStyles: Record<DashboardKpi["tone"], string> = {
  neutral: "text-primary/80",
  positive: "text-secondary",
  warning: "text-amber-700",
  danger: "text-destructive",
};

const KpiCard = ({ metric, icon: Icon, isLoading, errorMessage, variant = "default" }: KpiCardProps) => {
  const isCompact = variant === "compact";

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-3xl border border-border/80 bg-card shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]",
          isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        )}
      >
        <div className={cn("flex items-center justify-between", isCompact ? "mb-4" : "mb-5")}>
          <div className={cn("animate-pulse rounded-2xl bg-muted/50", isCompact ? "h-9 w-9" : "h-10 w-10")} />
          <div className="h-3 w-16 animate-pulse rounded-full bg-muted/50" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-muted/50" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted/50" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-muted/50" />
          <div className={cn("animate-pulse rounded-full bg-muted/40", isCompact ? "h-3 w-32" : "h-4 w-40")} />
        </div>
      </div>
    );
  }

  if (errorMessage || !metric) {
    return (
      <div
        className={cn(
          "rounded-3xl border border-destructive/20 bg-destructive/5 shadow-[0_20px_60px_-40px_rgba(220,38,38,0.35)]",
          isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        )}
      >
        <div className="mb-4 inline-flex rounded-2xl bg-destructive/10 p-3 text-destructive">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">Falha ao carregar indicador</p>
          <p className="text-sm text-destructive/80">{errorMessage || "Tente novamente em instantes."}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]",
        isCompact ? "min-h-[168px] p-4 sm:p-5" : "min-h-[200px] p-5 sm:p-6",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 bg-gradient-to-br",
          toneStyles[metric.tone],
          isCompact ? "h-16" : "h-24",
        )}
      />
      <div className="relative flex h-full flex-col">
        <div className={cn("flex items-start gap-4", isCompact ? "mb-3" : "mb-5")}>
          <div
            className={cn(
              "inline-flex rounded-2xl bg-background/90 text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur",
              isCompact ? "p-2.5" : "p-3",
            )}
          >
            <Icon className={cn(isCompact ? "h-[18px] w-[18px]" : "h-5 w-5")} />
          </div>
        </div>
        <div className={cn(isCompact ? "space-y-1.5" : "space-y-2")}>
          <p
            className={cn(
              "font-medium text-muted-foreground",
              isCompact ? "text-[11px] uppercase tracking-[0.2em]" : "text-sm",
            )}
          >
            {metric.label}
          </p>
          <p
            className={cn(
              "font-semibold tracking-tight text-foreground",
              isCompact ? "text-[1.95rem] leading-[0.95] sm:text-[2.05rem]" : "text-3xl xl:text-[2rem]",
            )}
          >
            {metric.value}
          </p>
          {!isCompact ? (
            <p className="max-w-[32ch] text-sm leading-6 text-muted-foreground">{metric.description}</p>
          ) : null}
        </div>
        <div className={cn("mt-auto border-t border-border/55", isCompact ? "pt-3" : "pt-4")}>
          <p
            className={cn(
              "leading-5 text-muted-foreground",
              helperToneStyles[metric.tone],
              isCompact ? "max-w-[30ch] text-[11px] leading-4" : "text-xs",
            )}
          >
            {metric.helperText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
