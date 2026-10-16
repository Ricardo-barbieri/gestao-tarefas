# Arquitetura e decisões

## Ambiente e escolha

O diretório estava vazio. O runtime Node 24 fornecido pelo aplicativo foi utilizado; o template traz versões travadas de React 19, TypeScript 5.9, Vite 8 e Vinext 1 beta. Instalação pelo package-lock, verificação de tipos e build confirmam compatibilidade neste ambiente. Vinext é beta; uma implantação independente que exija estabilidade sem essa dependência pode migrar o App Router para Next.js estável.

A hospedagem disponível executa Cloudflare Workers com D1 e R2. Por isso D1/SQLite substitui PostgreSQL e o acesso SQL usa prepared statements. O schema Drizzle gera migrações SQL, mantidas imutáveis depois de aplicadas. Uma migração futura deve ser aditiva.

## Organização do código

- app/workspace.tsx: interface do workspace e editores.
- app/public-portal.tsx: formulário e portal restrito de convidados.
- app/api/: rotas HTTP autenticadas, de upload, download, formulários e API v1.
- lib/model.ts: tipos e regras puras de acesso, fluxo, prazo, métricas e demonstração.
- lib/actions.ts: comandos do domínio com autorização e validação.
- lib/server.ts: identidade, banco, isolamento, revisão global, tokens e limitação.
- lib/files.ts: validação de upload e armazenamento.
- lib/webhooks.ts: validação de destino, assinatura e processamento de tentativas.
- db/schema.ts e drizzle/: schema e migrações.
- tests/: regras de negócio, webhook com rede substituída e integração HTTP com D1/R2 locais.

## Persistência e concorrência

Empresas, vínculos, links públicos, limites, segredos de webhook e entregas de webhook possuem tabelas próprias. O estado operacional de cada empresa é um documento JSON, com uma revisão inteira. Uma transação D1 grava o novo estado somente se a revisão ainda corresponder à lida; atualizações de perfis e outbox também condicionam o mesmo estado/revisão. Conflitos retornam 409 e o cliente mantém o rascunho.

Essa escolha viabiliza invariantes fortes em um primeiro incremento: cronômetro único, entrega condicionada, criação por formulário sem duplicação e auditoria atômica. O custo é conflito entre alterações simultâneas mesmo em tarefas diferentes. A normalização do agregado é a próxima mudança de infraestrutura para maior escala.

## Fronteiras de acesso

A plataforma autentica usuários e fornece headers de identidade verificados. O modo de desenvolvimento do template aceita somente loopback e substitui headers externos; o Worker de produção depende da proteção do gateway Sites. Nunca expor o Worker de produção diretamente na internet aceitando headers não confiáveis.

Identidade não concede acesso a organizações existentes. Todas as operações internas carregam vínculo ativo e filtram quadros pelo perfil/equipes/usuários. Seguidores, menções e identificadores não concedem acesso. Tokens de API herdam as permissões atuais do membro e seu escopo. Convidados usam tokens aleatórios específicos com hash, expiração e revogação.

Desde a revisão de acesso, somente o administrador principal configurado pode criar o workspace inicial. Novas contas ficam pendentes e não criam empresas automaticamente. Convites permitem que outra identidade participe da mesma organização depois de validar o e-mail autenticado. O aceite direciona para a organização do convite.

## Datas e dinheiro

Instantes são ISO UTC. Prazo sem horário é AAAA-MM-DD e nunca é convertido como instante; visualização usa meio-dia local para não deslocar o dia. Dias úteis usam o dia local do instante do evento no fuso da empresa e excluem feriados. Custos e orçamentos são centavos inteiros. Sobreposição de registros de tempo do mesmo usuário é rejeitada.

## Uploads e conteúdo

Conteúdo textual é renderizado como texto React, sem HTML arbitrário. Uploads têm tamanho/formato limitados e assinatura básica de formatos binários. Arquivos recebem nomes de armazenamento aleatórios; downloads exigem acesso ao quadro ou seleção explícita do compartilhamento. Downloads usam attachment, no-store e nosniff. A validação não é uma solução de antivírus.

## Integrações

E-mail/WhatsApp/IA estão explicitamente não configurados e não fazem envios. Webhooks só ativam para domínio HTTPS exato liberado no ambiente do servidor. Segredos ficam na tabela server-side e nunca são retornados na leitura do workspace. O destinatário deve deduplicar X-Vamo-Event-Id e validar a assinatura e o timestamp.

Para disponibilizar formulários a anônimos em produção, a barreira externa de hospedagem precisa permitir essas rotas. A demonstração permanece privada até que essa política seja configurada explicitamente.
