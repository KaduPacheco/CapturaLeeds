# Ponto Eletrônico | CapturaLeeds

Landing page de captação de leads para a oferta de controle de ponto eletrônico voltada a pequenas e médias empresas.

## Visão geral

O fluxo principal da página pública está concentrado em `src/pages/HomePage.tsx` e segue esta ordem:

1. `Hero`
2. `Problems`
3. `Solution`
4. `TrustSection`
5. `Pricing`
6. `FaqSection`
7. `LeadForm`

Após o envio do formulário, a Home substitui esse fluxo por `SuccessView`. O CTA `Revisar a solução` fecha a tela de sucesso e faz scroll suave para `#solucao`, com fallback para o topo caso a âncora não esteja disponível.

## Seções preservadas fora do fluxo principal

Os componentes abaixo continuam no repositório apenas para referência editorial e rollback seguro. Eles não são renderizados pela Home atual:

- `src/components/sections/Benefits.tsx`
- `src/components/sections/Security.tsx`
- `src/components/sections/FinalCTA.tsx`
- `src/components/sections/SocialProof.tsx`

## Navegação e fluxo comercial

- O `Header` aponta para âncoras ativas da landing: `#problemas`, `#solucao`, `#precos`, `#faq` e `#contato`.
- O CTA principal do topo aponta para o formulário.
- O formulário envia leads para o Supabase e replica para o webhook do n8n quando configurado.
- A comunicação comercial atual mantém os termos `demonstração`, `teste de 30 dias`, `retorno em até 1 dia útil`, `implantação assistida` e `controle da jornada`.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query
- Zod
- Lucide React

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

O servidor de desenvolvimento sobe via Vite. O build de produção usa `vite build`.

## Integrações

### Supabase

O formulário utiliza `src/services/leadService.ts` para enviar dados para a tabela `leads` via REST API.

### n8n

Se `VITE_N8N_WEBHOOK_URL` estiver configurada, o lead também é encaminhado para o webhook. Falhas nessa etapa não interrompem o envio principal.

## Deploy

Este repositório é usado com deploy no Vercel. A publicação depende da branch configurada no projeto Vercel. Preview e produção devem ser validados no fluxo do próprio repositório antes de mergear mudanças.

## Licença

Projeto privado.
