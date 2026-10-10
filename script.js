document.addEventListener('DOMContentLoaded', () => {
    const libraryTbody = document.getElementById('library-tbody');
    const manifestTbody = document.getElementById('manifest-tbody');
    const totalWeightEl = document.getElementById('total-weight');
    const searchInput = document.getElementById('search-input');
    const clearManifestBtn = document.getElementById('clear-manifest');

    let libraryParts = [];
    let robotManifest = JSON.parse(localStorage.getItem('ftc_manifest')) || [];

    // Fetch library data from robot-parts/gobilda.json
    fetch('../robot-parts/gobilda.json')
        .then(response => response.json())
        .then(data => {
            libraryParts = data;
            renderLibrary(libraryParts);
            renderManifest();
        })
        .catch(err => {
            console.error('Error loading parts library:', err);
            libraryTbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger-color); text-align:center;">Failed to load part library JSON file.</td></tr>`;
        });

    function renderLibrary(partsToDisplay) {
        libraryTbody.innerHTML = '';
        if (partsToDisplay.length === 0) {
            libraryTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No parts found</td></tr>`;
            return;
        }

        partsToDisplay.forEach((part, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(part.name)}</strong></td>
                <td><span style="color: var(--primary-color);">${escapeHtml(part.type)}</span></td>
                <td>${escapeHtml(part.manufacturer)}</td>
                <td>${parseFloat(part.weight).toFixed(1)} g</td>
                <td><button class="btn-add" onclick="addPartToManifest(${index})">Add</button></td>
            `;
            libraryTbody.appendChild(tr);
        });
    }

    function renderManifest() {
        manifestTbody.innerHTML = '';
        let totalWeight = 0;

        if (robotManifest.length === 0) {
            manifestTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No parts added yet</td></tr>`;
        }

        robotManifest.forEach((item, index) => {
            totalWeight += parseFloat(item.weight);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(item.name)}</td>
                <td>${parseFloat(item.weight).toFixed(1)} g</td>
                <td><button class="btn-remove" onclick="removePartFromManifest(${index})">X</button></td>
            `;
            manifestTbody.appendChild(tr);
        });

        totalWeightEl.textContent = totalWeight.toFixed(1);
        localStorage.setItem('ftc_manifest', JSON.stringify(robotManifest));
    }

    // Global scope helper for adding items from the library table
    window.addPartToManifest = function(libraryIndex) {
        const part = libraryParts[libraryIndex];
        if (part) {
            robotManifest.push({
                name: part.name,
                weight: part.weight,
                type: part.type
            });
            renderManifest();
        }
    };

    // Global scope helper for removing items from the robot build
    window.removePartFromManifest = function(manifestIndex) {
        robotManifest.splice(manifestIndex, 1);
        renderManifest();
    };

    clearManifestBtn.addEventListener('click', () => {
        robotManifest = [];
        renderManifest();
    });

    // Real-time search/filter handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = libraryParts.filter(part => 
            part.name.toLowerCase().includes(query) || 
            part.type.toLowerCase().includes(query) ||
            part.manufacturer.toLowerCase().includes(query)
        );
        renderLibrary(filtered);
    });

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
});
