import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20).regex(/^[\d\s()+-]+$/, "Formato inválido"),
  email: z.string().trim().email("E-mail inválido").max(255),
  employees: z.string().min(1, "Selecione a quantidade de funcionários"),
});

const LeadForm = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    setErrors({});
    setSubmitted(true);
    toast({
      title: "Cadastro realizado! 🎉",
      description: "Em breve entraremos em contato com você.",
    });
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
              Comece a usar agora mesmo
            </h2>
             <p className="opacity-90">
               Preencha seus dados e receba acesso gratuito por 7 dias. Sem cartão de crédito.
             </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className={`bg-card rounded-2xl p-8 shadow-2xl ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={100}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input
                  placeholder="WhatsApp (ex: 11 99999-9999)"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={20}
                />
                {errors.whatsapp && <p className="text-destructive text-xs mt-1">{errors.whatsapp}</p>}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 rounded-xl"
                  maxLength={255}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
            <Button variant="cta" type="submit" className="w-full h-14 rounded-xl mt-6 text-lg">
              <Send className="w-5 h-5 mr-2" />
              Quero testar agora
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Seus dados estão seguros. Não enviamos spam.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadForm;
