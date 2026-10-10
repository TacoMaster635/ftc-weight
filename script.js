document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('part-form');
    const partsTbody = document.getElementById('parts-tbody');
    const totalWeightEl = document.getElementById('total-weight');

    let parts = JSON.parse(localStorage.getItem('ftc_parts')) || [];

    function renderParts() {
        partsTbody.innerHTML = '';
        let totalWeight = 0;

        parts.forEach((part, index) => {
            totalWeight += parseFloat(part.weight);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(part.name)}</td>
                <td>${escapeHtml(part.category)}</td>
                <td>${escapeHtml(part.manufacturer)}</td>
                <td>${parseFloat(part.weight).toFixed(1)} g</td>
                <td><button class="btn-delete" onclick="deletePart(${index})">Remove</button></td>
            `;
            partsTbody.appendChild(tr);
        });

        totalWeightEl.textContent = totalWeight.toFixed(1);
        localStorage.setItem('ftc_parts', JSON.stringify(parts));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('part-name').value;
        const weight = document.getElementById('part-weight').value;
        const category = document.getElementById('part-category').value;
        const manufacturer = document.getElementById('part-manufacturer').value;

        parts.push({ name, weight, category, manufacturer });
        form.reset();
        renderParts();
    });

    window.deletePart = function(index) {
        parts.splice(index, 1);
        renderParts();
    };

    // Automatically load default goBilda parts if local storage is empty
    if (parts.length === 0) {
        fetch('../robot-parts/gobilda.json')
            .then(response => response.json())
            .then(data => {
                parts = data.map(item => ({
                    name: item.name,
                    weight: item.weight,
                    category: item.type === 'Motor' || item.type === 'Drivetrain' ? 'Drivetrain' : 'Other',
                    manufacturer: item.manufacturer
                }));
                renderParts();
            })
            .catch(err => console.log('Could not load goBilda default parts file:', err));
    } else {
        renderParts();
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
});
