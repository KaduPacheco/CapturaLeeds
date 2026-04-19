import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CheckCircle, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { z } from "zod";
import { submitLeadToSupabase } from "@/services/leadService";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20).regex(/^[\d\s()+-]+$/, "Formato inválido"),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  empresa: z.string().trim().min(2, "Nome da empresa é obrigatório").max(100),
  employees: z.coerce.number().min(1, "Informe a quantidade de funcionários").int(),
});

const trustPoints = [
  "Retorno comercial em até 1 dia útil",
  "Demonstração orientada ao seu cenário",
  "Teste de 30 dias para avaliar aderência",
] as const;

const LeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", empresa: "", employees: "", bot_field: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useState(() => Date.now())[0];
  const hasTrackedStartRef = useRef(false);

  const handleFormStart = () => {
    if (hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (form.bot_field || Date.now() - startTime < 3000) {
      toast({ title: "Sua solicitação foi recebida." });
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

      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Em breve entraremos em contato com você.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seus dados, tente novamente.",
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
          <h2 className="mb-4 text-3xl font-extrabold">Obrigado pelo interesse.</h2>
          <p className="text-lg opacity-90">Nossa equipe deve retornar em até 1 dia útil.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="bg-hero-gradient py-20" aria-labelledby="lead-form-title">
      <div className="container" ref={ref}>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`text-primary-foreground ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 id="lead-form-title" className="mt-4 text-3xl font-extrabold md:text-4xl">
              Solicite uma demonstração e avalie a plataforma no seu cenário.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-primary-foreground/84">
              Preencha os dados para nosso time entender a sua operação e conduzir a próxima etapa comercial com objetividade.
            </p>

            <div className="mt-8 space-y-3">
              {trustPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <p className="text-sm leading-6 text-primary-foreground/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onFocusCapture={handleFormStart}
            className={`rounded-[2rem] bg-card p-8 shadow-2xl md:p-10 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <input
              type="text"
              name="bot_field"
              value={form.bot_field}
              onChange={(e) => setForm({ ...form, bot_field: e.target.value })}
              className="absolute -z-10 h-0 w-0 opacity-0"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Solicitar demonstração</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deixe seus dados para receber um contato comercial alinhado ao seu contexto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-foreground">
                  WhatsApp
                </label>
                <Input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
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
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  E-mail profissional
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com.br"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={255}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="empresa" className="mb-2 block text-sm font-medium text-foreground">
                  Empresa
                </label>
                <Input
                  id="empresa"
                  placeholder="Nome da empresa"
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="organization"
                  aria-invalid={!!errors.empresa}
                  aria-describedby={errors.empresa ? "empresa-error" : undefined}
                />
                {errors.empresa && (
                  <p id="empresa-error" className="mt-1 text-xs text-destructive">
                    {errors.empresa}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="employees" className="mb-2 block text-sm font-medium text-foreground">
                  Quantidade de funcionários
                </label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="Ex.: 25"
                  value={form.employees}
                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
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
              {isSubmitting ? "Enviando..." : "Solicitar demonstração"}
            </Button>

            <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
              Seus dados serão usados apenas para contato comercial e apresentação da plataforma. Não enviamos spam.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
