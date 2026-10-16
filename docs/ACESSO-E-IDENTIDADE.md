# Acesso, cadastro e identidade visual

Revisão solicitada em 16/10/2026.

## Paleta

Cores amostradas da referência fornecida: bege #F0ECE5, branco quente #FBF9F8, preto #1F1814 e laranja #E47251. Marca, destaques, botões, navegação, formulários, tarefa e dashboard usam a nova família. Cores semânticas de aprovação/erro permanecem distinguíveis. Ações em laranja usam texto escuro para manter legibilidade.

## Métodos de acesso

- E-mail e senha: implementado com bcrypt (custo 12), sal aleatório e sem senha em texto simples. Senha mínima de 12 caracteres, limitada a 72 bytes para evitar truncamento silencioso do bcrypt.
- Google/Gmail: fluxo OAuth/OIDC implementado com code flow, PKCE, state, nonce, validação criptográfica do ID token, issuer, audience, expiração e e-mail verificado. Até configurar as credenciais, a opção aparece indisponível; não há login simulado.
- ChatGPT: integração existente preservada como método adicional e caminho inicial do administrador.

A pedido do usuário, a aplicação agora tem sessão e credenciais próprias além da identidade do gateway Sites. O gateway continua sendo a fonte confiável dos headers ChatGPT; nunca aceitar esses headers de clientes em uma implantação direta sem essa proteção.

## Administrador e aprovação

ADMIN_EMAIL é configurado no ambiente do servidor, não no repositório. O e-mail principal só é reconhecido como administrador depois de comprovado pelo login Google ou pela identidade ChatGPT verificada. Cadastro anônimo por senha com o e-mail principal é recusado, evitando que alguém reserve a conta administrativa.

O proprietário entra primeiro por ChatGPT e acessa Configurações → Minha conta → Definir senha. Depois poderá entrar com o mesmo e-mail e a senha escolhida. Nenhuma senha foi criada para o usuário pelo assistente.

Novos cadastros gratuitos ficam pendentes. Configurações → Cadastros mostra a fila ao administrador principal, com Aprovar ou Recusar. A aprovação cria vínculo de colaborador na empresa sem conceder acesso automático aos quadros restritos. Equipes e acessos são definidos em Pessoas/Quadros. Contas pendentes, recusadas ou inativas não acessam dados internos.

## Vinculação Google/ChatGPT

Os IDs de provedor são únicos. O mesmo e-mail comprovado pelos provedores converge para a mesma conta e preserva o ID de usuário e os vínculos existentes. Um texto digitado no cadastro não comprova titularidade. Se um provedor verificar um e-mail previamente cadastrado sem verificação, a senha anterior e suas sessões são revogadas antes da vinculação, evitando retenção de acesso por quem possa ter pré-cadastrado o endereço.

Sessões usam token aleatório com hash no banco, cookie HttpOnly/SameSite, Secure em HTTPS e expiração de sete dias. Logout revoga a sessão. Trocar senha exige a senha anterior quando já definida e revoga outras sessões da aplicação. Novos cadastros e tentativas de entrada têm limitação por IP/e-mail e validação de origem.

Não existe recuperação automática por e-mail nesta revisão. Administrador com conta vinculada pode entrar novamente pelo provedor. Para recuperar uma conta exclusivamente por senha, ainda é necessário implementar o adaptador de e-mail e o fluxo de recuperação, sem utilizar redefinição insegura por texto.

## Ativar Google

1. No Google Cloud, escolha um projeto e configure a tela de consentimento para o aplicativo.
2. Crie um cliente OAuth do tipo Aplicativo da Web.
3. Origem do aplicativo: https://vamo-gestao-rb.daringstork16.chatgpt.site
4. URI de redirecionamento autorizado: https://vamo-gestao-rb.daringstork16.chatgpt.site/api/auth/google/callback
5. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET como variáveis do servidor; o secret deve ser marcado como segredo. Nunca comitar essas credenciais nem colocá-las em um campo do navegador.
6. APP_ORIGIN já aponta para o domínio do aplicativo. ADMIN_EMAIL já foi configurado pelo proprietário.
7. Publique uma versão com essa configuração e valide um login real. Em modo de teste do Google, inclua os e-mails autorizados na tela de consentimento.

Escopos solicitados: openid, email e profile. O aplicativo não pede acesso à caixa Gmail, contatos, calendário ou arquivos. A conexão Gmail usada no chat não é um cliente OAuth reutilizável por visitantes do aplicativo.

Referências oficiais: https://developers.google.com/identity/openid-connect/openid-connect e https://developers.google.com/identity/sign-in/web/backend-auth

## Ambiente e testes

A hospedagem estava pública quando esta revisão foi iniciada. Essa audiência foi preservada; a página de acesso pode ser visitada e os dados internos continuam exigindo conta aprovada e permissões no servidor.

Aplique a migração 0002_brown_rhodey.sql após as anteriores. Para desenvolvimento, use .dev.vars ignorado pelo Git e configure ADMIN_EMAIL com a identidade fictícia local se for usar o mock do template. Não copie configuração fictícia para produção.

Testes: 31 testes de domínio/webhooks/identidades, 25 verificações HTTP de acesso e 27 verificações do fluxo operacional. O fluxo Google real não foi executado por ausência de cliente OAuth; o comportamento indisponível foi validado e as regras de vinculação foram testadas com dados controlados.
