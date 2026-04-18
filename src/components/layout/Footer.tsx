import { Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card py-10">
      <div className="container">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
                <Clock className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Ponto Eletrônico</span>
            </a>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Software de controle de ponto eletrônico para empresas que precisam de mais previsibilidade no fechamento da
              folha, visibilidade da jornada e menos retrabalho operacional.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="Links institucionais">
              <a href="/politica-de-privacidade" className="transition-colors hover:text-foreground">
                Política de Privacidade
              </a>
              <a href="/termos-de-uso" className="transition-colors hover:text-foreground">
                Termos de Uso
              </a>
              <a href="/#contato" className="transition-colors hover:text-foreground">
                Solicitar demonstração
              </a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ponto Eletrônico. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
