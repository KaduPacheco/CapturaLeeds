import { LucideIcon } from "lucide-react";
import { DashboardKpi } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface KpiCardProps {
  metric?: DashboardKpi;
  icon: LucideIcon;
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
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

const KpiCard = ({ metric, icon: Icon, isLoading, errorMessage, isUnavailable }: KpiCardProps) => {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted/50" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-muted/50" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted/50" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>
    );
  }

  if (errorMessage || !metric) {
    if (isUnavailable) {
      return (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-[0_20px_60px_-40px_rgba(37,99,235,0.28)]">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Analytics aguardando habilitacao</p>
            <p className="text-sm text-muted-foreground">
              {errorMessage || "A infraestrutura de analytics ainda nao esta disponivel neste ambiente."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-[0_20px_60px_-40px_rgba(220,38,38,0.35)]">
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
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
      <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-br", toneStyles[metric.tone])} />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="inline-flex rounded-2xl bg-background/90 p-3 text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          <span className={cn("text-xs font-semibold", helperToneStyles[metric.tone])}>{metric.helperText}</span>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            {metric.valueDisplay ?? metric.value}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{metric.description}</p>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
