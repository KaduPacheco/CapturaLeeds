import { cn } from "@/utils/cn";

interface LeadOperationalSummaryCardProps {
  label: string;
  value: string;
  helper: string;
  tone: "neutral" | "danger";
}

const LeadOperationalSummaryCard = ({
  label,
  value,
  helper,
  tone,
}: LeadOperationalSummaryCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        tone === "danger" ? "border-destructive/20 bg-destructive/5" : "border-border/70 bg-muted/20",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("mt-3 text-lg font-semibold text-foreground", tone === "danger" && "text-destructive")}>
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
};

export default LeadOperationalSummaryCard;
