document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('games-grid');

    // Percorso del file JSON
    fetch('games.json')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const card = createGameCard(game);
                grid.appendChild(card);
            });
        })
        .catch(error => console.error('Errore nel caricamento dei giochi:', error));
});

function createGameCard(game) {
    // Costruiamo i percorsi
    const gameUrl = `games/${game.id}.html`;
    // Se l'immagine non esiste, potremmo gestire un errore, 
    // ma qui assumiamo che tu carichi sempre gameX.jpg in /img
    const imgUrl = `img/${game.id}.jpg`; 

    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
        <div class="card-image-container">
            <img src="${imgUrl}" alt="${game.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x250/1e293b/38bdf8?text=No+Image'">
        </div>
        <div class="card-content">
            <h2 class="card-title">${game.title}</h2>
            <p class="card-desc">${game.description}</p>
            <a href="${gameUrl}" target="_blank" class="card-btn">Gioca Ora &rarr;</a>
        </div>
    `;

    return article;
}
