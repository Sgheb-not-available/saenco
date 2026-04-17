function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
tick();
setInterval(tick, 1000);

// Initialize year
document.getElementById('year').textContent = new Date().getFullYear();

// Calendar state
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('saenco-events') || '[]');

// Initialize with sample events if empty
if (events.length === 0) {
    events = [
        { id: 1, date: '2026-04-24', title: 'Impegno interno', description: 'Responsabile: [Nome]' },
        { id: 2, date: '2026-04-30', title: 'Impegno con cliente', description: 'Cliente: [Nome]' },
        { id: 3, date: '2026-05-15', title: 'Rinnovo certificazione', description: 'Ente certificatore: [Nome]' },
        { id: 4, date: '2026-05-20', title: 'Riunione', description: 'Sede: [Luogo] — ore [HH:MM]' }
    ];
    saveEvents();
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('saenco-events', JSON.stringify(events));
}

// Render calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');

    // Clear previous calendar
    calendarGrid.innerHTML = '';

    // Month and year display
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Day headers
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = 'text-align: center; padding: 0.5rem; font-family: var(--mono); font-size: 11px; color: var(--text-muted); font-weight: 500;';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Calculate first day of month and last day
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    const totalDays = 42; // 6 weeks
    for (let i = 0; i < totalDays; i++) {
        const dayElement = document.createElement('div');
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);

        const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
        const isToday = dayDate.toDateString() === new Date().toDateString();
        const dayEvents = events.filter(event => event.date === dayDate.toISOString().split('T')[0]);

        dayElement.style.cssText = `
                    min-height: 80px;
                    padding: 0.25rem;
                    border: 1px solid var(--border);
                    background: ${isCurrentMonth ? 'var(--surface)' : 'var(--surface-alt)'};
                    ${isToday ? 'background: var(--accent-bg); border-color: var(--accent);' : ''}
                    cursor: pointer;
                    transition: background 0.15s;
                `;

        dayElement.innerHTML = `
                    <div style="font-family: var(--mono); font-size: 12px; font-weight: ${isToday ? '600' : '500'}; color: ${isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)'}; margin-bottom: 0.25rem;">
                        ${dayDate.getDate()}
                    </div>
                    ${dayEvents.map(event => `<div style="font-size: 10px; background: var(--accent-bg); color: var(--accent); padding: 1px 3px; border-radius: 2px; margin-bottom: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${event.title}</div>`).join('')}
                `;

        dayElement.addEventListener('click', () => showDayEvents(dayDate, dayEvents));
        calendarGrid.appendChild(dayElement);
    }
}

// Show events for a specific day
function showDayEvents(date, dayEvents) {
    if (dayEvents.length === 0) {
        // Allow adding event for this day
        document.getElementById('event-date').value = date.toISOString().split('T')[0];
        document.getElementById('event-title').focus();
        return;
    }

    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modalTitle.textContent = `Eventi del ${date.toLocaleDateString('it-IT')}`;

    modalContent.innerHTML = dayEvents.map(event => `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${event.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary);">${event.description || 'Nessuna descrizione'}</p>
                </div>
            `).join('');

    modal.style.display = 'flex';

    // Store current date for edit/delete
    modal.dataset.date = date.toISOString().split('T')[0];
    modal.dataset.events = JSON.stringify(dayEvents);
}

// Handle form submission
document.getElementById('event-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('event-date').value;
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;

    if (!date || !title) return;

    const newEvent = {
        id: Date.now(),
        date,
        title,
        description
    };

    events.push(newEvent);
    saveEvents();
    renderCalendar();

    // Clear form
    document.getElementById('event-date').value = '';
    document.getElementById('event-title').value = '';
    document.getElementById('event-description').value = '';
});

// Navigation
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Modal controls
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

document.getElementById('event-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('event-modal')) {
        document.getElementById('event-modal').style.display = 'none';
    }
});

// Delete event
document.getElementById('delete-event').addEventListener('click', () => {
    const modal = document.getElementById('event-modal');
    const date = modal.dataset.date;
    const dayEvents = JSON.parse(modal.dataset.events || '[]');

    if (dayEvents.length === 1) {
        // Remove the single event
        events = events.filter(event => event.id !== dayEvents[0].id);
    } else {
        // For multiple events, remove the first one (could be improved with selection)
        events = events.filter(event => event.id !== dayEvents[0].id);
    }

    saveEvents();
    renderCalendar();
    modal.style.display = 'none';
});

// Edit event (placeholder)
document.getElementById('edit-event').addEventListener('click', () => {
    alert('Funzionalità di modifica non implementata');
});

// Initialize calendar
renderCalendar();