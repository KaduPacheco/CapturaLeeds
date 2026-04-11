import { FormEvent, useRef, useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/useToast";
import { leadSchema } from "@/lib/validations";
import { trackAnalyticsEvent } from "@/services/analyticsService";
import { submitLeadToSupabase } from "@/services/leadService";

const LeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", empresa: "", employees: "", bot_field: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formStartTimeRef = useRef(Date.now());
  const hasTrackedFormStartRef = useRef(false);

  const trackFormStart = () => {
    if (hasTrackedFormStartRef.current) {
      return;
    }

    hasTrackedFormStartRef.current = true;
    trackAnalyticsEvent({
      eventName: "lead_form_start",
      payload: {
        form_id: "landing_primary_lead_form",
      },
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submissionTimeMs = Date.now() - formStartTimeRef.current;
    const rawEmployeeCount = Number(form.employees);

    trackAnalyticsEvent({
      eventName: "lead_form_submit_attempt",
      payload: {
        form_id: "landing_primary_lead_form",
        elapsed_ms: submissionTimeMs,
        has_email: Boolean(form.email.trim()),
        has_company: Boolean(form.empresa.trim()),
        employee_count: Number.isFinite(rawEmployeeCount) ? rawEmployeeCount : null,
      },
    });

    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((schemaError) => {
        if (schemaError.path[0]) {
          fieldErrors[schemaError.path[0] as string] = schemaError.message;
        }
      });
      setErrors(fieldErrors);

      trackAnalyticsEvent({
        eventName: "lead_form_submit_error",
        payload: {
          form_id: "landing_primary_lead_form",
          error_type: "validation",
          invalid_fields: Object.keys(fieldErrors),
        },
      });
      return;
    }

    if (form.bot_field || submissionTimeMs < 3000) {
      trackAnalyticsEvent({
        eventName: "lead_form_submit_error",
        payload: {
          form_id: "landing_primary_lead_form",
          error_type: "spam_guard",
          elapsed_ms: submissionTimeMs,
        },
      });

      toast({ title: "Sua solicitacao foi recebida." });
      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await submitLeadToSupabase({
        nome: result.data.name,
        whatsapp: result.data.whatsapp,
        email: result.data.email || undefined,
        empresa: result.data.empresa,
        funcionarios: result.data.employees,
      });

      trackAnalyticsEvent({
        eventName: "lead_form_submit_success",
        payload: {
          form_id: "landing_primary_lead_form",
          lead_origin: "landing_page",
          elapsed_ms: submissionTimeMs,
          has_email: Boolean(result.data.email),
          employee_count: result.data.employees,
          employee_bucket: getEmployeeBucket(result.data.employees),
        },
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Em breve entraremos em contato com voce.",
      });
    } catch (error) {
      trackAnalyticsEvent({
        eventName: "lead_form_submit_error",
        payload: {
          form_id: "landing_primary_lead_form",
          error_type: "request_failure",
          error_message: error instanceof Error ? error.message : "unknown_error",
        },
      });

      toast({
        title: "Erro ao enviar",
        description: "Nao foi possivel enviar seus dados, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="contato" className="bg-hero-gradient py-20">
        <div className="container text-center text-primary-foreground">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-secondary" />
          <h2 className="mb-4 text-3xl font-extrabold">Obrigado pelo interesse!</h2>
          <p className="text-lg opacity-90">Nossa equipe entrara em contato em ate 24 horas.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="bg-hero-gradient py-20">
      <div className="container" ref={ref}>
        <div className="mx-auto max-w-lg">
          <div className={`mb-10 text-center text-primary-foreground ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">Fale com um especialista</h2>
            <p className="mx-auto max-w-sm opacity-90">
              Descubra como nossa plataforma pode eliminar o trabalho bracal do seu RH. Receba 14 dias de teste gratis.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            onFocusCapture={trackFormStart}
            className={`rounded-2xl bg-card p-8 shadow-2xl ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-4">
              <input
                type="text"
                name="bot_field"
                value={form.bot_field}
                onChange={(nextEvent) => setForm({ ...form, bot_field: nextEvent.target.value })}
                className="absolute -z-10 h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label htmlFor="name" className="sr-only">
                  Nome completo
                </label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(nextEvent) => setForm({ ...form, name: nextEvent.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="whatsapp" className="sr-only">
                  WhatsApp
                </label>
                <Input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp (ex: 11 99999-9999)"
                  value={form.whatsapp}
                  onChange={(nextEvent) => setForm({ ...form, whatsapp: nextEvent.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={!!errors.whatsapp}
                  aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                />
                {errors.whatsapp && (
                  <p id="whatsapp-error" className="mt-1 text-xs text-destructive">
                    {errors.whatsapp}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail corporativo
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu melhor e-mail (opcional)"
                  value={form.email}
                  onChange={(nextEvent) => setForm({ ...form, email: nextEvent.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={255}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="empresa" className="sr-only">
                  Nome da empresa
                </label>
                <Input
                  id="empresa"
                  placeholder="Nome da sua empresa"
                  value={form.empresa}
                  onChange={(nextEvent) => setForm({ ...form, empresa: nextEvent.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="organization"
                  aria-invalid={!!errors.empresa}
                  aria-describedby={errors.empresa ? "empresa-error" : undefined}
                />
                {errors.empresa && <p id="empresa-error" className="mt-1 text-xs text-destructive">{errors.empresa}</p>}
              </div>

              <div>
                <label htmlFor="employees" className="sr-only">
                  Quantidade de funcionarios
                </label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="Quantidade exata de funcionarios"
                  value={form.employees}
                  onChange={(nextEvent) => setForm({ ...form, employees: nextEvent.target.value })}
                  className="h-12 rounded-xl"
                  min="1"
                  autoComplete="off"
                  aria-invalid={!!errors.employees}
                  aria-describedby={errors.employees ? "employees-error" : undefined}
                />
                {errors.employees && (
                  <p id="employees-error" className="mt-1 text-xs text-destructive">
                    {errors.employees}
                  </p>
                )}
              </div>
            </div>

            <Button variant="cta" type="submit" className="mt-6 h-14 w-full rounded-xl text-lg" disabled={isSubmitting || submitted}>
              <Send className={`mr-2 h-5 w-5 ${isSubmitting ? "animate-pulse" : ""}`} />
              {isSubmitting ? "Enviando..." : "Quero testar agora"}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Seus dados serao usados apenas para contato comercial e demonstracao da plataforma. Nao enviamos spam.
              Ao enviar, voce concorda com nossos termos.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

function getEmployeeBucket(employeeCount: number) {
  if (employeeCount <= 10) {
    return "1_10";
  }

  if (employeeCount <= 50) {
    return "11_50";
  }

  if (employeeCount <= 200) {
    return "51_200";
  }

  return "200_plus";
}

export default LeadForm;
