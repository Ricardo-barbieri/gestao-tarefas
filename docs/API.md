# API v1 e webhooks

Crie um token em Configurações → Integrações → Tokens da API. O valor é disponibilizado uma vez, expira em até 90 dias e pode ser revogado. Guarde-o em um cofre de segredos. A API herda o vínculo ativo e as permissões atuais do usuário emissor.

## Ler tarefas

`GET /api/v1/tasks?page=1&pageSize=25&boardId=...&q=...`

Header `Authorization: Bearer <token>`.

Resposta: `{ data: Task[], page, pageSize, total, revision }`. Ordenação por identificador numérico. pageSize de 1 a 100. `ETag` contém a revisão da organização. Anexos permanecem sujeitos ao download autenticado; o campo interno de armazenamento não concede acesso ao R2.

## Modificar tarefas

`POST /api/v1/tasks`

Headers: `Authorization: Bearer <token de escrita>`, `Content-Type: application/json`, `If-Match: "<revision>"`.

```json
{"action":"createTask","data":{"boardId":"marketing","title":"Nova demanda","typeId":"arte"}}
```

Ações permitidas: createTask, updateTask, move, archiveTask, restoreTask, comment, manualTime. Campos de updateTask vão em data.fields. Movimentação usa data.id e data.stageId. As mesmas regras e permissões da interface são aplicadas no servidor.

Retorno: `{ result, revision }`. Faça nova leitura depois de um conflito. Nunca tente resolver 409 reenviando cegamente o conteúdo antigo com uma revisão nova.

## Erros

Formato `{ "error": "Mensagem legível" }`.

- 400: valor/operação inválida ou regra de negócio.
- 401: identidade ausente ou token revogado.
- 403: empresa, perfil, escopo ou origem sem acesso.
- 404: recurso indisponível, link expirado/revogado ou token inválido.
- 409: conflito de revisão, tarefa entregue ou estado incompatível.
- 413: tamanho excedido.
- 428: If-Match ausente.
- 429: limite de requisições.

Limites técnicos iniciais: API 60 chamadas/minuto por token; ações internas 120/minuto por usuário; upload 20/minuto; cada link público 20 chamadas de envio/minuto. Não são limites comerciais.

## Webhooks

Cadastre nome e URL HTTPS em Configurações → Integrações. A chave de assinatura é apresentada uma única vez. O webhook começa desativado; ative somente depois de configurar WEBHOOK_ALLOWED_HOSTS com o domínio exato. Configuração padrão observa createTask e move; o domínio também admite updateTask, reopen, comment, requestApproval e decideApproval em configuração por API interna.

Payload mínimo:

```json
{"id":"<event-id>","event":"move","at":"<UTC ISO>","organizationId":"<id>","taskId":"<id>"}
```

Headers:

- X-Vamo-Event-Id: ID estável do evento, usado para deduplicação.
- X-Vamo-Timestamp: segundos Unix da tentativa.
- X-Vamo-Signature: `sha256=<hex de HMAC-SHA256(secret, timestamp + '.' + corpo)>`.

O consumidor deve validar assinatura em tempo constante, conferir recência do timestamp e deduplicar o ID. O sistema aceita HTTP 2xx, não segue redirects, limita a duração da chamada e registra o resultado. Tenta até 5 vezes com espera exponencial, de 60 segundos até 1 hora. Uma tentativa pode ser repetida se o processo falhar depois do envio; o consumidor deve ser idempotente.

O histórico está em GET /api/webhooks?org=<id>, restrito a administrador. Um webhook não substitui a autorização da API. Não usa conectores do usuário nem transmite comentários ou custos implicitamente.
