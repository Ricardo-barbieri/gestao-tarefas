> A revisão local do plano aprovado acrescenta login Google e Apple, vinculação e ativação por link. Consulte GOOGLE-APPLE-CALENDAR.md. A produção permanece na versão anterior até aprovação.

# Acesso por e-mail e senha

A página de acesso oferece somente e-mail e senha, com cadastro gratuito sujeito à aprovação do administrador principal. Google e o login geral com ChatGPT estão desativados, inclusive suas rotas de autenticação. A identidade da plataforma não autentica automaticamente o workspace.

O administrador principal é definido pela variável secreta `ADMIN_EMAIL` no ambiente. E-mails não devem ser gravados em código como credenciais. Novos cadastros ficam `pending`; apenas o administrador principal pode aprovar ou recusar em Configurações → Cadastros. A aprovação vincula a pessoa à empresa como colaborador sem equipes, com acesso ajustado em Pessoas.

## Primeira senha do administrador

Se o administrador ainda não tem senha, deve abrir `/definir-senha`. A configuração inicial exige uma verificação da identidade do proprietário com o provedor confiável da hospedagem. Somente o e-mail exato de ADMIN_EMAIL é aceito. Essa etapa não abre o workspace: serve exclusivamente para o proprietário definir sua senha. Após a definição, a configuração inicial fica bloqueada e a entrada normal exige e-mail e senha. Uma senha existente não pode ser substituída pela configuração inicial.

Não há senha padrão do administrador. Não é seguro permitir que alguém obtenha o perfil de administrador apenas informando o e-mail público em um formulário.

Senhas usam bcrypt com salt, mínimo de 12 caracteres e máximo de 72 bytes. Sessões usam tokens opacos com hash no banco, cookies HttpOnly/SameSite e Secure em HTTPS. Alteração de senha exige a senha atual e revoga as outras sessões. As APIs validam aprovação e permissões em cada acesso.

## Limitações

Recuperação de senha por e-mail ainda depende da configuração de um serviço de envio. Não há botão prometendo esse recurso. Identidades históricas do Google permanecem no banco para preservar dados, mas não habilitam novas entradas. As rotas `/api/auth/google`, `/api/auth/google/callback` e `/api/auth/platform` retornam 410.

## Verificação local

Execute `node tests/auth-integration.mjs` em loopback com o administrador fictício `seedy@sites.test` e `AUTH_TEST_ADMIN_HEADERS=1` no Worker compilado. O teste prepara uma senha exclusiva do ambiente de testes, sem tocar em produção. Execute os testes operacionais depois, usando a sessão real de e-mail e senha do administrador fictício.
