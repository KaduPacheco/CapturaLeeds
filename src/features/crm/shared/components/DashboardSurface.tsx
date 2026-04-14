import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface DashboardClusterShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  tone?: "default" | "subtle" | "muted";
  className?: string;
  contentClassName?: string;
}

interface DashboardMetricRailProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  columnsClassName?: string;
  className?: string;
}

export function DashboardClusterShell({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
  className,
  contentClassName,
}: DashboardClusterShellProps) {
  return (
    <section
      className={cn(
        "rounded-[32px] border border-border/70 p-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.6)] backdrop-blur sm:p-6 xl:p-7 2xl:p-8",
        tone === "muted"
          ? "bg-muted/[0.16]"
          : tone === "subtle"
            ? "bg-card/70"
            : "bg-card/82",
        className,
      )}
    >
      <DashboardClusterIntro eyebrow={eyebrow} title={title} description={description} />
      <div className={cn("mt-4 sm:mt-6", contentClassName)}>{children}</div>
    </section>
  );
}

export function DashboardMetricRail({
  eyebrow,
  title,
  description,
  children,
  columnsClassName,
  className,
}: DashboardMetricRailProps) {
  return (
    <div
      className={cn(
        "h-full rounded-[28px] border border-border/70 bg-background/[0.38] p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)] sm:p-5 xl:p-6",
        className,
      )}
    >
      <div className="mb-4 max-w-xl space-y-1.5 border-b border-border/60 pb-4 sm:mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
        </div>
      </div>

      <div className={cn("grid gap-4 sm:grid-cols-2", columnsClassName)}>{children}</div>
    </div>
  );
}

function DashboardClusterIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 px-1">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <div className="max-w-3xl space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
      </div>
    </div>
  );
}
