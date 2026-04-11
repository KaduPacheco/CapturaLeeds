import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Compass } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { SectionEmptyState, SectionErrorState } from "./SectionStates";
import { DashboardChartDatum } from "@/types/dashboard";

interface SourceChartProps {
  data?: DashboardChartDatum[];
  isLoading?: boolean;
  errorMessage?: string;
}

const SourceChart = ({ data, isLoading, errorMessage }: SourceChartProps) => {
  return (
    <DashboardSection
      title="Origem operacional do lead"
      subtitle="Campo origem salvo no CRM. Pode diferir da origem analitica por UTM e referrer."
    >
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-[220px,1fr] md:items-center">
          <div className="mx-auto h-52 w-52 animate-pulse rounded-full bg-muted/50" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        </div>
      ) : errorMessage ? (
        <SectionErrorState
          title="Nao foi possivel carregar as origens"
          description={errorMessage}
        />
      ) : !data || data.length === 0 ? (
        <SectionEmptyState
          title="Sem origens registradas"
          description="Quando os leads comecarem a entrar, os canais de aquisicao aparecerao aqui."
          icon={<Compass className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[220px,1fr] md:items-center">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                  formatter={(value: number, name: string) => [`${value} leads`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">{entry.percentage}% da base</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
};

export default SourceChart;
