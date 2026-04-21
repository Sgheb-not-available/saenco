function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
tick();
setInterval(tick, 1000);

const giorni = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
const mesi = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
    'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const now = new Date();
document.getElementById('hero-date-label').textContent =
    giorni[now.getDay()] + ', ' + now.getDate() + ' ' + mesi[now.getMonth()];
document.getElementById('hero-date-big').textContent = now.getFullYear();
document.getElementById('year').textContent = now.getFullYear();

async function syncMetrics() {
    const todos = await fetch('/api/todos').then(r => r.json());
    const events = await fetch('/api/events').then(r => r.json());
    const documents = await fetch('/api/documents').then(r => r.json());

    const metrics = document.querySelectorAll('.metric-card .metric-value');

    if (metrics[0]) metrics[0].innerHTML = `${todos.length} <span class="metric-unit">da completare</span>`;
    if (metrics[1]) metrics[1].innerHTML = `${documents.length} <span class="metric-unit">documenti</span>`;

    syncTodoList(todos);
    syncUpcomingEvents(events);
}

function syncTodoList(todos) {
    const todoCard = Array.from(document.querySelectorAll('.card')).find(card =>
        card.querySelector('.card-title')?.textContent === 'Da fare'
    );
    if (!todoCard) return;

    const todoCardBody = todoCard.querySelector('.card-body');
    if (!todoCardBody) return;

    todoCardBody.querySelectorAll('.project-row').forEach(r => r.remove());

    const priorityOrder = { 'urgente': 4, 'alta': 3, 'media': 2, 'bassa': 1 };
    const sorted = [...todos].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    sorted.slice(0, 4).forEach(todo => {
        const priorityClass = { 'bassa': 'badge-green', 'media': 'badge-blue', 'alta': 'badge-amber', 'urgente': 'badge-red' }[todo.priority] || 'badge-blue';
        const statusText = { 'bassa': 'Bassa', 'media': 'Media', 'alta': 'Alta', 'urgente': 'Urgente' }[todo.priority] || 'Media';

        const row = document.createElement('div');
        row.className = 'project-row';
        row.innerHTML = `
            <div>
                <div class="project-name">${todo.description}</div>
                <div class="project-loc">Priorità: ${statusText}</div>
            </div>
            <div class="progress-wrap"></div>
            <span class="badge ${priorityClass}">${statusText}</span>
        `;
        todoCardBody.appendChild(row);
    });
}

function syncUpcomingEvents(events) {
    const upcomingCard = Array.from(document.querySelectorAll('.card')).find(card =>
        card.querySelector('.card-title')?.textContent === 'A breve'
    );
    if (!upcomingCard) return;

    const container = upcomingCard.querySelector('.card-body');
    if (!container) return;

    container.querySelectorAll('.deadline-row').forEach(r => r.remove());

    const today = new Date();
    const upcoming = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

    upcoming.forEach(event => {
        const d = new Date(event.date);
        const row = document.createElement('div');
        row.className = 'deadline-row';
        row.innerHTML = `
            <div class="deadline-date" style="background: var(--surface-alt);">
                <div class="deadline-day">${d.getDate()}</div>
                <div class="deadline-mon">${d.toLocaleDateString('it-IT', { month: 'short' })}</div>
            </div>
            <div>
                <div class="deadline-text">${event.title}</div>
                <div class="deadline-sub">${event.description || 'Nessuna descrizione'}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

function syncAlertsBar(events) {
    const alertsBar = document.querySelector('.alerts-bar');
    if (!alertsBar) return;

    alertsBar.querySelectorAll('.alert-item, [style*="opacity:0.25"]').forEach(i => i.remove());

    const today = new Date();
    const upcoming = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    if (upcoming.length === 0) {
        const item = document.createElement('div');
        item.className = 'alert-item';
        item.innerHTML = `<span class="alert-tag">INFO</span><span>Nessun evento imminente</span>`;
        alertsBar.appendChild(item);
        return;
    }

    upcoming.forEach((event, i) => {
        const item = document.createElement('div');
        item.className = 'alert-item';
        item.innerHTML = `<span class="alert-tag">SCADENZA</span><span>${event.title}</span>`;
        alertsBar.appendChild(item);

        if (i < upcoming.length - 1) {
            const sep = document.createElement('div');
            sep.style.cssText = 'opacity:0.25; font-size: 18px; font-weight: 100;';
            sep.textContent = '|';
            alertsBar.appendChild(sep);
        }
    });
}

syncMetrics();
setInterval(syncMetrics, 5000);

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Domani';
    if (diffDays === -1) return 'Ieri';
    if (diffDays > 0) return `Tra ${diffDays} giorni`;
    return `${Math.abs(diffDays)} giorni fa`;
}

// Sync on page load
syncMetrics();

// Sync periodically (every 5 seconds)
setInterval(syncMetrics, 5000);