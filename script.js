document.addEventListener('DOMContentLoaded', () => {
    const libraryTbody = document.getElementById('library-tbody');
    const manifestTbody = document.getElementById('manifest-tbody');
    const totalWeightEl = document.getElementById('total-weight');
    const totalWeightLbsEl = document.getElementById('total-weight-lbs');
    const searchInput = document.getElementById('search-input');
    const clearManifestBtn = document.getElementById('clear-manifest');

    const goBILDAParts = [
        { name: "goBILDA 5203 Series Yellow Jacket Motor", weight: 215.5, type: "Motor", manufacturer: "goBILDA" },
        { name: "goBILDA 96mm Mecanum Wheel Set", weight: 440.0, type: "Drivetrain", manufacturer: "goBILDA" },
        { name: "goBILDA Turret Bearing Assembly", weight: 180.0, type: "Turret", manufacturer: "goBILDA" },
        { name: "goBILDA Dual High-Speed Launcher Flywheel", weight: 320.5, type: "Launcher", manufacturer: "goBILDA" },
    ];
    const REVParts = [
        { name: "REV Control Hub", weight: 142.0, type: "Electronics", manufacturer: "REV Robotics" }
    ];

    const libraryParts = [...goBILDAParts, ...REVParts];

    let robotManifest = [];

    renderLibrary(libraryParts);
    renderManifest();

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
