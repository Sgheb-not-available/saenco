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

// Load documents from localStorage
function loadDocuments() {
    let documents = JSON.parse(localStorage.getItem('saenco-documents') || '[]');

    // Initialize with sample document if empty
    if (documents.length === 0) {
        documents = [{
            id: Date.now(),
            name: 'Documento di esempio.pdf',
            type: 'pdf',
            size: '2.3 MB',
            uploadDate: '2026-04-17',
            file: null // In a real app, this would store the file data
        }];
        saveDocuments(documents);
    }

    const documentsList = document.getElementById('documents-list');
    documentsList.innerHTML = '';

    documents.forEach((doc, index) => {
        const documentItem = document.createElement('div');
        documentItem.className = 'document-item';
        documentItem.style.cssText = 'display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; align-items: center; padding: 0.9rem 0; border-bottom: 1px solid var(--border);';

        const fileIcon = getFileIcon(doc.type);
        const typeBadge = getTypeBadge(doc.type);

        documentItem.innerHTML = `
                    <div class="document-icon" style="width: 32px; height: 32px; background: var(--surface-alt); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 14px;">${fileIcon}</div>
                    <div>
                    <div class="document-name" style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${doc.name}</div>
                    <div class="document-meta" style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Caricato il ${formatDate(doc.uploadDate)} • ${doc.size}</div>
                    </div>
                    <span class="badge ${typeBadge.class}">${typeBadge.label}</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="document-download" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px;" data-index="${index}">↓</button>
                        <button class="document-delete" style="background: none; border: none; color: var(--red); cursor: pointer; font-size: 12px;" data-index="${index}">×</button>
                    </div>
                `;

        documentsList.appendChild(documentItem);
    });

    // Remove border from last item
    const lastItem = documentsList.lastElementChild;
    if (lastItem) lastItem.style.borderBottom = 'none';
}

// Save documents to localStorage
function saveDocuments(documents) {
    localStorage.setItem('saenco-documents', JSON.stringify(documents));
}

// Get file icon based on type
function getFileIcon(type) {
    const icons = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'txt': '📄',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️'
    };
    return icons[type] || '📄';
}

// Get type badge
function getTypeBadge(type) {
    const badges = {
        'pdf': { class: 'badge-red', label: 'PDF' },
        'doc': { class: 'badge-blue', label: 'DOC' },
        'docx': { class: 'badge-blue', label: 'DOCX' },
        'xls': { class: 'badge-green', label: 'XLS' },
        'xlsx': { class: 'badge-green', label: 'XLSX' },
        'txt': { class: 'badge-gray', label: 'TXT' },
        'jpg': { class: 'badge-amber', label: 'JPG' },
        'jpeg': { class: 'badge-amber', label: 'JPEG' },
        'png': { class: 'badge-amber', label: 'PNG' }
    };
    return badges[type] || { class: 'badge-gray', label: type.toUpperCase() };
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

// Handle file upload
document.getElementById('document-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('document-file');
    const file = fileInput.files[0];

    if (!file) return;

    const documents = JSON.parse(localStorage.getItem('saenco-documents') || '[]');

    // Create document object
    const document = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop().toLowerCase(),
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString().split('T')[0],
        file: null // In a real app, you'd store the file data or upload to server
    };

    documents.push(document);
    saveDocuments(documents);

    loadDocuments();

    // Clear form
    fileInput.value = '';
});

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Handle download (placeholder)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('document-download')) {
        const index = e.target.dataset.index;
        const documents = JSON.parse(localStorage.getItem('saenco-documents') || '[]');
        const doc = documents[index];

        // In a real app, you'd download the actual file
        alert(`Download di "${doc.name}" - Funzionalità non implementata nel frontend`);
    }
});

// Handle delete with confirmation
let documentToDelete = null;

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('document-delete')) {
        documentToDelete = e.target.dataset.index;
        showConfirmModal();
    }
});

function showConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'flex';
}

function hideConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    documentToDelete = null;
}

document.getElementById('confirm-cancel').addEventListener('click', hideConfirmModal);

document.getElementById('confirm-delete').addEventListener('click', function() {
    if (documentToDelete !== null) {
        const documents = JSON.parse(localStorage.getItem('saenco-documents') || '[]');
        documents.splice(documentToDelete, 1);
        saveDocuments(documents);
        loadDocuments();
    }
    hideConfirmModal();
});

// Close modal on background click
document.getElementById('confirm-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideConfirmModal();
    }
});

// Initialize
loadDocuments();