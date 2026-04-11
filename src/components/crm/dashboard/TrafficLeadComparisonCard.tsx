import { BarChart3 } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { AnalyticsUnavailableState, SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import {
  formatDashboardCount,
  formatDashboardPercent,
  formatDashboardSignedPercent,
  formatDashboardSignedPoints,
} from "./analyticsFormatting";
import { DashboardTrafficLeadComparison, DashboardTrafficLeadInsight } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface TrafficLeadComparisonCardProps {
  data?: DashboardTrafficLeadComparison;
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
}

const TrafficLeadComparisonCard = ({
  data,
  isLoading,
  errorMessage,
  isUnavailable,
}: TrafficLeadComparisonCardProps) => {
  return (
    <DashboardSection
      title="Comparativo trafego x leads"
      subtitle="Leitura executiva entre a metade inicial e a metade final da janela selecionada."
    >
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
          <SectionSkeleton rows={4} />
          <SectionSkeleton rows={3} />
        </div>
      ) : errorMessage ? (
        isUnavailable ? (
          <AnalyticsUnavailableState
            description={errorMessage}
            icon={<BarChart3 className="h-5 w-5" />}
            title="Comparativo aguardando analytics"
          />
        ) : (
          <SectionErrorState
            title="Nao foi possivel comparar trafego e leads"
            description={errorMessage}
          />
        )
      ) : !data ? (
        <SectionEmptyState
          title="Sem base comparativa"
          description="Quando houver dados suficientes no periodo, o comparativo entre volume e geracao de leads aparecera aqui."
          icon={<BarChart3 className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SnapshotCard title={data.previous.label} snapshot={data.previous} />
              <SnapshotCard title={data.current.label} snapshot={data.current} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DeltaCard
                label="Visitantes"
                value={formatDeltaPercent(data.delta.visitorsPercent)}
                description="Mudanca de volume entre as duas metades do periodo."
                tone={resolveDeltaTone(data.delta.visitorsPercent)}
              />
              <DeltaCard
                label="Leads"
                value={formatDeltaPercent(data.delta.leadsPercent)}
                description="Variacao de leads criados na comparacao."
                tone={resolveDeltaTone(data.delta.leadsPercent)}
              />
              <DeltaCard
                label="Taxa de conversao"
                value={formatDeltaPoints(data.delta.conversionRatePoints)}
                description="Diferenca em pontos percentuais de conversao."
                tone={resolveDeltaTone(data.delta.conversionRatePoints)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {data.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

function SnapshotCard({
  title,
  snapshot,
}: {
  title: string;
  snapshot: DashboardTrafficLeadComparison["previous"];
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCell label="Visitantes" value={formatDashboardCount(snapshot.visitors)} />
        <MetricCell label="Leads" value={formatDashboardCount(snapshot.leads)} />
        <MetricCell label="Conversao" value={formatDashboardPercent(snapshot.conversionRate)} />
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DeltaCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: DashboardTrafficLeadInsight["tone"];
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("mt-3 text-3xl font-semibold tracking-tight text-foreground", toneStyles[tone])}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: DashboardTrafficLeadInsight }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className={cn("text-sm font-semibold", toneStyles[insight.tone])}>{insight.title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.description}</p>
    </div>
  );
}

const toneStyles: Record<DashboardTrafficLeadInsight["tone"], string> = {
  neutral: "text-foreground",
  positive: "text-secondary",
  warning: "text-amber-700",
  danger: "text-destructive",
};

function resolveDeltaTone(value: number | null): DashboardTrafficLeadInsight["tone"] {
  if (value === null || value === 0) {
    return "neutral";
  }

  return value > 0 ? "positive" : "warning";
}

function formatDeltaPercent(value: number | null) {
  return formatDashboardSignedPercent(value);
}

function formatDeltaPoints(value: number | null) {
  return formatDashboardSignedPoints(value);
}

export default TrafficLeadComparisonCard;
