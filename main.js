document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

function loadGames() {
    const grid = document.getElementById('games-grid');
    
    fetch('games.json')
        .then(response => {
            if (!response.ok) throw new Error("Errore caricamento JSON");
            return response.json();
        })
        .then(games => {
            grid.innerHTML = ''; // Pulisce eventuali contenuti vecchi
            
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
                
                // Percorso immagine
                const imgPath = `img/${game.id}.jpg`;
                
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="${imgPath}" alt="${game.title}" class="card-img" onerror="this.src='https://placehold.co/600x400/000000/00f3ff?text=NO+IMG'">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn">INITIALIZE &rarr;</a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.log("Errore:", err));
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    container.innerHTML = '';

    // 1. SCENA
    const scene = new THREE.Scene();
    // Nebbia nera più densa per nascondere l'orizzonte
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Posizione: più bassa per accentuare l'effetto terreno
    const isMobile = window.innerWidth < 768;
    camera.position.z = isMobile ? 5 : 4; 
    camera.position.y = 1.2; 
    camera.rotation.x = -0.2; // Guarda dritto verso l'orizzonte

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. GRIGLIA (Piano molto più grande e definito)
    // 80 segmenti per renderlo liquido
    const geometry = new THREE.PlaneGeometry(80, 80, 60, 60);
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.2 
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; 
    scene.add(terrain);

    // 3. ANIMAZIONE PROCEDURALE (SENZA RESET)
    const count = geometry.attributes.position.count;
    const positionAttribute = geometry.attributes.position;
    
    const clock = new THREE.Clock();

    const animate = () => {
        const time = clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            // Prendiamo le coordinate
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i); 
            
            // FORMULA MAGICA PER FLUIDITÀ INFINITA
            // Invece di muovere il terreno, muoviamo l'offset del tempo basandoci sulla posizione Y.
            // (y * 0.5 + time) fa scorrere l'onda verso la camera infinitamente.
            
            const waveX = Math.sin(x * 0.2 + time * 0.5);
            const waveY = Math.cos(y * 0.3 + time * 1.2); // 1.2 è la velocità di scorrimento
            
            // Combiniamo le onde per creare "colline digitali"
            const height = (waveX + waveY) * 1.5;
            
            // Applichiamo solo l'altezza (Z locale)
            positionAttribute.setZ(i, height);
        }

        positionAttribute.needsUpdate = true;

        // NON muoviamo più terrain.position.z
        // Il movimento è simulato matematicamente nell'onda sopra.
        // Questo elimina lo scatto di reset.

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    // Gestione Resize Ottimizzata per Mobile
    window.addEventListener('resize', () => {
        // Aggiorniamo solo se le dimensioni sono cambiate significativamente
        // (per evitare sfarfallii quando scompare la barra indirizzi)
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function initThreeJStodelete() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    container.innerHTML = '';

    // 1. SCENA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035); // Nebbia nera

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Posizione ottimizzata per mobile
    const isMobile = window.innerWidth < 768;
    camera.position.z = isMobile ? 6 : 5; 
    camera.position.y = isMobile ? 2 : 1.5; 
    camera.rotation.x = -0.3; 

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. GRIGLIA (Wireframe Terrain)
    const geometry = new THREE.PlaneGeometry(100, 100, 40, 40);
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, // Ciano
        wireframe: true,
        transparent: true,
        opacity: 0.3 
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; 
    scene.add(terrain);

    // 3. ANIMAZIONE
    const count = geometry.attributes.position.count;
    const positionAttribute = geometry.attributes.position;
    
    const clock = new THREE.Clock();

    const animate = () => {
        const time = clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i); 
            
            // Effetto onda digitale
            const waveHeight = Math.sin(x * 0.3 + time * 0.5) * Math.cos(y * 0.2 + time * 0.8) * 2;
            
            positionAttribute.setZ(i, waveHeight);
        }

        positionAttribute.needsUpdate = true;

        // Movimento in avanti infinito
        terrain.position.z = (time * 2) % 8; 

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
