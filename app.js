// ============================================================
// EVENTO-EVENTS DASHBOARD – Full JavaScript
// With Login + Role-Based Access (localStorage)
// ============================================================

// ===== USER DATABASE (Hardcoded for Demo – Replace with backend later) =====
const USERS = {
    founder: {
        email: 'founder@evento.com',
        password: 'founder123',
        role: 'founder',
        name: 'Founder'
    },
    founder2: {
        email: 'founder2@evento.com',
        password: 'founder123',
        role: 'founder',
        name: 'Founder 2'
    },
    founder3: {
        email: 'founder3@evento.com',
        password: 'founder123',
        role: 'founder',
        name: 'Founder 3'
    },
    intern1: {
        email: 'intern1@evento.com',
        password: 'intern123',
        role: 'intern',
        name: 'Intern 1'
    },
    intern2: {
        email: 'intern2@evento.com',
        password: 'intern123',
        role: 'intern',
        name: 'Intern 2'
    },
    intern3: {
        email: 'intern3@evento.com',
        password: 'intern123',
        role: 'intern',
        name: 'Intern 3'
    }
};

// ===== CURRENT USER =====
let currentUser = null;

// ===== DATA STORE =====
let data = {
    events: [],
    vendors: [],
    tasks: [],
    budgets: [],
    runSheets: [],
    training: {
        modules: [
            { id: 1, title: "Introduction to the Event Industry", completed: false },
            { id: 2, title: "The Vendor Ecosystem", completed: false },
            { id: 3, title: "Essential Documents", completed: false },
            { id: 4, title: "Client Communication & Psychology", completed: false },
            { id: 5, title: "The Business of Events", completed: false },
            { id: 6, title: "Emergency Management", completed: false },
            { id: 7, title: "Site Walkthrough & Technical Logistics", completed: false },
            { id: 8, title: "Marketing & Lead Generation", completed: false },
            { id: 9, title: "The Art of Negotiation", completed: false },
            { id: 10, title: "On-Ground Execution (D-Day)", completed: false },
            { id: 11, title: "Post-Event Procedures", completed: false },
            { id: 12, title: "Legal, Paperwork & Compliance", completed: false },
            { id: 13, title: "AI in Your Work", completed: false }
        ]
    }
};

// ===== SAMPLE DATA =====
const SAMPLE_DATA = {
    events: [
        { id: 1, name: "Sharma Wedding", client: "Mr. Sharma", date: "2026-12-15", venue: "Grand Gardens", status: "Upcoming" },
        { id: 2, name: "Gupta Anniversary", client: "Mrs. Gupta", date: "2026-11-20", venue: "Sky Banquet", status: "Ongoing" }
    ],
    vendors: [
        { id: 1, name: "Grand Gardens", category: "Venue", contact: "Mr. Rajesh", phone: "98765XXXXX", price: "₹50,000" },
        { id: 2, name: "Sharma Caterers", category: "Caterer", contact: "Mr. Amit", phone: "98765YYYYY", price: "₹40,000" }
    ],
    tasks: [
        { id: 1, title: "Call Sharma Wedding Venue", description: "Confirm December 15 availability", status: "todo", assignedTo: "Intern 1", eventId: 1 },
        { id: 2, title: "Send Proposal to Gupta", description: "Draft and send final proposal", status: "progress", assignedTo: "Intern 2", eventId: 2 },
        { id: 3, title: "Review Budget for Sharma", description: "Check actual costs vs estimated", status: "done", assignedTo: "Intern 3", eventId: 1 }
    ],
    budgets: [
        { id: 1, eventId: 1, category: "Venue", estimated: 50000, actual: 48000, status: "Paid" },
        { id: 2, eventId: 1, category: "Catering", estimated: 70000, actual: 75000, status: "Partially Paid" }
    ],
    runSheets: [
        { id: 1, eventId: 1, timeline: "8:00 AM – Venue Walkthrough\n10:00 AM – Decor Setup\n6:00 PM – Ceremony" }
    ]
};

// ============================================================
// LOGIN / LOGOUT FUNCTIONS
// ============================================================

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Find user
    let user = null;
    for (let key in USERS) {
        if (USERS[key].email === email && USERS[key].password === password) {
            user = { ...USERS[key], id: key };
            break;
        }
    }

    if (!user) {
        alert('Invalid email or password. Please try again.');
        return;
    }

    currentUser = user;
    localStorage.setItem('eventoUser', JSON.stringify(currentUser));

    // Show dashboard
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';

    // Update user badge
    document.getElementById('user-badge').textContent = `👤 ${user.name} (${user.role})`;

    // Apply role-based permissions
    applyPermissions(user.role);

    // Load data
    loadData();

    // Redirect to home
    navigateTo('home');
}

function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('eventoUser');
    currentUser = null;
    document.getElementById('dashboard-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

function applyPermissions(role) {
    const isFounder = role === 'founder';
    const isIntern = role === 'intern';

    // Show/hide Budgets tab
    document.getElementById('nav-budgets').style.display = isFounder ? 'block' : 'none';

    // Show/hide Run-Sheets tab
    document.getElementById('nav-run-sheets').style.display = isFounder ? 'block' : 'none';

    // Interns can only view vendors (not edit)
    if (isIntern) {
        // We handle this in the render functions
    }
}

// ============================================================
// DATA LOADING
// ============================================================

function loadData() {
    // If data exists in localStorage, load it
    if (localStorage.getItem('eventoData')) {
        data = JSON.parse(localStorage.getItem('eventoData'));
    } else {
        // Otherwise, load sample data
        data = SAMPLE_DATA;
        localStorage.setItem('eventoData', JSON.stringify(data));
    }
    // Ensure training exists
    if (!data.training) {
        data.training = { modules: SAMPLE_DATA.training.modules };
        saveData();
    }
    renderAll();
}

function saveData() {
    localStorage.setItem('eventoData', JSON.stringify(data));
    renderAll();
}

function genId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ============================================================
// RENDER FUNCTIONS (Same as before, with permission checks)
// ============================================================

function renderAll() {
    renderStats();
    renderEvents();
    renderVendors();
    renderTasks();
    renderBudgets();
    renderRunSheets();
    renderTraining();
    renderTrainingProgress();
}

function renderStats() {
    document.getElementById('stat-events').textContent = data.events.length;
    document.getElementById('stat-vendors').textContent = data.vendors.length;
    document.getElementById('stat-tasks').textContent = data.tasks.length;
    const totalBudget = data.budgets.reduce((sum, b) => sum + b.estimated, 0);
    document.getElementById('stat-budget').textContent = totalBudget.toLocaleString();
}

function renderEvents() {
    const tbody = document.getElementById('events-table-body');
    const isFounder = currentUser?.role === 'founder';
    if (data.events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No events yet. Add one!</td></tr>`;
        return;
    }
    tbody.innerHTML = data.events.map(e => {
        const actions = isFounder
            ? `<button class="btn-edit" onclick="editEvent(${e.id})">✏️</button><button class="btn-danger" onclick="deleteEvent(${e.id})">🗑️</button>`
            : `<span style="color:#94a3b8;font-size:12px;">View only</span>`;
        return `
            <tr>
                <td><strong>${e.name}</strong></td>
                <td>${e.client}</td>
                <td>${e.date}</td>
                <td>${e.venue}</td>
                <td><span class="status-badge status-${e.status.toLowerCase()}">${e.status}</span></td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderVendors() {
    const tbody = document.getElementById('vendors-table-body');
    const isFounder = currentUser?.role === 'founder';
    if (data.vendors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No vendors yet. Add one!</td></tr>`;
        return;
    }
    tbody.innerHTML = data.vendors.map(v => {
        const actions = isFounder
            ? `<button class="btn-edit" onclick="editVendor(${v.id})">✏️</button><button class="btn-danger" onclick="deleteVendor(${v.id})">🗑️</button>`
            : `<span style="color:#94a3b8;font-size:12px;">View only</span>`;
        return `
            <tr>
                <td><strong>${v.name}</strong></td>
                <td>${v.category}</td>
                <td>${v.contact}</td>
                <td>${v.phone}</td>
                <td>${v.price}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderTasks() {
    document.getElementById('tasks-todo').innerHTML = '';
    document.getElementById('tasks-progress').innerHTML = '';
    document.getElementById('tasks-done').innerHTML = '';

    const isFounder = currentUser?.role === 'founder';
    let filteredTasks = data.tasks;

    // If intern, only show tasks assigned to them
    if (currentUser?.role === 'intern') {
        filteredTasks = data.tasks.filter(t => t.assignedTo === currentUser.name);
    }

    if (filteredTasks.length === 0) {
        ['tasks-todo', 'tasks-progress', 'tasks-done'].forEach(id => {
            document.getElementById(id).innerHTML = `<div style="color:#94a3b8;padding:12px;text-align:center;font-size:13px;">No tasks</div>`;
        });
        return;
    }

    filteredTasks.forEach(t => {
        const canMove = isFounder || (currentUser?.role === 'intern' && t.assignedTo === currentUser.name);
        let actions = '';
        if (canMove) {
            if (t.status === 'todo') {
                actions += `<button class="btn-secondary" onclick="moveTask(${t.id},'progress')">➡️ Start</button>`;
            }
            if (t.status === 'progress') {
                actions += `<button class="btn-secondary" onclick="moveTask(${t.id},'done')">✅ Done</button>`;
            }
            if (t.status === 'todo' && isFounder) {
                actions += `<button class="btn-danger" onclick="deleteTask(${t.id})">🗑️</button>`;
            }
        }
        const card = `
            <div class="task-card">
                <div class="task-title">${t.title}</div>
                <div class="task-meta">${t.assignedTo || 'Unassigned'} ${t.eventId ? '• Event #'+t.eventId : ''}</div>
                <div class="task-actions">${actions}</div>
            </div>
        `;
        const columnId = t.status === 'todo' ? 'tasks-todo' : (t.status === 'progress' ? 'tasks-progress' : 'tasks-done');
        document.getElementById(columnId).innerHTML += card;
    });
}

function renderBudgets() {
    const tbody = document.getElementById('budgets-table-body');
    const isFounder = currentUser?.role === 'founder';
    if (!isFounder) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">🔒 Access restricted. Please contact founder.</td></tr>`;
        return;
    }
    if (data.budgets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No budget items yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = data.budgets.map(b => {
        const diff = b.actual - b.estimated;
        const diffColor = diff > 0 ? 'red' : (diff < 0 ? 'green' : '#64748b');
        const eventName = data.events.find(e => e.id === b.eventId)?.name || 'Unknown';
        return `
            <tr>
                <td>${eventName}</td>
                <td>${b.category}</td>
                <td>₹${b.estimated.toLocaleString()}</td>
                <td>₹${b.actual.toLocaleString()}</td>
                <td style="color:${diffColor};font-weight:${diff !== 0 ? '600' : '400'};">${diff > 0 ? '+' : ''}${diff.toLocaleString()}</td>
                <td><span class="status-badge">${b.status}</span></td>
            </tr>
        `;
    }).join('');
}

function renderRunSheets() {
    const container = document.getElementById('run-sheets-container');
    const isFounder = currentUser?.role === 'founder';
    if (!isFounder) {
        container.innerHTML = `<div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;color:#94a3b8;text-align:center;">🔒 Access restricted. Please contact founder.</div>`;
        return;
    }
    if (data.runSheets.length === 0) {
        container.innerHTML = `<div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;color:#94a3b8;text-align:center;">No run-sheets yet. Add one!</div>`;
        return;
    }
    container.innerHTML = data.runSheets.map(rs => {
        const eventName = data.events.find(e => e.id === rs.eventId)?.name || 'Unknown Event';
        return `
            <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;margin-bottom:16px;">
                <h3 style="margin-bottom:4px;">${eventName}</h3>
                <div style="font-size:13px;color:#64748b;white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;margin-top:8px;">${rs.timeline}</div>
                <div style="margin-top:8px;">
                    <button class="btn-edit" onclick="editRunSheet(${rs.id})">✏️ Edit</button>
                    <button class="btn-danger" onclick="deleteRunSheet(${rs.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== TRAINING RENDERING =====
const MODULE_SUMMARIES = [
    { id: 1, summary: "Learn what event management is, the 5 phases of every event, and the key roles (Client, Vendors, Planners, Guests)." },
    { id: 2, summary: "Deep dive into 6 vendor categories: Venue, Caterer, Photographer, Decorator, DJ, Makeup Artist. Learn what to ask and hidden costs." },
    { id: 3, summary: "Master the three essential documents: Run-Sheet (timeline), Budget Tracker, and Vendor Contracts." },
    { id: 4, summary: "Learn the Sandwich Method for bad news, active listening, and professional email/WhatsApp etiquette." },
    { id: 5, summary: "Understand Revenue vs. Profit vs. Margin, cash flow management, and hidden costs (GST, service tax, tips)." },
    { id: 6, summary: "The 'Invisible Fix' philosophy and SOPs for common emergencies: vendor lateness, rain, power cuts, medical issues." },
    { id: 7, summary: "20-point venue checklist: parking, washrooms, power backup, stage, kitchen location, and technical logistics." },
    { id: 8, summary: "Sales funnel, lead generation tactics (Instagram DMs, vendor referrals), and DM templates." },
    { id: 9, summary: "Negotiation tactics: The Bulk Discount, The Pause, and Value Add vs. Discount. Up-selling to clients." },
    { id: 10, summary: "D-Day playbook: Vendor check-in protocol, founder's rules, and your role as 'eyes and ears'." },
    { id: 11, summary: "Post-event: vendor payments, client feedback forms, and team debrief sessions." },
    { id: 12, summary: "Client contracts (5 must-have clauses), GST/invoicing, and intellectual property (photo rights)." },
    { id: 13, summary: "Generative AI for event planning: prompt engineering, email drafting, run-sheets, vendor research, marketing, and golden rules." }
];

function renderTraining() {
    const grid = document.querySelector('.training-grid');
    if (!grid) return;
    grid.innerHTML = data.training.modules.map(m => {
        const summary = MODULE_SUMMARIES.find(s => s.id === m.id)?.summary || '';
        const statusClass = m.completed ? 'module-complete' : 'module-incomplete';
        const statusText = m.completed ? '✅ Completed' : '⏳ In Progress';
        return `
            <div class="training-card" onclick="toggleModule(${m.id})">
                <h4>${m.id}. ${m.title}</h4>
                <p>${summary}</p>
                <div class="module-status ${statusClass}">${statusText}</div>
            </div>
        `;
    }).join('');
}

function renderTrainingProgress() {
    const container = document.getElementById('training-progress');
    if (!container) return;
    const total = data.training.modules.length;
    const completed = data.training.modules.filter(m => m.completed).length;
    const percentage = Math.round((completed / total) * 100);
    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <span style="font-weight:600;">Progress: ${completed}/${total} modules (${percentage}%)</span>
            <div style="flex:1;min-width:200px;height:8px;background:#e9edf4;border-radius:4px;overflow:hidden;">
                <div style="width:${percentage}%;height:100%;background:#3b82f6;border-radius:4px;"></div>
            </div>
            <span style="font-size:14px;color:#64748b;">${percentage}%</span>
        </div>
    `;
}

function toggleModule(id) {
    const mod = data.training.modules.find(m => m.id === id);
    if (mod) {
        mod.completed = !mod.completed;
        saveData();
    }
}

// ============================================================
// NAVIGATION
// ============================================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    renderAll();
}

// ============================================================
// MODAL
// ============================================================

function openModal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ============================================================
// EVENT CRUD
// ============================================================

function showAddEventForm() {
    if (currentUser?.role !== 'founder') { alert('Only founders can add events.'); return; }
    openModal(`
        <h2>Add New Event</h2>
        <label>Event Name</label><input id="f-event-name" placeholder="Sharma Wedding" />
        <label>Client Name</label><input id="f-event-client" placeholder="Mr. Sharma" />
        <label>Date</label><input id="f-event-date" type="date" />
        <label>Venue</label><input id="f-event-venue" placeholder="Grand Gardens" />
        <label>Status</label>
        <select id="f-event-status">
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
        </select>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addEvent()">Save</button>
        </div>
    `);
}

function addEvent() {
    const name = document.getElementById('f-event-name').value.trim();
    const client = document.getElementById('f-event-client').value.trim();
    const date = document.getElementById('f-event-date').value;
    const venue = document.getElementById('f-event-venue').value.trim();
    const status = document.getElementById('f-event-status').value;
    if (!name || !client || !date || !venue) { alert('Please fill all fields'); return; }
    data.events.push({ id: genId(), name, client, date, venue, status });
    saveData();
    closeModal();
}

function deleteEvent(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can delete events.'); return; }
    if (!confirm('Delete this event?')) return;
    data.events = data.events.filter(e => e.id !== id);
    saveData();
}

function editEvent(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can edit events.'); return; }
    const e = data.events.find(ev => ev.id === id);
    if (!e) return;
    openModal(`
        <h2>Edit Event</h2>
        <label>Event Name</label><input id="f-event-name" value="${e.name}" />
        <label>Client Name</label><input id="f-event-client" value="${e.client}" />
        <label>Date</label><input id="f-event-date" type="date" value="${e.date}" />
        <label>Venue</label><input id="f-event-venue" value="${e.venue}" />
        <label>Status</label>
        <select id="f-event-status">
            <option value="Upcoming" ${e.status==='Upcoming'?'selected':''}>Upcoming</option>
            <option value="Ongoing" ${e.status==='Ongoing'?'selected':''}>Ongoing</option>
            <option value="Completed" ${e.status==='Completed'?'selected':''}>Completed</option>
        </select>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateEvent(${id})">Update</button>
        </div>
    `);
}

function updateEvent(id) {
    const e = data.events.find(ev => ev.id === id);
    if (!e) return;
    e.name = document.getElementById('f-event-name').value.trim();
    e.client = document.getElementById('f-event-client').value.trim();
    e.date = document.getElementById('f-event-date').value;
    e.venue = document.getElementById('f-event-venue').value.trim();
    e.status = document.getElementById('f-event-status').value;
    saveData();
    closeModal();
}

// ============================================================
// VENDOR CRUD
// ============================================================

function showAddVendorForm() {
    if (currentUser?.role !== 'founder') { alert('Only founders can add vendors.'); return; }
    openModal(`
        <h2>Add New Vendor</h2>
        <label>Vendor Name</label><input id="f-vendor-name" placeholder="Grand Gardens" />
        <label>Category</label>
        <select id="f-vendor-category">
            <option value="Venue">Venue</option>
            <option value="Caterer">Caterer</option>
            <option value="Photographer">Photographer</option>
            <option value="Decorator">Decorator</option>
            <option value="DJ">DJ</option>
            <option value="Makeup Artist">Makeup Artist</option>
        </select>
        <label>Contact Person</label><input id="f-vendor-contact" placeholder="Mr. Rajesh" />
        <label>Phone</label><input id="f-vendor-phone" placeholder="98765XXXXX" />
        <label>Price</label><input id="f-vendor-price" placeholder="₹50,000" />
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addVendor()">Save</button>
        </div>
    `);
}

function addVendor() {
    const name = document.getElementById('f-vendor-name').value.trim();
    const category = document.getElementById('f-vendor-category').value;
    const contact = document.getElementById('f-vendor-contact').value.trim();
    const phone = document.getElementById('f-vendor-phone').value.trim();
    const price = document.getElementById('f-vendor-price').value.trim();
    if (!name || !contact || !phone) { alert('Please fill all required fields'); return; }
    data.vendors.push({ id: genId(), name, category, contact, phone, price });
    saveData();
    closeModal();
}

function deleteVendor(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can delete vendors.'); return; }
    if (!confirm('Delete this vendor?')) return;
    data.vendors = data.vendors.filter(v => v.id !== id);
    saveData();
}

function editVendor(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can edit vendors.'); return; }
    const v = data.vendors.find(vendor => vendor.id === id);
    if (!v) return;
    openModal(`
        <h2>Edit Vendor</h2>
        <label>Vendor Name</label><input id="f-vendor-name" value="${v.name}" />
        <label>Category</label>
        <select id="f-vendor-category">
            <option value="Venue" ${v.category==='Venue'?'selected':''}>Venue</option>
            <option value="Caterer" ${v.category==='Caterer'?'selected':''}>Caterer</option>
            <option value="Photographer" ${v.category==='Photographer'?'selected':''}>Photographer</option>
            <option value="Decorator" ${v.category==='Decorator'?'selected':''}>Decorator</option>
            <option value="DJ" ${v.category==='DJ'?'selected':''}>DJ</option>
            <option value="Makeup Artist" ${v.category==='Makeup Artist'?'selected':''}>Makeup Artist</option>
        </select>
        <label>Contact Person</label><input id="f-vendor-contact" value="${v.contact}" />
        <label>Phone</label><input id="f-vendor-phone" value="${v.phone}" />
        <label>Price</label><input id="f-vendor-price" value="${v.price}" />
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateVendor(${id})">Update</button>
        </div>
    `);
}

function updateVendor(id) {
    const v = data.vendors.find(vendor => vendor.id === id);
    if (!v) return;
    v.name = document.getElementById('f-vendor-name').value.trim();
    v.category = document.getElementById('f-vendor-category').value;
    v.contact = document.getElementById('f-vendor-contact').value.trim();
    v.phone = document.getElementById('f-vendor-phone').value.trim();
    v.price = document.getElementById('f-vendor-price').value.trim();
    saveData();
    closeModal();
}

// ============================================================
// TASK CRUD
// ============================================================

function showAddTaskForm() {
    const isFounder = currentUser?.role === 'founder';
    if (!isFounder) { alert('Only founders can create tasks.'); return; }
    const eventOptions = data.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    openModal(`
        <h2>Add New Task</h2>
        <label>Task Title</label><input id="f-task-title" placeholder="Call Caterer" />
        <label>Description</label><textarea id="f-task-desc" placeholder="Confirm December 15 availability"></textarea>
        <label>Assigned To</label>
        <select id="f-task-assign"><option value="Intern 1">Intern 1</option><option value="Intern 2">Intern 2</option><option value="Intern 3">Intern 3</option></select>
        <label>Related Event</label>
        <select id="f-task-event"><option value="">None</option>${eventOptions}</select>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addTask()">Save</button>
        </div>
    `);
}

function addTask() {
    const title = document.getElementById('f-task-title').value.trim();
    const description = document.getElementById('f-task-desc').value.trim();
    const assignedTo = document.getElementById('f-task-assign').value;
    const eventId = parseInt(document.getElementById('f-task-event').value) || null;
    if (!title) { alert('Please enter a task title'); return; }
    data.tasks.push({ id: genId(), title, description, status: 'todo', assignedTo, eventId });
    saveData();
    closeModal();
}

function deleteTask(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can delete tasks.'); return; }
    if (!confirm('Delete this task?')) return;
    data.tasks = data.tasks.filter(t => t.id !== id);
    saveData();
}

function moveTask(id, newStatus) {
    const task = data.tasks.find(t => t.id === id);
    if (task) { task.status = newStatus; saveData(); }
}

// ============================================================
// BUDGET CRUD (Founder Only)
// ============================================================

function showAddBudgetForm() {
    if (currentUser?.role !== 'founder') { alert('Only founders can manage budgets.'); return; }
    const eventOptions = data.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    openModal(`
        <h2>Add Budget Item</h2>
        <label>Event</label>
        <select id="f-budget-event">${eventOptions}</select>
        <label>Category</label>
        <select id="f-budget-cat">
            <option value="Venue">Venue</option>
            <option value="Catering">Catering</option>
            <option value="Photography">Photography</option>
            <option value="Decor">Decor</option>
            <option value="DJ">DJ</option>
            <option value="Miscellaneous">Miscellaneous</option>
        </select>
        <label>Estimated Cost (₹)</label><input id="f-budget-est" type="number" placeholder="50000" />
        <label>Actual Cost (₹)</label><input id="f-budget-act" type="number" placeholder="48000" />
        <label>Status</label>
        <select id="f-budget-status"><option value="Not Paid">Not Paid</option><option value="Partially Paid">Partially Paid</option><option value="Paid">Paid</option></select>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addBudget()">Save</button>
        </div>
    `);
}

function addBudget() {
    const eventId = parseInt(document.getElementById('f-budget-event').value);
    const category = document.getElementById('f-budget-cat').value;
    const estimated = parseFloat(document.getElementById('f-budget-est').value);
    const actual = parseFloat(document.getElementById('f-budget-act').value) || 0;
    const status = document.getElementById('f-budget-status').value;
    if (!eventId || isNaN(estimated) || estimated <= 0) { alert('Please fill all fields'); return; }
    data.budgets.push({ id: genId(), eventId, category, estimated, actual, status });
    saveData();
    closeModal();
}

// ============================================================
// RUN-SHEET CRUD (Founder Only)
// ============================================================

function showAddRunSheetForm() {
    if (currentUser?.role !== 'founder') { alert('Only founders can manage run-sheets.'); return; }
    const eventOptions = data.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    openModal(`
        <h2>Add Run-Sheet</h2>
        <label>Event</label>
        <select id="f-rs-event">${eventOptions}</select>
        <label>Timeline (one line per item)</label>
        <textarea id="f-rs-timeline" rows="6" placeholder="8:00 AM – Venue Walkthrough&#10;10:00 AM – Decor Setup&#10;6:00 PM – Ceremony"></textarea>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addRunSheet()">Save</button>
        </div>
    `);
}

function addRunSheet() {
    const eventId = parseInt(document.getElementById('f-rs-event').value);
    const timeline = document.getElementById('f-rs-timeline').value.trim();
    if (!eventId || !timeline) { alert('Please fill all fields'); return; }
    data.runSheets.push({ id: genId(), eventId, timeline });
    saveData();
    closeModal();
}

function deleteRunSheet(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can delete run-sheets.'); return; }
    if (!confirm('Delete this run-sheet?')) return;
    data.runSheets = data.runSheets.filter(rs => rs.id !== id);
    saveData();
}

function editRunSheet(id) {
    if (currentUser?.role !== 'founder') { alert('Only founders can edit run-sheets.'); return; }
    const rs = data.runSheets.find(r => r.id === id);
    if (!rs) return;
    const eventOptions = data.events.map(e => `<option value="${e.id}" ${e.id===rs.eventId?'selected':''}>${e.name}</option>`).join('');
    openModal(`
        <h2>Edit Run-Sheet</h2>
        <label>Event</label>
        <select id="f-rs-event">${eventOptions}</select>
        <label>Timeline (one line per item)</label>
        <textarea id="f-rs-timeline" rows="6">${rs.timeline}</textarea>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateRunSheet(${id})">Update</button>
        </div>
    `);
}

function updateRunSheet(id) {
    const rs = data.runSheets.find(r => r.id === id);
    if (!rs) return;
    rs.eventId = parseInt(document.getElementById('f-rs-event').value);
    rs.timeline = document.getElementById('f-rs-timeline').value.trim();
    saveData();
    closeModal();
}

// ============================================================
// SIDEBAR NAVIGATION EVENTS
// ============================================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.page);
    });
});

// ============================================================
// KEYBOARD SHORTCUT: Escape to close modal
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ============================================================
// AUTO-LOGIN CHECK
// ============================================================

function checkAutoLogin() {
    const savedUser = localStorage.getItem('eventoUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'flex';
            document.getElementById('user-badge').textContent = `👤 ${currentUser.name} (${currentUser.role})`;
            applyPermissions(currentUser.role);
            loadData();
            navigateTo('home');
        } catch (e) {
            localStorage.removeItem('eventoUser');
        }
    }
}

// ============================================================
// START APP
// ============================================================

// Show login screen by default
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('eventoUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'flex';
            document.getElementById('user-badge').textContent = `👤 ${currentUser.name} (${currentUser.role})`;
            applyPermissions(currentUser.role);
            loadData();
            navigateTo('home');
        } catch (e) {
            localStorage.removeItem('eventoUser');
        }
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('dashboard-container').style.display = 'none';
    }

    console.log('🚀 Evento-Events Dashboard loaded successfully!');
});

// ============================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================================

window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.navigateTo = navigateTo;
window.showAddEventForm = showAddEventForm;
window.addEvent = addEvent;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;
window.updateEvent = updateEvent;
window.showAddVendorForm = showAddVendorForm;
window.addVendor = addVendor;
window.deleteVendor = deleteVendor;
window.editVendor = editVendor;
window.updateVendor = updateVendor;
window.showAddTaskForm = showAddTaskForm;
window.addTask = addTask;
window.deleteTask = deleteTask;
window.moveTask = moveTask;
window.showAddBudgetForm = showAddBudgetForm;
window.addBudget = addBudget;
window.showAddRunSheetForm = showAddRunSheetForm;
window.addRunSheet = addRunSheet;
window.deleteRunSheet = deleteRunSheet;
window.editRunSheet = editRunSheet;
window.updateRunSheet = updateRunSheet;
window.toggleModule = toggleModule;
window.closeModal = closeModal;
window.openModal = openModal;