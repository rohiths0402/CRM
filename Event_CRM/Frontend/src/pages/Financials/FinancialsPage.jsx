import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Plus,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { SelectField, TextField } from "../../components/common/FormControls";
import { eventService } from "../../api/services/eventService";
import { workspaceService } from "../../api/services/workspaceService";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const shortMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const AddExpenseModal = ({ open, onClose, events, onSave }) => {
  const [form, setForm] = useState({
    eventId: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Production",
    description: "",
    vendor: "",
    amount: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const saved = await onSave({
        ...form,
        eventId: Number(form.eventId),
        amount: Number(form.amount),
      });
      if (saved) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record an expense"
      subtitle="Add a cost against an event to keep its P&L up to date."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="expense-form" loading={busy}>Save expense</Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={submit} className="space-y-5">
        <SelectField label="Event" required value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })} options={events.map((item) => ({ value: item.id.toString(), label: item.title }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Expense date" required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <SelectField label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} options={["Production", "Venue", "Talent", "Marketing", "Travel", "Staff", "Other"].map((item) => ({ value: item, label: item }))} />
          <TextField label="Description" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What was this expense for?" />
          <TextField label="Vendor / payee" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} placeholder="Vendor name" />
          <TextField label="Amount (INR)" required type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0" />
        </div>
      </form>
    </Modal>
  );
};

const FinancialsPage = () => {
  const [events, setEvents] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [error, setError] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([eventService.list(), workspaceService.listExpenses()])
      .then(([eventResult, expenseResult]) => {
        setEvents(eventResult.events);
        setExpenses(expenseResult);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selectedEventId = eventFilter === "all" ? null : Number(eventFilter);
  const visibleEvents = useMemo(
    () => (events || []).filter((event) => selectedEventId === null || event.id === selectedEventId),
    [events, selectedEventId],
  );
  const visibleExpenses = useMemo(
    () => (expenses || []).filter((expense) => selectedEventId === null || expense.eventId === selectedEventId),
    [expenses, selectedEventId],
  );
  const expenseByEvent = useMemo(() => {
    const totals = new Map();
    visibleExpenses.forEach((expense) => totals.set(expense.eventId, (totals.get(expense.eventId) || 0) + Number(expense.amount)));
    return totals;
  }, [visibleExpenses]);

  const totals = useMemo(() => {
    const revenue = visibleEvents.reduce((sum, event) => sum + Number(event.grossRevenue || 0), 0);
    const costs = visibleExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return { revenue, costs, profit: revenue - costs };
  }, [visibleEvents, visibleExpenses]);

  const chartData = useMemo(() => {
    const months = new Map();
    visibleEvents.forEach((event) => {
      const month = new Date(`${event.date}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const current = months.get(month) || { month, revenue: 0, costs: 0 };
      current.revenue += Number(event.grossRevenue || 0);
      current.costs += expenseByEvent.get(event.id) || 0;
      months.set(month, current);
    });
    return [...months.values()];
  }, [visibleEvents, expenseByEvent]);

  const addExpense = async (expense) => {
    try {
      const created = await workspaceService.createExpense(expense);
      setExpenses((items) => [created, ...items]);
      toast.success("Expense recorded");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const removeExpense = async () => {
    try {
      await workspaceService.removeExpense(deleting.id);
      setExpenses((items) => items.filter((item) => item.id !== deleting.id));
      toast.success("Expense removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Event", "Date", "Ticket revenue (INR)", "Expenses (INR)", "Net (INR)"],
      ...visibleEvents.map((event) => [
        event.title,
        event.date,
        event.grossRevenue || 0,
        expenseByEvent.get(event.id) || 0,
        (event.grossRevenue || 0) - (expenseByEvent.get(event.id) || 0),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-profit-and-loss.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("P&L report downloaded");
  };

  const eventName = (id) => events?.find((event) => event.id === id)?.title || "Unknown event";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Financials & P&L"
        description="Track ticket revenue, event costs, and net performance across your live calendar."
        actions={<><Button variant="ghost" onClick={exportCsv} disabled={!events}><Download className="size-4" />Export report</Button><Button onClick={() => setModalOpen(true)} disabled={!events?.length}><Plus className="size-4" />Record expense</Button></>}
      />

      {error && <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Revenue is based on ticket sales; expenses include event budgets and recorded costs.</p>
        <div className="sm:w-72"><SelectField aria-label="Filter financials by event" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} options={[{ value: "all", label: "All events" }, ...(events || []).map((event) => ({ value: event.id.toString(), label: event.title }))]} /></div>
      </div>

      {!events && !error && <div className="h-48 animate-pulse rounded-3xl bg-card" />}
      {events && expenses && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Ticket revenue", value: money(totals.revenue), icon: ArrowUpRight, tone: "text-emerald-500" },
              { label: "Total expenses", value: money(totals.costs), icon: ArrowDownRight, tone: "text-rose-500" },
              { label: "Net profit / loss", value: money(totals.profit), icon: Wallet, tone: totals.profit >= 0 ? "text-primary" : "text-rose-500" },
              { label: "Net margin", value: totals.revenue ? `${((totals.profit / totals.revenue) * 100).toFixed(1)}%` : "—", icon: TrendingUp, tone: "text-sky-500" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-3xl border border-line bg-card p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-elevated"><Icon className={`size-5 ${tone}`} /></span>
                <p className="mt-4 text-sm text-muted">{label}</p>
                <p className="mt-1 truncate text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-lg font-semibold">Revenue vs expenses</h2><p className="mt-1 text-sm text-muted">Monthly comparison by event date</p></div>
              <div className="flex gap-4 text-xs text-muted"><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-primary" />Revenue</span><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-accent" />Expenses</span></div>
            </div>
            <div className="h-72">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={shortMoney} width={54} />
                    <Tooltip formatter={(value) => money(value)} contentStyle={{ background: "var(--elevated)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--foreground)" }} />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="costs" name="Expenses" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="grid h-full place-items-center text-sm text-muted">No financial data for this event.</p>}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-line bg-card">
            <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Event profit & loss</h2><p className="mt-1 text-xs text-muted">{visibleEvents.length} events in this report</p></div>
            {visibleEvents.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-elevated text-xs uppercase tracking-wide text-muted"><tr>{["Event", "Date", "Ticket revenue", "Expenses", "Net P&L"].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-line/70">
                    {visibleEvents.map((event) => {
                      const costs = expenseByEvent.get(event.id) || 0;
                      const profit = Number(event.grossRevenue || 0) - costs;
                      return <tr key={event.id} className="hover:bg-elevated/60"><td className="px-5 py-4 font-medium">{event.title}<p className="mt-1 text-xs text-muted">{event.city}</p></td><td className="whitespace-nowrap px-5 py-4">{new Date(`${event.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td><td className="whitespace-nowrap px-5 py-4">{money(event.grossRevenue)}</td><td className="whitespace-nowrap px-5 py-4">{money(costs)}</td><td className={`whitespace-nowrap px-5 py-4 font-semibold ${profit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{money(profit)}</td></tr>;
                    })}
                    <tr className="bg-elevated font-semibold"><td className="px-5 py-4">Total</td><td /><td className="px-5 py-4">{money(totals.revenue)}</td><td className="px-5 py-4">{money(totals.costs)}</td><td className={`px-5 py-4 ${totals.profit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{money(totals.profit)}</td></tr>
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon={TrendingUp} title="No events to report" text="Select a different event to see its financial performance." />}
          </section>

          <section className="overflow-hidden rounded-3xl border border-line bg-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-semibold">Expense ledger</h2><p className="mt-1 text-xs text-muted">Recorded operating costs</p></div><ReceiptText className="size-5 text-muted" /></div>
            {visibleExpenses.length ? (
              <div className="divide-y divide-line/70">
                {visibleExpenses.map((expense) => (
                  <div key={expense.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{expense.description}</p><p className="mt-1 text-xs text-muted">{eventName(expense.eventId)} · {expense.category} · {expense.vendor}</p></div>
                    <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-semibold">{money(expense.amount)}</p><p className="text-xs text-muted">{new Date(`${expense.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div><button type="button" onClick={() => setDeleting(expense)} aria-label={`Remove ${expense.description}`} className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/10">Remove</button></div>
                  </div>
                ))}
              </div>
            ) : <div className="p-5"><EmptyState icon={ReceiptText} title="No expenses recorded" text="Record a cost to include it in this report." /></div>}
          </section>
        </>
      )}

      <AddExpenseModal key={modalOpen ? "open" : "closed"} open={modalOpen} onClose={() => setModalOpen(false)} events={events || []} onSave={addExpense} />
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Remove this expense?" message={deleting ? `${deleting.description} (${money(deleting.amount)}) will be removed from the P&L.` : ""} confirmLabel="Remove expense" onConfirm={removeExpense} />
    </div>
  );
};

export default FinancialsPage;
