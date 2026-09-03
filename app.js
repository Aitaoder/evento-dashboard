// ============================================================
// EVENTO-EVENTS DASHBOARD – FINAL WORKING VERSION
// ============================================================

// ===== SUPABASE CONFIGURATION =====
const supabaseUrl = 'https://tkapyxsuagzwxvvslhyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXB5eHN1YWd6d3h2dnNsaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDIyMzEsImV4cCI6MjEwMzMxODIzMX0.7UaRmzPGK9cStuJEkw4Fa1xoYLuCzGN6ONRFB_GNDJw';

// ===== INITIALIZE SUPABASE =====
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Supabase initialized');

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

function handleLogin() {
    console.log('🟢 handleLogin() triggered');
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    console.log('📧 Email:', email);

    supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    .then(result => {
        console.log('📦 Auth result:', result);
        
        if (result.error) {
            alert('Login failed: ' + result.error.message);
            return;
        }

        if (!result.data || !result.data.user) {
            alert('No user data returned.');
            return;
        }

        console.log('✅ Auth successful for:', result.data.user.email);

        // Show dashboard
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'flex';
        document.getElementById('user-badge').textContent = '👤 Logged In';

        console.log('✅ Dashboard should be visible now!');
    })
    .catch(err => {
        alert('Login failed: ' + err.message);
        console.error('💥 Error:', err);
    });
}

function handleLogout() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard-container').style.display = 'none';
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
}

// ============================================================
// DUMMY FUNCTIONS (to avoid errors)
// ============================================================

function showAddEventForm() { alert('Add Event – implement later'); }
function showAddVendorForm() { alert('Add Vendor – implement later'); }
function showAddTaskForm() { alert('Add Task – implement later'); }
function showAddBudgetForm() { alert('Add Budget – implement later'); }
function showAddRunSheetForm() { alert('Add Run-Sheet – implement later'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function openModal(html) { 
    document.getElementById('modal-body').innerHTML = html; 
    document.getElementById('modal').classList.remove('hidden'); 
}

// ============================================================
// EXPOSE TO GLOBAL SCOPE
// ============================================================

window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.navigateTo = navigateTo;
window.showAddEventForm = showAddEventForm;
window.showAddVendorForm = showAddVendorForm;
window.showAddTaskForm = showAddTaskForm;
window.showAddBudgetForm = showAddBudgetForm;
window.showAddRunSheetForm = showAddRunSheetForm;
window.closeModal = closeModal;
window.openModal = openModal;

console.log('✅ All functions exposed to window');