function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
tick();
setInterval(tick, 1000);
document.getElementById('year').textContent = new Date().getFullYear();

let currentDate = new Date();
let events = [];

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return new Date(year, month - 1, day);
}

async function loadEvents() {
    events = await fetch('/api/events').then(r => r.json());
    renderCalendar();
    renderEventList();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    calendarGrid.innerHTML = '';

    const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
        'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
    currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const dayNames = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = 'text-align: center; padding: 0.5rem; font-family: var(--mono); font-size: 11px; color: var(--text-muted); font-weight: 500;';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const today = new Date();
    let d = new Date(firstDay);
    d.setDate(d.getDate() - firstDay.getDay());

    while (d <= lastDay || calendarGrid.children.length % 7 !== 0) {
        const dayCell = document.createElement('div');
        const isCurrentMonth = d.getMonth() === currentDate.getMonth();
        const isToday = d.toDateString() === today.toDateString();
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        const dayEvents = events.filter(e => e.date.split('T')[0] === dateStr);
        const hasEvent = dayEvents.length > 0;

        dayCell.style.cssText = `
            text-align: center; padding: 0.5rem; border-radius: var(--radius); cursor: pointer;
            font-size: 13px; position: relative;
            color: ${isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)'};
            background: ${isToday ? 'var(--accent)' : 'transparent'};
            font-weight: ${isToday ? '600' : '400'};
        `;
        dayCell.textContent = d.getDate();

        if (hasEvent) {
            const dot = document.createElement('div');
            dot.style.cssText = 'width: 4px; height: 4px; background: var(--accent); border-radius: 50%; margin: 2px auto 0;';
            dayCell.appendChild(dot);
        }

        dayCell.addEventListener('click', () => {
            const formDate = document.getElementById('event-date');
            if (formDate) formDate.value = dateStr;

            document.getElementById('day-popup')?.remove();

            if (dayEvents.length > 0) {
                const popup = document.createElement('div');
                popup.id = 'day-popup';
                popup.style.cssText = `
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: var(--surface); border: 1px solid var(--border);
                    border-radius: var(--radius); padding: 1.5rem; z-index: 1000;
                    min-width: 300px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                `;

                popup.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <div style="font-family:var(--mono); font-size:12px; color:var(--text-muted);">${dateStr}</div>
                        <button id="close-popup" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;">×</button>
                    </div>
                    ${dayEvents.map(e => `
                        <div style="display:flex; justify-content:space-between; align-items:start; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
                            <div>
                                <div style="font-size:14px; font-weight:600; color:var(--text-primary);">${e.title}</div>
                                <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${e.description || ''}</div>
                            </div>
                            <button class="delete-event-btn" data-id="${e.id}" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;flex-shrink:0;margin-left:12px;">×</button>
                        </div>
                    `).join('')}
                    <div style="margin-top:1rem;">
                        <button id="add-to-day" style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer;">+ Aggiungi evento in questo giorno</button>
                    </div>
                `;

                document.body.appendChild(popup);

                // Delete dal popup
                popup.querySelectorAll('.delete-event-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        await fetch(`/api/events/${btn.dataset.id}`, { method: 'DELETE' });
                        popup.remove();
                        loadEvents();
                    });
                });
                document.getElementById('close-popup').addEventListener('click', () => popup.remove());
                document.getElementById('add-to-day').addEventListener('click', () => {
                    popup.remove();
                    document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById('event-title')?.focus();
                });

                setTimeout(() => {
                    document.addEventListener('click', function handler(ev) {
                        if (!popup.contains(ev.target)) {
                            popup.remove();
                            document.removeEventListener('click', handler);
                        }
                    });
                }, 100);

            } else {
                document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('event-title')?.focus();
            }
        });

        calendarGrid.appendChild(dayCell);
        d.setDate(d.getDate() + 1);
    }
}

function renderEventList() {
    const eventList = document.getElementById('event-list');
    if (!eventList) return;
    eventList.innerHTML = '';

    const today = new Date();
    const upcoming = events
        .filter(e => parseDate(e.date) >= today)
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    if (upcoming.length === 0) {
        eventList.innerHTML = '<div style="color: var(--text-muted); font-size: 13px;">Nessun evento in programma</div>';
        return;
    }

    upcoming.forEach(event => {
        const d = parseDate(event.date);
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 0.9rem 0; border-bottom: 1px solid var(--border);';
        item.innerHTML = `
            <div style="width: 44px; flex-shrink: 0; background: var(--surface-alt); border-radius: var(--radius); text-align: center; padding: 4px;">
                <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${d.getDate()}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${d.toLocaleDateString('it-IT', { month: 'short' })}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${event.title}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${event.description || ''}</div>
            </div>
            <button style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 12px;" data-id="${event.id}">×</button>
        `;
        item.querySelector('button').addEventListener('click', async () => {
            await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
            loadEvents();
        });
        eventList.appendChild(item);
    });
}

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('event-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const date = document.getElementById('event-date').value;
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;

    if (!date || !title) return;

    await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title, description })
    });

    this.reset();
    loadEvents();
});

loadEvents();