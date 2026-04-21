function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
tick();
setInterval(tick, 1000);
document.getElementById('year').textContent = new Date().getFullYear();

function getFileIcon(type) {
    const icons = { 'pdf': '📄', 'doc': '📝', 'docx': '📝', 'xls': '📊', 'xlsx': '📊', 'jpg': '🖼', 'jpeg': '🖼', 'png': '🖼' };
    return icons[type] || '📎';
}

function getTypeBadge(type) {
    const badges = {
        'pdf':  { class: 'badge-red',   label: 'PDF' },
        'doc':  { class: 'badge-blue',  label: 'DOC' },
        'docx': { class: 'badge-blue',  label: 'DOCX' },
        'xls':  { class: 'badge-green', label: 'XLS' },
        'xlsx': { class: 'badge-green', label: 'XLSX' },
        'jpg':  { class: 'badge-amber', label: 'JPG' },
        'jpeg': { class: 'badge-amber', label: 'JPEG' },
        'png':  { class: 'badge-amber', label: 'PNG' },
    };
    return badges[type] || { class: 'badge-blue', label: type?.toUpperCase() || 'FILE' };
}

async function loadDocuments() {
    const documents = await fetch('/api/documents').then(r => r.json());

    const documentsList = document.getElementById('documents-list');
    documentsList.innerHTML = '';

    if (documents.length === 0) {
        documentsList.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; padding: 1rem 0;">Nessun documento caricato</div>';
        return;
    }

    documents.forEach((doc) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 0.9rem 0; border-bottom: 1px solid var(--border);';

        const icon = getFileIcon(doc.type);
        const badge = getTypeBadge(doc.type);

        item.innerHTML = `
            <div style="width: 32px; height: 32px; background: var(--surface-alt); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 14px;">${icon}</div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${doc.name}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${doc.upload_date} · ${doc.size}</div>
            </div>
            <span class="badge ${badge.class}">${badge.label}</span>
            <a href="/uploads/${doc.filename}" download="${doc.name}" style="color: var(--accent); font-size: 12px; text-decoration: none;">↓</a>
            <button data-id="${doc.id}" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 12px;">×</button>
        `;

        item.querySelector('button').addEventListener('click', async () => {
            await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
            loadDocuments();
        });

        documentsList.appendChild(item);
    });

    const last = documentsList.lastElementChild;
    if (last) last.style.borderBottom = 'none';
}

// Upload form
document.getElementById('document-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('document-file');
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Caricamento...';
    btn.disabled = true;

    await fetch('/api/documents', {
        method: 'POST',
        body: formData
    });

    this.reset();
    btn.textContent = 'Carica';
    btn.disabled = false;
    loadDocuments();
});

loadDocuments();