import { Globe } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { AnalyticsUnavailableState, SectionEmptyState, SectionErrorState, SectionSkeleton } from "./SectionStates";
import { formatDashboardCount, formatDashboardPercent } from "./analyticsFormatting";
import { DashboardAttributionSourceRow } from "@/types/dashboard";
import { cn } from "@/utils/cn";

interface AttributionSourcesTableProps {
  data?: DashboardAttributionSourceRow[];
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
}

const toneStyles: Record<DashboardAttributionSourceRow["attributionModel"], string> = {
  utm: "bg-primary/10 text-primary",
  referrer: "bg-secondary/10 text-secondary",
  direct: "bg-muted text-muted-foreground",
};

const AttributionSourcesTable = ({
  data,
  isLoading,
  errorMessage,
  isUnavailable,
}: AttributionSourcesTableProps) => {
  return (
    <DashboardSection
      title="Conversao por origem"
      subtitle="Origem analitica atribuida por UTM e, na ausencia de UTM, por referrer normalizado."
    >
      {isLoading ? (
        <SectionSkeleton rows={6} />
      ) : errorMessage ? (
        isUnavailable ? (
          <AnalyticsUnavailableState
            description={errorMessage}
            icon={<Globe className="h-5 w-5" />}
          />
        ) : (
          <SectionErrorState
            title="Nao foi possivel carregar a atribuicao"
            description={errorMessage}
          />
        )
      ) : !data || data.length === 0 ? (
        <SectionEmptyState
          title="Sem origens suficientes no periodo"
          description="Quando page views e conversoes forem registrados, o ranking de origem aparecera aqui."
          icon={<Globe className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Regra de atribuicao</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Visitantes usam <span className="font-medium text-foreground">page_view</span>; conversoes usam{" "}
              <span className="font-medium text-foreground">lead_form_submit_success</span>. A origem segue{" "}
              <span className="font-medium text-foreground">utm_source</span> primeiro, depois referrer normalizado e,
              por fim, trafego direto.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid md:grid-cols-[minmax(0,1.6fr),110px,120px,110px]">
            <span>Origem</span>
            <span className="text-right">Visitantes</span>
            <span className="text-right">Conversoes</span>
            <span className="text-right">Taxa</span>
          </div>

          <div className="space-y-3">
            {data.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.6fr),110px,120px,110px] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{row.sourceLabel}</p>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                          toneStyles[row.attributionModel],
                        )}
                      >
                        {row.attributionModel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{row.detailLabel}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDashboardPercent(row.visitorsShare)} dos visitantes e {formatDashboardPercent(row.conversionsShare)} das conversoes do periodo
                    </p>
                  </div>

                  <MetricColumn label="Visitantes" value={formatDashboardCount(row.visitors)} />
                  <MetricColumn label="Conversoes" value={formatDashboardCount(row.conversions)} />
                  <MetricColumn
                    label="Taxa"
                    value={formatDashboardPercent(row.conversionRate)}
                    highlight={row.conversionRate !== null && row.conversionRate > 0}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

interface MetricColumnProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const MetricColumn = ({ label, value, highlight }: MetricColumnProps) => {
  return (
    <div className="flex items-center justify-between gap-3 md:block md:text-right">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">{label}</span>
      <span className={cn("text-sm font-semibold text-foreground", highlight && "text-primary")}>{value}</span>
    </div>
  );
};

export default AttributionSourcesTable;
