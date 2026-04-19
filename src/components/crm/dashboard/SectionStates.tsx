import { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

interface SectionMessageProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export const SectionErrorState = ({
  title,
  description,
  icon = <AlertTriangle className="h-5 w-5" />,
  className,
}: SectionMessageProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="max-w-sm text-sm text-destructive/80">{description}</p>
      </div>
    </div>
  );
};

export const SectionEmptyState = ({
  title,
  description,
  icon = <Inbox className="h-5 w-5" />,
  className,
}: SectionMessageProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-background p-3 text-muted-foreground shadow-sm">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface SectionSkeletonProps {
  className?: string;
  rows?: number;
}

export const SectionSkeleton = ({ className, rows = 4 }: SectionSkeletonProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-2xl border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
};
