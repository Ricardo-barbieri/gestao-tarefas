import {isBusinessDay,type HolidayFeed} from './holidays';
import type {CompanyStructure} from './organization';
import {catalogTypes} from './catalog';
export type Role = 'admin' | 'manager' | 'member';
export type Person = {
    deletedAt?:string;
    deletedBy?:string;
    active?: boolean;
    jobTitle?: string;
    departmentId?:string;
    positionId?:string;
    functionIds?:string[];
    permissions?: Partial<Record<'createTasks'|'editTasks'|'assignTasks'|'approveTasks'|'viewReports'|'viewFinance'|'managePeople',boolean>>;
    allowedBoards?: string[];
    deniedBoards?: string[];
    id: string;
    name: string;
    email: string;
    role: Role;
    teams: string[];
    hours: number;
    hourlyCents: number;
    absences: string[];
};
export type Stage = {
    id: string;
    name: string;
    kind: 'entry' | 'work' | 'delivery';
    limit: number;
};
export type Board = {
    id: string;
    name: string;
    description: string;
    color: string;
    access: 'all' | 'selected';
    teams: string[];
    users: string[];
    stages: Stage[];
    archived: boolean;
    fieldOrder: string[];
};
export type Attachment = {
    id: string;
    name: string;
    mime: string;
    size: number;
    author: string;
    at: string;
    kind: 'request' | 'delivery';
    tag: string;
    version: number;
    previousId?: string;
    key: string;
};
export type Comment = {
    id: string;
    author: string;
    at: string;
    text: string;
    audience: 'internal' | 'external' | 'file';
    attachmentId?: string;
};
export type Approval = {
    id: string;
    attachmentId: string;
    version: number;
    approver: string;
    due: string;
    required: boolean;
    status: 'pending' | 'approved' | 'changes' | 'cancelled';
    comment: string;
    decidedAt?: string;
    decidedBy?: string;
};
export type Log = {
    fromStageId?: string;
    toStageId?: string;
    id: string;
    at: string;
    author: string;
    event: string;
    detail: string;
};
export type Task = {
    meetingDate?:string;
    meetingTime?:string;
    meetingDuration?:number;
    parentId?: string;
    recurrence?: {
        frequency: string;
        nextDue: string;
    };
    id: string;
    number: number;
    title: string;
    description: string;
    boardId: string;
    stageId: string;
    typeId: string;
    typeSnapshot: string;
    priority: string;
    assignee: string;
    creator: string;
    projectId: string;
    clientId: string;
    start: string;
    due: string;
    desiredDue: string;
    estimate: number;
    tags: string[];
    fields: Record<string, any>;
    checklist: {
        id: string;
        text: string;
        done: boolean;
    }[];
    dependencies: string[];
    followers: string[];
    comments: Comment[];
    attachments: Attachment[];
    approvals: Approval[];
    history: Log[];
    archived: boolean;
    createdAt: string;
    deliveredAt?: string;
    deliveredBy?: string;
    revision: number;
    submission?: {
        questions?: {
            id: string;
            label: string;
            type: string;
        }[];
        at: string;
        version: number;
        formId: string;
        answers: Record<string, any>;
    };
};
export type FormDef = {
    id: string;
    name: string;
    boardId: string;
    stageId: string;
    typeId: string;
    tags: string[];
    assignee: string;
    titleTemplate: string;
    fallback: string;
    published: boolean;
    token?: string;
    version: number;
    confirmation: string;
    useDesiredDue: boolean;
    questions: {
        id: string;
        label: string;
        instruction: string;
        type: string;
        required: boolean;
        target: string;
        options: string;
    }[];
};
export type Rule = {
    id: string;
    name: string;
    boardId: string;
    stageId: string;
    days: number;
    business: boolean;
    cutoff: string;
    existing: 'preserve' | 'replace';
    reentry: 'preserve' | 'reapply';
    active: boolean;
};
export type Share = {
    id: string;
    taskId: string;
    email: string;
    fields: string[];
    attachments: string[];
    futureDeliveries: boolean;
    expiresAt: string;
    revoked: boolean;
    token?: string;
};
export type State = {
    webhooks?: {
        id: string;
        name: string;
        url: string;
        events: string[];
        active: boolean;
    }[];
    apiTokens?: {
        id: string;
        userId: string;
        name: string;
        scope: 'read' | 'write';
        expiresAt: string;
        revoked: boolean;
    }[];
    demo: boolean;
    org: {
        name: string;
        language: string;
        timezone: string;
        workdays: number[];
        holidays: string[];
        manualHolidays?:string[];
        holidayFeed?:HolidayFeed;
        hours: number;
        onboarding: number;
        help: boolean;
    };
    jobTitles?:string[];
    structure?:CompanyStructure;
    people: Person[];
    teams: {
        id: string;
        name: string;
    }[];
    boards: Board[];
    tasks: Task[];
    types: {
        jobTitles?:string[];
        positionIds?:string[];
        area?: string;
        id: string;
        name: string;
        color: string;
        description: string;
        estimate: number;
        active: boolean;
    }[];
    projects: {
        id: string;
        name: string;
        description: string;
        clientId: string;
        manager: string;
        status: string;
        start: string;
        end: string;
        budgetCents: number;
    }[];
    clients: {
        id: string;
        name: string;
        email: string;
        contact: string;
    }[];
    forms: FormDef[];
    rules: Rule[];
    runs: {
        id: string;
        ruleId: string;
        taskId: string;
        at: string;
        previous: string;
        applied: string;
        status: string;
    }[];
    time: {
        id: string;
        taskId: string;
        userId: string;
        start: string;
        end: string;
        seconds: number;
        note: string;
    }[];
    timers: {
        userId: string;
        taskId: string;
        start: string;
    }[];
    shares: Share[];
    notifications: {
        id: string;
        userId: string;
        text: string;
        taskId: string;
        read: boolean;
        at: string;
    }[];
    views: {
        id: string;
        userId: string;
        name: string;
        boardId: string;
        query: string;
        priority: string;
        sort: string;
    }[];
    dashboards: Record<string, string[]>;
    audit: Log[];
    receipts: {
        key: string;
        taskId: string;
    }[];
    invites: {
        name?: string;
        jobTitle?: string;
        id: string;
        email: string;
        role: Role;
        teams: string[];
        expiresAt: string;
        hash: string;
        used: boolean;
    }[];
    agents: {
        id: string;
        name: string;
        purpose: string;
        instructions: string;
        provider: string;
        model: string;
    }[];
    customFields: {
        id: string;
        name: string;
        type: string;
        options: string;
        min: number;
        max: number;
    }[];
};
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const log = (author: string, event: string, detail: string): Log => ({ id: uid(), at: now(), author, event, detail });
export function canBoard(s: State, b: Board, p: Person) { if (p.active === false || p.deletedAt)
    return false; if(p.role==='admin')return true;if(p.deniedBoards?.includes(b.id))return false;return !!p.allowedBoards?.includes(b.id)|| b.access === 'all' || b.users.includes(p.id) || b.teams.some(t => p.teams.includes(t)); }
export function isDelivered(s: State, t: Task) { return s.boards.find(b => b.id === t.boardId)?.stages.find(x => x.id === t.stageId)?.kind === 'delivery'; }
export function projectProgress(s: State, id: string) { const ts = s.tasks.filter(t => t.projectId === id && !t.archived); return ts.length ? Math.round(ts.filter(t => isDelivered(s, t)).length / ts.length * 100) : 0; }
export function newTask(s: State,p:string,data:Partial<Task>):Task{const b=s.boards.find(b=>b.id===data.boardId)||s.boards[0];const ty=s.types.find(x=>x.id===data.typeId);const at=now();const defaults={start:relativeDue(s,at,1,true),desiredDue:relativeDue(s,at,5,true),due:relativeDue(s,at,5,true)};const fields=Object.fromEntries(s.customFields.filter(f=>f.id==='impacto'||f.name.toLocaleLowerCase('pt-BR')==='impacto da demanda').map(f=>[f.id,1]));return {id:uid(),number:Math.max(0,...s.tasks.map(t=>t.number))+1,title:'Nova tarefa',description:'',boardId:b.id,stageId:b.stages[0].id,typeId:'',typeSnapshot:ty?.name||'',priority:'Normal',assignee:p,creator:p,projectId:'',clientId:'',...defaults,estimate:ty?.estimate||0,tags:[],checklist:[],dependencies:[],followers:s.people.some(person=>person.id===p)?[p]:[],comments:[],attachments:[],approvals:[],history:[log(p,'Criada','Tarefa criada')],archived:false,createdAt:at,revision:1,...data,fields:{...fields,...data.fields}};}
export function hasPermission(p:Person,key:NonNullable<Person['permissions']> extends Partial<Record<infer K,boolean>>?K:never){if(p.role==='admin')return true;const defaults:Record<string,boolean>={createTasks:true,editTasks:true,assignTasks:p.role==='manager',approveTasks:true,viewReports:p.role==='manager',viewFinance:false,managePeople:p.role==='manager'};return p.permissions?.[key]??defaults[key];}
export function localParts(instant: string, timezone: string) { const p = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant)); const get = (t: string) => p.find(x => x.type === t)?.value || ''; return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }; }
export function relativeDue(s: State, event: string, days: number, business: boolean) { let date = localParts(event, s.org.timezone).date; let d = new Date(date + 'T12:00:00Z'); let n = 0; while (n < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const v = d.toISOString().slice(0, 10);
    if (!business || (isBusinessDay(s,v)))
        n++;
} return d.toISOString().slice(0, 10); }
export function moveTask(s: State, t: Task, stageId: string, p: Person, event = now()) {
    const b = s.boards.find(b => b.id === t.boardId)!;
    const stage = b.stages.find(x => x.id === stageId);
    if (!stage)
        throw Error('Etapa inválida.');
    if (isDelivered(s, t))
        throw Error('Reabra a tarefa antes de alterar a etapa.');
    if (stage.limit > 0 && s.tasks.filter(x => x.boardId === b.id && x.stageId === stageId && !x.archived && x.id !== t.id).length >= stage.limit)
        throw Error('Limite de trabalho da etapa atingido.');
    if (stage.kind === 'delivery') {
        if (s.timers.some(x => x.taskId === t.id))
            throw Error('Encerre o cronômetro antes de entregar.');
        if (t.approvals.some(a => a.required && a.status !== 'approved' && a.status !== 'cancelled' && !t.attachments.some(f => f.previousId === a.attachmentId)))
            throw Error('Existe aprovação obrigatória não concluída.');
        if (t.dependencies.some(id => { const dep = s.tasks.find(x => x.id === id); return !dep || !isDelivered(s, dep); }))
            throw Error('Conclua as dependências antes de entregar.');
        if (s.tasks.some(x => x.parentId === t.id && !x.archived && !isDelivered(s, x)))
            throw Error('Conclua as subtarefas antes de entregar.');
        if (t.checklist.some(x => !x.done))
            throw Error('Conclua o checklist antes de entregar.');
        t.deliveredAt = event;
        t.deliveredBy = p.id;
    }
    const old = t.stageId;
    t.stageId = stageId;
    t.history.push({ ...log(p.id, 'Movimentada', `${b.stages.find(x => x.id === old)?.name || 'Transferência'} → ${stage.name}`), fromStageId: old, toStageId: stageId });
    for (const r of s.rules.filter(r => r.active && r.boardId === b.id && r.stageId === stageId && old !== stageId)) {
        if (r.existing === 'preserve' && t.due)
            continue;
        if (r.reentry === 'preserve' && s.runs.some(x => x.ruleId === r.id && x.taskId === t.id))
            continue;
        const previous = t.due;
        t.due = relativeDue(s, event, r.days, r.business);
        s.runs.push({ id: uid(), ruleId: r.id, taskId: t.id, at: event, previous, applied: t.due, status: 'executada' });
        t.history.push(log('automação', 'Prazo definido', `${previous || 'Sem prazo'} → ${t.due} · ${r.name}`));
    }
    t.revision++;
}
export function seed(userId: string, email: string, name: string): State {
    const s: State = { demo: true, org: { name: 'Estúdio Aurora', language: 'pt-BR', timezone: 'America/Sao_Paulo', workdays: [1, 2, 3, 4, 5], holidays: [], hours: 8, onboarding: 0, help: true }, people: [{ id: userId, name: name || 'Você', email, role: 'admin', teams: ['marketing'], hours: 40, hourlyCents: 0, absences: [] }, { id: 'demo-ana', name: 'Ana Martins', email: 'ana@example.com', role: 'manager', teams: ['marketing'], hours: 40, hourlyCents: 8500, absences: [] }, { id: 'demo-lucas', name: 'Lucas Costa', email: 'lucas@example.com', role: 'member', teams: ['marketing'], hours: 40, hourlyCents: 6500, absences: [] }], teams: [{ id: 'marketing', name: 'Marketing' }], boards: [{ id: 'marketing', name: 'Marketing', description: 'Da primeira ideia à próxima grande entrega.', color: '#e47251', access: 'selected', teams: ['marketing'], users: [userId], stages: [{ id: 'entrada', name: 'Entrada', kind: 'entry', limit: 0 }, { id: 'fazendo', name: 'Fazendo', kind: 'work', limit: 8 }, { id: 'aprovacao', name: 'Em aprovação', kind: 'work', limit: 0 }, { id: 'entregue', name: 'Entregue', kind: 'delivery', limit: 0 }], archived: false, fieldOrder: ['description', 'assignee', 'due', 'estimate', 'type'] }], tasks: [], types: [{ id: 'arte', name: 'Criação de arte', color: '#e47251', description: 'Peças visuais para campanhas e comunicação.', estimate: 4, active: true }, { id: 'conteudo', name: 'Conteúdo', color: '#288879', description: 'Textos e planejamento editorial.', estimate: 2, active: true },...catalogTypes()], projects: [{ id: 'campanha', name: 'Campanha de primavera', description: 'Uma nova estação, novas possibilidades.', clientId: 'horizonte', manager: userId, status: 'Em andamento', start: '2026-10-01', end: '2026-11-15', budgetCents: 1200000 }, { id: 'marca', name: 'Nova identidade Aurora', description: 'Construir uma marca que nos representa.', clientId: '', manager: userId, status: 'Em andamento', start: '2026-10-01', end: '2026-12-01', budgetCents: 0 }], clients: [{ id: 'horizonte', name: 'Horizonte', email: 'contato@example.com', contact: 'Marina · Marketing' }], forms: [{ id: 'briefing', name: 'Solicitação de criação', boardId: 'marketing', stageId: 'entrada', typeId: 'arte', tags: ['Solicitação externa'], assignee: userId, titleTemplate: 'Criação · {briefing}', fallback: 'Nova solicitação de criação', published: false, version: 1, confirmation: 'Recebemos seu briefing. Nossa equipe fará a triagem em breve.', useDesiredDue: false, questions: [{ id: 'email', label: 'Qual é o seu e-mail?', instruction: 'Usaremos este endereço para acompanhar a solicitação.', type: 'email', required: true, target: 'email', options: '' }, { id: 'briefing', label: 'O que vamos criar juntos?', instruction: 'Conte o objetivo, o público e os materiais necessários.', type: 'textarea', required: true, target: 'description', options: '' }, { id: 'impacto', label: 'Quanto esta solicitação está afetando seu trabalho?', instruction: 'De 1 (baixo) a 5 (alto).', type: 'number', required: true, target: 'impacto', options: '' }, { id: 'prazo', label: 'Para quando você precisa?', instruction: 'Este é o prazo desejado; a equipe confirmará a data de entrega.', type: 'date', required: false, target: 'desiredDue', options: '' }, { id: 'arquivo', label: 'Materiais de referência', instruction: 'PDF, imagem ou texto, até 10 MB.', type: 'file', required: false, target: 'attachment', options: '' }] }], rules: [{ id: 'prazo-5', name: '5 dias úteis para criar', boardId: 'marketing', stageId: 'fazendo', days: 5, business: true, cutoff: '18:00', existing: 'preserve', reentry: 'preserve', active: true }], runs: [], time: [], timers: [], shares: [], notifications: [], views: [], dashboards: {}, audit: [], receipts: [], invites: [], agents: [], customFields: [{ id: 'impacto', name: 'Impacto da demanda', type: 'rating', options: '', min: 1, max: 5 }] };
    const demos = [['Planejar campanha de primavera', 'entrada', 'conteudo', 'campanha', 'Alta', userId, 3, ['Estratégia']], ['Criar peças para redes sociais', 'fazendo', 'arte', 'campanha', 'Alta', 'demo-ana', 6, ['Design', 'Social']], ['Revisar apresentação institucional', 'aprovacao', 'arte', 'marca', 'Normal', 'demo-lucas', 4, ['Branding']], ['Organizar referências visuais', 'entregue', 'arte', 'marca', 'Normal', userId, 2, ['Pesquisa']], ['Escrever textos da landing page', 'entrada', 'conteudo', 'campanha', 'Normal', 'demo-lucas', 3, ['Conteúdo']], ['Desenvolver identidade da campanha', 'fazendo', 'arte', 'campanha', 'Urgente', userId, 8, ['Design']], ['Preparar calendário editorial', 'entrada', 'conteudo', '', 'Baixa', 'demo-ana', 2, ['Planejamento']]];
    for (const [title, stageId, typeId, projectId, priority, assignee, estimate, tags] of demos as any[]) {
        const t = newTask(s, userId, { title, boardId: 'marketing', stageId, typeId, typeSnapshot: s.types.find(x => x.id === typeId)!.name, projectId, priority, assignee, estimate, tags, description: 'Dados de demonstração. Edite este briefing para registrar objetivos, contexto e critérios de entrega.', start: '2026-10-16', due: relativeDue(s, now(), s.tasks.length % 5 + 1, true) });
        if (stageId === 'entregue') {
            t.deliveredAt = now();
            t.deliveredBy = userId;
        }
        s.tasks.push(t);
    }
    s.time.push({ id: uid(), taskId: s.tasks[1].id, userId: 'demo-ana', start: '2026-10-15T12:00:00Z', end: '2026-10-15T14:30:00Z', seconds: 9000, note: 'Demonstração: desenvolvimento visual' });
    return s;
}
export function operationalMetrics(s: State, instant = new Date().toISOString()) {
    const tasks = s.tasks.filter(t => !t.archived), delivered = tasks.filter(t => isDelivered(s, t) && t.deliveredAt);
    const leadHours = delivered.length ? delivered.reduce((sum, t) => sum + Math.max(0, (Date.parse(t.deliveredAt!) - Date.parse(t.createdAt)) / 3600000), 0) / delivered.length : 0;
    const withDue = delivered.filter(t => t.due), onTime = withDue.filter(t => localParts(t.deliveredAt!, s.org.timezone).date <= t.due);
    const stageHours: Record<string, number> = {};
    for (const t of tasks) {
        const board = s.boards.find(b => b.id === t.boardId);
        if (!board)
            continue;
        const transitions = t.history.filter(h => h.toStageId).sort((a, b) => a.at.localeCompare(b.at));
        let cursor = t.createdAt;
        let stage = transitions[0]?.fromStageId || t.stageId;
        for (const h of transitions) {
            if (stage && board.stages.find(x => x.id === stage)?.kind !== 'delivery') {
                const key = board.name + ' / ' + (board.stages.find(x => x.id === stage)?.name || 'Etapa anterior');
                stageHours[key] = (stageHours[key] || 0) + Math.max(0, (Date.parse(h.at) - Date.parse(cursor)) / 3600000);
            }
            cursor = h.at;
            stage = h.toStageId!;
        }
        if (!isDelivered(s, t)) {
            const key = board.name + ' / ' + (board.stages.find(x => x.id === stage)?.name || 'Etapa anterior');
            stageHours[key] = (stageHours[key] || 0) + Math.max(0, (Date.parse(instant) - Date.parse(cursor)) / 3600000);
        }
    }
    const nps = s.customFields.filter(f => f.type === 'nps').map(f => { const answers = tasks.map(t => t.fields[f.id]).filter(v => v !== '' && v !== undefined && Number.isFinite(Number(v))).map(Number); return { name: f.name, count: answers.length, score: answers.length ? Math.round((answers.filter(v => v >= 9).length - answers.filter(v => v <= 6).length) / answers.length * 100) : null }; });
    return { leadHours, slaCount: withDue.length, onTime: onTime.length, slaPercent: withDue.length ? Math.round(onTime.length / withDue.length * 100) : null, stageHours, nps };
}

export function createCompany(userId:string,email:string,name:string):State{const s=seed(userId,email,name);s.demo=false;s.org.name='Minha empresa';s.people=s.people.slice(0,1).map(p=>({...p,teams:[]}));s.teams=[];s.boards=[];s.tasks=[];s.projects=[];s.clients=[];s.forms=[];s.rules=[];s.notifications=[];s.types=catalogTypes();return s;}
