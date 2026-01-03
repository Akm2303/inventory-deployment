// API Base URL (gunakan Cloudflare Workers URL setelah deployment)
const API_BASE_URL = 'https://your-worker.your-account.workers.dev/api';

// In-memory database (akan digantikan dengan Cloudflare KV saat deployment)
let inventoryDB = [
    {
        id: 1,
        nama: "3-ADAPTOR LAMPU MICROSCOPE",
        kodeMaterial: "#N/A",
        kategori: "INVENTARIS",
        satuan: "#N/A",
        unitKecil: 0,
        unitBesar: 0,
        total: 0,
        usageDays: Array(17).fill(false)
    },
    {
        id: 2,
        nama: "3-ASAHAN HALUS",
        kodeMaterial: "604067/INVENTARIS",
        kategori: "INVENTARIS",
        satuan: "PC",
        unitKecil: 0,
        unitBesar: 43,
        total: 43,
        usageDays: Array(17).fill(false)
    },
    // Add more initial data as needed
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    generateUsageDaysCheckboxes();
    loadData();
});

// Generate checkboxes for usage days
function generateUsageDaysCheckboxes() {
    const container = document.getElementById('usageDays');
    container.innerHTML = '';
    
    for (let i = 1; i <= 17; i++) {
        const col = document.createElement('div');
        col.className = 'col-auto';
        
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="day${i}" value="${i}">
                <label class="form-check-label" for="day${i}">${i}</label>
            </div>
        `;
        container.appendChild(col);
    }
}

// Load data from database
function loadData() {
    // In production, fetch from API
    // fetch(`${API_BASE_URL}/items`)
    //     .then(response => response.json())
    //     .then(data => {
    //         inventoryDB = data;
    //         renderTable();
    //         updateStats();
    //     });
    
    renderTable();
    updateStats();
}

// Render table with data
function renderTable(data = inventoryDB) {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    
    data.forEach((item, index) => {
        const usageDisplay = item.usageDays.map((used, idx) => 
            `<span class="usage-day ${used ? 'used' : 'inactive'}">${idx + 1}</span>`
        ).join('');
        
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama}</strong></td>
                <td>${item.kodeMaterial}</td>
                <td><span class="badge bg-primary">${item.kategori}</span></td>
                <td>${item.satuan}</td>
                <td>${item.unitKecil}</td>
                <td>${item.unitBesar}</td>
                <td><span class="badge bg-success">${item.total}</span></td>
                <td>${usageDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-action" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-info btn-action" onclick="viewDetails(${item.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Update statistics
function updateStats() {
    const totalItems = inventoryDB.length;
    const totalUnits = inventoryDB.reduce((sum, item) => sum + item.total, 0);
    const categories = [...new Set(inventoryDB.map(item => item.kategori))];
    const activeUsage = inventoryDB.reduce((sum, item) => 
        sum + item.usageDays.filter(day => day).length, 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalUnits').textContent = totalUnits;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('activeUsage').textContent = activeUsage;
}

// Add new item
function addItem() {
    document.getElementById('modalTitle').textContent = 'Tambah Item Baru';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    
    // Uncheck all usage days
    for (let i = 1; i <= 17; i++) {
        document.getElementById(`day${i}`).checked = false;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();
}

// Edit existing item
function editItem(id) {
    const item = inventoryDB.find(item => item.id === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('nama').value = item.nama;
    document.getElementById('kodeMaterial').value = item.kodeMaterial;
    document.getElementById('kategori').value = item.kategori;
    document.getElementById('satuan').value = item.satuan;
    document.getElementById('unitKecil').value = item.unitKecil;
    document.getElementById('unitBesar').value = item.unitBesar;
    document.getElementById('itemId').value = item.id;
    
    // Set usage days checkboxes
    item.usageDays.forEach((used, index) => {
        document.getElementById(`day${index + 1}`).checked = used;
    });
    
    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();
}

// Save item (create or update)
function saveItem() {
    const id = document.getElementById('itemId').value;
    const nama = document.getElementById('nama').value;
    const kodeMaterial = document.getElementById('kodeMaterial').value;
    const kategori = document.getElementById('kategori').value;
    const satuan = document.getElementById('satuan').value;
    const unitKecil = parseInt(document.getElementById('unitKecil').value) || 0;
    const unitBesar = parseInt(document.getElementById('unitBesar').value) || 0;
    
    // Get usage days
    const usageDays = [];
    for (let i = 1; i <= 17; i++) {
        usageDays.push(document.getElementById(`day${i}`).checked);
    }
    
    const newItem = {
        id: id ? parseInt(id) : Date.now(),
        nama,
        kodeMaterial: kodeMaterial || "#N/A",
        kategori,
        satuan: satuan || "#N/A",
        unitKecil,
        unitBesar,
        total: unitKecil + unitBesar,
        usageDays
    };
    
    if (id) {
        // Update existing item
        const index = inventoryDB.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            inventoryDB[index] = newItem;
        }
    } else {
        // Add new item
        inventoryDB.push(newItem);
    }
    
    // In production, send to API
    // const method = id ? 'PUT' : 'POST';
    // fetch(`${API_BASE_URL}/items${id ? '/' + id : ''}`, {
    //     method: method,
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newItem)
    // }).then(() => {
    //     loadData();
    // });
    
    loadData();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
    modal.hide();
    
    alert('Data berhasil disimpan!');
}

// Delete item
function deleteItem(id) {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
        const index = inventoryDB.findIndex(item => item.id === id);
        if (index !== -1) {
            inventoryDB.splice(index, 1);
        }
        
        // In production, send DELETE request
        // fetch(`${API_BASE_URL}/items/${id}`, {
        //     method: 'DELETE'
        // }).then(() => {
        //     loadData();
        // });
        
        loadData();
        alert('Item berhasil dihapus!');
    }
}

// View item details
function viewDetails(id) {
    const item = inventoryDB.find(item => item.id === id);
    if (item) {
        let usageText = 'Penggunaan: ';
        const usedDays = item.usageDays
            .map((used, idx) => used ? idx + 1 : null)
            .filter(day => day !== null);
        
        usageText += usedDays.length > 0 ? usedDays.join(', ') : 'Tidak ada';
        
        const details = `
Nama: ${item.nama}
Kode: ${item.kodeMaterial}
Kategori: ${item.kategori}
Satuan: ${item.satuan}
Unit Kecil: ${item.unitKecil}
Unit Besar: ${item.unitBesar}
Total: ${item.total}
${usageText}
        `;
        
        alert(details);
    }
}

// Search items
function searchItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = inventoryDB.filter(item =>
        item.nama.toLowerCase().includes(searchTerm) ||
        item.kodeMaterial.toLowerCase().includes(searchTerm) ||
        item.kategori.toLowerCase().includes(searchTerm)
    );
    renderTable(filtered);
}

// Refresh data
function refreshData() {
    loadData();
    document.getElementById('searchInput').value = '';
}

// Export data to CSV
function exportToCSV() {
    const headers = ['NO', 'NAMA', 'KODE MATERIAL', 'KATEGORI', 'SATUAN', 'UNIT KECIL', 'UNIT BESAR', 'TOTAL'];
    const rows = inventoryDB.map((item, index) => [
        index + 1,
        item.nama,
        item.kodeMaterial,
        item.kategori,
        item.satuan,
        item.unitKecil,
        item.unitBesar,
        item.total
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventaris_lab.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}