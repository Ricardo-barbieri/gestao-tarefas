# Verificações executadas

Data: 16/10/2026. Ambiente local macOS, Node 24.19, Worker compilado com D1 e R2 locais.

## Resultado

- Instalação travada pelo package-lock: concluída.
- TypeScript (`tsc --noEmit`): aprovado.
- Build de produção em cinco etapas do Vinext/Vite: aprovado.
- Duas migrações SQL: aplicadas ao D1 local, seis tabelas criadas.
- Testes automatizados de domínio e webhooks: 25 aprovados.
- Cenário HTTP com persistência real D1/R2: 27 verificações aprovadas.
- Navegador: criação de tarefa, aplicação do tipo/estimativa, edição com salvamento automático, movimentação para Fazendo e cálculo real de prazo; atualização do dashboard observada.
- Layout inspecionado em 1440×1000 e 390×844. Evidências em outputs/vamo-desktop.png e outputs/vamo-mobile.png, disponibilizadas separadamente da fonte.

## O que os testes verificam

Acesso por equipe e por usuário direto, perda de acesso sem vínculo remanescente, isolamento de empresas, identidade obrigatória e bloqueio de leitura/escrita em organização alheia. Seguidores/menções não concedem acesso.

Calendário local, feriado, fim de semana, instante próximo de meia-noite UTC, automação aplicada de verdade e comportamento em reentrada.

Cronômetro único, estado persistido em nova leitura, duração calculada no servidor, sobreposição manual rejeitada e bloqueio da entrega com cronômetro ativo.

Criação por formulário com tipo, estimativa, tags, campos e arquivo; preservação de submissão/versão e prazo desejado separado. Reenvio idempotente sem segunda tarefa.

Portal externo omitindo comentários internos, custos e anexos não escolhidos. Download autorizado do R2 e negação do download não compartilhado. Discussão e aprovação da versão pelo destinatário.

Nova versão gera nova aprovação obrigatória; aprovação anterior não aprova arquivo novo. Versões substituídas com ajustes não bloqueiam uma versão atual aprovada. Entrega condicionada a checklist, subtarefas e dependências.

Entrega registra autor e instante, bloqueia edição operacional; reabertura exige justificativa e permissão e preserva submissão/histórico. Revisões antigas não sobrescrevem dados. Dependências não criam ciclos. Tipos não alteram silenciosamente estimativas/snapshots antigos. NPS usa escala própria.

API com escopo de leitura, paginação e revogação. Webhooks com validação de HTTPS, domínio exato permitido, bloqueio de IP/DNS privado, assinatura correta, ID estável e política sem redirecionamentos.

## Limites da evidência

Os testes de webhook substituem a rede por respostas controladas. Nenhum destinatário externo real recebeu webhook, e-mail ou WhatsApp; não houve execução de IA.

A suíte HTTP usa o Worker de produção no loopback com identidades fictícias, reproduzindo a fronteira de identidade que o gateway aplica na hospedagem. Ela não tenta falsificar identidade no serviço de produção.

Uma prévia de Worker antigo chegou a manter módulos em memória após rebuild. O processo foi encerrado e reiniciado com o artefato final; as 27 verificações foram aprovadas nessa execução. A primeira execução de 24 verificações havia aprovado antes da inclusão da API v1.

A validação não é auditoria independente nem teste de carga. O fluxo de acesso anônimo no domínio publicado depende da audiência da hospedagem; o Site é mantido privado. As pendências funcionais completas estão em ESCOPO.md.
