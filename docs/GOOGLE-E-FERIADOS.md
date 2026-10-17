# Google, agenda e feriados no Vamo

## 1. Entrar com Google

O login Google usa a autenticação da própria conta Google. O Vamo não recebe sua senha do Gmail. Quem prefere e-mail e senha continua usando a senha cadastrada no Vamo. Nos dois casos, novos usuários precisam da aprovação do admin master.

Configuração única do proprietário:

1. Entre em https://console.cloud.google.com/ com sua conta e crie um projeto chamado Vamo.
2. Em **Google Auth Platform → Branding**, configure nome do aplicativo, e-mail de suporte e contato.
3. Em **Audience**, escolha **External** se for usar Gmail pessoal ou usuários de fora da sua organização Google Workspace. Enquanto estiver em **Testing**, adicione seu Gmail e as contas que testarão o sistema à lista de usuários de teste.
4. Em **Clients → Create client**, escolha **Web application**.
5. Cadastre este endereço em **Authorized redirect URIs**, exatamente:

   `https://vamo-gestao-rb.daringstork16.chatgpt.site/api/auth/google/callback`

6. Guarde o Client ID e o Client secret. Configure no ambiente seguro do servidor, sem colocar no GitHub nem em arquivos públicos:

   - `GOOGLE_CLIENT_ID`: ID fornecido pelo Google.
   - `GOOGLE_CLIENT_SECRET`: segredo fornecido pelo Google.
   - `APP_ORIGIN`: `https://vamo-gestao-rb.daringstork16.chatgpt.site` (já configurado).

7. Com a configuração aplicada, entre no Vamo por e-mail, abra **Minha conta → Contas vinculadas → Vincular Google** e autorize sua conta. Depois poderá usar **Entrar com Google**. O cadastro associado ao mesmo e-mail permanece o mesmo.

Não envie o Client secret, sua senha, códigos de verificação ou tokens pelo chat. Se o Google exigir verificação de domínio para liberar a configuração externa, use um domínio próprio sob seu controle; o endereço de retorno e APP_ORIGIN precisarão acompanhar esse domínio.

## 2. Autorizar Google Calendar

No mesmo projeto:

1. Em **APIs & Services → Library**, habilite **Google Calendar API**.
2. Em **Google Auth Platform → Data Access**, configure os escopos solicitados pelo Vamo: identidade (`openid`, `email`, `profile`), `calendar.events`, `calendar.calendarlist.readonly` e `calendar.events.readonly` (prefixo `https://www.googleapis.com/auth/` nos escopos de agenda).
3. Configure no servidor uma `TOKEN_ENCRYPTION_KEY`: chave aleatória de 32 bytes em base64 para proteger as credenciais de agenda. Ela não é senha do Google e não deve ser compartilhada. A troca dessa chave exige reconectar as agendas ou migrar as credenciais.
4. No Vamo, abra **Configurações → Integrações → Autorizar Google Calendar** e conceda os acessos solicitados.
5. Escolha uma agenda com permissão de escrita e clique em **Ativar nesta agenda**. As suas tarefas autorizadas serão enviadas para ela.
6. Em **Compromissos do Google no Vamo**, selecione uma agenda e clique em **Buscar eventos do Google** para consultar os próximos 30 dias. Essa leitura é pessoal: não transforma compromissos em tarefas nem em feriados da empresa.

Login Google e autorização da agenda são separados. É possível autorizar a agenda mantendo o login por e-mail. Desconectar interrompe novos envios; os eventos já enviados permanecem no Google.

Enquanto o aplicativo Google estiver em testes, autorizações que incluem Calendar podem exigir reconexão após sete dias. Para liberar a todos, avalie a publicação e a verificação OAuth exigidas pelo Google para os escopos utilizados.

## 3. Calendarr e dias úteis

A integração de feriados não precisa de conta Google, senha nem chave de API.

- Fonte nacional: https://www.calendarr.com/brasil/feriados-2026/ e https://www.calendarr.com/brasil/feriados-2027/. O ano vigente e o seguinte são consultados automaticamente.
- Atualização: primeiro acesso à empresa após 24 horas. Não há execução diária garantida com o sistema fechado. **Atualizar feriados agora** permite consulta imediata pelo administrador.
- Se a fonte falhar ou mudar seu formato, as datas anteriores são mantidas. A próxima tentativa automática ocorre em um acesso após uma hora; a falha aparece na configuração.
- Feriados importados e datas manuais da empresa aparecem no calendário e são excluídos dos cálculos de dias úteis e capacidade.
- Sábado e domingo nunca são dias úteis, mesmo que um cadastro antigo os tenha marcado.
- Os prazos padrão de novas tarefas usam 1 dia útil para início e 5 dias úteis para entrega. Datas de tarefas existentes não são deslocadas silenciosamente. Regras explicitamente configuradas em dias corridos continuam distinguindo dias corridos de dias úteis.
- Pontos facultativos ficam separados. O admin pode habilitar a opção para considerar todos eles como dias sem expediente, por dia inteiro, inclusive quando a fonte indicar apenas parte do dia.
- Datas comemorativas não bloqueiam trabalho. O portal mundial é referência para outras localidades; feriados de outros países não são aplicados automaticamente à empresa brasileira.
- Cadastre em **Empresa → Editar configurações → Feriados** os feriados estaduais, municipais e recessos aplicáveis. Precisamos da cidade e do estado para determinar os locais.

O Calendarr é a fonte solicitada pelo proprietário. A importação usa sua classificação de feriados e pontos facultativos; não determina quais obrigações locais se aplicam à empresa.

## Referências oficiais

- Configuração do Google: https://developers.google.com/workspace/calendar/api/quickstart/js
- OAuth para servidor: https://developers.google.com/identity/protocols/oauth2/web-server
- Eventos: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
- Validade de refresh tokens em testes: https://developers.google.com/identity/protocols/oauth2#expiration
