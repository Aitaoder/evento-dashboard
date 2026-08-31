// ============================================================
// EVENTO-EVENTS DASHBOARD – Phase 2 (Supabase Backend)
// ============================================================

// ===== SUPABASE CONFIGURATION =====
// REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE DASHBOARD
const supabaseUrl = 'https://tkapyxsuagzwxvvslhyn.supabase.co'; // ← REPLACE THIS
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXB5eHN1YWd6d3h2dnNsaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDIyMzEsImV4cCI6MjEwMzMxODIzMX0.7UaRmzPGK9cStuJEkw4Fa1xoYLuCzGN6ONRFB_GNDJw'; // ← REPLACE THIS

// Initialize Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// ===== CURRENT USER =====
let currentUser = null;
let currentUserRole = null;

// ===== DATA STORE (for UI rendering) =====
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

// ===== MODULE SUMMARIES =====
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

// ============================================================
// LOGIN / LOGOUT FUNCTIONS
// ============================================================

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        // Sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            alert('Invalid email or password. Please try again.');
            console.error('Login error:', authError);
            return;
        }

        // Get user role from the users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError) {
            alert('User role not found. Please contact the administrator.');
            console.error('User fetch error:', userError);
            return;
        }

        currentUser = {
            email: userData.email,
            name: userData.name,
            role: userData.role
        };
        currentUserRole = userData.role;

        // Save session
        localStorage.setItem('eventoUser', JSON.stringify(currentUser));

        // Show dashboard
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'flex';
        document.getElementById('user-badge').textContent = `👤 ${currentUser.name} (${currentUser.role})`;

        applyPermissions(currentUser.role);

        // Load data from Supabase
        await loadAllData();

        // Navigate to home
        navigateTo('home');

        console.log('✅ Logged in as:', currentUser.name);

    } catch (error) {
        alert('Login failed. Please try again.');
        console.error('Login error:', error);
    }
}

async function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) return;

    try {
        await supabase.auth.signOut();
        localStorage.removeItem('eventoUser');
        currentUser = null;
        currentUserRole = null;
        document.getElementById('dashboard-container').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        console.log('✅ Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function applyPermissions(role) {
    const isFounder = role === 'founder';
    document.getElementById('nav-budgets').style.display = isFounder ? 'block' : 'none';
    document.getElementById('nav-run-sheets').style.display = isFounder ? 'block' : 'none';
}

// ============================================================
// DATA LOADING FROM SUPABASE
// ============================================================

async function loadAllData() {
    try {
        await Promise.all([
            loadEvents(),
            loadVendors(),
            loadTasks(),
            loadBudgets(),
            loadRunSheets(),
            loadTrainingProgress()
        ]);
        renderAll();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please refresh the page.');
    }
}

async function loadEvents() {
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Error loading events:', error);
        return;
    }
    data.events = events || [];
}

async function loadVendors() {
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error loading vendors:', error);
        return;
    }
    data.vendors = vendors || [];
}

async function loadTasks() {
    const query = supabase.from('tasks').select('*');

    // If intern, only show their tasks
    if (currentUserRole === 'intern') {
        query.eq('assigned_to', currentUser.name);
    }

    const { data: tasks, error } = await query;

    if (error) {
        console.error('Error loading tasks:', error);
        return;
    }
    data.tasks = tasks || [];
}

async function loadBudgets() {
    // Only founders can see budgets
    if (currentUserRole !== 'founder') {
        data.budgets = [];
        return;
    }

    const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error loading budgets:', error);
        return;
    }
    data.budgets = budgets || [];
}

async function loadRunSheets() {
    // Only founders can see run-sheets
    if (currentUserRole !== 'founder') {
        data.runSheets = [];
        return;
    }

    const { data: runSheets, error } = await supabase
        .from('run_sheets')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error loading run-sheets:', error);
        return;
    }
    data.runSheets = runSheets || [];
}

async function loadTrainingProgress() {
    const { data: progress, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_email', currentUser.email);

    if (error) {
        console.error('Error loading training progress:', error);
        return;
    }

    // Update training modules with progress
    if (progress && progress.length > 0) {
        data.training.modules = data.training.modules.map(module => {
            const found = progress.find(p => p.module_id === module.id);
            return { ...module, completed: found ? found.completed : false };
        });
    }
}

// ============================================================
// SAVE FUNCTIONS (CRUD Operations)
// ============================================================

async function addEventToSupabase(eventData) {
    const { data: newEvent, error } = await supabase
        .from('events')
        .insert([{
            ...eventData,
            created_by: currentUser.email
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding event:', error);
        alert('Failed to add event. Please try again.');
        return null;
    }
    return newEvent;
}

async function updateEventInSupabase(id, eventData) {
    const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
        return null;
    }
    return updatedEvent;
}

async function deleteEventFromSupabase(id) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
        return false;
    }
    return true;
}

// ============================================================
// RENDER FUNCTIONS
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
    const isFounder = currentUserRole === 'founder';

    if (data.events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No events yet. Add one!</td></tr>`;
        return;
    }

    tbody.innerHTML = data.events.map(e => {
        const actions = isFounder
            ? `<button class="btn-edit" onclick="editEvent(${e.id})">✏️</button>
               <button class="btn-danger" onclick="deleteEvent(${e.id})">🗑️</button>`
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
    const isFounder = currentUserRole === 'founder';

    if (data.vendors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No vendors yet. Add one!</td></tr>`;
        return;
    }

    tbody.innerHTML = data.vendors.map(v => {
        const actions = isFounder
            ? `<button class="btn-edit" onclick="editVendor(${v.id})">✏️</button>
               <button class="btn-danger" onclick="deleteVendor(${v.id})">🗑️</button>`
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

    if (data.tasks.length === 0) {
        ['tasks-todo', 'tasks-progress', 'tasks-done'].forEach(id => {
            document.getElementById(id).innerHTML = `<div style="color:#94a3b8;padding:12px;text-align:center;font-size:13px;">No tasks</div>`;
        });
        return;
    }

    data.tasks.forEach(t => {
        const canMove = currentUserRole === 'founder' || (currentUserRole === 'intern' && t.assigned_to === currentUser.name);
        let actions = '';
        if (canMove) {
            if (t.status === 'todo') {
                actions += `<button class="btn-secondary" onclick="moveTask(${t.id},'progress')">➡️ Start</button>`;
            }
            if (t.status === 'progress') {
                actions += `<button class="btn-secondary" onclick="moveTask(${t.id},'done')">✅ Done</button>`;
            }
        }
        const card = `
            <div class="task-card">
                <div class="task-title">${t.title}</div>
                <div class="task-meta">${t.assigned_to || 'Unassigned'} ${t.event_id ? '• Event #'+t.event_id : ''}</div>
                <div class="task-actions">${actions}</div>
            </div>
        `;
        const columnId = t.status === 'todo' ? 'tasks-todo' : (t.status === 'progress' ? 'tasks-progress' : 'tasks-done');
        document.getElementById(columnId).innerHTML += card;
    });
}

function renderBudgets() {
    const tbody = document.getElementById('budgets-table-body');

    if (currentUserRole !== 'founder') {
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
        const eventName = data.events.find(e => e.id === b.event_id)?.name || 'Unknown';
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

    if (currentUserRole !== 'founder') {
        container.innerHTML = `<div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;color:#94a3b8;text-align:center;">🔒 Access restricted. Please contact founder.</div>`;
        return;
    }

    if (data.runSheets.length === 0) {
        container.innerHTML = `<div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e9edf4;color:#94a3b8;text-align:center;">No run-sheets yet. Add one!</div>`;
        return;
    }

    container.innerHTML = data.runSheets.map(rs => {
        const eventName = data.events.find(e => e.id === rs.event_id)?.name || 'Unknown Event';
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

// ============================================================
// TRAINING MODULE RENDERING
// ============================================================

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

// ============================================================
// TRAINING TOGGLE (Sync to Supabase)
// ============================================================

async function toggleModule(id) {
    const mod = data.training.modules.find(m => m.id === id);
    if (!mod) return;

    const newStatus = !mod.completed;
    mod.completed = newStatus;

    // Sync to Supabase
    const { error } = await supabase
        .from('training_progress')
        .upsert({
            user_email: currentUser.email,
            module_id: id,
            completed: newStatus,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_email, module_id'
        });

    if (error) {
        console.error('Error updating training progress:', error);
        alert('Failed to save training progress. Please try again.');
        // Revert the change
        mod.completed = !newStatus;
        renderTraining();
        renderTrainingProgress();
        return;
    }

    renderTraining();
    renderTrainingProgress();
    console.log(`✅ Module ${id} toggled to ${newStatus ? 'completed' : 'incomplete'}`);
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
// EVENT CRUD (Supabase)
// ============================================================

function showAddEventForm() {
    if (currentUserRole !== 'founder') {
        alert('Only founders can add events.');
        return;
    }

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

    const eventData = { name, client, date, venue, status };
    const newEvent = await addEventToSupabase(eventData);

    if (newEvent) {
        data.events.push(newEvent);
        renderAll();
        closeModal();
        console.log('✅ Event added:', newEvent);
    }
}

async function deleteEvent(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can delete events.');
        return;
    }

    if (!confirm('Delete this event?')) return;

    const success = await deleteEventFromSupabase(id);
    if (success) {
        data.events = data.events.filter(e => e.id !== id);
        renderAll();
        console.log('✅ Event deleted:', id);
    }
}

function editEvent(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can edit events.');
        return;
    }

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

    const updatedEvent = await updateEventInSupabase(id, updatedData);
    if (updatedEvent) {
        Object.assign(e, updatedEvent);
        renderAll();
        closeModal();
        console.log('✅ Event updated:', updatedEvent);
    }
}

// ============================================================
// VENDOR CRUD (Supabase)
// ============================================================

function showAddVendorForm() {
    if (currentUserRole !== 'founder') {
        alert('Only founders can add vendors.');
        return;
    }

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

    const vendorData = { name, category, contact, phone, price, created_by: currentUser.email };

    const { data: newVendor, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

    if (error) {
        console.error('Error adding vendor:', error);
        alert('Failed to add vendor. Please try again.');
        return;
    }

    data.vendors.push(newVendor);
    renderAll();
    closeModal();
    console.log('✅ Vendor added:', newVendor);
}

async function deleteVendor(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can delete vendors.');
        return;
    }

    if (!confirm('Delete this vendor?')) return;

    const { error } = await supabase.from('vendors').delete().eq('id', id);

    if (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor. Please try again.');
        return;
    }

    data.vendors = data.vendors.filter(v => v.id !== id);
    renderAll();
    console.log('✅ Vendor deleted:', id);
}

function editVendor(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can edit vendors.');
        return;
    }

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

    const { data: updatedVendor, error } = await supabase
        .from('vendors')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating vendor:', error);
        alert('Failed to update vendor. Please try again.');
        return;
    }

    Object.assign(v, updatedVendor);
    renderAll();
    closeModal();
    console.log('✅ Vendor updated:', updatedVendor);
}

// ============================================================
// TASK CRUD (Supabase)
// ============================================================

function showAddTaskForm() {
    if (currentUserRole !== 'founder') {
        alert('Only founders can create tasks.');
        return;
    }

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

    const taskData = { title, description, assigned_to, event_id, status: 'todo', created_by: currentUser.email };

    const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

    if (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
        return;
    }

    data.tasks.push(newTask);
    renderAll();
    closeModal();
    console.log('✅ Task added:', newTask);
}

async function moveTask(id, newStatus) {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error moving task:', error);
        alert('Failed to update task. Please try again.');
        return;
    }

    Object.assign(task, updatedTask);
    renderAll();
    console.log('✅ Task moved:', updatedTask);
}

// ============================================================
// BUDGET CRUD (Founder Only)
// ============================================================

function showAddBudgetForm() {
    if (currentUserRole !== 'founder') {
        alert('Only founders can manage budgets.');
        return;
    }

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
        <select id="f-budget-status">
            <option value="Not Paid">Not Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
        </select>
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

    const budgetData = { event_id, category, estimated, actual, status, created_by: currentUser.email };

    const { data: newBudget, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();

    if (error) {
        console.error('Error adding budget:', error);
        alert('Failed to add budget item. Please try again.');
        return;
    }

    data.budgets.push(newBudget);
    renderAll();
    closeModal();
    console.log('✅ Budget added:', newBudget);
}

// ============================================================
// RUN-SHEET CRUD (Founder Only)
// ============================================================

function showAddRunSheetForm() {
    if (currentUserRole !== 'founder') {
        alert('Only founders can manage run-sheets.');
        return;
    }

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

    const runSheetData = { event_id, timeline, created_by: currentUser.email };

    const { data: newRunSheet, error } = await supabase
        .from('run_sheets')
        .insert([runSheetData])
        .select()
        .single();

    if (error) {
        console.error('Error adding run-sheet:', error);
        alert('Failed to add run-sheet. Please try again.');
        return;
    }

    data.runSheets.push(newRunSheet);
    renderAll();
    closeModal();
    console.log('✅ Run-sheet added:', newRunSheet);
}

async function deleteRunSheet(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can delete run-sheets.');
        return;
    }

    if (!confirm('Delete this run-sheet?')) return;

    const { error } = await supabase.from('run_sheets').delete().eq('id', id);

    if (error) {
        console.error('Error deleting run-sheet:', error);
        alert('Failed to delete run-sheet. Please try again.');
        return;
    }

    data.runSheets = data.runSheets.filter(rs => rs.id !== id);
    renderAll();
    console.log('✅ Run-sheet deleted:', id);
}

function editRunSheet(id) {
    if (currentUserRole !== 'founder') {
        alert('Only founders can edit run-sheets.');
        return;
    }

    const rs = data.runSheets.find(r => r.id === id);
    if (!rs) return;

    const eventOptions = data.events.map(e =>
        `<option value="${e.id}" ${e.id === rs.event_id ? 'selected' : ''}>${e.name}</option>`
    ).join('');

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

    const { data: updatedRunSheet, error } = await supabase
        .from('run_sheets')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating run-sheet:', error);
        alert('Failed to update run-sheet. Please try again.');
        return;
    }

    Object.assign(rs, updatedRunSheet);
    renderAll();
    closeModal();
    console.log('✅ Run-sheet updated:', updatedRunSheet);
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
// AUTO-LOGIN CHECK & START APP
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('eventoUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            // Verify session with Supabase
            const { data: sessionData } = await supabase.auth.getSession();

            if (sessionData?.session) {
                currentUser = user;
                currentUserRole = user.role;

                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('dashboard-container').style.display = 'flex';
                document.getElementById('user-badge').textContent = `👤 ${currentUser.name} (${currentUser.role})`;

                applyPermissions(currentUser.role);
                await loadAllData();
                navigateTo('home');
                console.log('✅ Auto-logged in as:', currentUser.name);
                return;
            }
        } catch (e) {
            localStorage.removeItem('eventoUser');
            console.warn('Auto-login failed, showing login screen.');
        }
    }

    // Show login screen
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard-container').style.display = 'none';
    console.log('🚀 Evento-Events Dashboard with Supabase backend loaded successfully!');
});

// ============================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================================

// Login/Logout
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.navigateTo = navigateTo;

// Events
window.showAddEventForm = showAddEventForm;
window.addEvent = addEvent;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;
window.updateEvent = updateEvent;

// Vendors
window.showAddVendorForm = showAddVendorForm;
window.addVendor = addVendor;
window.deleteVendor = deleteVendor;
window.editVendor = editVendor;
window.updateVendor = updateVendor;

// Tasks
window.showAddTaskForm = showAddTaskForm;
window.addTask = addTask;
window.moveTask = moveTask;

// Budgets
window.showAddBudgetForm = showAddBudgetForm;
window.addBudget = addBudget;

// Run-Sheets
window.showAddRunSheetForm = showAddRunSheetForm;
window.addRunSheet = addRunSheet;
window.deleteRunSheet = deleteRunSheet;
window.editRunSheet = editRunSheet;
window.updateRunSheet = updateRunSheet;

// Training
window.toggleModule = toggleModule;

// Modal
window.closeModal = closeModal;
window.openModal = openModal;