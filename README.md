# Vamo — gestão de trabalho

Aplicação original em português para demandas, quadros, projetos e processos. **Em desenvolvimento: ainda não utilizar com dados de produção.**

## Arquitetura

React 19, TypeScript, Vinext (compatibilidade com Next.js App Router), Cloudflare Workers, banco D1/SQLite e armazenamento R2. Identidade fornecida pela hospedagem Sites. Organizações e vínculos relacionais; agregado operacional versionado por organização com compare-and-swap para rejeitar sobrescrita concorrente.

## Executar

Requer Node >=22.13 e npm. `npm ci`, `npm run db:generate` apenas ao mudar o schema, aplicar as migrações locais conforme `docs/EXECUCAO.md`, `npm run dev`. A autenticação de desenvolvimento do template é exclusiva da prévia local; produção usa a identidade verificada pela hospedagem.

## Progresso

Fundação, domínio, API e interface estão em implementação. A lista final de funcionalidades e os resultados dos testes serão registrados em `docs/VALIDACAO.md` e `docs/ESCOPO.md`. Não interpretar código em progresso como funcionalidade validada.

Dados de demonstração usam pessoas e organizações fictícias. Nenhuma credencial de e-mail, WhatsApp ou IA está incluída.
