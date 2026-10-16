Você será responsável por projetar e desenvolver meu sistema próprio de gestão de trabalho, projetos e processos, inspirado nas funcionalidades do Runrun.it.

Quero uma aplicação funcional, com dados persistentes, regras de negócio e fluxos completos. A interface deve ser original, em português do Brasil, responsiva e fácil de usar.

Use o Runrun.it como referência funcional. Crie nossa própria identidade visual, textos, componentes e experiência, sem copiar sua marca ou seus materiais.

## 1. Objetivo do produto

Centralizar a operação de uma empresa em uma plataforma que permita:

- Receber e organizar demandas.
- Gerenciar tarefas, projetos e processos.
- Distribuir trabalho entre pessoas e equipes.
- Acompanhar prazos, prioridades e capacidade.
- Registrar tempo e custos.
- Centralizar conversas, arquivos e aprovações.
- Colaborar com clientes e convidados externos.
- Automatizar atividades repetitivas.
- Acompanhar indicadores operacionais.
- Incorporar agentes de IA ao fluxo de trabalho.

O fluxo principal será:

Solicitação → triagem → planejamento → execução → aprovação → entrega → análise dos resultados.

## 2. Como você deve trabalhar

Primeiro, examine o ambiente e o repositório existente. Respeite instruções locais e aproveite o que já estiver implementado.

Se o projeto estiver vazio, escolha uma arquitetura moderna, estável e adequada ao produto. Como preferência inicial, considere:

- Next.js e TypeScript.
- PostgreSQL.
- Prisma ou equivalente compatível.
- Tailwind CSS e componentes acessíveis.
- Uma solução consolidada de autenticação.
- Armazenamento de arquivos compatível com S3.
- Uma solução de processamento em segundo plano para automações e notificações.

Valide a compatibilidade das versões antes de instalar dependências. Caso o ambiente indique outra arquitetura, adapte-se e explique brevemente a decisão.

Não interrompa o desenvolvimento para perguntar sobre escolhas rotineiras. Adote padrões sensatos e documente suas premissas. Pergunte apenas quando faltar uma informação indispensável ou uma autorização para uma ação externa.

Antes de implementar:

1. Apresente um plano breve.
2. Defina os módulos e a arquitetura.
3. Registre o escopo e a sequência de implementação.
4. Comece a desenvolver imediatamente.

Não encerre o trabalho apenas com planejamento, documentação, telas estáticas ou exemplos de código.

## 3. Modelo organizacional

O sistema deve suportar múltiplas empresas com isolamento de dados.

Estrutura principal:

- Empresa ou organização.
- Usuários e vínculos com a empresa.
- Equipes.
- Clientes.
- Projetos.
- Quadros.
- Etapas.
- Tarefas e subtarefas.

Diferencie os conceitos:

- Quadro organiza o fluxo operacional.
- Etapa representa uma fase do fluxo.
- Projeto agrupa tarefas relacionadas a um objetivo ou entrega.
- Cliente identifica a organização ou pessoa atendida.
- Tarefa representa uma unidade de trabalho.

Um projeto pode reunir tarefas de diferentes quadros. Uma tarefa pode pertencer a um projeto e a um cliente, mas deve estar em apenas um quadro e uma etapa por vez.

Projete a estrutura para uma pessoa poder participar de mais de uma empresa com permissões diferentes.

## 4. Autenticação e permissões

Implemente:

- Login e logout.
- Recuperação de acesso conforme o provedor escolhido.
- Convites para participar da empresa.
- Gestão de membros.
- Perfis de administrador, gestor, colaborador e convidado externo.
- Controle de acesso a quadros e projetos.
- Verificação de permissões no servidor.

Regras iniciais:

- Administrador gerencia a organização, usuários e configurações.
- Gestor administra os espaços sob sua responsabilidade.
- Colaborador acessa e executa o trabalho autorizado.
- Convidado acessa apenas tarefas ou projetos explicitamente compartilhados.

Comentários internos, custos e informações privadas devem permanecer inacessíveis aos convidados.

## 5. Navegação principal

Crie uma navegação clara com:

- Visão geral.
- Meu trabalho.
- Quadros.
- Projetos.
- Clientes.
- Equipes e capacidade.
- Formulários.
- Automações.
- Relatórios.
- Notificações.
- Configurações.

Inclua pesquisa global respeitando as permissões do usuário.

## 6. Quadros e etapas

Permita:

- Criar, editar, duplicar e arquivar quadros.
- Criar quadros a partir de modelos.
- Definir membros e acesso.
- Criar, renomear, ordenar e excluir etapas.
- Classificar etapas como entrada, trabalho em andamento ou conclusão.
- Definir limites de trabalho em andamento por etapa.
- Configurar visualmente o fluxo.

Ao excluir uma etapa com tarefas, exija a escolha de uma etapa de destino para preservar os dados.

Modelos iniciais:

- Marketing.
- Desenvolvimento.
- Atendimento interno.
- Administrativo.
- Projetos gerais.

## 7. Gestão de tarefas

Cada tarefa deve conter:

- Identificador legível.
- Título.
- Descrição com formatação.
- Quadro e etapa.
- Projeto e cliente opcionais.
- Criador.
- Responsável principal.
- Colaboradores.
- Seguidores.
- Prioridade.
- Data de início.
- Prazo.
- Estimativa de esforço.
- Tempo registrado.
- Tags.
- Campos personalizados.
- Checklist.
- Subtarefas.
- Dependências.
- Anexos.
- Comentários.
- Histórico de alterações.
- Estado de aprovação, quando aplicável.

Permita:

- Criar, editar, duplicar, arquivar e restaurar tarefas.
- Mover tarefas entre etapas.
- Transferir tarefas entre quadros com tratamento dos campos incompatíveis.
- Alterar várias tarefas em uma única ação.
- Filtrar, ordenar e salvar visualizações.
- Acompanhar tarefas atrasadas, bloqueadas ou sem responsável.
- Definir recorrência.
- Organizar a passagem de responsabilidade entre etapas.
- Identificar dependências que impedem o início ou a conclusão.

Use arquivamento como ação padrão para remoção cotidiana. Exclusões permanentes devem ter confirmação explícita.

## 8. Visualizações

Implemente visualizações sobre os mesmos dados:

### Kanban

- Colunas por etapa.
- Movimentação por arrastar e soltar.
- Alternativa acessível para mover tarefas.
- Cartões com informações essenciais.
- Destaques de atraso, prioridade e bloqueio.
- Quantidade de tarefas por etapa.
- Filtros e ações em massa.

### Lista

- Colunas configuráveis.
- Ordenação e filtros.
- Seleção múltipla.
- Edição rápida de campos apropriados.

### Calendário

- Tarefas posicionadas por prazo.
- Navegação mensal e semanal.
- Alteração de prazo conforme a permissão.

### Cronograma ou Gantt

- Início e término das tarefas.
- Dependências.
- Agrupamento por projeto ou responsável.
- Indicação de conflitos e atrasos.
- Reprogramação com prévia dos impactos.

Não altere silenciosamente prazos de tarefas dependentes.

## 9. Meu trabalho

Crie uma área pessoal com:

- Minhas tarefas.
- Hoje.
- Próximos dias.
- Atrasadas.
- Sem prazo.
- Aguardando minha aprovação.
- Tarefas que acompanho.
- Registros de tempo.

Permita ordenar por prioridade, prazo, projeto e etapa.

## 10. Projetos e clientes

Projetos devem ter:

- Nome e descrição.
- Cliente.
- Gestor.
- Equipe.
- Status.
- Datas.
- Orçamento opcional.
- Estimativa de horas.
- Tarefas vinculadas.
- Progresso.
- Horas consumidas.
- Custos.
- Atividade recente.

Clientes devem ter cadastro, contatos e visão dos projetos e tarefas relacionados.

Explique como o progresso do projeto é calculado e use a mesma regra em todas as telas.

## 11. Registro de tempo e custos

Implemente:

- Iniciar e parar cronômetro.
- Registro manual.
- Edição autorizada dos registros.
- Histórico das alterações.
- Relatórios por pessoa, tarefa, projeto, cliente e período.
- Comparação entre estimado e realizado.
- Custo por hora com acesso restrito.

Regras:

- Um usuário não pode manter dois cronômetros ativos simultaneamente.
- O cronômetro deve sobreviver ao recarregamento da página.
- A duração deve ser calculada por registros confiáveis no servidor.
- Defina e documente como tratar sobreposição de registros.
- Valores monetários devem usar representação decimal adequada.

## 12. Capacidade da equipe

Permita configurar:

- Jornada semanal.
- Dias úteis.
- Feriados.
- Férias e ausências.
- Capacidade disponível por pessoa.

Mostre:

- Horas disponíveis.
- Horas planejadas.
- Percentual de ocupação.
- Sobrecarga.
- Disponibilidade por período.

Use uma regra explícita para distribuir esforço estimado no calendário. Diferencie tarefas sem estimativa para evitar indicadores enganosos.

## 13. Formulários e portal de solicitações

Crie um construtor de formulários com:

- Texto curto e longo.
- Número.
- Data.
- Seleção única e múltipla.
- Checkbox.
- E-mail.
- Upload de arquivos.
- Campos obrigatórios.
- Ordem e instruções dos campos.

Cada formulário deve permitir configurar:

- Quadro e etapa de destino.
- Mapeamento das respostas para campos da tarefa.
- Responsável ou regra de distribuição.
- Mensagem de confirmação.
- Acesso interno ou público.
- Publicação e desativação.

Implemente também:

- Link público.
- Portal reunindo formulários publicados.
- Histórico de respostas.
- Exportação CSV.
- Proteção contra abuso em formulários públicos.
- Estrutura para incorporação em outras páginas.

Cada envio válido deve gerar uma tarefa completa sem duplicações por reenvio acidental.

## 14. Colaboração e convidados

Implemente:

- Comentários nas tarefas.
- Menções.
- Respostas em conversa.
- Reações simples.
- Anexos.
- Seguidores.
- Notificações.
- Histórico de movimentações.

Diferencie claramente:

- Comentário interno.
- Mensagem compartilhada com convidados.

O convidado deve ter um portal simples para acompanhar os itens compartilhados, comentar, anexar arquivos e responder a aprovações.

Convites e links de acesso devem permitir revogação e ter regras adequadas de expiração.

## 15. Aprovações

Permita solicitar aprovação de uma tarefa ou entrega.

Inclua:

- Aprovadores internos ou externos.
- Prazo da aprovação.
- Estados pendente, aprovado, ajustes solicitados e cancelado.
- Justificativa.
- Registro de quem decidiu e quando.
- Identificação da entrega ou versão aprovada.
- Bloqueio opcional da conclusão enquanto houver aprovação pendente.

Comece com aprovação simples e prepare a estrutura para aprovação sequencial e paralela.

## 16. Campos personalizados

Permita criar campos de:

- Texto.
- Número.
- Data.
- Seleção única.
- Seleção múltipla.
- Booleano.
- Moeda.

Configure:

- Nome.
- Descrição.
- Obrigatoriedade.
- Escopo.
- Opções.
- Permissão de edição.

Os campos devem funcionar em tarefas, formulários, filtros e automações. Mudanças de tipo ou exclusão devem preservar a integridade dos dados existentes.

## 17. Automações

Crie um mecanismo baseado em gatilho, condições e ações.

Gatilhos iniciais:

- Tarefa criada.
- Mudança de etapa.
- Mudança de responsável.
- Alteração de campo.
- Aproximação ou vencimento do prazo.
- Período sem atividade.
- Envio de formulário.
- Decisão de aprovação.

Ações iniciais:

- Atribuir responsável.
- Mover etapa.
- Alterar prioridade.
- Definir prazo.
- Atualizar campo.
- Adicionar comentário.
- Solicitar aprovação.
- Enviar notificação.
- Criar tarefa ou subtarefa.

Inclua:

- Ativação e desativação.
- Histórico de execuções.
- Status e erros.
- Proteção contra ciclos.
- Limite de encadeamento.
- Execução idempotente.
- Tratamento de tentativas e falhas.

Não apresente uma automação como concluída sem executar de fato suas ações.

## 18. Dashboards e relatórios

Crie indicadores para:

- Tarefas abertas e concluídas.
- Tarefas atrasadas.
- Distribuição por etapa.
- Demandas por responsável.
- Horas estimadas e realizadas.
- Capacidade e sobrecarga.
- Tempo até a conclusão.
- Tempo por etapa.
- Cumprimento de prazo e SLA.
- Custos por projeto e cliente.
- Aprovações pendentes.

Inclua filtros por período, equipe, pessoa, projeto, cliente e quadro.

Documente as fórmulas dos indicadores, inclusive o tratamento de tarefas reabertas, canceladas e arquivadas.

Use dados reais da aplicação. Dados de demonstração devem estar claramente identificados.

## 19. Notificações

Implemente uma central de notificações com:

- Atribuição de tarefa.
- Menção.
- Aprovação solicitada.
- Aprovação respondida.
- Prazo próximo.
- Atraso.
- Atualização relevante de item acompanhado.

Permita marcar como lida e configurar preferências.

Prepare envio de e-mails por um provedor configurável. Sem credenciais, disponibilize uma forma local de verificar os envios e identifique essa limitação com clareza.

## 20. Integrações e API

Prepare uma API documentada para os recursos principais.

Inclua:

- Autenticação adequada.
- Tokens com escopo e revogação.
- Paginação.
- Validação.
- Limitação de requisições.
- Erros consistentes.
- Verificação de permissões.

Implemente webhooks para eventos principais com:

- Assinatura.
- Registro das entregas.
- Novas tentativas.
- Proteção contra destinos de rede indevidos.

Disponibilize exportação CSV. Estruture o produto para futuras integrações com calendários, ferramentas de automação e BI.

## 21. Agentes de IA

Prepare um módulo para agentes configuráveis com:

- Nome e finalidade.
- Instruções.
- Provedor e modelo.
- Entradas permitidas.
- Formato de saída.
- Histórico de execuções.
- Status, custo e consumo quando disponíveis.
- Permissões e limites.

Casos iniciais:

- Resumir um briefing.
- Identificar informações faltantes.
- Sugerir subtarefas.
- Gerar um relatório de andamento.
- Analisar anexos compatíveis.
- Sugerir uma revisão da entrega.

Regras:

- Respeitar o acesso aos dados da empresa e do usuário.
- Tratar conteúdo de tarefas e anexos como dados, não como instruções de sistema.
- Não executar ações externas ou alterações relevantes sem uma regra explícita de autorização.
- Registrar mudanças executadas.
- Proteger credenciais no servidor.

Sem credenciais de IA, deixe o módulo preparado e explique como ativá-lo. Não simule uma resposta como se tivesse sido gerada por um serviço real.

## 22. Experiência e identidade visual

Crie uma interface profissional, consistente e original.

Direção visual:

- Visual limpo.
- Boa hierarquia de informação.
- Tipografia legível.
- Cores com contraste adequado.
- Componentes consistentes.
- Sidebar organizada.
- Navegação rápida.
- Estados claros de carregamento, erro, vazio e sucesso.
- Formulários com validação compreensível.
- Boa experiência em desktop e celular.

A área de tarefa deve facilitar a leitura e a edição sem exigir navegação excessiva.

Use um nome provisório facilmente substituível para o produto. Não dependa de uma decisão de marca para avançar.

## 23. Segurança e integridade

Implemente desde o início:

- Isolamento entre empresas em todas as operações.
- Autorização no servidor.
- Validação de entradas.
- Proteção contra acesso indevido por identificadores.
- Tratamento seguro de conteúdo formatado.
- Uploads com limites e verificação de tipos.
- Downloads autorizados.
- Segredos fora do código e dos logs.
- Registro de auditoria para ações relevantes.
- Transações em alterações que exigem consistência.
- Controle de concorrência onde necessário.
- Política consistente de datas, horários e fusos.

Armazene instantes de tempo em UTC e exiba conforme o fuso configurado. Trate prazos sem horário como datas locais, evitando mudanças de dia por conversão de fuso.

Não declare certificações ou conformidade legal sem evidências.

## 24. Ordem de implementação

Organize o desenvolvimento em incrementos utilizáveis:

1. Fundação: banco, autenticação, empresas e permissões.
2. Operação central: quadros, etapas, tarefas e Meu trabalho.
3. Projetos, clientes, comentários e anexos.
4. Registro de tempo e relatórios básicos.
5. Formulários e convidados.
6. Aprovações e campos personalizados.
7. Calendário, Gantt e capacidade.
8. Automações e notificações.
9. API, webhooks e módulo de IA.
10. Refinamento visual e validação final.

Implemente cada incremento de ponta a ponta, com persistência e autorização.

Se houver restrição real do ambiente, conclua o máximo de fluxos utilizáveis, registre precisamente o que falta e informe o bloqueio. Não trate estruturas vazias ou botões sem ação como funcionalidades entregues.

## 25. Dados de demonstração

Crie um ambiente demonstrativo reproduzível com:

- Uma empresa fictícia.
- Equipes.
- Usuários com diferentes perfis.
- Clientes.
- Projetos.
- Quadros e etapas.
- Tarefas em diferentes situações.
- Comentários.
- Registros de tempo.
- Solicitações e aprovações.

Não utilize dados pessoais reais nem credenciais fixas inseguras em produção.

## 26. Verificação

Execute verificações proporcionais ao risco, incluindo:

- Compilação.
- Análise estática.
- Migrações.
- Validação dos principais fluxos.
- Testes de permissões.
- Testes de isolamento entre empresas.
- Testes do cronômetro.
- Testes de criação de tarefa por formulário.
- Testes de aprovação.
- Testes de automação e prevenção de ciclos.

Valide a interface no navegador em desktop e celular, quando o ambiente permitir.

Um fluxo obrigatório de validação deve demonstrar:

1. Criar uma demanda por formulário.
2. Encontrar a tarefa no quadro correto.
3. Atribuir o responsável.
4. Mover a tarefa para execução.
5. Registrar tempo.
6. Comentar e anexar material.
7. Solicitar aprovação.
8. Aprovar como usuário autorizado.
9. Concluir a tarefa.
10. Ver os resultados nos indicadores.

Verifique também que um convidado e um usuário de outra empresa não conseguem acessar informações restritas.

## 27. Entrega esperada

Ao final, disponibilize:

- Código organizado e funcional.
- Banco e migrações.
- Dados demonstrativos.
- Arquivo de exemplo das variáveis de ambiente, sem segredos.
- Instruções simples para executar.
- Documentação das decisões principais.
- Resultado das verificações executadas.
- Lista precisa de integrações que dependem de credenciais.
- Limitações e pendências reais.

Na resposta final, informe:

- O que foi implementado.
- Como abrir e usar o sistema.
- Como acessar a demonstração.
- O que foi validado.
- O que ainda depende de configuração.

Comece agora examinando o ambiente, escolhendo a arquitetura adequada e implementando a primeira parte funcional. Continue trabalhando até entregar o escopo ou encontrar um bloqueio concreto que exija minha participação.