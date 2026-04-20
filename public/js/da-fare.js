function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
}

function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
tick();
setInterval(tick, 1000);
document.getElementById('year').textContent = new Date().getFullYear();

// Carica todos dal backend
async function loadTodos() {
    const todos = await fetch('/api/todos').then(r => r.json());

    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    todos.forEach((todo) => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 0.9rem 0; border-bottom: 1px solid var(--border);';

        const priorityClass = {
            'bassa': 'badge-green',
            'media': 'badge-blue',
            'alta': 'badge-amber',
            'urgente': 'badge-red'
        }[todo.priority] || 'badge-blue';

        const priorityLabel = {
            'bassa': 'Bassa',
            'media': 'Media',
            'alta': 'Alta',
            'urgente': 'Urgente'
        }[todo.priority];

        todoItem.innerHTML = `
            <div style="width: 90px; flex-shrink: 0; font-family: var(--mono); font-size: 11px; color: var(--text-muted);">${formatDate(todo.date)}</div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${todo.description}</div>
            </div>
            <span class="badge ${priorityClass}">${priorityLabel}</span>
            <button class="todo-delete" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 12px;" data-id="${todo.id}">×</button>
        `;

        todoList.appendChild(todoItem);
    });

    const lastItem = todoList.lastElementChild;
    if (lastItem) lastItem.style.borderBottom = 'none';

    // Elimina todo
    document.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            await fetch(`/api/todos/${btn.dataset.id}`, { method: 'DELETE' });
            loadTodos();
        });
    });
}

// Aggiungi todo
document.getElementById('todo-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const date = document.getElementById('todo-date').value;
    const description = document.getElementById('todo-description').value;
    const priority = document.getElementById('todo-priority').value;

    if (!date || !description) return;

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, description, priority })
    });

    this.reset();
    loadTodos();
});

loadTodos();