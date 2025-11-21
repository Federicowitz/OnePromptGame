document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});
function initThreeJS() {
    const container = document.getElementById('canvas-container');

    // 1. SETUP SCENA
    const scene = new THREE.Scene();
    // Aggiungiamo una nebbia nera per fondere l'oggetto in lontananza se serve
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posizione camera: abbastanza vicina per vedere i dettagli
    camera.position.z = 10; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = ''; // Pulisce vecchi canvas se presenti
    container.appendChild(renderer.domElement);

    // 2. CREAZIONE DELL'OGGETTO "FLUIDO"
    // Usiamo un Icosaedro con alto dettaglio per farlo sembrare una sfera
    // Parametri: Raggio 3, Dettaglio 5 (più è alto più è liscio, ma pesante per mobile. 5 è un buon compromesso)
    const geometry = new THREE.IcosahedronGeometry(3.5, 4); 
    
    // Materiale "Plastica Nera Lucida"
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,     // Quasi nero
        roughness: 0.1,      // Molto liscio (0 = specchio, 1 = opaco)
        metalness: 0.6,      // Un po' metallico per i riflessi
        flatShading: false,  // Shading morbido
    });

    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // Salviamo la posizione originale dei vertici per poterli deformare
    const originalPositions = geometry.attributes.position.array.slice();
    
    // 3. LUCI (NEON VIBES)
    // Luce ambientale debole per non avere il nero totale cieco
    const ambientLight = new THREE.AmbientLight(0x222222); 
    scene.add(ambientLight);

    // Luce 1: Neon Ciano (Azzurro)
    const light1 = new THREE.PointLight(0x00ffff, 2, 50);
    scene.add(light1);

    // Luce 2: Neon Viola (Magenta)
    const light2 = new THREE.PointLight(0xff00ff, 2, 50);
    scene.add(light2);

    // Helper per muovere le luci
    const clock = new THREE.Clock();

    // 4. ANIMAZIONE
    const animate = () => {
        const time = clock.getElapsedTime();
        const positions = geometry.attributes.position; // Accesso ai vertici

        // -- DEFORMAZIONE (IL "MODELLAMENTO") --
        // Cicliamo attraverso i vertici per spostarli
        for (let i = 0; i < positions.count; i++) {
            // Prendiamo le coordinate originali
            const ox = originalPositions[i * 3];
            const oy = originalPositions[i * 3 + 1];
            const oz = originalPositions[i * 3 + 2];

            // Creiamo un "rumore" basato su seno e coseno e tempo
            // Questo simula l'effetto liquido senza librerie pesanti
            const offset = 
                Math.sin(ox * 0.5 + time * 1.2) * 0.4 + 
                Math.cos(oy * 0.3 + time * 1.5) * 0.4 + 
                Math.sin(oz * 0.5 + time * 0.5) * 0.2;

            // Normalizziamo il vettore (direzione dal centro)
            const dist = Math.sqrt(ox*ox + oy*oy + oz*oz);
            const nx = ox / dist;
            const ny = oy / dist;
            const nz = oz / dist;

            // Applichiamo la deformazione lungo la normale (gonfia/sgonfia)
            const scale = 1 + offset * 0.2; // 0.2 è l'intensità della deformazione

            positions.setXYZ(i, ox * scale, oy * scale, oz * scale);
        }
        
        // Diciamo a Three.js che i vertici sono cambiati
        positions.needsUpdate = true;
        geometry.computeVertexNormals(); // Ricalcola le luci sulla nuova forma

        // -- MOVIMENTO LUCI --
        // Le luci orbitano attorno al blob
        light1.position.x = Math.sin(time * 0.7) * 8;
        light1.position.y = Math.cos(time * 0.5) * 8;
        light1.position.z = Math.sin(time * 0.3) * 8;

        light2.position.x = Math.sin(time * 0.8 + 2) * -8; // +2 per sfasare
        light2.position.y = Math.cos(time * 0.6 + 2) * -8;
        light2.position.z = Math.cos(time * 0.4 + 2) * 8;

        // Rotazione lenta dell'intero oggetto
        blob.rotation.y += 0.002;
        blob.rotation.z += 0.001;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function loadGames() {
    const grid = document.getElementById('games-grid');

    fetch('games.json')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
                // Inseriamo un attributo data-tilt se volessimo usare vanilla-tilt.js in futuro
                
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="img/${game.id}.jpg" alt="${game.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop'">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn">
                            LAUNCH_PROTOCOL <span style="font-size:1.2em">→</span>
                        </a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Errore DB giochi:", err));
}

// --- PARTE 2: THREE.JS BACKGROUND (PARTICLE FIELD) ---
