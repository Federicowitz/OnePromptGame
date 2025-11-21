document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

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
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // Scena base
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30; // Allontaniamo la camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Creiamo le particelle
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500; // Numero di particelle
    
    const posArray = new Float32Array(particlesCount * 3); // x, y, z per ogni particella

    for(let i = 0; i < particlesCount * 3; i++) {
        // Posizioniamo le particelle random nello spazio
        posArray[i] = (Math.random() - 0.5) * 100; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Materiale delle particelle (colore Ciano)
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x00f3ff, // Ciano
        transparent: true,
        opacity: 0.8,
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Listener movimento mouse con effetto "parallasse" ridotto
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        const elapsedTime = clock.getElapsedTime();

        // Rotazione automatica lenta
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Movimento fluido verso la posizione del mouse
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
        
        // Effetto onda leggero
        // (Opzionale: se volessi far pulsare le particelle potresti modificare geometry qui, ma pesante per CPU)

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
}
