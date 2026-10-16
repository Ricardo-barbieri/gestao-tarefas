# Vamo — gestão de trabalho

Primeira versão funcional de um sistema original em português para tarefas, projetos e processos. **Demonstração para avaliação; o escopo completo ainda tem pendências.**

Demonstração privada: https://vamo-gestao-rb.daringstork16.chatgpt.site

Entre com a conta ChatGPT autorizada na hospedagem. O primeiro acesso cria Estúdio Aurora, equipe de Marketing, projetos e sete tarefas fictícias, em um workspace isolado por identidade.

## Já utilizável

Quadros e permissões, tarefas e subtarefas, Kanban/lista/calendário/cronograma, projetos/clientes, cronômetro e tempo manual, anexos versionados, formulários com criação idempotente, compartilhamento restrito com prévia, aprovação por versão, entrega/reabertura, prazos em dias úteis, notificações internas, indicadores e API com tokens. Webhooks assinados têm outbox e retentativas; destinos começam desabilitados.

## Executar

Node >=22.13 e npm. `npm ci`, `npm run typecheck`, `npm test`, `npm run build`; aplique as duas migrações locais conforme [EXECUCAO.md](docs/EXECUCAO.md) e rode `npm run dev`.

## Documentação

- [Escopo implementado e pendências reais](docs/ESCOPO.md).
- [Arquitetura, segurança e premissas](docs/ARQUITETURA.md).
- [Execução e cenário demonstrativo](docs/EXECUCAO.md).
- [API e webhooks](docs/API.md).
- [Verificações executadas](docs/VALIDACAO.md): 25 testes de domínio/webhooks, 27 verificações HTTP com D1/R2, build, tipos e navegador desktop/celular.
- Requisitos originais e complementares preservados em docs/.

## Arquitetura

React 19, TypeScript, Vinext/App Router, Cloudflare Workers, D1/SQLite e R2. Identidade fornecida pelo gateway Sites; autorização por empresa/quadro no servidor. Migrações Drizzle e agregado operacional com revisão otimista por organização. A decisão por D1/R2 acompanha a hospedagem disponível; a migração para um domínio relacional normalizado é indicada para maior escala.

## Configuração ainda necessária

A hospedagem permanece privada: links anônimos de formulários/convidados precisam de política externa que permita essas rotas. E-mail, WhatsApp e IA não estão conectados: exigem adaptadores e credenciais, sem envios simulados. Webhooks exigem domínio permitido no servidor e configuração de agenda para tentativas sem tráfego. Consulte a lista completa de pendências antes de utilizar com dados reais.

Nenhuma senha fixa, credencial de provedor, cobrança, assinatura ou limite comercial está incluído. Dados de runtime e arquivos enviados não são versionados.
