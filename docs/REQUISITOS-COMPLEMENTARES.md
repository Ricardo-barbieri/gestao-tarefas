## Complemento obrigatório: configurações e regras operacionais

Integre os requisitos abaixo ao escopo principal. Este complemento detalha os comportamentos do sistema e prevalece nos pontos em que o prompt anterior for genérico.

### 1. Configuração inicial da empresa

Implemente um assistente inicial para:

- Configurar nome da empresa, idioma e fuso horário.
- Definir dias úteis, jornada e calendário de feriados.
- Criar equipes e convidar pessoas.
- Criar o primeiro quadro a partir de um modelo ou em branco.
- Configurar etapas, tipos de tarefa e formulário de entrada.
- Mostrar uma prévia do fluxo antes de concluir.

Permita retomar etapas incompletas e acessar essas configurações posteriormente.

### 2. Permissões dos quadros

Cada quadro poderá estar disponível para:

- Todos os membros internos da empresa.
- Equipes selecionadas.
- Usuários selecionados.
- Uma combinação de equipes e usuários.

O acesso concedido por equipe deve acompanhar a entrada e saída de membros. Se uma pessoa continuar autorizada por outro vínculo, preserve seu acesso.

Ser seguidor de uma tarefa, receber uma menção ou conhecer seu endereço não concede acesso automaticamente.

### 3. Etapas abertas e de entrega

Diferencie:

- Etapas abertas: permitem execução e edição conforme as permissões.
- Etapas de entrega: representam a conclusão do fluxo e bloqueiam alterações operacionais.

Mantenha as etapas de entrega ao final do quadro.

Ao entregar uma tarefa:

- Verifique bloqueios e aprovações obrigatórias.
- Exija encerrar um cronômetro ativo antes de concluir.
- Registre autor, data e etapa de entrega.
- Preserve histórico, anexos e registros de tempo.

Permita reabertura somente por usuário autorizado, com justificativa e escolha da etapa de retorno.

Defina explicitamente quais interações continuam permitidas após a entrega. Por padrão, mantenha consulta e histórico disponíveis; alterações operacionais exigem reabertura.

### 4. Tipos de tarefa

Crie um cadastro de tipos de tarefa por empresa com:

- Nome.
- Cor.
- Descrição.
- Estimativa padrão de duração.
- Estado ativo ou inativo.

Diferencie tipo de tarefa, prioridade e tags.

Ao selecionar um tipo, aplique sua estimativa apenas quando a tarefa ainda não tiver uma estimativa definida. Para substituir uma estimativa existente, solicite confirmação.

Alterações no cadastro não devem modificar silenciosamente tarefas antigas.

### 5. Organização e salvamento dos campos

Permita reordenar os campos da tarefa em uma configuração padrão do quadro. Preferências pessoais de exibição podem sobrescrever essa ordem sem afetar outras pessoas.

Campos de sistema indispensáveis devem preservar sua função, mesmo quando sua posição mudar.

Implemente salvamento automático nos campos apropriados, com indicação de:

- Salvando.
- Salvo.
- Falha ao salvar.

Uma falha não pode apagar o conteúdo digitado. Trate edições concorrentes para evitar sobrescrita silenciosa.

Inclua campo personalizado de avaliação com escala configurável. Se houver pesquisa NPS, utilize escala de 0 a 10 e cálculo próprio, separadamente de avaliações genéricas.

### 6. Gestão de anexos

Disponibilize:

- Upload por seleção e por arrastar e soltar.
- Nome, autor, data, tamanho e tipo de arquivo.
- Etiquetas.
- Busca e filtros.
- Conversa específica por anexo.
- Histórico de versões.
- Visibilidade interna ou compartilhada.
- Visão consolidada dos anexos do quadro.

A visão consolidada deve respeitar o acesso à tarefa de origem.

Diferencie arquivos enviados na solicitação de arquivos produzidos como entrega.

### 7. Configuração dos formulários

Cada pergunta terá:

- Rótulo apresentado ao solicitante.
- Instrução ou descrição.
- Tipo de resposta.
- Obrigatoriedade.
- Campo interno de destino, quando aplicável.

O rótulo público pode ser diferente do nome interno do campo.

Exemplo:

- Campo interno: “Impacto da demanda”.
- Pergunta pública: “Quanto esta solicitação está afetando seu trabalho?”.

Cada formulário permitirá configurar:

- Quadro e etapa de entrada.
- Tipo de tarefa.
- Tags automáticas.
- Responsável ou regra de distribuição.
- Padrão do título da tarefa.
- Mapeamento de respostas.
- Mensagem de confirmação.
- Publicação e desativação.
- Link público e código de incorporação por iframe.

O título poderá utilizar texto fixo e respostas de campos permitidos. A configuração deverá ter prévia e regra de fallback para valores ausentes.

Preserve a submissão original com data e versão do formulário. Gere uma cópia legível para consulta na tarefa, sem alterar retroativamente as respostas quando o formulário for editado.

Diferencie prazo desejado pelo solicitante de prazo assumido pela equipe. Permita configurar se o primeiro será usado inicialmente como prazo da tarefa.

### 8. Compartilhamento externo por tarefa

Permita compartilhar uma tarefa com destinatários identificados por e-mail e configurar quais informações serão expostas, como:

- Descrição ou cópia da solicitação.
- Etapa e andamento.
- Prazo desejado.
- Prazo assumido.
- Campos personalizados selecionados.
- Anexos selecionados.
- Conversa externa.
- Solicitações de aprovação.

Mostre uma prévia da visão do convidado antes de confirmar o compartilhamento.

O convidado não pode acessar comentários internos, custos, outras tarefas ou arquivos não compartilhados.

Ofereça acesso por link seguro enviado ao e-mail, sem exigir cadastro completo. Implemente expiração, revogação e identificação adequada do destinatário.

Novos campos e anexos devem permanecer privados por padrão. O compartilhamento automático de anexos futuros será uma configuração explícita e restrita aos arquivos destinados à entrega.

### 9. Conversas e aprovações por arquivo

Mantenha contextos distintos para:

- Comentários internos da tarefa.
- Conversa compartilhada com convidados.
- Discussão de um anexo específico.

Identifique claramente o público de cada mensagem.

Permita solicitar aprovação de um arquivo ou versão específica, com:

- Aprovador.
- Prazo.
- Estado.
- Comentário da decisão.
- Data e identificação de quem respondeu.

Uma nova versão deve gerar uma nova aprovação pendente quando a validação for obrigatória. A aprovação antiga permanece no histórico e não aprova automaticamente o novo arquivo.

A aprovação de um arquivo não equivale automaticamente à aprovação de toda a tarefa.

### 10. Prazos relativos e dias úteis

Implemente automações como:

“Quando a tarefa entrar na etapa Fazendo, definir o prazo para cinco dias úteis após a movimentação.”

Permita configurar:

- Evento de referência.
- Quantidade de dias ou horas.
- Dias corridos ou úteis.
- Calendário da empresa.
- Horário limite.
- Comportamento quando já existir prazo.
- Comportamento quando a tarefa entrar novamente na etapa.

Use o instante do evento como referência, mesmo que a automação seja processada depois.

Registre o prazo anterior, o prazo aplicado e a regra responsável pela alteração.

### 11. Filtros e dashboards pessoais

Filtros salvos devem pertencer ao usuário e preservar quadro, condições e ordenação.

Cada usuário poderá montar seu dashboard com cartões de métricas, filtros e posição dos componentes.

Exemplo de métrica:

“Total de tarefas com a tag Solicitação externa.”

As métricas devem considerar apenas os dados que o usuário está autorizado a consultar.

Uma visualização só será compartilhada mediante uma ação explícita.

### 12. WhatsApp

Prepare uma integração opcional para notificações de atribuição e outros eventos selecionados.

Inclua:

- Telefone verificado.
- Preferências do usuário.
- Provedor configurável.
- Registro de entrega.
- Tratamento de falhas.
- Controle de duplicidade.

Sem provedor e credenciais, apresente a integração como não configurada. Não simule envios reais.

### 13. Orientação ao usuário

Inclua:

- Dicas contextuais.
- Estados vazios explicativos.
- Exemplos de configuração.
- Checklist inicial.
- Ajuda sobre quadros, etapas, tarefas e projetos.

Permita dispensar e reabrir a orientação.

### 14. Cenário adicional de validação

Valide este fluxo completo:

1. Um gestor cria um quadro de Marketing com acesso à equipe de Marketing e a um usuário específico.
2. Configura as etapas Entrada, Fazendo, Em aprovação e Entregue.
3. Cria o tipo de tarefa “Criação de arte”, com estimativa padrão.
4. Publica um formulário com briefing, impacto, prazo desejado e anexo.
5. Uma pessoa externa envia uma solicitação.
6. O sistema cria a tarefa com tipo, tags e campos corretos e preserva a submissão original.
7. Ao entrar em Fazendo, uma automação define o prazo em cinco dias úteis.
8. A equipe registra tempo e envia um arquivo de entrega.
9. O solicitante recebe acesso apenas às informações selecionadas.
10. O solicitante conversa sobre o arquivo e aprova sua versão.
11. A equipe entrega a tarefa, que fica bloqueada para alterações operacionais.
12. Um usuário autorizado reabre a tarefa com justificativa.
13. Histórico, indicadores e permissões refletem todo o fluxo corretamente.

Incorpore este complemento ao plano e à implementação. Não acrescente cobrança, assinaturas ou limites comerciais copiados do Runrun.it sem uma solicitação específica.