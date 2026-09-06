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

// ===== AUTH UI & HELPERS =====
async function getCurrentUserId() {
    if (!supabaseClient || !supabaseClient.auth) return null;
    try {
        const { data } = await supabaseClient.auth.getUser();
        return data?.user?.id || null;
    } catch (err) {
        console.error('Auth getUser failed', err);
        return null;
    }
}

function createAuthUi() {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;
    footer.innerHTML = `<div id="auth-area"></div>`;
    updateAuthUi();
    if (supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.onAuthStateChange === 'function') {
        supabaseClient.auth.onAuthStateChange(() => updateAuthUi());
    }
}

async function updateAuthUi() {
    const area = document.getElementById('auth-area');
    if (!area) return;
    const userId = await getCurrentUserId();
    if (userId) {
        area.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
            <span style="font-size:13px;color:#e2e8f0;">Signed in</span>
            <button class="btn-secondary" onclick="signOut()">Sign out</button>
        </div>`;
    } else {
        area.innerHTML = `<button class="btn-primary" onclick="showLoginForm()">Sign In</button>`;
    }
}

function showLoginForm() {
    openModal(`
        <h2>Sign In</h2>
        <label>Email</label><input id="f-auth-email" type="email" placeholder="you@example.com" />
        <label>Password</label><input id="f-auth-pass" type="password" placeholder="password" />
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="signIn()">Sign In</button>
        </div>
    `);
}

async function signIn() {
    const email = document.getElementById('f-auth-email').value.trim();
    const password = document.getElementById('f-auth-pass').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) { alert('Sign in failed: ' + error.message); console.error('SignIn error', error); return; }
        closeModal();
        updateAuthUi();
        loadAllData(); // Reload data after signing in to bypass RLS
    } catch (err) {
        console.error('SignIn exception', err);
        alert('Sign in failed — check console for details');
    }
}

async function signOut() {
    try {
        await supabaseClient.auth.signOut();
        updateAuthUi();
        data = { events: [], vendors: [], tasks: [], budgets: [], runSheets: [], training: data.training }; // Clear data on sign out
        renderAll();
    } catch (err) {
        console.error('Sign out failed', err);
        alert('Sign out failed');
    }
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
    // Check if user is logged in first
    const user = await getCurrentUserId();
    if (!user) {
        console.warn('User not authenticated, skipping data load.');
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
    if (error) { console.error('Failed to load events', error); }
    else data.events = events || [];
}

async function loadVendors() {
    const { data: vendors, error } = await supabaseClient.from('vendors').select('*');
    if (error) { console.error('Failed to load vendors', error); }
    else data.vendors = vendors || [];
}

async function loadTasks() {
    const { data: tasks, error } = await supabaseClient.from('tasks').select('*');
    if (error) { console.error('Failed to load tasks', error); }
    else data.tasks = tasks || [];
}

async function loadBudgets() {
    const { data: budgets, error } = await supabaseClient.from('budgets').select('*');
    if (error) { console.error('Failed to load budgets', error); }
    else data.budgets = budgets || [];
}

async function loadRunSheets() {
    const { data: runSheets, error } = await supabaseClient.from('run_sheets').select('*');
    if (error) { console.error('Failed to load run_sheets', error); }
    else data.runSheets = runSheets || [];
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

// ... (RenderEvents, RenderVendors, RenderTasks, RenderBudgets, RenderRunSheets, Training remain EXACTLY the same as your original code) ...

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

// =============================================================
// UPDATED addEvent FUNCTION - THE KEY FIX
// =============================================================
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

    // 1. Get the current logged-in user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // 2. Prevent the error if the user is not logged in
    if (!user) {
        alert('You must be signed in to add events. Please sign in from the sidebar.');
        return;
    }

    // 3. Attach created_by to the payload
    const eventData = { 
    name, 
    client, 
    date, 
    venue, 
    status,
    created_by: user.id 
};

    const { data: inserted, error } = await supabaseClient.from('events').insert([eventData]).select().single();
    if (error) { alert('Failed to add event: ' + error.message); return; }
    data.events.push(inserted);
    renderAll();
    closeModal();
}

// ... (deleteEvent, editEvent, updateEvent remain exactly the same) ...

// ===== CRUD FUNCTIONS (VENDORS, TASKS, BUDGETS, RUN-SHEETS) =====
// NOTE: I have also updated these to include created_by. 
// **IMPORTANT**: If your 'vendors', 'tasks', 'budgets', or 'run_sheets' tables in Supabase DO NOT have a "created_by" column, you must REMOVE the `created_by: user.id` line from those specific functions below.

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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('You must be signed in to add vendors.'); return; }

    const vendorData = { name, category, contact, phone, price, created_by: user.id };
    const { data: inserted, error } = await supabaseClient.from('vendors').insert([vendorData]).select().single();
    if (error) { alert('Failed to add vendor: ' + error.message); return; }
    data.vendors.push(inserted);
    renderAll();
    closeModal();
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('You must be signed in to add tasks.'); return; }

    const taskData = { title, description, assigned_to, event_id, status: 'todo', created_by: user.id };
    const { data: inserted, error } = await supabaseClient.from('tasks').insert([taskData]).select().single();
    if (error) { alert('Failed to add task: ' + error.message); return; }
    data.tasks.push(inserted);
    renderAll();
    closeModal();
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('You must be signed in to add budgets.'); return; }

    const budgetData = { event_id, category, estimated, actual, status, created_by: user.id };
    const { data: inserted, error } = await supabaseClient.from('budgets').insert([budgetData]).select().single();
    if (error) { alert('Failed to add budget: ' + error.message); return; }
    data.budgets.push(inserted);
    renderAll();
    closeModal();
}

async function addRunSheet() {
    const event_id = parseInt(document.getElementById('f-rs-event').value);
    const timeline = document.getElementById('f-rs-timeline').value.trim();
    if (!event_id || !timeline) {
        alert('Please fill all fields');
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('You must be signed in to add run sheets.'); return; }

    const runSheetData = { event_id, timeline, created_by: user.id };
    const { data: inserted, error } = await supabaseClient.from('run_sheets').insert([runSheetData]).select().single();
    if (error) { alert('Failed to add run-sheet: ' + error.message); return; }
    data.runSheets.push(inserted);
    renderAll();
    closeModal();
}

// ... (Remaining functions and event listeners remain exactly the same) ...

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
createAuthUi(); // Initialize auth UI at start
loadAllData();2