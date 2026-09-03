// ============================================================
// EVENTO-EVENTS DASHBOARD – Final Working Version
// ============================================================

// ===== SUPABASE CONFIGURATION =====
const supabaseUrl = 'https://tkapyxsuagzwxvvslhyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXB5eHN1YWd6d3h2dnNsaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDIyMzEsImV4cCI6MjEwMzMxODIzMX0.7UaRmzPGK9cStuJEkw4Fa1xoYLuCzGN6ONRFB_GNDJw';

// ===== INITIALIZE SUPABASE =====
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
console.log('🚀 Supabase initialized');

// ===== GLOBAL STATE =====
let currentUser = null;
let currentUserRole = null;

// ===== LOGIN FUNCTION =====
async function handleLogin() {
    console.log('🟢 handleLogin() triggered');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    console.log('📧 Email:', email);
    console.log('🔑 Password entered (length):', password.length);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Login failed: ' + error.message);
            console.error('❌ Auth error:', error);
            return;
        }

        if (!data.user) {
            alert('No user data returned.');
            return;
        }

        console.log('✅ Auth successful for:', data.user.email);

        // Fetch user role from 'users' table
        const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.user.email)
            .single();

        if (roleError) {
            alert('User role not found. Contact admin.');
            console.error('❌ Role error:', roleError);
            return;
        }

        currentUser = {
            email: userData.email,
            name: userData.name,
            role: userData.role
        };
        currentUserRole = userData.role;

        localStorage.setItem('eventoUser', JSON.stringify(currentUser));

        // Hide login, show dashboard
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'flex';
        document.getElementById('user-badge').textContent = `👤 ${currentUser.name} (${currentUser.role})`;

        applyPermissions(currentUser.role);

        // Load data (you'll need to implement loadAllData if not present)
        // For now, just navigate to home
        navigateTo('home');

        console.log('✅ Logged in as:', currentUser.name);

    } catch (err) {
        alert('Login failed. Please try again.');
        console.error('💥 Unexpected error:', err);
    }
}

function applyPermissions(role) {
    const isFounder = role === 'founder';
    document.getElementById('nav-budgets').style.display = isFounder ? 'block' : 'none';
    document.getElementById('nav-run-sheets').style.display = isFounder ? 'block' : 'none';
}

async function handleLogout() {
    if (!confirm('Logout?')) return;
    await supabase.auth.signOut();
    localStorage.removeItem('eventoUser');
    document.getElementById('dashboard-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// ===== DUMMY FUNCTIONS TO AVOID ERRORS (replace with your real ones) =====
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
}

function showAddEventForm() { alert('Add Event – implement later'); }
function showAddVendorForm() { alert('Add Vendor – implement later'); }
function showAddTaskForm() { alert('Add Task – implement later'); }
function showAddBudgetForm() { alert('Add Budget – implement later'); }
function showAddRunSheetForm() { alert('Add Run-Sheet – implement later'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function openModal(html) { document.getElementById('modal-body').innerHTML = html; document.getElementById('modal').classList.remove('hidden'); }

// Expose to global scope
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

console.log('✅ All functions exposed');