export const professionalRoles=['Diretor','Gerente de operações','Coordenador','Gestor de projetos','Assistente administrativo','Analista administrativo','Assistente financeiro','Analista financeiro','Controller','SDR / Pré-vendas','Vendedor','Executivo de contas','Gerente comercial','Atendimento','Sucesso do cliente','Diretor de arte','Designer','Redator','Social media','Editor de vídeo','Analista de marketing','Gestor de tráfego'];
export const taskCatalog=[
 ['operacoes','Direção e operações',['Planejamento','Acompanhamento de projeto','Revisão de processo']],
 ['administrativo','Administrativo',['Organização documental','Cadastro administrativo','Compras','Acompanhamento de contrato']],
 ['financeiro','Financeiro',['Contas a pagar','Contas a receber','Cobrança','Conciliação bancária','Fluxo de caixa']],
 ['comercial','Comercial',['Prospecção','Acompanhamento comercial','Agendamento de reunião','Proposta comercial','Negociação']],
 ['atendimento','Atendimento',['Briefing','Alinhamento com cliente','Atendimento de solicitação','Acompanhamento de aprovação']],
 ['criacao','Criação',['Conceito criativo','Peça gráfica','Identidade visual','Redação','Publicação','Edição de vídeo']],
 ['marketing','Marketing',['Planejamento de campanha','Configuração de anúncio','Análise de resultados']]
] as const;
export const permissionLabels={createTasks:'Criar tarefas',editTasks:'Editar tarefas',assignTasks:'Atribuir tarefas',approveTasks:'Aprovar entregas',viewReports:'Consultar relatórios',viewFinance:'Consultar informações financeiras',managePeople:'Gerenciar colaboradores'};
export const professionalAreas:Record<string,string>=Object.fromEntries(professionalRoles.map((role,i)=>[role,i<4?'Direção e operações':i<6?'Administrativo':i<9?'Financeiro':i<13?'Comercial':i<15?'Atendimento':i<20?'Criação':'Marketing']));
export function catalogTypes(){return taskCatalog.flatMap(([id,area,names])=>names.map((name,i)=>({id:`catalog-${id}-${i}`,name,area,jobTitles:professionalRoles.filter(role=>professionalAreas[role]===area),color:'#e47251',description:`Atividade de ${area.toLowerCase()}.`,estimate:0,active:true})));}
