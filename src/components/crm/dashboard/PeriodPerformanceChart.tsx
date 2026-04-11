import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { AnalyticsUnavailableState, SectionEmptyState, SectionErrorState } from "./SectionStates";
import { formatDashboardCount, formatDashboardPercent } from "./analyticsFormatting";
import { DashboardPeriodPoint } from "@/types/dashboard";

interface PeriodPerformanceChartProps {
  data?: DashboardPeriodPoint[];
  isLoading?: boolean;
  errorMessage?: string;
  isUnavailable?: boolean;
}

const PeriodPerformanceChart = ({ data, isLoading, errorMessage, isUnavailable }: PeriodPerformanceChartProps) => {
  return (
    <DashboardSection
      title="Volume e conversao por periodo"
      subtitle="Comparativo entre visitantes, leads criados e taxa de conversao ao longo da janela selecionada."
    >
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),280px]">
          <div className="h-[320px] animate-pulse rounded-3xl bg-muted/40" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      ) : errorMessage && isUnavailable ? (
        <AnalyticsUnavailableState
          description={errorMessage}
          icon={<LineChart className="h-5 w-5" />}
        />
      ) : errorMessage ? (
        <SectionErrorState
          title="Nao foi possivel carregar a evolucao por periodo"
          description={errorMessage}
        />
      ) : !data || data.every((point) => point.visitors === 0 && point.leads === 0 && point.conversions === 0) ? (
        <SectionEmptyState
          title="Sem volume suficiente no periodo"
          description="Assim que visitas e conversoes forem registradas, a evolucao temporal aparecera aqui."
          icon={<LineChart className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),280px]">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px", fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="volume"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  style={{ fontSize: "12px", fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis yAxisId="rate" orientation="right" hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "conversionRate") {
                      return [`${value.toFixed(1)}%`, "Taxa de conversao"];
                    }

                    if (name === "visitors") {
                      return [`${value}`, "Visitantes"];
                    }

                    if (name === "leads") {
                      return [`${value}`, "Leads"];
                    }

                    return [`${value}`, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="visitors"
                  yAxisId="volume"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#visitorsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  name="leads"
                  yAxisId="volume"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fill="url(#leadsGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  name="conversionRate"
                  yAxisId="rate"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {buildHighlights(data).map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

function buildHighlights(data: DashboardPeriodPoint[]) {
  const totalVisitors = data.reduce((sum, point) => sum + point.visitors, 0);
  const totalLeads = data.reduce((sum, point) => sum + point.leads, 0);
  const totalConversions = data.reduce((sum, point) => sum + point.conversions, 0);
  const bestConversionDay = [...data].sort((left, right) => right.conversionRate - left.conversionRate)[0];

  return [
    {
      label: "Visitantes",
      value: formatDashboardCount(totalVisitors),
      description: "Volume total de visitantes unicos no recorte atual.",
    },
    {
      label: "Leads criados",
      value: formatDashboardCount(totalLeads),
      description: "Registros que chegaram ao CRM dentro da mesma janela.",
    },
    {
      label: "Conversoes",
      value: formatDashboardCount(totalConversions),
      description: "Visitantes com evento de envio bem-sucedido do formulario.",
    },
    {
      label: "Melhor dia",
      value: bestConversionDay ? `${bestConversionDay.label} - ${formatDashboardPercent(bestConversionDay.conversionRate)}` : "-",
      description: "Dia com a melhor taxa de conversao observada no periodo.",
    },
  ];
}

export default PeriodPerformanceChart;
