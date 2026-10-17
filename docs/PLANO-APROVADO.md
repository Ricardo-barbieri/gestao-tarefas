# Plano aprovado — versão local para revisão

Aprovação: 17/10/2026. Branch: `feature/plano-aprovado`.
Não publicar antes da revisão e aprovação da versão de teste.

## Direção visual preservada

Branco quente #FBF9F8, bege #F0ECE5, laranja #E47251, laranja escuro #A74229, texto #1F1814, secundário #675B52. Avenir Next / Segoe UI / sistema. Conteúdo alinhado à esquerda, tarefas e prazos como prioridade visual.

```
Trabalho ▾        Buscar tarefas               Minha conta
  Visão geral     Meu trabalho           + Nova tarefa
  Meu trabalho    Quadro selecionado
  Quadros         Entrada | Fazendo | Em aprovação | Entregue
Gestão ▾          Somente tarefas atribuídas à pessoa no Kanban pessoal
Administração ▾
```

O bege segue a referência do proprietário. O menu representa áreas reais, com estado expansível persistido por pessoa. A correção do login conserva um único indicador de foco acessível, sem eliminar a orientação por teclado.

## Implementação

- Menu expansível por grupo. Removido o falso seletor de empresa. Notificações, conta e saída mantidos.
- Meu trabalho por quadro e etapas reais, somente atribuições próprias; detalhes acessíveis pelo cartão e teclado; projeto e gestor destacados e clicáveis.
- Novas tarefas: início +1 dia corrido, prazos +5 dias corridos, fuso da empresa, prioridade Normal, impacto 1, sem projeto/cliente/checklist por padrão e criador acompanhando. Formulários preservam parâmetros explicitamente configurados.
- Empresa nova sem demonstração fictícia: pt-BR, oito horas diárias e São Paulo. Empresas existentes preservadas.
- Catálogo de tarefas por área e funções profissionais separadas de perfil de acesso; novas funções podem ser cadastradas pelo administrador.
- Administrações plenas na empresa; gestores gerenciam colaboradores das suas equipes sem promover administradores ou ampliar o próprio acesso. Bloqueios e permissões aplicados no servidor.
- Cadastro direto, ativação de senha por link de uso único e aprovação exclusiva do admin master para cadastros preparados por outros perfis. Entrega do link é manual enquanto envio de e-mail não estiver configurado.
- Google e Apple preparados com validação criptográfica, state, nonce, sessão e aprovação. Vinculação explícita, proteção contra troca de contas e desconexão condicionada a senha própria.
- Google Calendar separado do login. Escolha de agenda, credenciais cifradas, eventos idempotentes, atualizações por fila e importação de feriados de calendário selecionado. Reuniões têm data, horário e duração opcionais.
- Dashboard individual para todos os perfis, escolha, ordem e restauração dos indicadores.
- Removidos da interface: Primeiros passos, Agentes de IA, WhatsApp e configuração de API/webhooks. Dados históricos e endpoints de API existentes preservados; nenhuma nova integração de API foi ativada.

## Limites e requisitos antes de produção

O proprietário informou não ter Google Cloud nem Apple Developer. Assim, o código está preparado, mas não houve autenticação real com esses provedores nem sincronização com agendas reais. Os controles ficam indisponíveis até a configuração descrita em GOOGLE-APPLE-CALENDAR.md.

A fila inicia em alterações do sistema e em Sincronizar agora. Retentativas sem tráfego e continuidade de lotes grandes exigem um gatilho periódico na hospedagem para o handler scheduled. Recomenda-se um intervalo de cinco minutos; a configuração será feita na etapa de publicação autorizada. O worker interrompe lotes longos e preserva progresso para a próxima execução.

Desconectar agenda remove credenciais locais e interrompe novos envios; eventos já enviados ficam na conta Google. A sincronização é de uma direção. Alterações feitas no Google não alteram tarefas no Vamo.

Datas de tarefa são datas locais, não horários exatos. “+1 dia” significa o próximo dia do calendário da empresa. Reuniões têm horário explícito no fuso da empresa.

A aprovação em produção, a configuração dos provedores e testes de consentimento reais são etapas pendentes. Não há migração de dados nem mudança de permissões em produção nesta entrega.
