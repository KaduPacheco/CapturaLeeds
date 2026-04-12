import { KanbanSquare, LayoutList, ListFilter, Users } from "lucide-react";
import {
  LEAD_OWNER_FILTER_ALL,
  LEAD_OWNER_FILTER_MINE,
  LEAD_OWNER_FILTER_UNASSIGNED,
  LeadOwnerFilter,
  LeadsViewMode,
  LeadStageFilter,
  PIPELINE_STAGE_OPTIONS,
  getOwnerFilterValueForId,
} from "@/lib/crmLeadPresentation";
import { CrmOwnerOption } from "@/types/crm";
import { cn } from "@/utils/cn";

interface LeadsWorkspaceToolbarProps {
  totalLeads: number;
  visibleLeads: number;
  overdueLeads: number;
  unassignedLeads: number;
  stageFilter: LeadStageFilter;
  ownerFilter: LeadOwnerFilter;
  ownerOptions: CrmOwnerOption[];
  viewMode: LeadsViewMode;
  onStageFilterChange: (value: LeadStageFilter) => void;
  onOwnerFilterChange: (value: LeadOwnerFilter) => void;
  onViewModeChange: (value: LeadsViewMode) => void;
}

const LeadsWorkspaceToolbar = ({
  totalLeads,
  visibleLeads,
  overdueLeads,
  unassignedLeads,
  stageFilter,
  ownerFilter,
  ownerOptions,
  viewMode,
  onStageFilterChange,
  onOwnerFilterChange,
  onViewModeChange,
}: LeadsWorkspaceToolbarProps) => {
  return (
    <section className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <ListFilter className="h-3.5 w-3.5" />
            Operacao comercial
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline e ownership dos leads</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filtre por etapa e ownership, acompanhe pendencias e alterne entre lista e kanban sem sair da operacao.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-3">
          <StatCard label="Leads visiveis" value={String(visibleLeads)} helper={`${totalLeads} no total`} />
          <StatCard
            label="Com follow-up vencido"
            value={String(overdueLeads)}
            helper="Exigem acao imediata"
            danger={overdueLeads > 0}
          />
          <StatCard label="Sem responsavel" value={String(unassignedLeads)} helper="Ownership pendente" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Etapa</span>
            <select
              value={stageFilter}
              onChange={(event) => onStageFilterChange(event.target.value as LeadStageFilter)}
              className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="all">Todas as etapas</option>
              <option value="without_stage">Sem etapa definida</option>
              {PIPELINE_STAGE_OPTIONS.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Responsavel</span>
            <select
              value={ownerFilter}
              onChange={(event) => onOwnerFilterChange(event.target.value as LeadOwnerFilter)}
              className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value={LEAD_OWNER_FILTER_ALL}>Todos os responsaveis</option>
              <option value={LEAD_OWNER_FILTER_MINE}>Sob minha responsabilidade</option>
              <option value={LEAD_OWNER_FILTER_UNASSIGNED}>Sem responsavel</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={getOwnerFilterValueForId(owner.id)}>
                  {owner.selectLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inline-flex rounded-2xl border border-border bg-muted/20 p-1">
          <ViewToggleButton
            label="Lista"
            icon={LayoutList}
            active={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
          />
          <ViewToggleButton
            label="Kanban"
            icon={KanbanSquare}
            active={viewMode === "kanban"}
            onClick={() => onViewModeChange("kanban")}
          />
        </div>
      </div>
    </section>
  );
};

const StatCard = ({
  label,
  value,
  helper,
  danger,
}: {
  label: string;
  value: string;
  helper: string;
  danger?: boolean;
}) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <Users className={cn("h-4 w-4 text-muted-foreground", danger && "text-destructive")} />
      </div>
      <p className={cn("mt-3 text-2xl font-semibold tracking-tight text-foreground", danger && "text-destructive")}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
};

const ViewToggleButton = ({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof LayoutList;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
};

export default LeadsWorkspaceToolbar;
