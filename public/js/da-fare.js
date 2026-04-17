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

// Load todos from localStorage
function loadTodos() {
    let todos = JSON.parse(localStorage.getItem('saenco-todos') || '[]');

    // Initialize with sample data if empty
    if (todos.length === 0) {
        todos = [
            { date: '2026-04-20', description: 'Completare report mensile', priority: 'alta' },
            { date: '2026-04-25', description: 'Revisione contratto cliente', priority: 'media' },
            { date: '2026-05-01', description: 'Aggiornamento software', priority: 'bassa' }
        ];
        saveTodos(todos);
    }

    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.style.cssText = 'display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; align-items: center; padding: 0.9rem 0; border-bottom: 1px solid var(--border);';

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
                    <div class="todo-date" style="width: 80px; font-family: var(--mono); font-size: 11px; color: var(--text-muted);">${todo.date}</div>
                    <div>
                    <div class="todo-description" style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${todo.description}</div>
                    </div>
                    <span class="badge ${priorityClass}">${priorityLabel}</span>
                    <button class="todo-delete" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 12px;" data-index="${index}">×</button>
                `;

        todoList.appendChild(todoItem);
    });

    // Remove border from last item
    const lastItem = todoList.lastElementChild;
    if (lastItem) lastItem.style.borderBottom = 'none';
}

// Save todos to localStorage
function saveTodos(todos) {
    localStorage.setItem('saenco-todos', JSON.stringify(todos));
}

// Handle form submission
document.getElementById('todo-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('todo-date').value;
    const description = document.getElementById('todo-description').value;
    const priority = document.getElementById('todo-priority').value;

    if (!date || !description) return;

    const todos = JSON.parse(localStorage.getItem('saenco-todos') || '[]');
    todos.push({ date, description, priority });
    saveTodos(todos);

    loadTodos();

    // Clear form
    document.getElementById('todo-date').value = '';
    document.getElementById('todo-description').value = '';
    document.getElementById('todo-priority').value = 'media';
});

// Handle delete
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('todo-delete')) {
        const index = e.target.dataset.index;
        const todos = JSON.parse(localStorage.getItem('saenco-todos') || '[]');
        todos.splice(index, 1);
        saveTodos(todos);
        loadTodos();
    }
});

// Initialize
loadTodos();