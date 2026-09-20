const SETS = [
    { title: 'Riddim Set 09/15/2026', url: 'https://cdn.exil.dev/f/11b615c4_RiddimSet.wav', cover: 'https://cdn.exil.dev/f/9420faa8_Manic_Monday_9-14-2026.png' },
    { title: 'Tekk Tuesday Vol. 1', url: 'https://cdn.exil.dev/f/6727fc0f_TekkSet.wav', cover: 'https://cdn.exil.dev/f/74e40f6c_TekkTuesdayPoster.png' },
    {title: 'OCTAGON "Scheppert" Hardtekk Event 09/19/2026', url: 'https://cdn.exil.dev/f/e77dfc3d_OCTAGONScheppertSet.wav', cover: 'https://cdn.exil.dev/f/1824f380_2026-09-19_OCTAGON_Rave_Poster.png' }
];

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function downloadName(url, title) {
    const extMatch = url.match(/\.([a-z0-9]{2,4})(?:[?#]|$)/i);
    const base = (title || 'set').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return base + (extMatch ? '.' + extMatch[1].toLowerCase() : '');
}

async function downloadSet(url, title) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = downloadName(url, title);
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (err) {
        window.open(url, '_blank');
    }
}

function renderSets() {
    const container = document.getElementById('sets-content');
    if (!container) return;

    if (SETS.length === 0) {
        container.innerHTML = '<p class="hint">No sets yet, someones clearly forgot to add them :(</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'sets-grid';

    SETS.forEach(set => {
        const item = document.createElement('div');
        item.className = 'set-card';
        const coverHtml = set.cover
            ? `<img class="set-cover" src="${escapeHtml(set.cover)}" alt="${escapeHtml(set.title)}" />`
            : '';
        item.innerHTML = `
            ${coverHtml}
            <div class="set-info">
                <h4>${escapeHtml(set.title)}</h4>
            </div>
            <audio controls preload="none" src="${escapeHtml(set.url)}"></audio>
            <button onclick='downloadSet(${JSON.stringify(set.url)}, ${JSON.stringify(set.title)})'>
                <i class="fas fa-download"></i> Download
            </button>
        `;
        grid.appendChild(item);
    });

    container.appendChild(grid);
}

renderSets();