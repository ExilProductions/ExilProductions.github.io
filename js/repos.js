const ORGS = [
    { type: 'orgs', account: 'ExilProductions' },
    { type: 'users', account: 'SimonSeider' },
    { type: 'orgs', account: 'Stoarp' }
];

const LIMIT_PER_SOURCE = 6;
const TOTAL_LIMIT = 8;

async function fetchRepos(source) {
    const url = `https://api.github.com/${source.type}/${source.account}/repos?sort=pushed&per_page=${LIMIT_PER_SOURCE}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${source.account}`);
    return res.json();
}

async function fetchAllRepos() {
    const results = await Promise.all(ORGS.map(fetchRepos));
    const seen = new Set();
    return results
        .flat()
        .filter(r => !r.fork)
        .filter(r => (seen.has(r.name) ? false : (seen.add(r.name), true)));
}

async function loadStats(repos) {
    const container = document.getElementById('stats-content');
    if (!container) return;

    const langCount = {};
    let totalStars = 0, totalForks = 0;
    repos.forEach(r => {
        totalStars += r.stargazers_count || 0;
        totalForks += r.forks_count || 0;
        if (r.language) {
            langCount[r.language] = (langCount[r.language] || 0) + 1;
        }
    });
    const topLangs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang);

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap:1rem; margin-bottom:2rem;">
            <div class="project" style="text-align:center; padding:1.5rem;">
                <div style="font-size:2.5rem; font-weight:300;">${repos.length}</div>
                <div style="color:#aaa;">Repositories</div>
            </div>
            <div class="project" style="text-align:center; padding:1.5rem;">
                <div style="font-size:2.5rem; font-weight:300;">${totalStars}</div>
                <div style="color:#aaa;">Total Stars</div>
            </div>
            <div class="project" style="text-align:center; padding:1.5rem;">
                <div style="font-size:2.5rem; font-weight:300;">${totalForks}</div>
                <div style="color:#aaa;">Total Forks</div>
            </div>
            <div class="project" style="text-align:center; padding:1.5rem;">
                <div style="font-size:1.5rem; font-weight:300;">${topLangs.join(', ') || '—'}</div>
                <div style="color:#aaa;">Top Languages</div>
            </div>
        </div>
    `;
}

async function loadStarred(repos) {
    const container = document.getElementById('starred-content');
    if (!container) return;

    const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    const top = sorted.slice(0, 3);

    if (top.length === 0) {
        container.innerHTML = '<p>No starred repos found.</p>';
        return;
    }

    const catDiv = document.createElement('div');
    catDiv.className = 'project-category';
    catDiv.innerHTML = `<h3><i class="fas fa-star"></i> Most Starred</h3><div class="project-container"></div>`;
    const inner = catDiv.querySelector('.project-container');

    top.forEach(repo => {
        const projDiv = document.createElement('div');
        projDiv.className = 'project';
        const desc = repo.description || 'No description provided.';
        projDiv.innerHTML = `
            <h4>${repo.name}</h4>
            <p>${desc}</p>
            <p style="font-size:0.85rem;color:#888">${repo.language || '—'} · ⭐ ${repo.stargazers_count}</p>
            <button onclick="window.open('${repo.html_url}','_blank')">View on GitHub</button>
        `;
        inner.appendChild(projDiv);
    });

    container.appendChild(catDiv);
}

async function loadContributed() {
    const container = document.getElementById('contributed-content');
    if (!container) return;

    try {
        const url = 'https://api.github.com/users/SimonSeider/events?per_page=100';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Events API ${res.status}`);
        const events = await res.json();

        const contributedRepos = new Map();
        events.forEach(ev => {
            if (ev.type === 'PushEvent' || ev.type === 'PullRequestEvent') {
                const repo = ev.repo;
                if (repo && repo.name) {
                    const isOwn = ORGS.some(org => repo.name.startsWith(org.account + '/'));
                    if (!isOwn) {
                        const [owner, name] = repo.name.split('/');
                        contributedRepos.set(repo.name, {
                            name: repo.name,
                            html_url: `https://github.com/${repo.name}`,
                            description: 'Contributed via pushes or PRs',
                        });
                    }
                }
            }
        });

        const repos = Array.from(contributedRepos.values());
        if (repos.length === 0) {
            container.innerHTML = '<p>No contributed repos found in recent events.</p>';
            return;
        }

        const catDiv = document.createElement('div');
        catDiv.className = 'project-category';
        catDiv.innerHTML = `<h3><i class="fas fa-handshake"></i> Contributed To</h3><div class="project-container"></div>`;
        const inner = catDiv.querySelector('.project-container');

        repos.slice(0, 6).forEach(repo => {
            const projDiv = document.createElement('div');
            projDiv.className = 'project';
            projDiv.innerHTML = `
                <h4>${repo.name}</h4>
                <p>${repo.description}</p>
                <button onclick="window.open('${repo.html_url}','_blank')">View on GitHub</button>
            `;
            inner.appendChild(projDiv);
        });

        container.appendChild(catDiv);
    } catch (err) {
        container.innerHTML = `<p>Failed to load contributions: ${err.message}</p>`;
    }
}

async function loadLatestRepos(repos) {
    const container = document.getElementById('project-content');
    if (!container) return;

    const sorted = repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    const latest = sorted.slice(0, TOTAL_LIMIT);

    if (latest.length === 0) {
        container.innerHTML = '<p>No public repos found.</p>';
        return;
    }

    container.innerHTML = '';
    const catDiv = document.createElement('div');
    catDiv.className = 'project-category';
    catDiv.innerHTML = '<h3>Latest Work</h3><div class="project-container"></div>';
    const inner = catDiv.querySelector('.project-container');

    latest.forEach(repo => {
        const projDiv = document.createElement('div');
        projDiv.className = 'project';
        const desc = repo.description || 'No description provided.';
        projDiv.innerHTML = `
            <h4>${repo.name}</h4>
            <p>${desc}</p>
            ${repo.language ? `<p style="font-size:0.85rem;color:#888">${repo.language}</p>` : ''}
            <button onclick="window.open('${repo.html_url}','_blank')">View on GitHub</button>
        `;
        inner.appendChild(projDiv);
    });

    container.appendChild(catDiv);
}

async function loadAll() {
    try {
        const allRepos = await fetchAllRepos();

        await loadStats(allRepos);

        await loadLatestRepos(allRepos);

        await loadStarred(allRepos);

        await loadContributed();

    } catch (err) {
        ['stats-content', 'project-content', 'starred-content', 'contributed-content'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p style="color:#f08a8a;">Error: ${err.message}</p>`;
        });
    }
}

loadAll();