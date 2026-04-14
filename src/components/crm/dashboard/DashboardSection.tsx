import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

const DashboardSection = ({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: DashboardSectionProps) => {
  return (
    <section
      className={cn(
        "h-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6 sm:py-4.5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h2>
          {subtitle ? <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{subtitle}</p> : null}
        </div>
        {action ? <div className="w-full shrink-0 self-start lg:w-auto lg:self-auto">{action}</div> : null}
      </div>
      <div className={cn("p-5 sm:p-6 xl:p-6", contentClassName)}>{children}</div>
    </section>
  );
};

export default DashboardSection;
