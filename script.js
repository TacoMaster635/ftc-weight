document.addEventListener('DOMContentLoaded', () => {
    const libraryTbody = document.getElementById('library-tbody');
    const manifestTbody = document.getElementById('manifest-tbody');
    const totalWeightEl = document.getElementById('total-weight');
    const totalWeightLbsEl = document.getElementById('total-weight-lbs');
    const searchInput = document.getElementById('search-input');
    const clearManifestBtn = document.getElementById('clear-manifest');

    let robotManifest = [];
    let currentManufacturerFilter = 'all';

    renderLibrary(libraryParts);
    renderManifest();

    // Filter button click logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentManufacturerFilter = e.target.getAttribute('data-filter');
            applyFilters();
        });
    });

    function renderLibrary(partsToDisplay) {
        libraryTbody.innerHTML = '';
        if (partsToDisplay.length === 0) {
            libraryTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No parts found</td></tr>`;
            return;
        }

        partsToDisplay.forEach((part) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(part.name)}</strong></td>
                <td><span style="color: var(--primary-color);">${escapeHtml(part.type)}</span></td>
                <td>${escapeHtml(part.manufacturer)}</td>
                <td>${parseFloat(part.weight).toFixed(1)} g</td>
                <td><button class="btn-add" onclick="window.addPartToManifest('${escapeHtml(part.name)}', ${part.weight})">Add</button></td>
            `;
            libraryTbody.appendChild(tr);
        });
    }

    function renderManifest() {
        manifestTbody.innerHTML = '';
        let totalWeightGrams = 0;

        if (robotManifest.length === 0) {
            manifestTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">No parts added yet</td></tr>`;
        }

        robotManifest.forEach((item, index) => {
            const itemTotalWeight = item.weight * item.quantity;
            totalWeightGrams += itemTotalWeight;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(item.name)}</td>
                <td>
                    <button class="btn-qty" onclick="window.decreaseQuantity(${index})">-</button>
                    <span style="margin: 0 6px; font-weight: bold;">${item.quantity}</span>
                    <button class="btn-qty" onclick="window.increaseQuantity(${index})">+</button>
                </td>
                <td>${itemTotalWeight.toFixed(1)} g</td>
                <td><button class="btn-remove" onclick="window.removePartFromManifest(${index})">Remove</button></td>
            `;
            manifestTbody.appendChild(tr);
        });

        // Convert grams to pounds (1 lb = 453.592 grams)
        const totalWeightPounds = totalWeightGrams / 453.592;

        totalWeightEl.textContent = totalWeightGrams.toFixed(1);
        if (totalWeightLbsEl) {
            totalWeightLbsEl.textContent = `${totalWeightPounds.toFixed(2)} lbs`;
        }
    }

    window.addPartToManifest = function(name, weight) {
        const existingItem = robotManifest.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            robotManifest.push({ name, weight, quantity: 1 });
        }
        renderManifest();
    };

    window.increaseQuantity = function(index) {
        robotManifest[index].quantity += 1;
        renderManifest();
    };

    window.decreaseQuantity = function(index) {
        if (robotManifest[index].quantity > 1) {
            robotManifest[index].quantity -= 1;
        } else {
            robotManifest.splice(index, 1);
        }
        renderManifest();
    };

    window.removePartFromManifest = function(manifestIndex) {
        robotManifest.splice(manifestIndex, 1);
        renderManifest();
    };

    clearManifestBtn.addEventListener('click', () => {
        robotManifest = [];
        renderManifest();
    });

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        
        const filtered = libraryParts.filter(part => {
            const matchesSearch = part.name.toLowerCase().includes(query) || 
                                  part.type.toLowerCase().includes(query) ||
                                  part.manufacturer.toLowerCase().includes(query);
                                  
            const matchesManufacturer = currentManufacturerFilter === 'all' || 
                                       part.manufacturer.toLowerCase().includes(currentManufacturerFilter);
                                       
            return matchesSearch && matchesManufacturer;
        });
        
        renderLibrary(filtered);
    }

    searchInput.addEventListener('input', applyFilters);

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
});
