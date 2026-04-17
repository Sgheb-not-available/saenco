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

// Sync metrics
function syncMetrics() {
    // Sync todos count
    const todos = JSON.parse(localStorage.getItem('saenco-todos') || '[]');
    const todoCount = todos.length;
    const todoMetric = document.querySelector('.metric-card .metric-value');
    if (todoMetric) {
        todoMetric.innerHTML = `${todoCount} <span class="metric-unit">da completare</span>`;
    }

    // Sync todo list display
    syncTodoList(todos);

    // Sync upcoming events in the homepage
    syncUpcomingEvents();

    // Sync alerts bar
    syncAlertsBar();

    // Software count (static for now, can be made dynamic later)
    const softwareCount = 1; // Count from software.html cards
    const softwareMetrics = document.querySelectorAll('.metric-card .metric-value');
    if (softwareMetrics[2]) {
        softwareMetrics[2].innerHTML = `${softwareCount} <span class="metric-unit">software</span>`;
    }

    // Employees count (static)
    // Already set to 3 in HTML
}

// Sync alerts bar with upcoming events
function syncAlertsBar() {
    const events = JSON.parse(localStorage.getItem('saenco-events') || '[]');
    const alertsBar = document.querySelector('.alerts-bar');
    if (!alertsBar) return;

    // Get the alerts label (keep it)
    const alertsLabel = alertsBar.querySelector('.alert-label');

    // Clear existing alert items
    const existingItems = alertsBar.querySelectorAll('.alert-item, [style*="opacity:0.25"]');
    existingItems.forEach(item => item.remove());

    // Get upcoming events (next 3)
    const today = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Add alert items
    upcomingEvents.forEach((event, index) => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
                    <span class="alert-tag">SCADENZA</span>
                    <span>${event.title}</span>
                `;
        alertsBar.appendChild(alertItem);

        // Add separator if not the last item
        if (index < upcomingEvents.length - 1) {
            const separator = document.createElement('div');
            separator.style.cssText = 'opacity:0.25; font-size: 18px; font-weight: 100;';
            separator.textContent = '|';
            alertsBar.appendChild(separator);
        }
    });

    // If no upcoming events, show default message
    if (upcomingEvents.length === 0) {
        const defaultItem = document.createElement('div');
        defaultItem.className = 'alert-item';
        defaultItem.innerHTML = `
                    <span class="alert-tag">INFO</span>
                    <span>Nessun evento imminente</span>
                `;
        alertsBar.appendChild(defaultItem);
    }
}

// Sync upcoming events in the homepage
function syncUpcomingEvents() {
    const events = JSON.parse(localStorage.getItem('saenco-events') || '[]');
    const upcomingCard = Array.from(document.querySelectorAll('.card')).find(card =>
        card.querySelector('.card-title')?.textContent === 'A breve'
    );
    if (!upcomingCard) return;

    const deadlinesContainer = upcomingCard.querySelector('.card-body');
    if (!deadlinesContainer) return;

    // Clear existing deadline rows (keep the header)
    const existingRows = deadlinesContainer.querySelectorAll('.deadline-row');
    existingRows.forEach(row => row.remove());

    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Show next 4 upcoming events
    const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= new Date()).slice(0, 4);

    upcomingEvents.forEach(event => {
        const deadlineRow = document.createElement('div');
        deadlineRow.className = 'deadline-row';

        const eventDate = new Date(event.date);
        const today = new Date();
        const isOverdue = eventDate < today;

        deadlineRow.innerHTML = `
                    <div class="deadline-date" style="background: ${isOverdue ? 'var(--red-bg)' : 'var(--surface-alt)'};">
                    <div class="deadline-day" style="color: ${isOverdue ? 'var(--red)' : 'var(--text-primary)'};">${eventDate.getDate()}</div>
                    <div class="deadline-mon" style="color: ${isOverdue ? 'var(--red)' : 'var(--text-muted)'};">${eventDate.toLocaleDateString('it-IT', { month: 'short' })}</div>
                    </div>
                    <div>
                    <div class="deadline-text">${event.title}</div>
                    <div class="deadline-sub">${event.description || 'Nessuna descrizione'}</div>
                    </div>
                `;

        deadlinesContainer.appendChild(deadlineRow);
    });
}

// Sync todo list in the homepage card
function syncTodoList(todos) {
    // Target the "Da fare" card specifically
    const todoCard = Array.from(document.querySelectorAll('.card')).find(card =>
        card.querySelector('.card-title')?.textContent === 'Da fare'
    );
    if (!todoCard) return;

    const todoCardBody = todoCard.querySelector('.card-body');
    if (!todoCardBody) return;

    // Clear existing project rows (keep the header)
    const existingRows = todoCardBody.querySelectorAll('.project-row');
    existingRows.forEach(row => row.remove());

    // Sort todos by priority (urgente > alta > media > bassa) and then by date
    const priorityOrder = { 'urgente': 4, 'alta': 3, 'media': 2, 'bassa': 1 };
    const sortedTodos = todos.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.date) - new Date(b.date);
    });

    // Show only first 4 todos
    const displayTodos = sortedTodos.slice(0, 4);

    displayTodos.forEach(todo => {
        const projectRow = document.createElement('div');
        projectRow.className = 'project-row';

        const priorityClass = {
            'bassa': 'badge-green',
            'media': 'badge-blue',
            'alta': 'badge-amber',
            'urgente': 'badge-red'
        }[todo.priority] || 'badge-blue';

        const statusText = {
            'bassa': 'Bassa',
            'media': 'Media',
            'alta': 'Alta',
            'urgente': 'Urgente'
        }[todo.priority] || 'Media';

        projectRow.innerHTML = `
                    <div>
                        <div class="project-name">${todo.description}</div>
                        <div class="project-loc">Priorità: ${statusText}</div>
                    </div>
                    <div class="progress-wrap"></div>
                    <span class="badge ${priorityClass}">${statusText}</span>
                `;

        todoCardBody.appendChild(projectRow);
    });
}

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