# Escopo e estado real da implementação

Os dois documentos fornecidos pelo usuário são a referência funcional. O complemento prevalece sobre o texto principal. A revisão de acesso e paleta está detalhada em ACESSO-E-IDENTIDADE.md. Esta é uma primeira versão utilizável; não equivale à conclusão integral dos 27 tópicos.

## Fluxos implementados

- Empresa isolada por identidade, vínculos, perfis administrador/gestor/colaborador, convites identificados por e-mail com prazo e aceite autenticado. Gestão de perfil, equipe, jornada, ausências e ativação de membros. Proteção do último administrador.
- Quadros com acesso por todos ou combinação de equipes/pessoas; duplicação, arquivamento e restauração. Etapas ordenáveis, limite WIP, destino obrigatório ao excluir etapa ocupada e entregas mantidas ao final.
- Tarefas com título, descrição em texto seguro, prioridade, tipo com snapshot, tags, projeto/cliente, datas, estimativa, campos, checklist, subtarefas, dependências sem ciclos, seguidores, menções por @email, histórico e arquivo lógico.
- Criação, edição com salvamento ao sair do campo, revisão otimista, duplicação, movimentação acessível e por arrastar, seleção em lista, movimentação em lote e transferência entre quadros. Recorrência cria a próxima tarefa após entregar, com intervalo de 1, 7 ou 30 dias.
- Kanban, lista, calendário mensal, cronograma de 30 dias e anexos consolidados sobre os mesmos dados autorizados. Filtros pessoais salvos e ordenação. Preferência pessoal de ordem dos campos neste dispositivo.
- Projetos e clientes com cadastro, tarefas vinculadas, progresso consistente, horas e orçamento. Progresso = entregues / tarefas não arquivadas.
- Cronômetro único persistente por usuário, duração calculada no servidor, registro manual sem sobreposição, relatórios e custos em centavos.
- Formulários editáveis, prévia, perguntas ordenáveis, publicação/desativação, link e iframe, destino e mapeamento, título com fallback, tipo/tags, preservação da submissão original e da versão, upload e chave idempotente. Proteção básica com honeypot, validação e limitação de requisições.
- Arquivos R2 com download autorizado, metadados, etiqueta, finalidade solicitação/entrega, versões, busca por tarefa e visão consolidada. Upload por seleção ou arrastar. Limite técnico de 10 MB e formatos PDF, PNG, JPEG, WebP, TXT e CSV.
- Aprovação por arquivo/versão, aprovador identificado, prazo, decisão, justificativa e histórico. Nova versão obrigatória gera pendência nova e não herda aprovação. Aprovações de versões substituídas ficam no histórico e não bloqueiam a versão atual.
- Compartilhamento de tarefa por destinatário com prévia, seleção de informações/campos/anexos, expiração e revogação. Token aleatório guardado como hash; disponibilizado uma única vez para entrega manual. Novos campos/arquivos privados; opção explícita para futuros arquivos de entrega.
- Portal do convidado com conteúdo restrito, conversa externa, discussão de arquivo, envio de material e decisão de aprovação. Sem acesso a custos, comentários internos ou outras tarefas.
- Entrega exige cronômetro encerrado, dependências, subtarefas, checklist e aprovações obrigatórias concluídos. Bloqueio operacional no servidor. Reabertura por administrador/gestor com justificativa e etapa aberta.
- Regra de prazo ao entrar em etapa com dias úteis/corridos, calendário/fuso da empresa, preservar/substituir prazo, reaplicar/preservar em reentrada e histórico do prazo anterior/aplicado. Execução na mesma gravação da movimentação, sem fila atrasada nem encadeamento de movimentos.
- Dashboard pessoal com cartões selecionáveis, contagens reais, projetos, horas, aprovações, tag Solicitação externa; relatórios de SLA, tempo até entrega, tempo em etapas e NPS separado de avaliação genérica.
- Notificações internas para atribuição, aprovação interna solicitada, menções e novas mensagens para seguidores. Ajuda contextual e checklist retomável.
- API de tarefas com token Bearer, escopo leitura/escrita, expiração, revogação, paginação, validação, limitação e If-Match. Documentação em API.md.
- Webhooks com chave de assinatura no servidor, outbox transacional, HMAC SHA-256, ID idempotente, até 5 tentativas e histórico. HTTPS, domínio permitido exato, validação DNS de destinos públicos e sem redirecionamentos.
- Cadastro persistente de configurações de agentes. Execução retorna erro explícito de não configurado; nenhuma resposta de IA simulada.

## Limitações e pendências de produto

- O domínio operacional usa um agregado JSON por organização com revisão global. É consistente na versão atual, mas uma alteração simultânea em outra tarefa pode causar conflito legítimo. Para escala de produção, normalizar tarefas/comentários/tempos e adicionar índices, buscas e revisões por entidade.
- A interface está em pt-BR. A preferência de idioma ainda não oferece tradução para outros idiomas.
- A descrição usa texto simples seguro; editor de texto rico ainda não implementado.
- Calendário semanal, arrastar prazos no calendário/Gantt, prévia completa de impacto em dependências, agrupamento do Gantt e colunas de lista configuráveis ainda pendentes.
- Existe modelo inicial de Marketing e fluxo padrão para novos quadros. Catálogo dedicado de modelos Desenvolvimento, Atendimento, Administrativo e Projetos gerais ainda pendente.
- Subtarefas existem como tarefas vinculadas; navegação hierárquica aprofundada ainda pendente.
- Projetos/clientes têm cadastro e vinculação. Edição completa, contatos múltiplos, permissões independentes por projeto e status avançados ainda pendentes. Projetos consultáveis são derivados das tarefas autorizadas, da gestão do projeto ou do perfil administrador.
- Distribuição dinâmica de responsáveis e passagem automática entre etapas ainda pendentes. Formulários usam responsável fixo ou ficam sem responsável.
- Formulários não oferecem ainda portal agregador público. A proteção atual não substitui CAPTCHA/verificação de e-mail em cenários de alto abuso.
- Preferência pessoal de ordem dos campos usa armazenamento local. Dashboard permite escolher cartões e sua sequência por inclusão, sem editor livre de posição/tamanho.
- Campos da empresa oferecem cadastro; migração de tipo, exclusão e permissões/obrigatoriedade por escopo ainda pendentes. Seleção múltipla em edição de tarefa tem apresentação textual simples; formulários usam seleção múltipla nativa.
- Edição autorizada de tempo com trilha antes/depois ainda pendente. O custo usa a taxa atual da pessoa, não uma taxa histórica por registro.
- Automações gerais de gatilho-condições-ações, dias/horas com horário limite, regras por evento de criação/alteração/aprovação/inatividade e agendamentos de prazos ainda pendentes. A primeira versão executa somente regras de prazo por entrada em etapa.
- Reações e respostas encadeadas a comentários ainda pendentes. Menções usam @email, sem autocomplete.
- Notificações de aproximação/vencimento, decisão de aprovação e preferências individuais detalhadas ainda pendentes.
- WhatsApp sem provedor configurado: verificação de telefone, envio, deduplicação e registro por provedor ainda precisam do adaptador. Não há simulação de envio.
- Adaptadores de e-mail e IA ainda não foram implementados: além das credenciais, precisam da conexão com o provedor. Convites e links são entregues manualmente. IA possui apenas configuração e bloqueio explícito de execução.
- Os webhooks enviam payload mínimo (evento, ID da organização e tarefa). Não incluem automaticamente comentários/arquivos/custos. Novas tentativas rodam em próximas ações ou pela ação manual; o handler scheduled está pronto, mas a agenda da hospedagem não é provisionada automaticamente.
- E-mail e senha, sessão própria e cadastro sujeito à aprovação foram implementados na revisão de acesso. Recuperação por e-mail ainda não implementada; provedores vinculados continuam oferecendo entrada. Não há credencial fixa.
- A hospedagem foi encontrada pública na revisão de acesso e sua audiência foi preservada. Rotas internas continuam protegidas pelo login/aprovação e pelas permissões. Google depende das credenciais do cliente OAuth.
- Não foram realizados teste de carga, auditoria independente, antivírus de arquivos ou certificação de conformidade. A publicação é uma demonstração funcional para avaliação.

Não há cobrança, assinaturas ou limites comerciais.
