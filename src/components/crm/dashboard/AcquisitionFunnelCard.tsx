import { TrendingDown, Filter } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { AnalyticsUnavailableState, SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import { formatDashboardCount, formatDashboardPercent } from "./analyticsFormatting";
import { DashboardAcquisitionFunnel, DashboardFunnelStage } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface AcquisitionFunnelCardProps {
  data?: DashboardAcquisitionFunnel;
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
}

const AcquisitionFunnelCard = ({
  data,
  isLoading,
  errorMessage,
  isUnavailable,
}: AcquisitionFunnelCardProps) => {
  return (
    <DashboardSection
      title="Funil de aquisicao"
      subtitle="Avanco dos visitantes desde a landing ate o envio bem-sucedido do formulario."
    >
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),280px]">
          <SectionSkeleton rows={5} />
          <SectionSkeleton rows={3} />
        </div>
      ) : errorMessage ? (
        isUnavailable ? (
          <AnalyticsUnavailableState
            description={errorMessage}
            icon={<Filter className="h-5 w-5" />}
            title="Funil aguardando analytics"
          />
        ) : (
          <SectionErrorState
            title="Nao foi possivel carregar o funil"
            description={errorMessage}
          />
        )
      ) : !data || data.stages.every((stage) => stage.count === 0) ? (
        <SectionEmptyState
          title="Sem eventos suficientes no periodo"
          description="Assim que visitantes e interacoes forem registradas, o funil aparecera aqui."
          icon={<Filter className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),280px]">
          <div className="space-y-4">
            {data.hasPartialData ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-sm font-medium text-foreground">Historico parcial detectado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Algumas etapas posteriores superam a anterior no periodo. Nesses casos, a taxa fica indisponivel para
                  evitar leitura enganosa.
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              {data.stages.map((stage, index) => (
                <FunnelStageCard
                  key={stage.id}
                  stage={stage}
                  baseline={data.stages[0]?.count ?? 0}
                  showConnector={index < data.stages.length - 1}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <SummaryTile
              label="Conversao final"
              value={formatRate(getOverallConversionRate(data), (data.stages[0]?.count ?? 0) > 0)}
              description="Visitantes com envio bem-sucedido sobre o total de visitantes do periodo."
            />
            <SummaryTile
              label="Erros de envio"
              value={formatDashboardCount(data.submitErrorCount)}
              description="Visitantes distintos com lead_form_submit_error no periodo."
            />
            <SummaryTile
              label="Maior abandono"
              value={
                data.bottleneck
                  ? formatDashboardPercent(data.bottleneck.dropOffRate)
                  : "n/d"
              }
              description={
                data.bottleneck
                  ? `${data.bottleneck.fromStageLabel} -> ${data.bottleneck.toStageLabel}`
                  : "Sem abandono relevante identificado."
              }
              danger={Boolean(data.bottleneck)}
            />
          </aside>
        </div>
      )}
    </DashboardSection>
  );
};

interface FunnelStageCardProps {
  stage: DashboardFunnelStage;
  baseline: number;
  showConnector: boolean;
}

const FunnelStageCard = ({ stage, baseline, showConnector }: FunnelStageCardProps) => {
  const widthPercent = baseline > 0 ? Math.max((stage.count / baseline) * 100, 8) : 8;

  return (
    <div className="relative">
      <article className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{stage.label}</p>
            <p className="text-sm text-muted-foreground">{stage.description}</p>
          </div>
          {stage.hasPartialData ? (
            <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              parcial
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="h-3 overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width]",
                stage.hasPartialData && "from-amber-500 to-amber-400",
              )}
              style={{ width: `${Math.min(widthPercent, 100)}%` }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricBlock label="Visitantes" value={formatDashboardCount(stage.count)} />
            <MetricBlock
              label="Avanco"
              value={formatRate(stage.advanceRate, stage.previousCount !== null)}
            />
            <MetricBlock
              label="Abandono"
              value={formatRate(stage.dropOffRate, stage.previousCount !== null)}
              danger={Boolean(stage.dropOffRate && stage.dropOffRate > 0)}
            />
          </div>
        </div>
      </article>

      {showConnector ? <div className="mx-auto h-4 w-px bg-border" aria-hidden="true" /> : null}
    </div>
  );
};

interface MetricBlockProps {
  label: string;
  value: string;
  danger?: boolean;
}

const MetricBlock = ({ label, value, danger }: MetricBlockProps) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold text-foreground", danger && "text-destructive")}>{value}</p>
    </div>
  );
};

interface SummaryTileProps {
  label: string;
  value: string;
  description: string;
  danger?: boolean;
}

const SummaryTile = ({ label, value, description, danger }: SummaryTileProps) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {danger ? <TrendingDown className="h-4 w-4 text-destructive" /> : null}
      </div>
      <p className={cn("mt-3 text-3xl font-semibold tracking-tight text-foreground", danger && "text-destructive")}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
};

function formatRate(value: number | null, hasBaseline: boolean) {
  if (!hasBaseline) {
    return "-";
  }

  return formatDashboardPercent(value);
}

function getOverallConversionRate(data: DashboardAcquisitionFunnel) {
  const visitors = data.stages[0]?.count ?? 0;
  const successes = data.stages[data.stages.length - 1]?.count ?? 0;

  if (visitors === 0) {
    return null;
  }

  return Number(((successes / visitors) * 100).toFixed(1));
}

export default AcquisitionFunnelCard;
