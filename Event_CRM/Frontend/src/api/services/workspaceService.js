import { mockCrew, mockExpenses, mockProposals } from "../../mocks/mockWorkspace";

const keys = {
  proposals: "loop_workspace_proposals",
  crew: "loop_workspace_crew",
  expenses: "loop_workspace_expenses",
};

const readList = (key, initial) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial.map((item) => ({ ...item }));
};

const writeList = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
  return items;
};

const nextId = (items) =>
  Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;

const listProposals = async () => readList(keys.proposals, mockProposals);

const saveProposal = async (proposal) => {
  const proposals = readList(keys.proposals, mockProposals);
  if (proposal.id) {
    const index = proposals.findIndex((item) => item.id === proposal.id);
    if (index < 0) throw new Error("Proposal not found");
    proposals[index] = { ...proposals[index], ...proposal };
    return writeList(keys.proposals, proposals)[index];
  }
  const created = {
    ...proposal,
    id: nextId(proposals),
    receivedAt: new Date().toISOString().slice(0, 10),
    status: "NEW",
  };
  writeList(keys.proposals, [created, ...proposals]);
  return created;
};

const updateProposalStatus = async (id, status) => {
  const proposals = readList(keys.proposals, mockProposals);
  const index = proposals.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Proposal not found");
  proposals[index] = { ...proposals[index], status };
  return writeList(keys.proposals, proposals)[index];
};

const listCrew = async () => readList(keys.crew, mockCrew);

const saveCrewMember = async (member) => {
  const crew = readList(keys.crew, mockCrew);
  if (member.id) {
    const index = crew.findIndex((item) => item.id === member.id);
    if (index < 0) throw new Error("Crew member not found");
    crew[index] = { ...crew[index], ...member };
    return writeList(keys.crew, crew)[index];
  }
  const created = { ...member, id: nextId(crew) };
  writeList(keys.crew, [created, ...crew]);
  return created;
};

const removeCrewMember = async (id) => {
  const crew = readList(keys.crew, mockCrew);
  const remaining = crew.filter((member) => member.id !== id);
  if (remaining.length === crew.length) throw new Error("Crew member not found");
  writeList(keys.crew, remaining);
};

const listExpenses = async () => readList(keys.expenses, mockExpenses);

const createExpense = async (expense) => {
  const expenses = readList(keys.expenses, mockExpenses);
  const created = { ...expense, id: nextId(expenses) };
  writeList(keys.expenses, [created, ...expenses]);
  return created;
};

const removeExpense = async (id) => {
  const expenses = readList(keys.expenses, mockExpenses);
  const remaining = expenses.filter((expense) => expense.id !== id);
  if (remaining.length === expenses.length) throw new Error("Expense not found");
  writeList(keys.expenses, remaining);
};

export const workspaceService = {
  listProposals,
  saveProposal,
  updateProposalStatus,
  listCrew,
  saveCrewMember,
  removeCrewMember,
  listExpenses,
  createExpense,
  removeExpense,
};
