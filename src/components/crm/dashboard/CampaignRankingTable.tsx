import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { AnalyticsUnavailableState, SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import { formatDashboardCount, formatDashboardPercent } from "./analyticsFormatting";
import { sortCampaignRanking } from "@/services/dashboardService";
import { DashboardCampaignRow, DashboardCampaignSortMode } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface CampaignRankingTableProps {
  data?: DashboardCampaignRow[];
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
}

const CampaignRankingTable = ({
  data,
  isLoading,
  errorMessage,
  isUnavailable,
}: CampaignRankingTableProps) => {
  const [sortMode, setSortMode] = useState<DashboardCampaignSortMode>("highest_conversion");
  const sortedData = useMemo(
    () => (data ? sortCampaignRanking(data, sortMode) : []),
    [data, sortMode],
  );

  return (
    <DashboardSection
      title="Ranking de campanhas"
      subtitle="Efetividade por campanha com bucket explicito para trafego sem UTM e dados incompletos."
      action={
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as DashboardCampaignSortMode)}
          className="h-10 rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
          aria-label="Ordenar ranking de campanhas"
        >
          <option value="highest_conversion">Maior conversao</option>
          <option value="highest_volume">Maior volume</option>
          <option value="worst_performance">Pior desempenho</option>
        </select>
      }
    >
      {isLoading ? (
        <SectionSkeleton rows={6} />
      ) : errorMessage ? (
        isUnavailable ? (
          <AnalyticsUnavailableState
            description={errorMessage}
            icon={<Megaphone className="h-5 w-5" />}
            title="Campanhas aguardando analytics"
          />
        ) : (
          <SectionErrorState
            title="Nao foi possivel carregar as campanhas"
            description={errorMessage}
          />
        )
      ) : !sortedData || sortedData.length === 0 ? (
        <SectionEmptyState
          title="Sem campanhas suficientes no periodo"
          description="Quando a landing registrar trafego com ou sem UTM, o ranking vai consolidar volume, conversoes e desempenho."
          icon={<Megaphone className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Leitura da campanha</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              O ranking agrupa por <span className="font-medium text-foreground">source + medium + campaign</span>.
              Trafego sem UTM aparece em um bucket dedicado e UTM incompleta fica sinalizada para revisao de tagging.
            </p>
          </div>

          <div className="space-y-3">
          {sortedData.map((row, index) => (
            <article
              key={row.id}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{row.campaignLabel}</p>
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]", statusStyles[row.attributionStatus])}>
                        {statusLabels[row.attributionStatus]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {row.sourceLabel} - {row.mediumLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.attributionSummary}</p>
                    {row.termLabel || row.contentLabel ? (
                      <p className="text-xs text-muted-foreground">
                        {row.termLabel ? `Termo: ${row.termLabel}` : "Termo nao informado"}
                        {row.contentLabel ? ` | Conteudo: ${row.contentLabel}` : ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricTile label="Visitantes" value={formatDashboardCount(row.visitors)} />
                    <MetricTile label="Conversoes" value={formatDashboardCount(row.conversions)} />
                    <MetricTile
                      label="Taxa"
                      value={formatDashboardPercent(row.conversionRate)}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

const statusLabels: Record<DashboardCampaignRow["attributionStatus"], string> = {
  complete: "completa",
  partial: "parcial",
  untagged: "sem utm",
};

const statusStyles: Record<DashboardCampaignRow["attributionStatus"], string> = {
  complete: "bg-secondary/10 text-secondary",
  partial: "bg-amber-500/10 text-amber-700",
  untagged: "bg-muted text-muted-foreground",
};

interface MetricTileProps {
  label: string;
  value: string;
}

const MetricTile = ({ label, value }: MetricTileProps) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
};

export default CampaignRankingTable;
