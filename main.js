document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

function loadGames() {
    const grid = document.getElementById('games-grid');
    
    // Gestione errore se il file json non esiste ancora
    fetch('games.json')
        .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .then(games => {
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="img/${game.id}.jpg" alt="${game.title}" class="card-img" onerror="this.src='https://placehold.co/600x400/000000/00f3ff?text=NO+IMG'">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn">Initialize &rarr;</a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.log("Nessun gioco trovato o games.json mancante"));
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // Pulizia preventiva
    container.innerHTML = '';

    // 1. SCENA
    const scene = new THREE.Scene();
    // Nebbia nera per nascondere la fine della griglia
    scene.fog = new THREE.FogExp2(0x000000, 0.03); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Posizionamento Tattico per Mobile
    // Se lo schermo è stretto (mobile), alziamo un po' la camera
    const isMobile = window.innerWidth < 768;
    camera.position.z = isMobile ? 6 : 5; 
    camera.position.y = isMobile ? 2 : 1.5; 
    camera.rotation.x = -0.3; // Guarda verso il basso/orizzonte

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. GRIGLIA (TERRENO)
    // PlaneGeometry enorme
    const geometry = new THREE.PlaneGeometry(100, 100, 40, 40);
    
    // Materiale Wireframe Ciano "Tron Style"
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.25 
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // Disteso a terra
    scene.add(terrain);

    // 3. ANIMAZIONE ONDE
    const count = geometry.attributes.position.count;
    const positionAttribute = geometry.attributes.position;
    
    // Salviamo le Z originali (che ora sono Y locali) per non deformare troppo
    const originalZ = [];
    for(let i = 0; i < count; i++){
        originalZ.push(positionAttribute.getZ(i));
    }

    const clock = new THREE.Clock();

    const animate = () => {
        const time = clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            // Prendiamo X e Y originali della geometria piana
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i); 

            // Creiamo onde che scorrono lungo l'asse Y (che visivamente è la profondità)
            // L'effetto scorrimento si fa aggiungendo 'time' alle coordinate
            const waveHeight = Math.sin(x * 0.3 + time * 0.5) * Math.cos(y * 0.2 + time * 0.8) * 2;
            
            // Applichiamo la nuova altezza
            positionAttribute.setZ(i, waveHeight);
        }

        positionAttribute.needsUpdate = true;

        // Muoviamo leggermente il terreno verso la camera per effetto velocità
        // (Reset position per loop infinito semplice)
        const speed = 2;
        const terrainMove = (time * speed) % 10; 
        terrain.position.z = terrainMove; 

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}
