# Configuração externa — Google, Apple e agenda

Esta revisão foi preparada localmente. Nenhum segredo real foi criado ou enviado ao repositório. O proprietário ainda precisa criar os projetos dos provedores.

## Google Cloud

1. Criar o projeto no Google Cloud e configurar a tela de consentimento e usuários de teste.
2. Criar cliente OAuth do tipo aplicação web.
3. Registrar como retorno a origem do ambiente acrescida de `/api/auth/google/callback`.
4. Definir GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e APP_ORIGIN exclusivamente no ambiente do servidor. APP_ORIGIN deve ser a origem exata, sem caminho; HTTPS em produção.
5. Para agenda, habilitar Google Calendar API no mesmo projeto. A conexão solicita eventos, leitura da lista de calendários e leitura de eventos para importar feriados. Login solicita somente identidade.
6. Gerar uma chave aleatória de 32 bytes em base64 e armazenar como TOKEN_ENCRYPTION_KEY no ambiente seguro. Nunca enviar chaves pelo chat ou incluí-las no Git. A rotação dessa chave exige migrar as credenciais cifradas ou reconectar as agendas.
7. Validar login, rejeição de consentimento, conta pendente, aprovação e logout com usuários de teste.
8. Conectar Calendar em Minha conta ou Integrações, escolher uma agenda com escrita e ativar. Selecionar um calendário de feriados já inscrito na conta para importação. Datas importadas são somadas às datas manuais.
9. Testar criação, edição de prazo, reunião, reatribuição, arquivamento, perda de acesso, desconexão e reconexão. Configurar execução periódica do scheduled para retentativas da fila sem tráfego.

O ID do evento é determinístico e os vínculos são separados por conta Google e empresa. A integração não adiciona convidados automaticamente e não envia dados a agendas de outros usuários.

Referências: [OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [autorização incremental](https://developers.google.com/identity/protocols/oauth2/web-server), [lista de calendários](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list), [criação de eventos](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert).

## Sign in with Apple

1. Configurar uma conta Apple Developer elegível e um App ID principal com Sign in with Apple.
2. Criar o Services ID para o site e registrar domínio e retorno HTTPS `/api/auth/apple/callback`.
3. Criar a chave de Sign in with Apple. Guardar a chave privada PKCS8, Key ID e Team ID no ambiente seguro.
4. Definir APPLE_CLIENT_ID (Services ID), APPLE_TEAM_ID, APPLE_KEY_ID e APPLE_PRIVATE_KEY. O servidor gera client secrets de curta duração e valida os ID tokens pela assinatura, emissor, audiência, validade e nonce.
5. Usar HTTPS no ambiente de teste Apple: o retorno form_post usa um cookie de estado Secure/SameSite=None.
6. Testar compartilhar e ocultar e-mail. Para vincular um e-mail privado Apple a uma conta existente com e-mail diferente, iniciar em Minha conta enquanto conectado. Não há fusão automática de contas com e-mails diferentes.
7. Confirmar que cadastros Apple novos também aguardam o admin master.

Referências: [configurar Sign in with Apple](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple), [requisição de autorização](https://developer.apple.com/documentation/signinwithapplerestapi/request-an-authorization-to-the-sign-in-with-apple-server.), [validar tokens](https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens).

## Aprovação e publicação

As credenciais ausentes deixam os controles indisponíveis, sem sucesso simulado. Antes de produção, aplicar as migrações 0003 e 0004, configurar os provedores, validar consentimentos em ambiente de teste e obter aprovação da revisão visual. Cadastros diretos feitos pelo master representam sua autorização; cadastros feitos por gestores ou outros administradores ficam pendentes.
