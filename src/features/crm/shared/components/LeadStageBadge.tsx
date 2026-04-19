import type { CrmLead } from "@/features/crm/shared/types/crm";
import { getLeadStageBadgeClassName, getLeadStageLabel } from "@/lib/crmLeadPresentation/stages";
import { cn } from "@/utils/cn";

interface LeadStageBadgeProps {
  lead: Pick<CrmLead, "pipeline_stage" | "status">;
  className?: string;
}

const LeadStageBadge = ({ lead, className }: LeadStageBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        getLeadStageBadgeClassName(lead),
        className,
      )}
    >
      {getLeadStageLabel(lead)}
    </span>
  );
};

export default LeadStageBadge;
