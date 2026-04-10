# Auditoria de Infraestrutura de Banco (CRM)

Este documento centraliza a auditoria do estado desejado do banco de dados no Supabase, deduzido a partir da implementação front-end atual da aplicação. A meta é estabelecer a infraestrutura mínima viável para o CRM sem quebrar a captura de leads da Landing Page.

## 1. Inventário de Tabelas Esperadas

O front-end hoje faz requisições (via `supabase-js`) para **4 tabelas principais**.

### 1.1 Tabela: `leads` (Tabela Core - Híbrida)
Os dados trafegam pela Landing (inserção cega) e pelo CRM (leitura/edição).
**Colunas Esperadas (`src/types/crm.ts`):**
- `id` (UUID, Primary Key)
- `nome` (Text, Not Null)
- `whatsapp` (Text, Not Null)
- `email` (Text, Nullable)
- `empresa` (Text, Nullable)
- `funcionarios` (Int, Nullable)
- `origem` (Text, Default 'landing_page')
- `status` (Text, Default 'novo' - *Campo Legado LP*)
- `pipeline_stage` (Text, Nullable - *Campo Novo CRM*)
- `owner_id` (UUID, Nullable, FK `auth.users` - *Campo Novo CRM*)
- `lifetime_value` (Numeric/Decimal, Nullable - *Campo Novo CRM*)
- `created_at` (TimestampTZ)
- `updated_at` (TimestampTZ)
- `last_interaction_at` (TimestampTZ, Nullable)

### 1.2 Tabela: `lead_notes` (Exclusiva CRM)
**Colunas Esperadas:**
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Not Null, FK `leads.id`)
- `author_id` (UUID, Not Null, FK `auth.users`)
- `content` (Text, Not Null)
- `created_at` (TimestampTZ)
- `updated_at` (TimestampTZ)

### 1.3 Tabela: `lead_tasks` (Exclusiva CRM)
**Colunas Esperadas:**
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Not Null, FK `leads.id`)
- `assignee_id` (UUID, Not Null, FK `auth.users`)
- `title` (Text, Not Null)
- `due_date` (TimestampTZ, Not Null)
- `completed` (Boolean, Default false)
- `created_at` (TimestampTZ)
- `updated_at` (TimestampTZ)

### 1.4 Tabela: `lead_events` (Exclusiva CRM - Timeline)
**Colunas Esperadas:**
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Not Null, FK `leads.id`)
- `event_type` (Text, Not Null)
- `payload` (JSONB, Default '{}')
- `created_at` (TimestampTZ)

---

## 2. Inconsistências Identificadas (Frontend vs SQL Documentado)

1. **Tabela `leads` Incompleta**: O script `01_rls_leads.sql` assume que a tabela `leads` já existe com a modelagem antiga da Landing Page. Ele não possui as instruções `ALTER TABLE` para incluir as novas colunas do CRM (`pipeline_stage`, `owner_id`, `lifetime_value`, `last_interaction_at`).
2. **Ausência de Triggers**: O schema Typescript prevê a coluna `updated_at` auto-atualizada, mas não há documentação ou script criando o trigger de banco (ex: extensão `moddatetime`) para mantê-la sincronizada de forma segura via banco.
3. **Ausência da Migração de Criação Inicial**: Não há arquivo consolidando o "CREATE TABLE leads" base no repositório `docs/sql/`.

## 3. Triggers, Índices e Policies Recomendados

### Triggers Essenciais
- **moddatetime**: Na tabela `leads`, `lead_tasks` e `lead_notes` na coluna `updated_at` para atualizar automaticamente em cada `UPDATE`.
- Opcional: Trigger de *update* na tabela `leads` para registrar `last_interaction_at` quando uma nota for inserida (desacoplamento back-end > front-end).

### Índices de Performance Recomendados
- `leads(pipeline_stage, created_at)`: Para o pipeline board.
- `lead_notes(lead_id)`: Para carregamento rápido do dossiê.
- `lead_tasks(lead_id, due_date)`: Para alertas de tarefas vencidas.
- `lead_events(lead_id, created_at)`: Para a timeline imutável.

### Matriz de Segurança (RLS Policies)

| Alvo | Origem | Acesso | Justificativa |
| :--- | :--- | :--- | :--- |
| `leads` | Anon | **INSERT** | A Landing Page capta os leads livremente sem estar logada. |
| `leads` | Auth | **ALL** | O CRM visualiza, edita e deleta (em casos extremos). |
| `lead_notes` | Auth | **ALL** | Apenas usuários logados visualizam e manipulam notas. |
| `lead_tasks` | Auth | **ALL** | Apenas usuários logados criam e concluem tarefas. |
| `lead_events` | Auth | **SELECT/INSERT** | Histórico/Audit trail (não pode ter UPDATE/DELETE). |

---

## 4. Ordem Segura de Criação (Proposição)

Para não quebrarmos a Home (que já faz insert simples no `leads` antigo), a ordem de execução no painel do Supabase DEVERÁ ser rigorosamente:

1. **Script 00**: Habilitar extensões necessárias (ex: `uuid-ossp`, `moddatetime`).
2. **Script 01**: Extender a tabela `leads` com as colunas novas `pipeline_stage`, `owner_id` (todas explicitamente `NULLABLE` para não estourar o forms da LP) e aplicar as Políticas de Segurança (RLS).
3. **Script 02-04**: Criar as tabelas dependentes (notas, tarefas, eventos) usando Foreign Keys limitando `ON DELETE CASCADE`.
4. **Script 05**: Aplicar todos os Triggers para data de atualização e Inteligência (se as preferirmos na camada do PostgreSQL).
