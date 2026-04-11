import { AlertTriangle, BarChart3, Database } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { cn } from "@/utils/cn";

type AnalyticsStatusState = "unavailable" | "empty" | "error";

interface AnalyticsStatusPanelProps {
  state: AnalyticsStatusState;
  message?: string;
}

const stateConfig: Record<
  AnalyticsStatusState,
  {
    title: string;
    description: string;
    badge: string;
    badgeClassName: string;
    cardClassName: string;
    icon: typeof BarChart3;
    helperTitle: string;
    helperText: string;
  }
> = {
  unavailable: {
    title: "Analytics ainda nao esta disponivel neste ambiente",
    description:
      "O CRM operacional segue ativo. Assim que a infraestrutura estiver acessivel, visitantes, conversao, funil e campanhas voltam a aparecer automaticamente.",
    badge: "capacidade pendente",
    badgeClassName: "bg-primary/10 text-primary",
    cardClassName: "border-primary/20 bg-primary/5",
    icon: Database,
    helperTitle: "Para administracao",
    helperText: "Confirme a disponibilidade da tabela analytics_events, exposicao no schema cache e permissoes de leitura.",
  },
  empty: {
    title: "Analytics habilitado, aguardando volume inicial",
    description:
      "A estrutura esta pronta, mas ainda nao houve eventos suficientes na janela selecionada para preencher os modulos analiticos com leitura relevante.",
    badge: "sem dados suficientes",
    badgeClassName: "bg-muted text-muted-foreground",
    cardClassName: "border-border/70 bg-muted/20",
    icon: BarChart3,
    helperTitle: "Leitura recomendada",
    helperText: "Assim que page_view e lead_form_submit_success entrarem no periodo, o dashboard passa a preencher KPIs, evolucao, funil, origem e campanhas.",
  },
  error: {
    title: "A camada analitica precisa de revisao",
    description:
      "O CRM operacional continua funcionando, mas a atualizacao dos blocos analiticos falhou nesta sincronizacao.",
    badge: "erro de sincronizacao",
    badgeClassName: "bg-destructive/10 text-destructive",
    cardClassName: "border-destructive/20 bg-destructive/5",
    icon: AlertTriangle,
    helperTitle: "Detalhe tecnico",
    helperText: "Revise a conectividade do analytics e o contrato de leitura do dashboard antes de retomar a exibicao dos modulos.",
  },
};

const AnalyticsStatusPanel = ({ state, message }: AnalyticsStatusPanelProps) => {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <DashboardSection
      title="Estado da camada analitica"
      subtitle="Resumo centralizado para reduzir repeticao visual quando analytics nao estiver pronto para exibicao completa."
    >
      <div className={cn("rounded-3xl border p-6 shadow-sm", config.cardClassName)}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-background/80 p-3 text-foreground shadow-sm ring-1 ring-border/60">
              <Icon className="h-5 w-5" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{config.title}</h3>
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]", config.badgeClassName)}>
                  {config.badge}
                </span>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{config.description}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[320px] lg:grid-cols-1">
            <MiniCapability label="Visitantes" />
            <MiniCapability label="Conversao" />
            <MiniCapability label="Funil e campanhas" />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{config.helperTitle}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {state === "error" && message ? message : config.helperText}
          </p>
        </div>
      </div>
    </DashboardSection>
  );
};

const MiniCapability = ({ label }: { label: string }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">Oculto ate o estado ficar pronto</p>
    </div>
  );
};

export default AnalyticsStatusPanel;
