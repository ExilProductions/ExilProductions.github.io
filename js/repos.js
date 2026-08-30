const ORGS = [
    { type: 'orgs', account: 'ExilProductions' },
    { type: 'users', account: 'SimonSeider' },
];

const LIMIT_PER_SOURCE = 6;
const TOTAL_LIMIT = 8;

async function fetchRepos(source) {
    const url = `https://api.github.com/${source.type}/${source.account}/repos?sort=pushed&per_page=${LIMIT_PER_SOURCE}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${source.account}`);
    return res.json();
}

async function loadLatestRepos() {
    const container = document.getElementById('project-content');
    if (!container) return;

    container.innerHTML = '<p>Loading projects...</p>';

    try {
        const results = await Promise.all(ORGS.map(fetchRepos));
        const seen = new Set();
        const repos = results
            .flat()
            .filter(r => !r.fork)
            .filter(r => (seen.has(r.name) ? false : (seen.add(r.name), true)))
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
            .slice(0, TOTAL_LIMIT);

        if (repos.length === 0) {
            container.innerHTML = '<p>No public repos found.</p>';
            return;
        }

        container.innerHTML = '';
        const catDiv = document.createElement('div');
        catDiv.className = 'project-category';
        catDiv.innerHTML = '<h3>Latest Work</h3><div class="project-container"></div>';
        const inner = catDiv.querySelector('.project-container');

        repos.forEach(repo => {
            const projDiv = document.createElement('div');
            projDiv.className = 'project';
            const desc = repo.description ? repo.description : 'No description provided.';
            projDiv.innerHTML = `<h4>${repo.name}</h4><p>${desc}</p>`;
            if (repo.language) projDiv.innerHTML += `<p style="font-size:0.85rem;color:#888">${repo.language}</p>`;
            projDiv.innerHTML += `<button onclick="window.open('${repo.html_url}','_blank')">View on GitHub</button>`;
            inner.appendChild(projDiv);
        });

        container.appendChild(catDiv);
    } catch (err) {
        container.innerHTML = '<p>Failed to load projects: ' + err.message + '</p>';
    }
}

loadLatestRepos();
