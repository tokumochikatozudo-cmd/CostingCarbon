function createBiomeScene(container, currentBudget, maxBudget, onExit) {
  const biomeWrap = document.createElement('div');
  biomeWrap.style.cssText = 'position:absolute;inset:0;z-index:100;background:#01020a;overflow:hidden;animation:fadeIn 1s ease both;';
  
  const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/02/07/audio_67822996e3.mp3?filename=ambient-piano-ampamp-strings-10711.mp3'); 
  audio.loop = true;
  audio.volume = 0.4;
  audio.play().catch(e => console.log('Audio blocked', e));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#01020a');
  scene.fog = new THREE.FogExp2('#01020a', 0.05);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 14);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  biomeWrap.appendChild(renderer.domElement);

  const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xffddaa, 1.2);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  // 1. Base Island Shape (Underside dirt cone)
  const islandGeo = new THREE.CylinderGeometry(5, 0.1, 4, 64, 1, false, 0, Math.PI * 2);
  islandGeo.translate(0, -2, 0);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x3a2c21, roughness: 1.0, flatShading: true });
  const baseMesh = new THREE.Mesh(islandGeo, baseMat);
  islandGroup.add(baseMesh);

  // 2. Mountainous Terrain (Top surface)
  const surfaceGeo = new THREE.PlaneGeometry(10, 10, 32, 32);
  surfaceGeo.rotateX(-Math.PI / 2);
  const posAttribute = surfaceGeo.attributes.position;
  
  // Create a height map function
  function getHeight(x, z) {
    let h = 0;
    // Mountains on the negative X side
    if (x < -1) {
      h += Math.sin((x+1)*2) * Math.cos(z*1.5) * 1.5;
    }
    // Small hills on positive X
    if (x > 2) {
      h += Math.sin(x*3) * Math.cos(z*3) * 0.4;
    }
    // Valley/River trench in the middle (x between -1 and 2)
    if (x >= -1 && x <= 2) {
      // Create a river trench
      const trenchCenter = Math.sin(z * 0.5) * 0.5 + 0.5; // snake-like
      const dist = Math.abs(x - trenchCenter);
      if (dist < 0.8) {
        h -= (0.8 - dist) * 1.5; // deeper towards center
      }
    }
    // Keep edges rounded down to match the cylinder
    const r = Math.sqrt(x*x + z*z);
    if (r > 4.5) {
      h -= (r - 4.5) * 2;
    }
    return Math.max(-2, h); // clamp bottom
  }

  for (let i = 0; i < posAttribute.count; i++) {
    const x = posAttribute.getX(i);
    const z = posAttribute.getZ(i);
    const y = getHeight(x, z);
    posAttribute.setY(i, y);
  }
  surfaceGeo.computeVertexNormals();

  const surfaceMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8, flatShading: true });
  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  islandGroup.add(surfaceMesh);

  // 3. River
  const riverGeo = new THREE.PlaneGeometry(10, 10, 16, 16);
  riverGeo.rotateX(-Math.PI / 2);
  const riverMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.1 });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.position.y = -0.3; // Water level
  
  // Cut river to cylinder shape
  const riverPos = riverGeo.attributes.position;
  for (let i = 0; i < riverPos.count; i++) {
    const x = riverPos.getX(i);
    const z = riverPos.getZ(i);
    if (Math.sqrt(x*x + z*z) > 4.9) {
      riverPos.setY(i, -5); // pull down edges so it doesn't poke out
    }
  }
  islandGroup.add(riverMesh);

  // Waterfall (Particle system falling from the edge of the river)
  const particleCount = 200;
  const waterfallGeo = new THREE.BufferGeometry();
  const wPositions = new Float32Array(particleCount * 3);
  const wVelocities = [];
  for(let i=0; i<particleCount; i++) {
    wPositions[i*3] = (Math.random() - 0.5) * 1.5 + 0.5; // river mouth approx x
    wPositions[i*3+1] = -0.3 - Math.random() * 3; // y
    wPositions[i*3+2] = 4.8 + Math.random() * 0.2; // z (front edge)
    wVelocities.push(0); // y velocity
  }
  waterfallGeo.setAttribute('position', new THREE.BufferAttribute(wPositions, 3));
  const waterfallMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.15, transparent: true, opacity: 0.6 });
  const waterfall = new THREE.Points(waterfallGeo, waterfallMat);
  islandGroup.add(waterfall);

  // 4. Flora (Trees)
  const trees = [];
  const deadTrees = [];
  const sakuraTrees = [];

  for (let i=0; i<35; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 4;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const h = getHeight(x, z);
    
    // Don't place trees in the deep river
    if (h < -0.2) continue;

    const tGroup = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5), new THREE.MeshStandardMaterial({color: 0x5c4033}));
    trunk.position.y = 0.25;
    const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), new THREE.MeshStandardMaterial({color: 0x22c55e}));
    leaves.position.y = 0.6;
    tGroup.add(trunk); tGroup.add(leaves);
    tGroup.position.set(x, h, z);
    trees.push(tGroup);
    islandGroup.add(tGroup);

    const sGroup = new THREE.Group();
    const strunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5), new THREE.MeshStandardMaterial({color: 0x5c4033}));
    strunk.position.y = 0.25;
    const sleaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), new THREE.MeshStandardMaterial({color: 0xffb7c5}));
    sleaves.position.y = 0.6;
    sGroup.add(strunk); sGroup.add(sleaves);
    sGroup.position.set(x, h, z);
    sGroup.visible = false;
    sakuraTrees.push(sGroup);
    islandGroup.add(sGroup);

    const dtGroup = new THREE.Group();
    const dtrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6), new THREE.MeshStandardMaterial({color: 0x333333}));
    dtrunk.position.y = 0.3;
    dtGroup.add(dtrunk);
    dtGroup.position.set(x, h, z);
    dtGroup.visible = false;
    deadTrees.push(dtGroup);
    islandGroup.add(dtGroup);
  }

  // 5. Wildlife
  const birds = new THREE.Group();
  for(let i=0; i<8; i++) {
    const birdGeo = new THREE.ConeGeometry(0.05, 0.2, 3);
    birdGeo.rotateX(Math.PI/2);
    const bird = new THREE.Mesh(birdGeo, new THREE.MeshBasicMaterial({color: 0xffffff}));
    const r = 5 + Math.random()*2;
    const theta = Math.random() * Math.PI * 2;
    bird.position.set(Math.cos(theta)*r, 2 + Math.random()*2, Math.sin(theta)*r);
    bird.userData = { theta: theta, r: r, speed: 0.01 + Math.random()*0.01, yBase: bird.position.y };
    birds.add(bird);
  }
  islandGroup.add(birds);

  const landAnimals = [];
  for(let i=0; i<3; i++) {
    const deerGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), new THREE.MeshStandardMaterial({color: 0x8B5A2B}));
    body.position.y = 0.2;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshStandardMaterial({color: 0x8B5A2B}));
    head.position.set(0.15, 0.35, 0);
    deerGroup.add(body); deerGroup.add(head);
    // Find a spot
    let dx=0, dz=0, dh=0;
    while(dh < 0) {
      const a = Math.random() * Math.PI*2;
      const r = Math.random() * 3;
      dx = Math.cos(a)*r; dz = Math.sin(a)*r;
      dh = getHeight(dx, dz);
    }
    deerGroup.position.set(dx, dh, dz);
    deerGroup.userData = { originX: dx, originZ: dz, timeOffset: Math.random()*10 };
    landAnimals.push(deerGroup);
    islandGroup.add(deerGroup);
  }

  // Smog
  const smogGeo = new THREE.SphereGeometry(7, 32, 32);
  const smogMat = new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: 0, depthWrite: false });
  const smogMesh = new THREE.Mesh(smogGeo, smogMat);
  islandGroup.add(smogMesh);

  // ── UI ──────────────────────────────────────────────────────────────────
  const uiWrap = document.createElement('div');
  uiWrap.style.cssText = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);width:80%;max-width:600px;background:rgba(2,6,16,.8);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:20px;backdrop-filter:blur(10px);text-align:center;color:#fff;font-family:Syne,sans-serif;display:flex;flex-direction:column;gap:15px;';
  
  uiWrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-weight:900;font-size:18px;">Timeline: <span id="year-label" style="color:#aa88ff;">Year 1</span></div>
      <button id="biome-exit" style="background:rgba(255,255,255,.1);border:none;color:#fff;padding:8px 16px;border-radius:12px;cursor:pointer;font-family:Syne,sans-serif;transition:background 0.2s;">Exit Simulator</button>
    </div>
    <input type="range" id="year-slider" min="1" max="10" value="1" style="width:100%;accent-color:#aa88ff;cursor:pointer;" />
    <div style="font-size:12px;color:rgba(255,255,255,.6);" id="biome-status">Based on planned emissions: ${currentBudget.toFixed(1)} kg CO₂e/day</div>
  `;
  biomeWrap.appendChild(uiWrap);
  container.appendChild(biomeWrap);

  const slider = uiWrap.querySelector('#year-slider');
  const label = uiWrap.querySelector('#year-label');
  const status = uiWrap.querySelector('#biome-status');
  const exitBtn = uiWrap.querySelector('#biome-exit');

  exitBtn.addEventListener('mouseenter', () => exitBtn.style.background = 'rgba(255,255,255,.2)');
  exitBtn.addEventListener('mouseleave', () => exitBtn.style.background = 'rgba(255,255,255,.1)');

  let years = 1;

  function updateBiome() {
    const fraction = currentBudget / maxBudget; 
    const severity = Math.max(0, fraction * (years / 10)); 

    // Smog and Lighting
    smogMat.opacity = Math.min(0.9, Math.max(0, severity - 0.5));
    ambLight.intensity = 0.4 - Math.min(0.3, severity * 0.3);

    // Terrain Color
    const healthyColor = new THREE.Color(0x22c55e);
    const barrenColor = new THREE.Color(0x3a3a3a); // Ashen/black
    surfaceMat.color.copy(healthyColor).lerp(barrenColor, Math.min(1, severity));

    // River Color & Depth
    const hWater = new THREE.Color(0x3b82f6);
    const tWater = new THREE.Color(0x4a5a22); // Toxic green/brown
    riverMat.color.copy(hWater).lerp(tWater, Math.min(1, severity));
    riverMesh.position.y = -0.3 - (severity * 0.5); // Dries up

    // Flora
    const deathThreshold = Math.min(1, Math.max(0, severity * 1.5 - 0.2));
    const bloomFactor = (currentBudget < (maxBudget * 0.5)) ? (years / 10) : 0;

    trees.forEach((t, i) => {
      const isDead = (i / trees.length) < deathThreshold;
      const isSakura = !isDead && (i / trees.length) < bloomFactor;
      t.visible = !isDead && !isSakura;
      sakuraTrees[i].visible = isSakura;
      deadTrees[i].visible = isDead;
    });

    // Fauna
    const animalsVisible = severity < 0.6;
    birds.visible = animalsVisible;
    landAnimals.forEach(a => a.visible = animalsVisible);
    waterfall.visible = severity < 0.8;

    // Status text
    if (fraction <= 1) {
      if (bloomFactor > 0.5) {
        status.innerHTML = "Exceptional sustainability: the biome flourishes into a vivid Sakura bloom, wildlife thrives.";
        status.style.color = "#ffb7c5";
      } else {
        status.innerHTML = "Sustainable: clean rivers, healthy forests, and active wildlife.";
        status.style.color = "#22c55e";
      }
    } else {
      if (years < 4) {
        status.innerHTML = "Early degradation: rivers recede, vegetation begins to wither.";
        status.style.color = "#f59e0b";
      } else if (years < 8) {
        status.innerHTML = "Severe impact: toxic waterways, dying trees, wildlife fleeing.";
        status.style.color = "#ea580c";
      } else {
        status.innerHTML = "Ecological collapse: thick smog, dried barren ash lands, lifeless void.";
        status.style.color = "#ef4444";
      }
    }
  }

  slider.addEventListener('input', (e) => {
    years = parseInt(e.target.value);
    label.innerText = 'Year ' + years;
    updateBiome();
  });

  exitBtn.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    if(audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    biomeWrap.style.animation = 'fadeOut .5s ease both';
    setTimeout(() => {
      biomeWrap.remove();
      if(onExit) onExit();
    }, 500);
  });

  updateBiome();

  let animId;
  const clock = new THREE.Clock();
  
  function animate() {
    animId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Island slow rotation and bobbing
    islandGroup.position.y = Math.sin(time * 0.5) * 0.3;
    islandGroup.rotation.y = time * 0.05;
    
    // Birds orbiting
    if(birds.visible) {
      birds.children.forEach(b => {
        b.userData.theta += b.userData.speed;
        b.position.x = Math.cos(b.userData.theta) * b.userData.r;
        b.position.z = Math.sin(b.userData.theta) * b.userData.r;
        b.position.y = b.userData.yBase + Math.sin(time*3 + b.userData.theta)*0.2;
        b.rotation.y = -b.userData.theta; // face forward
      });
    }

    // Animals slight grazing movement
    landAnimals.forEach(a => {
      const t = time + a.userData.timeOffset;
      a.position.x = a.userData.originX + Math.sin(t)*0.2;
      a.position.z = a.userData.originZ + Math.cos(t*0.8)*0.2;
      a.rotation.y = Math.sin(t*0.5)*0.5;
    });

    // Waterfall animation
    if (waterfall.visible) {
      const positions = waterfall.geometry.attributes.position.array;
      for(let i=0; i<particleCount; i++) {
        wVelocities[i] -= 0.01; // gravity
        positions[i*3+1] += wVelocities[i];
        if (positions[i*3+1] < -4) {
          positions[i*3+1] = riverMesh.position.y;
          wVelocities[i] = 0;
        }
      }
      waterfall.geometry.attributes.position.needsUpdate = true;
    }

    // Smog swirl
    smogMesh.rotation.y = time * 0.1;
    smogMesh.rotation.z = time * 0.05;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);
}

    