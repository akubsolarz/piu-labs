document.addEventListener('DOMContentLoaded', () => {
    const KEY = 'kanban_ks';
    const COLS = ['todo', 'inprogress', 'done'];

    let state = {
        lastId: 0,
        columns: {
            todo: [],
            inprogress: [],
            done: [],
        },
    };

    const tablica = document.getElementById('tablica');

    // kolory

    const randColor = () => {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.floor(Math.random() * 20);
        return `hsl(${h}deg ${s}% 80%)`;
    };

    const save = () => localStorage.setItem(KEY, JSON.stringify(state));

    const load = () => {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            if (data && data.columns) state = data;
        } catch (e) {
            console.warn('localStorage parse error', e);
        }
    };

    const findCard = (id) => {
        for (const col of COLS) {
            const idx = state.columns[col].findIndex((c) => c.id === id);
            if (idx !== -1) return { col, idx, card: state.columns[col][idx] };
        }
        return null;
    };

    const refreshUI = () => {
        COLS.forEach((colKey, colIndex) => {
            const colEl = document.querySelector(
                `.column[data-column="${colKey}"]`
            );
            const cards = colEl.querySelectorAll('.card');
            colEl.querySelector('.column-counter').textContent = cards.length;

            cards.forEach((card) => {
                const left = card.querySelector('.move-left');
                const right = card.querySelector('.move-right');
                if (left) left.disabled = colIndex === 0;
                if (right) right.disabled = colIndex === COLS.length - 1;
            });
        });
    };

    //boxy
    function createCardEl(card, colKey, focus = false) {
        const colEl = document.querySelector(
            `.column[data-column="${colKey}"] .cards`
        );

        const cardEl = document.createElement('article');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        cardEl.style.backgroundColor = card.color;

        cardEl.innerHTML = `
            <div class="card-header">
                <div class="card-actions-left">
                    <button class="card-btn move-left">←</button>
                    <button class="card-btn move-right">→</button>
                </div>
                <div class="card-actions-right">
                    <button class="card-btn color-card">kolor</button>
                    <button class="card-btn card-delete delete-card">✕</button>
                </div>
            </div>
            <div class="card-content" contenteditable="true"></div>
        `;

        const content = cardEl.querySelector('.card-content');
        content.textContent = card.text || 'Nowa karta';

        content.addEventListener('input', () => {
            const id = Number(cardEl.dataset.id);
            const found = findCard(id);
            if (found) {
                found.card.text = content.textContent.trim();
                save();
            }
        });

        colEl.appendChild(cardEl);
        if (focus) content.focus();
        return cardEl;
    }

    const render = () => {
        COLS.forEach((col) => {
            const cont = document.querySelector(
                `.column[data-column="${col}"] .cards`
            );
            cont.innerHTML = '';
            state.columns[col].forEach((card) =>
                createCardEl(card, col, false)
            );
        });
        refreshUI();
    };

    //dodanie karty

    const addCard = (col) => {
        const id = ++state.lastId;
        const card = { id, text: 'Nowa karta', color: randColor() };
        state.columns[col].push(card);
        createCardEl(card, col, true);
        save();
        refreshUI();
    };

    //usunięcie karty

    const deleteCard = (cardEl) => {
        const id = Number(cardEl.dataset.id);
        const found = findCard(id);
        if (!found) return;
        state.columns[found.col].splice(found.idx, 1);
        cardEl.remove();
        save();
        refreshUI();
    };

    const recolorCard = (cardEl) => {
        const id = Number(cardEl.dataset.id);
        const found = findCard(id);
        if (!found) return;
        const c = randColor();
        found.card.color = c;
        cardEl.style.backgroundColor = c;
        save();
    };

    const recolorColumn = (col) => {
        const colEl = document.querySelector(`.column[data-column="${col}"]`);
        const cards = colEl.querySelectorAll('.card');
        const data = state.columns[col];

        cards.forEach((cardEl) => {
            const id = Number(cardEl.dataset.id);
            const idx = data.findIndex((c) => c.id === id);
            if (idx === -1) return;
            const c = randColor();
            data[idx].color = c;
            cardEl.style.backgroundColor = c;
        });
        save();
    };

    const moveCard = (cardEl, dir) => {
        const id = Number(cardEl.dataset.id);
        const found = findCard(id);
        if (!found) return;

        const fromIndex = COLS.indexOf(found.col);
        const toIndex = fromIndex + dir;
        if (toIndex < 0 || toIndex >= COLS.length) return;

        const toCol = COLS[toIndex];
        state.columns[found.col].splice(found.idx, 1);
        state.columns[toCol].push(found.card);

        const targetContainer = document.querySelector(
            `.column[data-column="${toCol}"] .cards`
        );
        targetContainer.appendChild(cardEl);

        save();
        refreshUI();
    };

    const sortColumn = (col) => {
        const cont = document.querySelector(
            `.column[data-column="${col}"] .cards`
        );
        const cards = Array.from(cont.querySelectorAll('.card'));

        cards.sort((a, b) => {
            const ta = a
                .querySelector('.card-content')
                .textContent.trim()
                .toLowerCase();
            const tb = b
                .querySelector('.card-content')
                .textContent.trim()
                .toLowerCase();
            return ta.localeCompare(tb);
        });

        cards.forEach((c) => cont.appendChild(c));

        const sorted = [];
        const data = state.columns[col];
        cards.forEach((cardEl) => {
            const id = Number(cardEl.dataset.id);
            const obj = data.find((c) => c.id === id);
            if (obj) sorted.push(obj);
        });
        state.columns[col] = sorted;
        save();
    };

    // --- events (delegacja) ---

    tablica.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const columnEl = e.target.closest('.column');
        const colKey = columnEl?.dataset.column;

        // przyciski kolumny
        if (btn.classList.contains('add-card')) return addCard(colKey);
        if (btn.classList.contains('color-column'))
            return recolorColumn(colKey);
        if (btn.classList.contains('sort-column')) return sortColumn(colKey);

        // przyciski na kartach
        const cardEl = btn.closest('.card');
        if (!cardEl) return;

        if (btn.classList.contains('delete-card')) return deleteCard(cardEl);
        if (btn.classList.contains('color-card')) return recolorCard(cardEl);
        if (btn.classList.contains('move-left')) return moveCard(cardEl, -1);
        if (btn.classList.contains('move-right')) return moveCard(cardEl, 1);
    });

    // --- init ---

    load();
    render();
});
