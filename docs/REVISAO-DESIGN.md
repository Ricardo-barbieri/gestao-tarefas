# Vamo: trabalho claro, próximo passo visível

O layout recomendado mantém o bege da referência e usa laranja para ações e seleção. O espaço de trabalho deve ajudar a responder: o que fazer agora, onde está a tarefa e quem precisa agir.

## Direção visual

- Branco quente `#FBF9F8`: área de trabalho.
- Bege `#F0ECE5`: separação dos fluxos e áreas de apoio.
- Laranja `#E47251`: ação principal e marca.
- Laranja escuro `#A74229`: links e estados selecionados.
- Preto quente `#1F1814`: texto principal.
- Cinza quente `#675B52`: texto secundário legível.

Tipografia: família de sistema com preferência por Avenir Next no macOS, títulos de 28–34 px e textos operacionais de 13–15 px. Nomes de tarefas têm prioridade sobre códigos e metadados. Conteúdo alinhado à esquerda; números e prazos fáceis de comparar.

## Layout proposto e implementado

```text
Menu agrupado       Busca de tarefas                  Ajuda / Conta
Trabalho            Título da página                 + Nova tarefa
  Visão geral       Resumo e próximos passos
  Meu trabalho      Filtros compreensíveis
  Quadros           Lista ou colunas de tarefas → Detalhes em painel
Gestão
  Projetos
  Clientes
  Equipes
Administração
  Configurações
```

No celular, o menu abre sobre o conteúdo e pode ser fechado por toque fora ou Escape. Listas largas, calendário e colunas rolam dentro da sua área. Formulários se adaptam à largura disponível.

A paleta bege foi mantida por ser uma preferência explícita do proprietário. A identidade vem do fluxo de trabalho e da clareza operacional; foram evitadas novas decorações, mudanças de fonte dependentes de serviços externos e etiquetas promocionais repetidas.

## Pontos da revisão

- Login somente com e-mail e senha. Novos cadastros dependem de aprovação.
- Google e login social geral desativados no servidor, além da interface.
- Configuração inicial do administrador separada do login: a identidade do proprietário é verificada uma única vez antes de ele escolher a senha.
- Menu dividido em Trabalho, Gestão e Administração.
- Texto maior, contraste reforçado, foco visível e áreas de toque maiores.
- Seleção de equipes e pessoas por nome no lugar de IDs nos diálogos principais.
- Busca global consistente, filtros rápidos e opção para limpar os filtros.
- Criação de tarefa na etapa escolhida ao clicar no botão da coluna.
- Modais com foco contido, fechamento por Escape e retorno do foco ao controle anterior.
- Estados ativos anunciados a tecnologias assistivas e aviso de erro ao falhar a atualização.
- Gráfico da visão geral com legenda correspondente às quantidades mostradas.

## Próximas evoluções sugeridas

1. Validar o fluxo com 2–3 pessoas da equipe: criar tarefa, atribuir responsável, localizar prazo e aprovar uma entrega.
2. Acrescentar recuperação de senha por e-mail quando um serviço de envio estiver configurado. A interface não deve oferecer uma recuperação que ainda não funciona.
3. Transformar configurações avançadas de automações e formulários em assistentes por etapas, preservando a operação atual.

Esta revisão melhora os fluxos existentes. Não representa uma auditoria formal de acessibilidade nem garante ausência de erros em cenários não exercitados.
