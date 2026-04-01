import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { z } from "zod";
import { submitLeadToSupabase } from "@/services/leadService";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20).regex(/^[\d\s()+-]+$/, "Formato inválido"),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal('')),
  empresa: z.string().trim().min(2, "Nome da empresa é obrigatório").max(100),
  employees: z.coerce.number().min(1, "Informe a quantidade de funcionários").int(),
});

const LeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", empresa: "", employees: "", bot_field: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useState(() => Date.now())[0]; // Bloqueio de envio muito rápido (bot)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Proteção contra spam simples (Honeypot e Tempo de preenchimento) -> Pode adicionar ReCaptcha depois
    if (form.bot_field || Date.now() - startTime < 3000) {
      toast({ title: "Sua solicitação foi recebida." }); // Falso positivo para o bot
      if (onSuccess) onSuccess(); else setSubmitted(true);
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
        funcionarios: result.data.employees
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        setSubmitted(true);
      }
      
      toast({
        title: "Cadastro realizado! 🎉",
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
      <section id="contato" className="py-20 bg-hero-gradient">
        <div className="container text-center text-primary-foreground">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-secondary" />
          <h2 className="text-3xl font-extrabold mb-4">Obrigado pelo interesse!</h2>
          <p className="text-lg opacity-90">Nossa equipe entrará em contato em até 24 horas.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="py-20 bg-hero-gradient">
      <div className="container" ref={ref}>
        <div className="max-w-lg mx-auto">
          <div className={`text-center text-primary-foreground mb-10 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Fale com um Especialista
            </h2>
             <p className="opacity-90 max-w-sm mx-auto">
               Descubra como nossa plataforma pode eliminar o trabalho braçal do seu RH. Receba 7 dias de teste grátis.
             </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className={`bg-card rounded-2xl p-8 shadow-2xl ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-4">
              <input
                type="text"
                name="bot_field"
                value={form.bot_field}
                onChange={(e) => setForm({ ...form, bot_field: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div>
                <label htmlFor="name" className="sr-only">Nome Completo</label>
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
                {errors.name && <p id="name-error" className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="whatsapp" className="sr-only">WhatsApp</label>
                <Input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp (ex: 11 99999-9999)"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={!!errors.whatsapp}
                  aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                />
                {errors.whatsapp && <p id="whatsapp-error" className="text-destructive text-xs mt-1">{errors.whatsapp}</p>}
              </div>
              <div>
                <label htmlFor="email" className="sr-only">E-mail corporativo</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu melhor e-mail (opcional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={255}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="empresa" className="sr-only">Nome da Empresa</label>
                <Input
                  id="empresa"
                  placeholder="Nome da sua empresa"
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                  autoComplete="organization"
                  aria-invalid={!!errors.empresa}
                  aria-describedby={errors.empresa ? "empresa-error" : undefined}
                />
                {errors.empresa && <p id="empresa-error" className="text-destructive text-xs mt-1">{errors.empresa}</p>}
              </div>
              <div>
                <label htmlFor="employees" className="sr-only">Quantidade de funcionários</label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="Quantidade exata de funcionários"
                  value={form.employees}
                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
                  className="h-12 rounded-xl"
                  min="1"
                  autoComplete="off"
                  aria-invalid={!!errors.employees}
                  aria-describedby={errors.employees ? "employees-error" : undefined}
                />
                {errors.employees && <p id="employees-error" className="text-destructive text-xs mt-1">{errors.employees}</p>}
              </div>
            </div>
            <Button 
              variant="cta" 
              type="submit" 
              className="w-full h-14 rounded-xl mt-6 text-lg"
              disabled={isSubmitting}
            >
              <Send className={`w-5 h-5 mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
              {isSubmitting ? "Enviando..." : "Quero testar agora"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Seus dados serão usados apenas para contato comercial e demonstração da plataforma. Não enviamos spam. 
              Ao enviar, você concorda com nossos termos.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
