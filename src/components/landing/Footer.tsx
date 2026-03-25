import { Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-10 border-t bg-card">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Ponto Eletrônico</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ponto Eletrônico. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
