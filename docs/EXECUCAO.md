> Atualização de acesso: somente e-mail e senha, mediante aprovação do administrador. Google e login social geral desativados. Para a primeira senha do proprietário, veja docs/ACESSO-E-IDENTIDADE.md.

# Executar e experimentar

## Demonstração hospedada

A URL publicada será registrada no README depois da implantação. A página de entrada é pública; os dados internos exigem conta aprovada. O administrador define sua primeira senha em /definir-senha, com verificação exclusiva do proprietário. Depois entra por e-mail e senha. Ao entrar pela primeira vez, o sistema cria a empresa fictícia Estúdio Aurora, Marketing, pessoas fictícias, projetos e sete tarefas. Não use dados reais neste estágio.

## Execução local

Requisitos: Node >=22.13, npm e acesso ao registro npm na primeira instalação. Os comandos abaixo são executados na raiz do repositório.

```sh
npm ci
npm run typecheck
npm test
npm run build
```

Depois do build, aplique cada migração local **uma única vez**, em ordem:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_misty_champions.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_large_the_fallen.sql
npm run dev
```

Para a revisão de acesso, aplique também drizzle/0002_brown_rhodey.sql. Configure ADMIN_EMAIL e APP_ORIGIN no servidor; em desenvolvimento, o mock usa seedy@sites.test. Leia ACESSO-E-IDENTIDADE.md antes de configurar autenticação.

Abra o endereço informado, normalmente http://127.0.0.1:5173, e entre com a conta fictícia preparada por tests/auth-integration.mjs. **Somente no desenvolvimento loopback**, o template oferece identidade fictícia local. O banco local persiste em .wrangler/state; os arquivos locais R2 também ficam nesse estado. Não versionar essa pasta.

## Cenário demonstrativo

1. Em Formulários, publique Solicitação de criação e abra seu link na prévia local.
2. Envie e-mail fictício, briefing, impacto, prazo e um arquivo permitido.
3. Encontre a demanda em Marketing / Entrada. Confira a solicitação original e a estimativa Criação de arte.
4. Mova para Fazendo e observe o prazo de cinco dias úteis, caso ainda não exista prazo assumido.
5. Inicie e pare o cronômetro. Envie um arquivo de entrega.
6. Em Aprovações, solicite aprovação para um e-mail fictício. Em Compartilhar, selecione os campos, o arquivo e aprovações; confira a prévia e gere o link.
7. Abra o link do convidado local, converse sobre o arquivo e aprove a versão.
8. Entregue a tarefa. A edição fica bloqueada. Reabra como administrador com justificativa.
9. Consulte histórico, relatórios e indicadores.

Na hospedagem privada, a política de acesso externa limita os passos anônimos; o fluxo foi validado nas rotas HTTP e no banco locais.

## Testar o Worker compilado

Em um terminal separado:

```sh
npm run start -- --port 8787 --var ADMIN_EMAIL:seedy@sites.test --var APP_ORIGIN:http://127.0.0.1:8787
```

O Worker local compilado não usa o mock de identidade do servidor dev. A suíte de integração fornece identidades fictícias nos headers **somente ao loopback** para validar o código de produção atrás do gateway:

```sh
TEST_URL=http://127.0.0.1:8787 node tests/integration.mjs
```

Os testes criam organizações e arquivos fictícios isolados, sem enviar e-mail ou mensagem real.

## Configuração de serviços

- DB e BUCKET: bindings D1 e R2 provisionados pela hospedagem Sites, definidos no manifesto.
- Login e logout: e-mail e senha. Recuperação por e-mail ainda requer serviço de envio.
- WEBHOOK_ALLOWED_HOSTS: lista de domínios HTTPS exatos autorizados no servidor. Vazio bloqueia todas as ativações. Registrar via configuração de variáveis do ambiente da hospedagem.
- E-mail, WhatsApp e IA: adaptadores e credenciais pendentes. Não basta preencher uma variável para que funcionalidades não implementadas comecem a funcionar.
- Webhooks agendados: o Worker tem handler scheduled; provisionar a agenda no ambiente escolhido. Até lá, primeira tentativa/retentativas vencidas são processadas após ações e há botão manual.

Migrações locais e hospedadas são independentes. A publicação Sites aplica as migrações de produção; nunca copiar .wrangler/state para o deploy.
