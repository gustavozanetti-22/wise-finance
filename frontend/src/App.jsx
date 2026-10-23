import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowLeftRight, ArrowUpRight, Bell, CalendarDays, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Edit3, LayoutDashboard, LogOut,
  Menu, MoreHorizontal, PieChart, Plus, ReceiptText, Search, Settings,
  Target, Trash2, TrendingUp, WalletCards, X,
} from 'lucide-react'
import { api } from './api'

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const now = new Date()
const initialPeriod = { month: now.getMonth() + 1, year: now.getFullYear() }

const demoData = {
  user: { name: 'Gustavo' },
  accounts: [
    { id: 1, name: 'Nubank', balance: 4280.5 },
    { id: 2, name: 'Carteira', balance: 740.0 },
  ],
  categories: [
    { id: 1, name: 'Alimentação' }, { id: 2, name: 'Moradia' }, { id: 3, name: 'Transporte' },
    { id: 4, name: 'Lazer' }, { id: 5, name: 'Assinaturas' }, { id: 8, name: 'Salário' },
  ],
  transactions: [
    { id: 8, description: 'Salário mensal', amount: 6200, type: 'INCOME', transactionDate: '2026-10-01', categoryId: 8, categoryName: 'Salário', accountId: 1, accountName: 'Nubank' },
    { id: 7, description: 'Aluguel', amount: 1800, type: 'EXPENSE', transactionDate: '2026-10-03', categoryId: 2, categoryName: 'Moradia', accountId: 1, accountName: 'Nubank' },
    { id: 6, description: 'Mercado do mês', amount: 654.3, type: 'EXPENSE', transactionDate: '2026-10-05', categoryId: 1, categoryName: 'Alimentação', accountId: 1, accountName: 'Nubank' },
    { id: 5, description: 'Uber', amount: 48.9, type: 'EXPENSE', transactionDate: '2026-10-06', categoryId: 3, categoryName: 'Transporte', accountId: 2, accountName: 'Carteira' },
    { id: 4, description: 'Netflix', amount: 55.9, type: 'EXPENSE', transactionDate: '2026-10-07', categoryId: 5, categoryName: 'Assinaturas', accountId: 1, accountName: 'Nubank' },
  ],
  budgets: [
    { id: 1, categoryId: 1, categoryName: 'Alimentação', amount: 800, spent: 654.3, remaining: 145.7, percentageUsed: 81.79, month: 10, year: 2026 },
    { id: 2, categoryId: 3, categoryName: 'Transporte', amount: 400, spent: 184.2, remaining: 215.8, percentageUsed: 46.05, month: 10, year: 2026 },
    { id: 3, categoryId: 5, categoryName: 'Assinaturas', amount: 180, spent: 55.9, remaining: 124.1, percentageUsed: 31.06, month: 10, year: 2026 },
  ],
  dashboard: { month: 10, year: 2026, totalBalance: 5020.5, totalIncome: 6200, totalExpense: 2559.1, net: 3640.9, transactionCount: 5, expensesByCategory: [
    { categoryId: 2, categoryName: 'Moradia', amount: 1800, percentage: 70.34 },
    { categoryId: 1, categoryName: 'Alimentação', amount: 654.3, percentage: 25.56 },
    { categoryId: 5, categoryName: 'Assinaturas', amount: 55.9, percentage: 2.18 },
    { categoryId: 3, categoryName: 'Transporte', amount: 48.9, percentage: 1.91 },
  ] },
}

function currency(value = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
}

function shortDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`)).replace('.', '')
}

function monthLabel(month, year) { return `${monthNames[month - 1]} ${year}` }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('finfinance_token'))
  const [isDemo, setIsDemo] = useState(false)
  const [view, setView] = useState('overview')
  const [period, setPeriod] = useState(initialPeriod)
  const [data, setData] = useState({ accounts: [], categories: [], transactions: [], budgets: [], dashboard: null, user: null })
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [authMode, setAuthMode] = useState('landing')
  const [showLanding, setShowLanding] = useState(false)

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  const loadData = async (activeToken = token) => {
    if (!activeToken) return
    setLoading(true)
    try {
      const query = `month=${period.month}&year=${period.year}`
      const results = await Promise.all([
        api.me(activeToken), api.accounts(activeToken), api.categories(activeToken),
        api.transactions(query, activeToken), api.budgets(period.month, period.year, activeToken),
        api.dashboard(period.month, period.year, activeToken),
      ])
      setData({ user: results[0], accounts: results[1], categories: results[2], transactions: results[3], budgets: results[4], dashboard: results[5] })
    } catch (error) {
      notify(error.message, 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (token && !isDemo) loadData(token) }, [token, period.month, period.year, isDemo])

  const enterDemo = () => { setIsDemo(true); setData(demoData); setPeriod({ month: 10, year: 2026 }); notify('Você está visualizando dados de demonstração.') }
  const handleLogin = (response) => { localStorage.setItem('finfinance_token', response.token); setToken(response.token); setData({ ...data, user: response }); notify(`Bem-vindo, ${response.name.split(' ')[0]}!`) }
  const logout = () => { localStorage.removeItem('finfinance_token'); setToken(null); setIsDemo(false); setShowLanding(false); setView('overview') }
  const openLanding = () => setShowLanding(true)
  const activeData = isDemo ? demoData : data

  const mutate = async (action, message) => {
    if (isDemo) { notify('A demonstração é somente para visualização.', 'info'); return }
    try { await action(); await loadData(); setModal(null); notify(message) } catch (error) { notify(error.message, 'error') }
  }

  if (showLanding) return <LandingPage onLogin={() => setShowLanding(false)} onRegister={() => setShowLanding(false)} onDemo={() => setShowLanding(false)} onBackToApp={() => setShowLanding(false)} />

  if (!token && !isDemo) {
    if (authMode === 'landing') return <LandingPage onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} onDemo={enterDemo} />
    return <AuthScreen initialMode={authMode} onLogin={handleLogin} onDemo={enterDemo} notify={notify} onBack={() => setAuthMode('landing')} />
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={(next) => { setView(next); setMobileNav(false) }} mobileNav={mobileNav} logout={logout} demo={isDemo} onLanding={openLanding} />
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>FinFinance</span><ChevronRight size={15} /><strong>{viewTitle(view)}</strong></div>
          <div className="top-actions">
            <div className="top-search"><Search size={17} /><input placeholder="Buscar transação..." /></div>
            <button className="icon-button"><Bell size={18} /><i /></button>
            <div className="user-chip"><span className="avatar">{(activeData.user?.name || 'G').slice(0, 1).toUpperCase()}</span><span className="user-name">{activeData.user?.name || 'Gustavo'}</span><ChevronDown size={15} /></div>
          </div>
        </header>
        <div className="content-wrap">
          <div className="page-heading">
            <div><p className="eyebrow">{isDemo ? 'Modo demonstração' : 'Visão financeira'}</p><h1>{viewTitle(view)}</h1><p className="muted">Acompanhe seu dinheiro com clareza e tranquilidade.</p></div>
            <div className="heading-actions"><PeriodPicker period={period} setPeriod={setPeriod} /><button className="primary-button" onClick={() => setModal({ type: 'transaction' })}><Plus size={17} /> Nova transação</button></div>
          </div>
          {loading && <div className="loading-line"><span /> Atualizando seus dados...</div>}
          {view === 'overview' && <Overview data={activeData} period={period} setView={setView} />}
          {view === 'transactions' && <TransactionsPage data={activeData} setModal={setModal} onDelete={(id) => mutate(() => api.deleteTransaction(id, token), 'Transação excluída.')} />}
          {view === 'budgets' && <BudgetPage data={activeData} period={period} setModal={setModal} onDelete={(id) => mutate(() => api.deleteBudget(id, token), 'Orçamento excluído.')} />}
          {view === 'accounts' && <AccountsPage data={activeData} setModal={setModal} onDelete={(id) => mutate(() => api.deleteAccount(id, token), 'Conta excluída.')} />}
          {view === 'settings' && <SettingsPage user={activeData.user} logout={logout} />}
        </div>
      </main>
      {modal?.type === 'transaction' && <Modal title={modal.item ? 'Editar transação' : 'Nova transação'} close={() => setModal(null)}><TransactionForm item={modal.item} data={activeData} onSubmit={(payload) => mutate(() => modal.item ? api.updateTransaction(modal.item.id, payload, token) : api.createTransaction(payload, token), modal.item ? 'Transação atualizada.' : 'Transação criada.')} /></Modal>}
      {modal?.type === 'budget' && <Modal title={modal.item ? 'Editar orçamento' : 'Novo orçamento'} close={() => setModal(null)}><BudgetForm item={modal.item} data={activeData} period={period} onSubmit={(payload) => mutate(() => modal.item ? api.updateBudget(modal.item.id, payload, token) : api.createBudget(payload, token), modal.item ? 'Orçamento atualizado.' : 'Orçamento criado.')} /></Modal>}
      {modal?.type === 'account' && <Modal title={modal.item ? 'Editar conta' : 'Nova conta'} close={() => setModal(null)}><AccountForm item={modal.item} onSubmit={(payload) => mutate(() => modal.item ? api.updateAccount(modal.item.id, payload, token) : api.createAccount(payload, token), modal.item ? 'Conta atualizada.' : 'Conta criada.')} /></Modal>}
      {toast && <div className={`toast toast-${toast.type}`}><CheckCircle2 size={17} /> {toast.message}</div>}
    </div>
  )
}

function viewTitle(view) { return ({ overview: 'Visão geral', transactions: 'Transações', budgets: 'Orçamento', accounts: 'Contas', settings: 'Configurações' })[view] }

function Sidebar({ view, setView, mobileNav, logout, demo, onLanding }) {
  const items = [{ id: 'overview', label: 'Visão geral', icon: LayoutDashboard }, { id: 'transactions', label: 'Transações', icon: ArrowLeftRight }, { id: 'budgets', label: 'Orçamento', icon: Target }]
  return <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
    <button type="button" className="brand brand-link" onClick={onLanding} title="Voltar para a apresentação"><span className="brand-mark"><TrendingUp size={20} /></span><span>fin <span>finance</span></span></button>
    <div className="sidebar-label">Menu principal</div>
    <nav>{items.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} onClick={() => setView(id)}><Icon size={18} /><span>{label}</span>{id === 'budgets' && <em>Novo</em>}</button>)}</nav>
    <div className="sidebar-label sidebar-label-lower">Preferências</div>
    <nav><button className={view === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => setView('settings')}><Settings size={18} /><span>Configurações</span></button><button className="nav-item"><CircleHelp size={18} /><span>Ajuda e suporte</span></button></nav>
    <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><PieChart size={17} /></div><div><strong>Plano gratuito</strong><span>Seu controle começa aqui</span></div><ChevronRight size={16} /></div><button className="nav-item logout" onClick={logout}><LogOut size={18} /><span>{demo ? 'Sair da demonstração' : 'Sair da conta'}</span></button><div className="sidebar-footer">FinFinance <span>v1.0</span></div></div>
  </aside>
}

function PeriodPicker({ period, setPeriod }) {
  return <label className="period-picker"><CalendarDays size={16} /><select value={`${period.year}-${String(period.month).padStart(2, '0')}`} onChange={(e) => { const [year, month] = e.target.value.split('-').map(Number); setPeriod({ year, month }) }}><option value="2026-10">Outubro 2026</option><option value="2026-09">Setembro 2026</option><option value="2026-08">Agosto 2026</option><option value="2026-07">Julho 2026</option><option value="2026-06">Junho 2026</option></select><ChevronDown size={15} /></label>
}

function Overview({ data, period, setView }) {
  const dashboard = data.dashboard || {}
  const topCategory = dashboard.expensesByCategory?.[0]
  return <div className="page-grid">
    <section className="metrics-grid"><MetricCard label="Saldo total" value={currency(dashboard.totalBalance)} helper="Em todas as suas contas" icon={<WalletCards />} tone="purple" /><MetricCard label="Receitas" value={currency(dashboard.totalIncome)} helper={`Entradas em ${monthNames[period.month - 1]}`} icon={<ArrowUpRight />} tone="green" trend="+ 12,4%" /><MetricCard label="Despesas" value={currency(dashboard.totalExpense)} helper={`Saídas em ${monthNames[period.month - 1]}`} icon={<ArrowDownRight />} tone="orange" trend="- 8,1%" /><MetricCard label="Resultado do mês" value={currency(dashboard.net)} helper="Receitas menos despesas" icon={<TrendingUp />} tone="blue" /></section>
    <section className="overview-main"><SpendingCard dashboard={dashboard} /><RecentTransactions transactions={data.transactions} setView={setView} /></section>
    <section className="overview-side"><BudgetSnapshot budgets={data.budgets} setView={setView} /><CategorySnapshot dashboard={dashboard} highlight={topCategory} /></section>
  </div>
}

function MetricCard({ label, value, helper, icon, tone, trend }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>{trend && <b className={`metric-trend ${tone}`}>{trend}</b>}</div> }

function SpendingCard({ dashboard }) {
  const palette = ['#0d6444', '#2eaa78', '#ee8a78', '#f2b84b', '#3e9c8b']
  const categories = dashboard.expensesByCategory?.slice(0, 5) || []
  const total = categories.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  let cursor = 0
  const segments = categories.map((item, index) => {
    const percentage = total ? (Number(item.amount || 0) / total) * 100 : 0
    const segment = palette[index % palette.length] + ' ' + cursor + '% ' + (cursor + percentage) + '%'
    cursor += percentage
    return { ...item, percentage, segment, color: palette[index % palette.length] }
  })
  const background = segments.length ? 'conic-gradient(' + segments.map((item) => item.segment).join(', ') + ')' : '#dcece5'
  return <div className="panel spending-panel"><div className="panel-heading"><div><h2>Onde foi meu dinheiro?</h2><p>Distribuição das despesas por categoria</p></div><button className="ghost-button">Este mês <ChevronDown size={14} /></button></div><div className="donut-layout"><div className="donut-chart" style={{ background }}><div className="donut-hole"><span>Total gasto</span><strong>{currency(dashboard.totalExpense)}</strong></div></div><div className="donut-legend">{segments.map((item) => <div className="donut-legend-row" key={item.categoryId}><span><i style={{ background: item.color }} />{item.categoryName}</span><strong>{currency(item.amount)}</strong></div>)}{segments.length === 0 && <span className="muted">Nenhuma despesa neste período.</span>}</div></div></div>
}

function RecentTransactions({ transactions = [], setView }) { return <div className="panel recent-panel"><div className="panel-heading"><div><h2>Transações recentes</h2><p>Suas últimas movimentações</p></div><button className="text-button" onClick={() => setView('transactions')}>Ver todas <ChevronRight size={15} /></button></div><div className="transaction-list">{transactions.slice(0, 5).map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</div>{transactions.length === 0 && <EmptyState icon={<ReceiptText />} title="Nenhuma transação neste período" />}</div> }

function TransactionRow({ transaction, compact = false, onEdit, onDelete }) { const income = transaction.type === 'INCOME'; return <div className={`transaction-row ${compact ? 'compact' : ''}`}><div className={`transaction-symbol ${income ? 'income' : 'expense'}`}>{income ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}</div><div className="transaction-info"><strong>{transaction.description}</strong><span>{transaction.categoryName || 'Sem categoria'} · {shortDate(transaction.transactionDate)}</span></div><strong className={`transaction-amount ${income ? 'income-text' : ''}`}>{income ? '+' : '-'} {currency(transaction.amount)}</strong>{(onEdit || onDelete) && <div className="row-actions"><button onClick={() => onEdit(transaction)}><Edit3 size={15} /></button><button onClick={() => onDelete(transaction.id)}><Trash2 size={15} /></button></div>}</div> }

function BudgetSnapshot({ budgets = [], setView }) { return <div className="panel budget-snapshot"><div className="panel-heading"><div><h2>Orçamento</h2><p>Acompanhe seus limites</p></div><button className="text-button" onClick={() => setView('budgets')}>Ver todos <ChevronRight size={15} /></button></div>{budgets.slice(0, 3).map((budget) => <BudgetProgress key={budget.id} budget={budget} />)}{budgets.length === 0 && <EmptyState icon={<Target />} title="Crie seu primeiro orçamento" />}</div> }
function BudgetProgress({ budget }) { const percentage = Math.min(Number(budget.percentageUsed || 0), 100); const over = Number(budget.spent) > Number(budget.amount); return <div className="budget-progress"><div className="budget-line"><span>{budget.categoryName}</span><strong className={over ? 'danger-text' : ''}>{currency(budget.spent)} <small>/ {currency(budget.amount)}</small></strong></div><div className="progress-track"><span className={over ? 'over' : percentage > 80 ? 'warning' : ''} style={{ width: `${percentage}%` }} /></div><div className="budget-foot"><small>{percentage.toFixed(0)}% utilizado</small><small className={over ? 'danger-text' : ''}>{over ? 'Acima do limite' : `${currency(budget.remaining)} restantes`}</small></div></div> }

function CategorySnapshot({ dashboard, highlight }) { return <div className="panel category-panel"><div className="panel-heading"><div><h2>Maiores despesas</h2><p>Distribuição por categoria</p></div><MoreHorizontal size={19} className="muted-icon" /></div>{dashboard.expensesByCategory?.slice(0, 4).map((item, index) => <div className="category-row" key={item.categoryId}><span className={`category-rank rank-${index + 1}`}>{index + 1}</span><div className="category-name"><strong>{item.categoryName}</strong><div className="mini-track"><span style={{ width: `${item.percentage}%` }} /></div></div><strong>{currency(item.amount)}</strong></div>)}{!highlight && <EmptyState icon={<PieChart />} title="Sem despesas no período" />}</div> }

function TransactionsPage({ data, setModal, onDelete }) { const [filter, setFilter] = useState('ALL'); const transactions = filter === 'ALL' ? data.transactions : data.transactions.filter((item) => item.type === filter); return <div className="panel page-panel"><div className="table-toolbar"><div className="segmented"><button className={filter === 'ALL' ? 'selected' : ''} onClick={() => setFilter('ALL')}>Todas</button><button className={filter === 'INCOME' ? 'selected' : ''} onClick={() => setFilter('INCOME')}>Receitas</button><button className={filter === 'EXPENSE' ? 'selected' : ''} onClick={() => setFilter('EXPENSE')}>Despesas</button></div><button className="primary-button small" onClick={() => setModal({ type: 'transaction' })}><Plus size={16} /> Adicionar</button></div><div className="transactions-table"><div className="table-head"><span>Descrição</span><span>Categoria</span><span>Conta</span><span>Data</span><span>Valor</span><span /></div>{transactions.map((transaction) => <div className="table-row" key={transaction.id}><TransactionRow transaction={transaction} compact onEdit={(item) => setModal({ type: 'transaction', item })} onDelete={onDelete} /><span className="table-category">{transaction.categoryName}</span><span className="table-account">{transaction.accountName}</span><span className="table-date">{shortDate(transaction.transactionDate)}</span><strong className={`table-value ${transaction.type === 'INCOME' ? 'income-text' : ''}`}>{transaction.type === 'INCOME' ? '+' : '-'} {currency(transaction.amount)}</strong><span className="table-more"><MoreHorizontal size={17} /></span></div>)}</div>{transactions.length === 0 && <EmptyState icon={<ReceiptText />} title="Nenhuma transação encontrada" description="Tente alterar o filtro ou adicione uma nova transação." />}</div> }

function BudgetPage({ data, period, setModal, onDelete }) { return <div><div className="section-actions"><div><h2 className="section-title">Limites de {monthNames[period.month - 1]}</h2><p className="muted">Defina quanto deseja gastar por categoria.</p></div><button className="primary-button" onClick={() => setModal({ type: 'budget' })}><Plus size={17} /> Novo orçamento</button></div><div className="budget-grid">{data.budgets.map((budget) => <div className="budget-card" key={budget.id}><div className="budget-card-top"><span className="category-badge"><Target size={15} /> {budget.categoryName}</span><div className="card-menu"><button onClick={() => setModal({ type: 'budget', item: budget })}><Edit3 size={15} /></button><button onClick={() => onDelete(budget.id)}><Trash2 size={15} /></button></div></div><div className="budget-card-values"><div><span>Gasto atual</span><strong>{currency(budget.spent)}</strong></div><div><span>Limite mensal</span><strong>{currency(budget.amount)}</strong></div></div><BudgetProgress budget={budget} /></div>)}{data.budgets.length === 0 && <div className="full-empty"><EmptyState icon={<Target />} title="Seu orçamento começa aqui" description="Crie limites por categoria para acompanhar seus hábitos." action="Criar orçamento" onAction={() => setModal({ type: 'budget' })} /></div>}</div></div> }

function AccountsPage({ data, setModal, onDelete }) { const total = data.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0); return <div><div className="section-actions"><div><h2 className="section-title">Suas contas</h2><p className="muted">Um lugar para cada parte do seu dinheiro.</p></div><button className="primary-button" onClick={() => setModal({ type: 'account' })}><Plus size={17} /> Nova conta</button></div><div className="account-total"><span>Saldo consolidado</span><strong>{currency(total)}</strong><small>Atualizado agora</small></div><div className="accounts-grid">{data.accounts.map((account, index) => <div className={`account-card account-${index % 3}`} key={account.id}><div className="account-card-head"><span className="bank-symbol">{account.name.slice(0, 1)}</span><div><strong>{account.name}</strong><span>Conta principal</span></div><div className="card-menu"><button onClick={() => setModal({ type: 'account', item: account })}><Edit3 size={15} /></button><button onClick={() => onDelete(account.id)}><Trash2 size={15} /></button></div></div><span className="account-label">Saldo disponível</span><strong className="account-balance">{currency(account.balance)}</strong><div className="account-card-foot"><span>•••• 2840</span><WalletCards size={17} /></div></div>)}</div></div> }

function SettingsPage({ user, logout }) { return <div className="settings-grid"><div className="panel settings-card"><div className="settings-profile"><span className="avatar large">{(user?.name || 'G').slice(0, 1).toUpperCase()}</span><div><h2>{user?.name || 'Gustavo'}</h2><p>{user?.email || 'Sua conta FinFinance'}</p></div><button className="outline-button">Editar perfil</button></div><div className="settings-row"><div><strong>Preferências de notificações</strong><span>Receba um resumo semanal dos seus gastos.</span></div><label className="switch"><input type="checkbox" defaultChecked /><span /></label></div><div className="settings-row"><div><strong>Modo compacto</strong><span>Mostre mais transações em menos espaço.</span></div><label className="switch"><input type="checkbox" /><span /></label></div></div><div className="panel settings-danger"><h2>Zona de segurança</h2><p>Saia da sua conta neste dispositivo.</p><button className="danger-button" onClick={logout}><LogOut size={16} /> Sair da conta</button></div></div> }

function Modal({ title, close, children }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><div className="modal"><div className="modal-header"><div><h2>{title}</h2><p>Preencha os dados abaixo.</p></div><button className="close-button" onClick={close}><X size={18} /></button></div>{children}</div></div> }

function TransactionForm({ item, data, onSubmit }) { const [form, setForm] = useState({ description: item?.description || '', amount: item?.amount || '', type: item?.type || 'EXPENSE', transactionDate: item?.transactionDate || new Date().toISOString().slice(0, 10), categoryId: item?.categoryId || data.categories?.[0]?.id || '', accountId: item?.accountId || data.accounts?.[0]?.id || '' }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), categoryId: Number(form.categoryId), accountId: Number(form.accountId) }) }}><label className="field wide"><span>Descrição</span><input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Mercado do mês" /></label><label className="field"><span>Valor</span><div className="input-prefix"><b>R$</b><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" /></div></label><label className="field"><span>Tipo</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select></label><label className="field"><span>Data</span><input required type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} /></label><label className="field"><span>Categoria</span><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="field wide"><span>Conta</span><select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>{data.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><FormActions submit={item ? 'Salvar alterações' : 'Adicionar transação'} /></form> }
function BudgetForm({ item, data, period, onSubmit }) { const [form, setForm] = useState({ amount: item?.amount || '', month: item?.month || period.month, year: item?.year || period.year, categoryId: item?.categoryId || data.categories?.[0]?.id || '' }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), month: Number(form.month), year: Number(form.year), categoryId: Number(form.categoryId) }) }}><label className="field wide"><span>Categoria</span><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{data.categories.filter((category) => category.name !== 'Salário').map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="field"><span>Limite mensal</span><div className="input-prefix"><b>R$</b><input required min="0" step="0.01" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="800,00" /></div></label><label className="field"><span>Mês</span><select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>{monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label><label className="field"><span>Ano</span><input required min="2000" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label><FormActions submit={item ? 'Salvar orçamento' : 'Criar orçamento'} /></form> }
function AccountForm({ item, onSubmit }) { const [form, setForm] = useState({ name: item?.name || '', balance: item?.balance || '' }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); onSubmit({ name: form.name, balance: Number(form.balance) }) }}><label className="field wide"><span>Nome da conta</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nubank" /></label><label className="field wide"><span>Saldo inicial</span><div className="input-prefix"><b>R$</b><input required min="0" step="0.01" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0,00" /></div></label><FormActions submit={item ? 'Salvar conta' : 'Adicionar conta'} /></form> }
function FormActions({ submit }) { return <div className="form-actions"><button type="button" className="outline-button" onClick={() => document.querySelector('.close-button')?.click()}>Cancelar</button><button type="submit" className="primary-button">{submit}</button></div> }
function EmptyState({ icon, title, description, action, onAction }) { return <div className="empty-state">{icon && <div className="empty-icon">{icon}</div>}<strong>{title}</strong>{description && <p>{description}</p>}{action && <button className="primary-button small" onClick={onAction}><Plus size={15} /> {action}</button>}</div> }

function LandingPage({ onLogin, onRegister, onDemo, onBackToApp }) {
  return <div className="landing-page">
    <header className="landing-nav">
      <div className="landing-brand landing-brand-link" onClick={onBackToApp} role={onBackToApp ? "button" : undefined} title={onBackToApp ? "Voltar para o painel" : undefined}><span className="brand-mark"><TrendingUp size={19} /></span><span>fin <span>finance</span></span></div>
      <nav className="landing-links"><a href="#beneficios">Benefícios</a><a href="#funcionalidades">Funcionalidades</a><a href="#como-funciona">Como funciona</a></nav>
      <div className="landing-actions"><button className="landing-login" onClick={onBackToApp || onLogin}>{onBackToApp ? "Voltar ao painel" : "Entrar"}</button><button className="primary-button small" onClick={onBackToApp || onRegister}>{onBackToApp ? "Ir para o painel" : "Criar conta"} <ChevronRight size={15} /></button></div>
    </header>
    <main>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><CheckCircle2 size={15} /> Finanças mais leves, decisões mais inteligentes</span>
          <h1>Sua grana.<br /><em>Suas regras.</em></h1>
          <p>Organize seus gastos, planeje seus objetivos e entenda seu dinheiro de um jeito simples, visual e sem julgamentos.</p>
          <div className="landing-hero-actions"><button className="primary-button" onClick={onRegister}>Começar de graça <ChevronRight size={17} /></button><button className="outline-button" onClick={onDemo}>Conhecer a plataforma <ChevronRight size={16} /></button></div>
          <div className="landing-trust"><span><CheckCircle2 size={14} /> Grátis para começar</span><span><CheckCircle2 size={14} /> Sem cartão</span><span><CheckCircle2 size={14} /> Seus dados protegidos</span></div>
        </div>
        <div className="landing-preview" aria-label="Prévia do painel FinFinance">
          <div className="preview-window"><div className="preview-top"><span className="preview-dots"><i /><i /><i /></span><span className="preview-url">app.finfinance.com</span><span className="preview-avatar">G</span></div><div className="preview-body"><aside><div className="preview-logo"><TrendingUp size={14} /></div><span className="preview-nav active" /><span className="preview-nav" /><span className="preview-nav" /><span className="preview-nav" /></aside><div className="preview-content"><div className="preview-greeting"><span>Olá, Gustavo!</span><b>Outubro 2026</b></div><h3>Visão geral</h3><div className="preview-metrics"><i /><i /><i /></div><div className="preview-panels"><div className="preview-chart"><span className="preview-heading" /><div className="preview-bars"><b /><b /><b /><b /><b /><b /><b /></div></div><div className="preview-donut"><span /><div /></div></div></div></div></div>
        </div>
      </section>
      <section className="landing-benefits" id="beneficios"><div><CheckCircle2 size={18} /><strong>Tudo sobre sua vida financeira em um só lugar</strong></div><div><TrendingUp size={18} /><strong>Orientação em uma linguagem que faz sentido</strong></div><div><WalletCards size={18} /><strong>Privacidade e segurança desde o primeiro acesso</strong></div></section>
      <section className="landing-feature" id="funcionalidades"><div className="landing-feature-copy"><span className="eyebrow">Feito para a vida real</span><h2>Cuidar do dinheiro não precisa ser um peso</h2><p>Tenha uma visão clara das suas movimentações, acompanhe seus limites e faça escolhas com mais tranquilidade.</p><button className="text-button" onClick={onRegister}>Quero organizar minha vida financeira <ChevronRight size={15} /></button></div><div className="landing-feature-card"><div className="feature-card-title"><strong>Onde foi meu dinheiro?</strong><span>Este mês</span></div><div className="feature-donut"><div><strong>R$ 2.559</strong><span>despesas</span></div></div><div className="feature-legend"><span><i className="feature-dot green" />Moradia <b>R$ 1.800</b></span><span><i className="feature-dot orange" />Alimentação <b>R$ 654</b></span><span><i className="feature-dot blue" />Transporte <b>R$ 49</b></span></div></div></section>
      <section className="landing-final" id="como-funciona"><span className="eyebrow">Seu próximo passo começa aqui</span><h2>Mais clareza para viver o seu dinheiro.</h2><button className="primary-button" onClick={onRegister}>Criar minha conta <ChevronRight size={17} /></button></section>
    </main>
    <footer className="landing-footer"><span>Grana</span><span>Seu dinheiro, do seu jeito.</span></footer>
  </div>
}

function AuthScreen({ initialMode = 'login', onLogin, onDemo, notify, onBack }) { const [mode, setMode] = useState(initialMode); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [loading, setLoading] = useState(false); const submit = async (event) => { event.preventDefault(); setLoading(true); try { const response = mode === 'login' ? await api.login({ email: form.email, password: form.password }) : await api.register(form).then(() => api.login({ email: form.email, password: form.password })); onLogin(response) } catch (error) { notify(error.message, 'error') } finally { setLoading(false) } }; return <div className="auth-screen"><div className="auth-art"><div className="auth-brand"><span className="brand-mark"><TrendingUp size={20} /></span>fin<span>finance</span></div><div className="auth-art-copy"><span className="auth-kicker">Sua vida financeira, mais leve.</span><h1>Clareza para<br /><em>cada escolha.</em></h1><p>Organize seu dinheiro, acompanhe seus objetivos e construa um futuro mais tranquilo.</p></div><div className="auth-art-stat"><TrendingUp size={18} /><div><strong>+ 18,6%</strong><span>de evolução este mês</span></div></div></div><div className="auth-form-wrap"><div className="auth-form"><div className="mobile-auth-brand"><span className="brand-mark"><TrendingUp size={20} /></span>fin<span>finance</span></div>{onBack && <button className="auth-back" onClick={onBack}><ArrowLeftRight size={14} /> Voltar para apresentação</button>}<span className="eyebrow">{mode === 'login' ? 'Bem-vindo de volta' : 'Comece agora'}</span><h2>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h2><p className="muted">{mode === 'login' ? 'Entre para continuar seu controle financeiro.' : 'Leva menos de um minuto para começar.'}</p><form onSubmit={submit}>{mode === 'register' && <label className="field"><span>Nome completo</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como podemos te chamar?" /></label>}<label className="field"><span>E-mail</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" /></label><label className="field"><span>Senha</span><input required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label><button className="primary-button auth-submit" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'} <ChevronRight size={17} /></button></form><div className="auth-divider"><span>ou</span></div><button className="outline-button demo-button" onClick={onDemo}>Explorar demonstração</button><p className="auth-switch">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'} <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Criar agora' : 'Entrar'}</button></p></div></div></div> }

export default App
