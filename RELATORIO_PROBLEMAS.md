# Relatório de Problemas - Finance Tracker

## Contexto
Migração de tabela única `transactions` para tabelas separadas `incomes` e `expenses` com categorias distintas.

## Problemas Atuais

### 1. Erro de Carregamento
- **Sintoma**: Dashboard não carrega dados
- **Causa**: Tabela `transactions` foi removida mas componentes ainda referenciam a antiga estrutura
- **Erro**: `"Could not find table 'public.transactions'"`

### 2. Erro de Criação
- **Sintoma**: Falha ao criar novas transações
- **Causa**: Formato de data incorreto (objeto Date vs string YYYY-MM-DD)
- **Erro**: `"Dados inválidos"` da validação Zod

### 3. Erro de Rede
- **Sintoma**: "Erro de rede" mesmo com internet funcionando
- **Causa Provável**: 
  - Supabase não configurado (.env.local ausente/inválido)
  - Tabelas não criadas no Supabase
  - RLS policies não configuradas

## Arquivos Modificados
- ✅ `lib/categories.ts` - Categorias separadas
- ✅ `app/transactions/new/page.tsx` - API calls corrigidos
- ✅ APIs criadas: `/api/incomes`, `/api/expenses`
- ❌ Componentes dashboard ainda usam estrutura antiga

## Próximas Ações Necessárias
1. Atualizar componentes dashboard para usar novas APIs
2. Verificar configuração Supabase (.env.local)
3. Criar tabelas e RLS policies no Supabase
4. Testar fluxo completo

## SQL para Executar no Supabase
```sql
CREATE TABLE incomes (...);
CREATE TABLE expenses (...);
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- (políticas RLS conforme enviado anteriormente)
```
