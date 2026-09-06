// ============================================================
// EVENTO-EVENTS DASHBOARD – WITH SUPABASE BACKEND
// ============================================================

// ===== SUPABASE CONFIGURATION =====
const supabaseUrl = 'https://tkapyxsuagzwxvvslhyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXB5eHN1YWd6d3h2dnNsaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDIyMzEsImV4cCI6MjEwMzMxODIzMX0.7UaRmzPGK9cStuJEkw4Fa1xoYLuCzGN6ONRFB_GNDJw';

// ===== INITIALIZE SUPABASE =====
const supabaseClient = (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : (typeof window.supabase !== 'undefined' ? window.supabase : null);

if (!supabaseClient) {
    console.error('❌ Supabase SDK not loaded. Make sure the Supabase script is included before app.js.');
} else {
    console.log('✅ Supabase initialized');
}

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

// ===== LOAD DATA FUNCTIONS =====
async function loadAllData() {
    if (!supabaseClient) {
        console.error('❌ Cannot load data because Supabase is not available.');
        return;
    }

    console.log('🔄 Loading data...');
    try {
        await Promise.all([
            loadEvents(),
            loadVendors(),
            loadTasks(),
            loadBudgets(),
            loadRunSheets()
        ]);
        renderAll();
        console.log('✅ Data loaded');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function loadEvents() {
    const { data: events, error } = await supabaseClient.from('events').select('*');
    if (!error) data.events = events || [];
}

async function loadVendors() {
    const { data: vendors, error } = await supabaseClient.from('vendors').select('*');
    if (!error) data.vendors = vendors || [];
}

async function loadTasks() {
    const { data: tasks, error } = await supabaseClient.from('tasks').select('*');
    if (!error) data.tasks = tasks || [];
}

async function loadBudgets() {
    const { data: budgets, error } = await supabaseClient.from('budgets').select('*');
    if (!error) data.budgets = budgets || [];
}

async function loadRunSheets() {
    const { data: runSheets, error } = await supabaseClient.from('run_sheets').select('*');
    if (!error) data.runSheets = runSheets || [];
}

// ===== HELPER FUNCTIONS =====
function genId() { return Date.now() + Math.floor(Math.random() * 1000); }
function getEventName(id) {
    const event = data.events.find(e => e.id === id);
    return event ? event.name : 'Unknown';
}

// ===== RENDER FUNCTIONS =====
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
    if (data.events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No events yet. Add one!</td></tr>';
        return;
    }
    tbody.innerHTML = data.events.map(e => `
        <tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.client}</td>
            <td>${e.date}</td>
            <td>${e.venue}</td>
            <td><span class="status-badge status-${e.status.toLowerCase()}">${e.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editEvent(${e.id})">✏️</button>
                <button class="btn-danger" onclick="deleteEvent(${e.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderVendors() {
    const tbody = document.getElementById('vendors-table-body');
    if (data.vendors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No vendors yet. Add one!</td></tr>';
        return;
    }
    tbody.innerHTML = data.vendors.map(v => `
        <tr>
            <td><strong>${v.name}</strong></td>
            <td>${v.category}</td>
            <td>${v.contact}</td>
            <td>${v.phone}</td>
            <td>${v.price}</td>
            <td>
                <button class="btn-edit" onclick="editVendor(${v.id})">✏️</button>
                <button class="btn-danger" onclick="deleteVendor(${v.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderTasks() {
    document.getElementById('tasks-todo').innerHTML = '';
    document.getElementById('tasks-progress').innerHTML = '';
    document.getElementById('tasks-done').innerHTML = '';

    if (data.tasks.length === 0) {
        ['tasks-todo', 'tasks-progress', 'tasks-done'].forEach(id => {
            document.getElementById(id).innerHTML = '<div style="color:#94a3b8;padding:12px;text-align:center;font-size:13px;">No tasks</div>';
        });
        return;
    }

    data.tasks.forEach(t => {
        const card = `
            <div class="task-card">
                <div class="task-title">${t.title}</div>
                <div class="task-meta">${t.assigned_to || 'Unassigned'} ${t.event_id ? '• Event #'+t.event_id : ''}</div>
                <div class="task-actions">
                    ${t.status === 'todo' ? `<button class="btn-secondary" onclick="moveTask(${t.id},'progress')">➡️ Start</button>` : ''}
                    ${t.status === 'progress' ? `<button class="btn-secondary" onclick="moveTask(${t.id},'done')">✅ Done</button>` : ''}
                    <button class="btn-danger" onclick="deleteTask(${t.id})">🗑️</button>
                </div>
            </div>
        `;
        const columnId = t.status === 'todo' ? 'tasks-todo' : (t.status === 'progress' ? 'tasks-progress' : 'tasks-done');
        document.getElementById(columnId).innerHTML += card;
    });
}

function renderBudgets() {
    const tbody = document.getElementById('budgets-table-body');
    if (data.budgets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No budget items yet.</td></tr>';
        return;
    }
    tbody.innerHTML = data.budgets.map(b => {
        const diff = b.actual - b.estimated;
        const diffColor = diff > 0 ? 'red' : (diff < 0 ? 'green' : '#64748b');
        const eventName = getEventName(b.event_id);
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
    if (data.runSheets.length === 0) {
        container.innerHTML = '<div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;color:#94a3b8;text-align:center;">No run-sheets yet. Add one!</div>';
        return;
    }
    container.innerHTML = data.runSheets.map(rs => {
        const eventName = getEventName(rs.event_id);
        return `
            <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;margin-bottom:16px;">
                <h3 style="margin-bottom:4px;">${eventName}</h3>
                <div style="font-size:13px;color:#64748b;white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;margin-top:8px;">${rs.timeline}</div>
                <div style="margin-top:8px;">
                    <button class="btn-edit" onclick="editRunSheet(${rs.id})">✏️</button>
                    <button class="btn-danger" onclick="deleteRunSheet(${rs.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== TRAINING FUNCTIONS =====
const MODULE_SUMMARIES = [
    { id: 1, summary: "Learn what event management is, the 5 phases of every event, and the key roles." },
    { id: 2, summary: "Deep dive into 6 vendor categories: Venue, Caterer, Photographer, Decorator, DJ, Makeup Artist." },
    { id: 3, summary: "Master the three essential documents: Run-Sheet, Budget Tracker, and Vendor Contracts." },
    { id: 4, summary: "Learn the Sandwich Method for bad news, active listening, and professional etiquette." },
    { id: 5, summary: "Understand Revenue vs. Profit vs. Margin, cash flow management, and hidden costs." },
    { id: 6, summary: "The 'Invisible Fix' philosophy and SOPs for common emergencies." },
    { id: 7, summary: "20-point venue checklist: parking, washrooms, power backup, stage, kitchen location." },
    { id: 8, summary: "Sales funnel, lead generation tactics, and DM templates." },
    { id: 9, summary: "Negotiation tactics: The Bulk Discount, The Pause, and Value Add." },
    { id: 10, summary: "D-Day playbook: Vendor check-in protocol, founder's rules." },
    { id: 11, summary: "Post-event: vendor payments, client feedback forms, and team debrief." },
    { id: 12, summary: "Client contracts (5 must-have clauses), GST/invoicing, and photo rights." },
    { id: 13, summary: "Generative AI for event planning: prompt engineering, email drafting, run-sheets." }
];

function renderTraining() {
    const grid = document.querySelector('.training-grid');
    if (!grid) return;
    grid.innerHTML = data.training.modules.map(m => {
        const summary = MODULE_SUMMARIES.find(s => s.id === m.id)?.summary || 'No summary available.';
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
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;width:100%;">
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
        renderTraining();
        renderTrainingProgress();
    }
}

// ===== NAVIGATION & MODAL =====
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
}

function openModal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ===== CRUD FUNCTIONS (EVENTS) =====
function showAddEventForm() {
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

async function addEvent() {
    const name = document.getElementById('f-event-name').value.trim();
    const client = document.getElementById('f-event-client').value.trim();
    const date = document.getElementById('f-event-date').value;
    const venue = document.getElementById('f-event-venue').value.trim();
    const status = document.getElementById('f-event-status').value;
    if (!name || !client || !date || !venue) {
        alert('Please fill all fields');
        return;
    }
    const id = genId();
    const eventData = { id, name, client, date, venue, status };
    const { error } = await supabaseClient.from('events').insert([eventData]);
    if (error) { alert('Failed to add event: ' + error.message); return; }
    data.events.push(eventData);
    renderAll();
    closeModal();
}

async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabaseClient.from('events').delete().eq('id', id);
    if (error) { alert('Failed to delete: ' + error.message); return; }
    data.events = data.events.filter(e => e.id !== id);
    renderAll();
}

function editEvent(id) {
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

async function updateEvent(id) {
    const e = data.events.find(ev => ev.id === id);
    if (!e) return;
    const updatedData = {
        name: document.getElementById('f-event-name').value.trim(),
        client: document.getElementById('f-event-client').value.trim(),
        date: document.getElementById('f-event-date').value,
        venue: document.getElementById('f-event-venue').value.trim(),
        status: document.getElementById('f-event-status').value
    };
    const { error } = await supabaseClient.from('events').update(updatedData).eq('id', id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    Object.assign(e, updatedData);
    renderAll();
    closeModal();
}

// ===== CRUD FUNCTIONS (VENDORS) =====
function showAddVendorForm() {
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

async function addVendor() {
    const name = document.getElementById('f-vendor-name').value.trim();
    const category = document.getElementById('f-vendor-category').value;
    const contact = document.getElementById('f-vendor-contact').value.trim();
    const phone = document.getElementById('f-vendor-phone').value.trim();
    const price = document.getElementById('f-vendor-price').value.trim();
    if (!name || !contact || !phone) {
        alert('Please fill all required fields');
        return;
    }
    const id = genId();
    const vendorData = { id, name, category, contact, phone, price };
    const { error } = await supabaseClient.from('vendors').insert([vendorData]);
    if (error) { alert('Failed to add vendor: ' + error.message); return; }
    data.vendors.push(vendorData);
    renderAll();
    closeModal();
}

async function deleteVendor(id) {
    if (!confirm('Delete this vendor?')) return;
    const { error } = await supabaseClient.from('vendors').delete().eq('id', id);
    if (error) { alert('Failed to delete: ' + error.message); return; }
    data.vendors = data.vendors.filter(v => v.id !== id);
    renderAll();
}

function editVendor(id) {
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

async function updateVendor(id) {
    const v = data.vendors.find(vendor => vendor.id === id);
    if (!v) return;
    const updatedData = {
        name: document.getElementById('f-vendor-name').value.trim(),
        category: document.getElementById('f-vendor-category').value,
        contact: document.getElementById('f-vendor-contact').value.trim(),
        phone: document.getElementById('f-vendor-phone').value.trim(),
        price: document.getElementById('f-vendor-price').value.trim()
    };
    const { error } = await supabaseClient.from('vendors').update(updatedData).eq('id', id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    Object.assign(v, updatedData);
    renderAll();
    closeModal();
}

// ===== CRUD FUNCTIONS (TASKS) =====
function showAddTaskForm() {
    const eventOptions = data.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    openModal(`
        <h2>Add New Task</h2>
        <label>Task Title</label><input id="f-task-title" placeholder="Call Caterer" />
        <label>Description</label><textarea id="f-task-desc" placeholder="Confirm December 15 availability"></textarea>
        <label>Assigned To</label>
        <select id="f-task-assign">
            <option value="Intern 1">Intern 1</option>
            <option value="Intern 2">Intern 2</option>
            <option value="Intern 3">Intern 3</option>
        </select>
        <label>Related Event</label>
        <select id="f-task-event"><option value="">None</option>${eventOptions}</select>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="addTask()">Save</button>
        </div>
    `);
}

async function addTask() {
    const title = document.getElementById('f-task-title').value.trim();
    const description = document.getElementById('f-task-desc').value.trim();
    const assigned_to = document.getElementById('f-task-assign').value;
    const event_id = parseInt(document.getElementById('f-task-event').value) || null;
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    const id = genId();
    const taskData = { id, title, description, assigned_to, event_id, status: 'todo' };
    const { error } = await supabaseClient.from('tasks').insert([taskData]);
    if (error) { alert('Failed to add task: ' + error.message); return; }
    data.tasks.push(taskData);
    renderAll();
    closeModal();
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const { error } = await supabaseClient.from('tasks').delete().eq('id', id);
    if (error) { alert('Failed to delete: ' + error.message); return; }
    data.tasks = data.tasks.filter(t => t.id !== id);
    renderAll();
}

async function moveTask(id, newStatus) {
    const { error } = await supabaseClient.from('tasks').update({ status: newStatus }).eq('id', id);
    if (error) { alert('Failed to update task: ' + error.message); return; }
    const task = data.tasks.find(t => t.id === id);
    if (task) task.status = newStatus;
    renderAll();
}

// ===== CRUD FUNCTIONS (BUDGETS) =====
function showAddBudgetForm() {
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

async function addBudget() {
    const event_id = parseInt(document.getElementById('f-budget-event').value);
    const category = document.getElementById('f-budget-cat').value;
    const estimated = parseFloat(document.getElementById('f-budget-est').value);
    const actual = parseFloat(document.getElementById('f-budget-act').value) || 0;
    const status = document.getElementById('f-budget-status').value;
    if (!event_id || isNaN(estimated) || estimated <= 0) {
        alert('Please fill all fields');
        return;
    }
    const id = genId();
    const budgetData = { id, event_id, category, estimated, actual, status };
    const { error } = await supabaseClient.from('budgets').insert([budgetData]);
    if (error) { alert('Failed to add budget: ' + error.message); return; }
    data.budgets.push(budgetData);
    renderAll();
    closeModal();
}

// ===== CRUD FUNCTIONS (RUN-SHEETS) =====
function showAddRunSheetForm() {
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

async function addRunSheet() {
    const event_id = parseInt(document.getElementById('f-rs-event').value);
    const timeline = document.getElementById('f-rs-timeline').value.trim();
    if (!event_id || !timeline) {
        alert('Please fill all fields');
        return;
    }
    const id = genId();
    const runSheetData = { id, event_id, timeline };
    const { error } = await supabaseClient.from('run_sheets').insert([runSheetData]);
    if (error) { alert('Failed to add run-sheet: ' + error.message); return; }
    data.runSheets.push(runSheetData);
    renderAll();
    closeModal();
}

async function deleteRunSheet(id) {
    if (!confirm('Delete this run-sheet?')) return;
    const { error } = await supabaseClient.from('run_sheets').delete().eq('id', id);
    if (error) { alert('Failed to delete: ' + error.message); return; }
    data.runSheets = data.runSheets.filter(rs => rs.id !== id);
    renderAll();
}

function editRunSheet(id) {
    const rs = data.runSheets.find(r => r.id === id);
    if (!rs) return;
    const eventOptions = data.events.map(e => `<option value="${e.id}" ${e.id===rs.event_id?'selected':''}>${e.name}</option>`).join('');
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

async function updateRunSheet(id) {
    const rs = data.runSheets.find(r => r.id === id);
    if (!rs) return;
    const updatedData = {
        event_id: parseInt(document.getElementById('f-rs-event').value),
        timeline: document.getElementById('f-rs-timeline').value.trim()
    };
    const { error } = await supabaseClient.from('run_sheets').update(updatedData).eq('id', id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    Object.assign(rs, updatedData);
    renderAll();
    closeModal();
}

// ===== NAVIGATION EVENTS =====
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        navigateTo(this.dataset.page);
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ===== START APP =====
loadAllData();