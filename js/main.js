function showSection(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(window.innerWidth < 768) toggleMenu(false);
}

function toggleMenu(forceClose=false) {
    const nav = document.getElementById('nav');
    if(forceClose) { nav.classList.remove('active'); return; }
    nav.classList.toggle('active');
}

var mailto = String.fromCharCode(109, 97, 105, 108, 116, 111, 58);
document.getElementById('email-link').href = mailto + 'exil.productions.business' + String.fromCharCode(64) + 'gmail.com';
