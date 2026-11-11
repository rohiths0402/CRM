/**
 * Demo records for trying out the CRM. Everything goes through the normal APIs,
 * so the same validation rules apply as when a person fills in the forms.
 * Each CRM is skipped if its sample records are already there.
 */
import api from "./api";
import {
  ottProjectsApi,
  castCrewApi,
  schedulesApi,
  locationsApi,
  expensesApi,
  contractsApi,
  tasksApi,
  teamMembersApi,
  paymentsApi,
  vendorsApi,
  quotationsApi,
  purchaseOrdersApi,
  vendorInvoicesApi,
  vendorPaymentsApi,
  vendorDocumentsApi,
} from "./crmApi";
import { canUseProduction, canUseVendor } from "./access";

/** "YYYY-MM-DD", `offset` days from today. */
function day(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const PROJECTS = {
  kingdom: "The Last Kingdom",
  city: "City Lights",
  coastal: "Coastal Tales",
  midnight: "Midnight Express",
};

async function loadProduction(log) {
  const existing = await ottProjectsApi.list();
  if (existing.some((p) => p.projectName === PROJECTS.kingdom)) {
    log("Production CRM sample data is already there; skipped.");
    return 0;
  }
  let count = 0;
  const add = async (fn, payload) => {
    const record = await fn(payload);
    count += 1;
    return record;
  };

  for (const house of [
    { companyName: "Sun Pictures", contactPerson: "Kalanithi R", email: "contact@sunpictures.in", phone: "9876543210", location: "Chennai, Tamil Nadu", website: "https://www.sunpictures.in", status: "Active", description: "Film production and distribution." },
    { companyName: "Lyca Productions", contactPerson: "Subaskaran A", email: "info@lycaproductions.in", phone: "9876543211", location: "Chennai, Tamil Nadu", website: "https://www.lycaproductions.in", status: "Active", description: "Feature films and web series." },
    { companyName: "Hombale Films", contactPerson: "Vijay K", email: "hello@hombalefilms.in", phone: "9876543212", location: "Bengaluru, Karnataka", website: "", status: "Inactive", description: "Co-production partner." },
  ]) {
    await add((p) => api.post("/production-houses", p), house);
  }

  const projects = {};
  for (const [key, project] of Object.entries({
    kingdom: { projectName: PROJECTS.kingdom, platform: "Netflix", projectType: "Web Series", genre: "Historical Thriller", language: "Tamil", startDate: day(-120), endDate: day(180), budget: 50000000, projectManager: "Arun Kumar", status: "In Progress", description: "8-episode period drama." },
    city: { projectName: PROJECTS.city, platform: "Amazon Prime Video", projectType: "Movie", genre: "Drama", language: "Hindi", startDate: day(20), endDate: day(240), budget: 30000000, projectManager: "Meera Nair", status: "Planning", description: "Feature film set in Mumbai." },
    coastal: { projectName: PROJECTS.coastal, platform: "ZEE5", projectType: "Documentary", genre: "Travel", language: "Malayalam", startDate: day(-300), endDate: day(-30), budget: 8000000, projectManager: "Joseph Thomas", status: "Completed", description: "Kerala coastline documentary." },
    midnight: { projectName: PROJECTS.midnight, platform: "Sony LIV", projectType: "Web Series", genre: "Crime", language: "Telugu", startDate: day(-45), endDate: day(150), budget: 25000000, projectManager: "Arun Kumar", status: "In Progress", description: "Crime thriller, season 1." },
  })) {
    projects[key] = await add(ottProjectsApi.create, project);
  }

  for (const member of [
    { name: "Rahul Sharma", role: "Director", department: "Direction", email: "rahul@example.com", phone: "9876500001" },
    { name: "Priya Menon", role: "Line Producer", department: "Production", email: "priya@example.com", phone: "9876500002" },
    { name: "Vikram Rao", role: "Director of Photography", department: "Camera", email: "vikram@example.com", phone: "9876500003" },
    { name: "Anjali Das", role: "Costume Designer", department: "Costume", email: "anjali@example.com", phone: "9876500004" },
    { name: "Sameer Khan", role: "Sound Engineer", department: "Sound", email: "sameer@example.com", phone: "9876500005" },
  ]) {
    await add(teamMembersApi.create, member);
  }

  for (const person of [
    { name: "Arjun Kumar", role: "Actor", email: "arjun@example.com", phone: "9876543220", experience: "8 Years", location: "Chennai", status: "On Project", project: PROJECTS.kingdom },
    { name: "Divya Iyer", role: "Actor", email: "divya@example.com", phone: "9876543221", experience: "5 Years", location: "Chennai", status: "On Project", project: PROJECTS.kingdom },
    { name: "Karthik Subbaraj", role: "Director", email: "karthik@example.com", phone: "9876543222", experience: "12 Years", location: "Madurai", status: "Available", project: "" },
    { name: "Ravi Varman", role: "Cinematographer", email: "ravi.v@example.com", phone: "9876543223", experience: "15 Years", location: "Hyderabad", status: "On Project", project: PROJECTS.midnight },
    { name: "Sreekar Prasad", role: "Editor", email: "sreekar@example.com", phone: "9876543224", experience: "20 Years", location: "Chennai", status: "Available", project: "" },
    { name: "Neha Kapoor", role: "Writer", email: "neha@example.com", phone: "9876543225", experience: "6 Years", location: "Mumbai", status: "Unavailable", project: PROJECTS.city },
  ]) {
    await add(castCrewApi.create, person);
  }

  for (const location of [
    { name: "Chennai Film City", type: "Studio", address: "Taramani", city: "Chennai", state: "Tamil Nadu", mapUrl: "", rentalCost: 25000, project: PROJECTS.kingdom, contactPerson: "Ramesh", contactPhone: "9876543230", status: "Approved", description: "Two sound stages." },
    { name: "Gingee Fort", type: "Outdoor", address: "Gingee", city: "Villupuram", state: "Tamil Nadu", mapUrl: "", rentalCost: 40000, project: PROJECTS.kingdom, contactPerson: "ASI office", contactPhone: "9876543231", status: "Approved", description: "Permit needed 10 days ahead." },
    { name: "Ramoji Street Set", type: "Set", address: "Anaspur", city: "Hyderabad", state: "Telangana", mapUrl: "", rentalCost: 60000, project: PROJECTS.midnight, contactPerson: "Suresh", contactPhone: "9876543232", status: "Pending", description: "" },
    { name: "Bandra Bungalow", type: "Private Property", address: "Bandra West", city: "Mumbai", state: "Maharashtra", mapUrl: "", rentalCost: 75000, project: PROJECTS.city, contactPerson: "Mrs. D'Souza", contactPhone: "9876543233", status: "Pending", description: "" },
  ]) {
    await add(locationsApi.create, location);
  }

  for (const schedule of [
    { title: "Palace courtyard scenes", project: PROJECTS.kingdom, date: day(2), startTime: "07:00", endTime: "18:00", endsNextDay: false, location: "Chennai Film City", crew: "Arjun Kumar, Divya Iyer", status: "Confirmed", description: "" },
    { title: "Fort battle night shoot", project: PROJECTS.kingdom, date: day(6), startTime: "20:00", endTime: "04:00", endsNextDay: true, location: "Gingee Fort", crew: "Arjun Kumar", status: "Planned", description: "Generator backup needed." },
    { title: "Chase sequence", project: PROJECTS.midnight, date: day(9), startTime: "06:00", endTime: "14:00", endsNextDay: false, location: "Ramoji Street Set", crew: "Ravi Varman", status: "Planned", description: "" },
    { title: "Look test", project: PROJECTS.city, date: day(15), startTime: "10:00", endTime: "16:00", endsNextDay: false, location: "Bandra Bungalow", crew: "Neha Kapoor", status: "Planned", description: "" },
    { title: "Opening montage", project: PROJECTS.kingdom, date: day(-10), startTime: "06:00", endTime: "12:00", endsNextDay: false, location: "Chennai Film City", crew: "Divya Iyer", status: "Completed", description: "" },
  ]) {
    await add(schedulesApi.create, schedule);
  }

  for (const expense of [
    { projectId: projects.kingdom.id, title: "Film City stage rent", vendor: "Chennai Film City", category: "Location", date: day(-20), amount: 750000, status: "Paid" },
    { projectId: projects.kingdom.id, title: "Camera & lens package", vendor: "Prime Lights Rentals", category: "Equipment", date: day(-15), amount: 1200000, status: "Partially Paid" },
    { projectId: projects.kingdom.id, title: "Crew lunch, week 3", vendor: "Spice Route Caterers", category: "Food", date: day(-5), amount: 180000, status: "Pending" },
    { projectId: projects.midnight.id, title: "Hotel for outstation crew", vendor: "Taj Krishna", category: "Accommodation", date: day(-12), amount: 420000, status: "Paid" },
    { projectId: projects.midnight.id, title: "Crew travel", vendor: "FastWheels Transport", category: "Travel", date: day(-8), amount: 95000, status: "Pending" },
    { projectId: projects.coastal.id, title: "Colour grading", vendor: "Pixel Forge Studios", category: "Post-production", date: day(-40), amount: 600000, status: "Paid" },
  ]) {
    await add(expensesApi.create, expense);
  }

  for (const contract of [
    { title: "Lead Actor Agreement", type: "Artist", party: "Arjun Kumar", project: PROJECTS.kingdom, startDate: day(-130), endDate: day(180), value: 15000000, paymentTerms: "40% signing, 60% on completion", status: "Active", document: "arjun-agreement.pdf" },
    { title: "Streaming Rights", type: "OTT Platform", party: "Netflix", project: PROJECTS.kingdom, startDate: day(-150), endDate: day(1700), value: 90000000, paymentTerms: "Milestone based", status: "Active", document: "netflix-rights.pdf" },
    { title: "Director Agreement", type: "Director", party: "Rahul Sharma", project: PROJECTS.city, startDate: day(10), endDate: day(260), value: 5000000, paymentTerms: "Monthly", status: "Draft", document: "" },
    { title: "Lighting Vendor Contract", type: "Vendor", party: "Prime Lights Rentals", project: PROJECTS.coastal, startDate: day(-300), endDate: day(-30), value: 1500000, paymentTerms: "Net 30", status: "Expired", document: "" },
  ]) {
    await add(contractsApi.create, contract);
  }

  for (const task of [
    { title: "Lock shooting schedule for week 5", description: "", project: PROJECTS.kingdom, assignee: "Priya Menon", department: "Production", priority: "High", status: "In Progress", startDate: day(-3), dueDate: day(2) },
    { title: "Approve costume designs", description: "Battle armour and court attire.", project: PROJECTS.kingdom, assignee: "Anjali Das", department: "Costume", priority: "Urgent", status: "To Do", startDate: day(-1), dueDate: day(1) },
    { title: "Camera tests for night shoot", description: "", project: PROJECTS.kingdom, assignee: "Vikram Rao", department: "Camera", priority: "Medium", status: "To Do", startDate: day(1), dueDate: day(5) },
    { title: "Dubbing studio booking", description: "", project: PROJECTS.midnight, assignee: "Sameer Khan", department: "Sound", priority: "Low", status: "On Hold", startDate: day(5), dueDate: day(30) },
    { title: "Script read-through", description: "", project: PROJECTS.city, assignee: "Rahul Sharma", department: "Direction", priority: "Medium", status: "Completed", startDate: day(-14), dueDate: day(-7) },
    { title: "Location permits", description: "Fort permit from ASI.", project: PROJECTS.kingdom, assignee: "Priya Menon", department: "Production", priority: "High", status: "Completed", startDate: day(-20), dueDate: day(-10) },
  ]) {
    await add(tasksApi.create, task);
  }

  for (const payment of [
    { title: "Lead actor advance", party: "Arjun Kumar", project: PROJECTS.kingdom, direction: "Outgoing", type: "Artist Payment", amount: 6000000, paymentDate: day(-125), dueDate: day(-125), method: "Bank Transfer", reference: "UTR10021", status: "Completed", notes: "" },
    { title: "Netflix milestone 1", party: "Netflix", project: PROJECTS.kingdom, direction: "Incoming", type: "OTT Revenue", amount: 30000000, paymentDate: day(-60), dueDate: day(-60), method: "Bank Transfer", reference: "NFX-M1", status: "Completed", notes: "" },
    { title: "Crew salaries, October", party: "Crew", project: PROJECTS.kingdom, direction: "Outgoing", type: "Crew Salary", amount: 2400000, paymentDate: "", dueDate: day(4), method: "Bank Transfer", reference: "", status: "Pending", notes: "" },
    { title: "Brand integration", party: "Ace Motors", project: PROJECTS.midnight, direction: "Incoming", type: "Sponsorship", amount: 1500000, paymentDate: "", dueDate: day(-5), method: "Bank Transfer", reference: "", status: "Overdue", notes: "Follow up with brand team." },
    { title: "Set construction balance", party: "Ramoji Street Set", project: PROJECTS.midnight, direction: "Outgoing", type: "Production Expense", amount: 350000, paymentDate: "", dueDate: day(10), method: "Cheque", reference: "", status: "Pending", notes: "" },
  ]) {
    await add(paymentsApi.create, payment);
  }

  log(`Production CRM: added ${count} sample records.`);
  return count;
}

async function loadVendor(log) {
  const existing = await vendorsApi.list();
  if (existing.some((v) => v.name === "Prime Lights Rentals")) {
    log("Vendor CRM sample data is already there; skipped.");
    return 0;
  }
  let count = 0;
  const add = async (fn, payload) => {
    const record = await fn(payload);
    count += 1;
    return record;
  };
  const base = { address: "", bankName: "", accountNumber: "", ifscCode: "", gstNumber: "", panNumber: "", notes: "" };

  const v = {};
  for (const [key, vendor] of Object.entries({
    lights: { ...base, name: "Prime Lights Rentals", category: "Camera & Lighting", contactPerson: "Ravi Shankar", email: "ravi@primelights.in", phone: "9845012345", city: "Chennai", address: "12 Arcot Road, Vadapalani", gstNumber: "33AACCP1234K1Z5", panNumber: "AACCP1234K", bankName: "HDFC Bank", accountNumber: "50100234567890", ifscCode: "HDFC0001234", paymentTerms: "Net 30", rating: 5, status: "Active" },
    catering: { ...base, name: "Spice Route Caterers", category: "Catering", contactPerson: "Lakshmi Narayan", email: "orders@spiceroute.in", phone: "9845012346", city: "Chennai", gstNumber: "33AAFCS5678L1Z2", paymentTerms: "Net 15", rating: 4, status: "Active" },
    transport: { ...base, name: "FastWheels Transport", category: "Transport", contactPerson: "Karthik R", email: "bookings@fastwheels.in", phone: "9845012347", city: "Hyderabad", paymentTerms: "Advance", rating: 3, status: "Active" },
    vfx: { ...base, name: "Pixel Forge Studios", category: "VFX", contactPerson: "Neil D'Costa", email: "studio@pixelforge.in", phone: "9845012348", city: "Mumbai", gstNumber: "27AAGCP9012M1Z8", panNumber: "AAGCP9012M", bankName: "ICICI Bank", accountNumber: "002301234567", ifscCode: "ICIC0000023", paymentTerms: "Net 45", rating: 4, status: "Active" },
    costumes: { ...base, name: "Threads & Drapes", category: "Costumes", contactPerson: "Fathima S", email: "hello@threadsdrapes.in", phone: "9845012349", city: "Chennai", paymentTerms: "On Delivery", rating: 4, status: "Active" },
    security: { ...base, name: "ShieldForce Security", category: "Security", contactPerson: "Major Singh", email: "ops@shieldforce.in", phone: "9845012350", city: "Chennai", paymentTerms: "Net 30", rating: 2, status: "Blacklisted", notes: "No-shows on two night shoots." },
    sound: { ...base, name: "EchoBox Audio", category: "Sound", contactPerson: "Arvind M", email: "rentals@echobox.in", phone: "9845012351", city: "Bengaluru", paymentTerms: "Net 15", rating: 4, status: "Inactive" },
  })) {
    v[key] = await add(vendorsApi.create, vendor);
  }

  const quote = (vendor, project, title, offset, extra) => ({
    vendorId: vendor.id, project, title, description: "", requestDate: day(offset), validUntil: day(offset + 30), taxPercent: 18, notes: "", ...extra,
  });
  const q1 = await add(quotationsApi.create, quote(v.lights, PROJECTS.kingdom, "Lighting package, 20 days", -25, { amount: 800000, status: "Received" }));
  const q2 = await add(quotationsApi.create, quote(v.vfx, PROJECTS.kingdom, "Battle sequence VFX, 40 shots", -18, { amount: 2500000, status: "Received" }));
  await add(quotationsApi.create, quote(v.catering, PROJECTS.city, "Crew meals, 30 days", -2, { status: "Requested" }));
  await add(quotationsApi.create, quote(v.costumes, PROJECTS.kingdom, "Period costumes, 60 sets", -6, { amount: 450000, taxPercent: 12, status: "Received" }));
  await add(quotationsApi.create, quote(v.transport, PROJECTS.midnight, "Crew vans, 3 weeks", -30, { amount: 210000, taxPercent: 5, status: "Rejected", notes: "Too expensive." }));

  const order = (vendor, project, title, offset, extra) => ({
    vendorId: vendor.id, quotationId: "", project, title, description: "", orderDate: day(offset), deliveryDate: day(offset + 10), taxPercent: 18, notes: "", ...extra,
  });
  const po1 = await add(purchaseOrdersApi.create, order(v.lights, PROJECTS.kingdom, "Lighting package, 20 days", -20, { quotationId: q1.id, amount: 800000, status: "Delivered" }));
  const po2 = await add(purchaseOrdersApi.create, order(v.vfx, PROJECTS.kingdom, "Battle sequence VFX, 40 shots", -12, { quotationId: q2.id, amount: 2500000, status: "Issued", deliveryDate: day(45) }));
  const po3 = await add(purchaseOrdersApi.create, order(v.catering, PROJECTS.kingdom, "Night shoot catering", -10, { amount: 120000, taxPercent: 5, status: "Delivered" }));
  const po4 = await add(purchaseOrdersApi.create, order(v.transport, PROJECTS.midnight, "Airport pickups", -40, { amount: 60000, taxPercent: 5, status: "Closed" }));
  await add(purchaseOrdersApi.create, order(v.costumes, PROJECTS.kingdom, "Costume alterations", 0, { amount: 75000, taxPercent: 12, status: "Draft" }));

  const invoice = (vendor, po, number, offset, due, amount, taxAmount, status) => ({
    vendorId: vendor.id, purchaseOrderId: po.id, invoiceNumber: number, invoiceDate: day(offset), dueDate: day(due), amount, taxAmount, status, notes: "",
  });
  const i1 = await add(vendorInvoicesApi.create, invoice(v.lights, po1, "PL/2026/118", -15, 5, 800000, 144000, "Approved"));
  const i2 = await add(vendorInvoicesApi.create, invoice(v.catering, po3, "SR-0451", -9, -2, 120000, 6000, "Approved"));
  const i3 = await add(vendorInvoicesApi.create, invoice(v.transport, po4, "FW-2210", -35, -20, 60000, 3000, "Approved"));
  await add(vendorInvoicesApi.create, invoice(v.vfx, po2, "PF-INV-031", -3, 27, 1000000, 180000, "Pending"));

  const pay = (vendor, inv, amount, offset, method, reference) => ({
    vendorId: vendor.id, invoiceId: inv.id, amount, paymentDate: day(offset), method, reference, status: "Completed", notes: "",
  });
  await add(vendorPaymentsApi.create, pay(v.lights, i1, 400000, -7, "Bank Transfer", "UTR88123"));
  await add(vendorPaymentsApi.create, pay(v.catering, i2, 50000, -1, "UPI", "UPI-55120"));
  await add(vendorPaymentsApi.create, pay(v.transport, i3, 63000, -22, "Cheque", "CHQ 004512"));

  const doc = (vendor, type, title, number, issue, expiry, fileName) => ({
    vendorId: vendor.id, type, title, documentNumber: number, issueDate: issue, expiryDate: expiry, fileName, notes: "",
  });
  await add(vendorDocumentsApi.create, doc(v.lights, "GST Certificate", "GST registration", "33AACCP1234K1Z5", day(-900), "", "prime-lights-gst.pdf"));
  await add(vendorDocumentsApi.create, doc(v.lights, "Agreement", "Rental master agreement", "MSA-PL-2026", day(-200), day(165), "prime-lights-msa.pdf"));
  await add(vendorDocumentsApi.create, doc(v.catering, "Insurance", "Food safety & liability cover", "FSL-7781", day(-350), day(15), "spice-route-insurance.pdf"));
  await add(vendorDocumentsApi.create, doc(v.vfx, "NDA", "Non-disclosure agreement", "NDA-PF-09", day(-30), day(700), "pixel-forge-nda.pdf"));
  await add(vendorDocumentsApi.create, doc(v.transport, "Trade License", "Transport permit", "TP-HYD-4410", day(-400), day(-5), ""));

  log(`Vendor CRM: added ${count} sample records.`);
  return count;
}

/**
 * Loads sample data into every CRM the login can use.
 * Returns { lines: status messages, added: number of records created }.
 */
export async function loadSampleData(user) {
  const lines = [];
  const log = (line) => lines.push(line);
  let added = 0;
  if (canUseProduction(user)) added += await loadProduction(log);
  if (canUseVendor(user)) added += await loadVendor(log);
  return { lines, added };
}
