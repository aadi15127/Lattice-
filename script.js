const canvas = document.getElementById('grid-canvas');
const codeContainer = document.getElementById('code-container');
const gapLabel = document.getElementById('gap-label');
const historyList = document.getElementById('history-list');
const historyPanel = document.getElementById('history-panel');

const controls = {
    cols: document.getElementById('cols'),
    rows: document.getElementById('rows'),
    gap: document.getElementById('gap'),
    justify: document.getElementById('justify')
};

const gradients = [
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)'
];

let itemStates = {};

function updateUI() {
    const c = controls.cols.value;
    const r = controls.rows.value;
    const g = controls.gap.value + 'px';
    const j = controls.justify.value;

    canvas.style.setProperty('--cols', c);
    canvas.style.setProperty('--rows', r);
    canvas.style.setProperty('--gap', g);
    canvas.style.setProperty('--justify', j);
    canvas.style.setProperty('--align', j);

    gapLabel.innerText = g;
    canvas.innerHTML = '';

    for (let i = 1; i <= (c * r); i++) {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.style.background = gradients[i % gradients.length];

        if(itemStates[i]) {
            div.classList.add('expanded');
            div.style.gridColumn = `span ${itemStates[i].colSpan}`;
            div.style.gridRow = `span ${itemStates[i].rowSpan}`;
        }

        div.innerHTML = `<span>${i}</span>`;
        div.onclick = () => {
            if(!itemStates[i]) itemStates[i] = { colSpan: 2, rowSpan: 1 };
            else if (itemStates[i].colSpan === 2) itemStates[i] = { colSpan: 1, rowSpan: 2 };
            else delete itemStates[i];
            updateUI();
        };
        canvas.appendChild(div);
    }
    generateCode(c, r, g, j);
}

function generateCode(c, r, g, j) {
    let itemCss = "";
    Object.keys(itemStates).forEach(id => {
        itemCss += `\n.item-${id} {\n  grid-column: span ${itemStates[id].colSpan};\n  grid-row: span ${itemStates[id].rowSpan};\n}`;
    });

    codeContainer.innerHTML = `<span class="code-keyword">.container</span> {
  <span class="code-prop">display</span>: grid;
  <span class="code-prop">grid-template-columns</span>: <span class="code-val">repeat(${c}, 1fr)</span>;
  <span class="code-prop">grid-template-rows</span>: <span class="code-val">repeat(${r}, 1fr)</span>;
  <span class="code-prop">gap</span>: <span class="code-val">${g}</span>;
  <span class="code-prop">place-items</span>: <span class="code-val">${j}</span>;
}${itemCss}`;
}

// Event Listeners
document.getElementById('copy-btn').onclick = function() {
    navigator.clipboard.writeText(codeContainer.textContent).then(() => {
        this.innerText = "COPIED!";
        setTimeout(() => this.innerText = "COPY CSS", 1500);
    });
};

document.getElementById('download-btn').onclick = function() {
    const text = codeContainer.textContent;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/css;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'lattice-style.css');
    element.click();
};

document.getElementById('mail-btn').onclick = function() {
    const email = document.getElementById('email-address').value.trim();
    if(!email) return alert("Enter an email.");
    
    this.innerText = "SENDING...";
    emailjs.send('service_z3m9wjn', 'template_mfb3n9c', { to_email: email, css_code: codeContainer.textContent })
        .then(() => {
            this.innerText = "SENT!";
            setTimeout(() => this.innerText = "EMAIL", 2000);
        });
};

function saveLayout() {
    const layout = {
        cols: controls.cols.value,
        rows: controls.rows.value,
        gap: controls.gap.value,
        justify: controls.justify.value,
        items: JSON.parse(JSON.stringify(itemStates)),
        time: new Date().toLocaleTimeString()
    };
    let history = JSON.parse(localStorage.getItem('lattice_history') || '[]');
    history.unshift(layout);
    localStorage.setItem('lattice_history', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('lattice_history') || '[]');
    historyList.innerHTML = history.map(h => `
        <div class="history-item" onclick="loadHistoryItem(${history.indexOf(h)})">
            <strong>${h.time}</strong> — ${h.cols}x${h.rows} Grid
        </div>
    `).join('');
}

window.loadHistoryItem = (idx) => {
    const h = JSON.parse(localStorage.getItem('lattice_history'))[idx];
    controls.cols.value = h.cols;
    controls.rows.value = h.rows;
    controls.gap.value = h.gap;
    controls.justify.value = h.justify;
    itemStates = h.items;
    updateUI();
};

document.getElementById('save-btn').onclick = saveLayout;
document.getElementById('history-toggle').onclick = () => {
    historyPanel.style.display = historyPanel.style.display === 'block' ? 'none' : 'block';
    renderHistory();
};

Object.values(controls).forEach(el => el.addEventListener('input', updateUI));
updateUI();