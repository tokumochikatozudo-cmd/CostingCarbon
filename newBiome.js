function createBiomeScene(container, currentBudget, maxBudget, onExit) {
  const biomeWrap = document.createElement('div');
  biomeWrap.style.cssText = 'position:fixed;inset:0;background:#01020a;z-index:100;animation:fadeIn 1s ease both;';

  const scene = new THREE.Scene();
  // We'll leave the background black/transparent, the css background handles it.
  scene.background = null; 

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 8, 16);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  biomeWrap.appendChild(renderer.domElement);

  // ── Lights ──────────────────────────────────────────────────────────────
  const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  // ── Island Geometry (Single Non-Indexed Icosahedron) ────────────────────
  const islandGeo = new THREE.IcosahedronGeometry(5, 4).toNonIndexed();
  const pos = islandGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  
  // Create an array to hold original vertices data for reference
  const vertexData = [];
  
  // Iterate vertices to flatten top, carve river, and color
  for(let i=0; i<pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    let type = 'dirt';

    if (y > 0.0) {
       // Top half flattened to create a plateau
       let r = Math.sqrt(x*x + z*z);
       if (r < 4.5) {
          y = 1.5; 
          // Mountains
          if (x < 0 && z < -1) {
             y += Math.max(0, 2 - Math.sqrt((x+2)*(x+2) + (z+2)*(z+2)));
          }
          if (x > 1.5 && z > 1.5) {
             y += Math.max(0, 1.2 - Math.sqrt((x-2.5)*(x-2.5) + (z-2.5)*(z-2.5)));
          }
          
          // River Path
          let isRiver = Math.abs(z - Math.sin(x*0.5)*1.2) < 0.8;
          if (isRiver) {
             y = 1.0; 
             type = 'water';
          } else {
             type = 'grass';
          }
       } else {
          // Graceful slope down to the edge (y = 0.0 at r = 5.0)
          y = 1.5 - (r - 4.5) * 3;
          type = 'dirt';
       }
    } else {
       // Bottom half (Dirt)
       // Make it jagged
       x *= 1 + (Math.random()-0.5)*0.1;
       z *= 1 + (Math.random()-0.5)*0.1;
       y *= 1 + (Math.random()-0.5)*0.1;
       type = 'dirt';
    }

    pos.setXYZ(i, x, y, z);
    vertexData.push({ type });
  }

  islandGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  islandGeo.computeVertexNormals();

  const islandMat = new THREE.MeshStandardMaterial({ 
    vertexColors: true, 
    flatShading: true,
    roughness: 0.8,
    metalness: 0.1
  });
  const islandMesh = new THREE.Mesh(islandGeo, islandMat);
  islandGroup.add(islandMesh);

  // ── Fauna: Sheep ────────────────────────────────────────────────────────
  const sheepGroup = new THREE.Group();
  for(let i=0; i<3; i++) {
    const sheep = new THREE.Group();
    const bodyGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.15;
    
    const headGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.12, 0.22, 0);
    
    sheep.add(body);
    sheep.add(head);

    // Initial position on grass
    let angle = Math.random() * Math.PI * 2;
    let r = 1 + Math.random() * 2;
    sheep.position.set(Math.cos(angle)*r, 1.5, Math.sin(angle)*r);

    sheep.userData = { 
       targetAngle: angle, 
       targetRadius: r,
       speed: 0.003 + Math.random() * 0.003,
       walking: false,
       timer: Math.random() * 100
    };
    sheepGroup.add(sheep);
  }
  islandGroup.add(sheepGroup);

  // ── Flora: Trees ────────────────────────────────────────────────────────
  const trees = [];
  const deadTrees = [];
  const sakuraTrees = [];
  const addTree = (x, z) => {
    // Normal Tree
    const tg = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8), new THREE.MeshStandardMaterial({color: 0x3d2817}));
    trunk.position.y = 0.4;
    const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), new THREE.MeshStandardMaterial({color: 0x2e8540, flatShading: true}));
    leaves.position.y = 1;
    tg.add(trunk); tg.add(leaves);
    tg.position.set(x, 1.5, z);
    
    // Dead Tree
    const dtg = new THREE.Group();
    const dt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8), new THREE.MeshStandardMaterial({color: 0x222222}));
    dt.position.y = 0.4;
    dtg.add(dt);
    dtg.position.set(x, 1.5, z);
    dtg.visible = false;

    // Sakura Tree
    const stg = new THREE.Group();
    const strunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8), new THREE.MeshStandardMaterial({color: 0x3d2817}));
    strunk.position.y = 0.4;
    const sleaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), new THREE.MeshStandardMaterial({color: 0xffb7c5, flatShading: true}));
    sleaves.position.y = 1;
    stg.add(strunk); stg.add(sleaves);
    stg.position.set(x, 1.5, z);
    stg.visible = false;

    scene.add(tg); scene.add(dtg); scene.add(stg);
    trees.push({ tg, x, z });
    deadTrees.push(dtg);
    sakuraTrees.push(stg);
    islandGroup.add(tg); islandGroup.add(dtg); islandGroup.add(stg);
  };
  addTree(-2.5, 0); addTree(-3, -0.8); addTree(-2, 1);
  addTree(1, -2.5); addTree(2, -2); addTree(0, -3.5);
  addTree(3.5, 1);  addTree(3, 2); addTree(2, 2.5);

  // ── Waterfall Particles ────────────────────────────────────────────────
  const particleCount = 100;
  const waterfallGeo = new THREE.BufferGeometry();
  const wPositions = new Float32Array(particleCount * 3);
  const wVelocities = new Float32Array(particleCount);
  
  // Position waterfall where the river exits the island (x = ~4.8, z = Math.sin(4.8*0.5)*1.2)
  const wx = 4.8;
  const wz = Math.sin(wx*0.5)*1.2;
  
  for(let i=0; i<particleCount; i++) {
    wPositions[i*3] = wx + (Math.random()-0.5)*0.8;
    wPositions[i*3+1] = 1.0 - Math.random()*3;
    wPositions[i*3+2] = wz + (Math.random()-0.5)*0.8;
    wVelocities[i] = -(0.02 + Math.random()*0.02);
  }
  waterfallGeo.setAttribute('position', new THREE.BufferAttribute(wPositions, 3));
  const waterfallMat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.15, transparent: true, opacity: 0.6 });
  const waterfall = new THREE.Points(waterfallGeo, waterfallMat);
  islandGroup.add(waterfall);

  // ── Smog ─────────────────────────────────────────────────────────────
  const smogGeo = new THREE.SphereGeometry(7, 32, 32);
  const smogMat = new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: 0, depthWrite: false });
  const smogMesh = new THREE.Mesh(smogGeo, smogMat);
  islandGroup.add(smogMesh);

  // ── Audio ─────────────────────────────────────────────────────────────
  let audio;
  try {
    audio = new Audio('https://cdn.pixabay.com/download/audio/2022/10/25/audio_24a1b021d7.mp3?filename=river-stream-1-125032.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(()=>{}); 
  } catch(e) {}

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
  const colorCache = new THREE.Color();

  function updateBiome() {
    const fraction = currentBudget / maxBudget; 
    const severity = Math.max(0, fraction * (years / 10)); 

    smogMat.opacity = Math.min(0.9, Math.max(0, severity - 0.5));
    ambLight.intensity = 0.4 - Math.min(0.3, severity * 0.3);

    const waterColorH = new THREE.Color(0x3b82f6);
    const waterColorT = new THREE.Color(0x4a5a22); 
    const wColor = waterColorH.lerp(waterColorT, Math.min(1, severity));

    const grassColorH = new THREE.Color(0x22c55e);
    const grassColorT = new THREE.Color(0x3a3a3a); 
    const gColor = grassColorH.lerp(grassColorT, Math.min(1, severity));

    const dirtColor = new THREE.Color(0x4a3b2c);

    // Update Vertex Colors
    for(let i=0; i<pos.count; i++) {
       const type = vertexData[i].type;
       if (type === 'water') {
           if (severity > 0.6) colorCache.copy(dirtColor);
           else colorCache.copy(wColor);
       } else if (type === 'grass') {
           colorCache.copy(gColor);
       } else { 
           colorCache.copy(dirtColor);
       }
       colors[i*3] = colorCache.r;
       colors[i*3+1] = colorCache.g;
       colors[i*3+2] = colorCache.b;
    }
    islandGeo.attributes.color.needsUpdate = true;

    // Flora
    const deathThreshold = Math.min(1, Math.max(0, severity * 1.5 - 0.2));
    const bloomFactor = (currentBudget < (maxBudget * 0.5)) ? (years / 10) : 0;

    trees.forEach((t, i) => {
      const isDead = (i / trees.length) < deathThreshold;
      const isSakura = !isDead && (i / trees.length) < bloomFactor;
      t.tg.visible = !isDead && !isSakura;
      sakuraTrees[i].visible = isSakura;
      deadTrees[i].visible = isDead;
    });

    // Fauna & Waterfall
    sheepGroup.visible = severity < 0.6;
    waterfall.visible = severity < 0.6;
    if (severity < 0.6) {
       waterfallMat.color.copy(wColor);
    }

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
    
    islandGroup.position.y = Math.sin(time * 0.5) * 0.3;
    islandGroup.rotation.y = time * 0.05;
    
    if(sheepGroup.visible) {
      sheepGroup.children.forEach(s => {
        s.userData.timer -= 1;
        if(s.userData.timer <= 0) {
          if(s.userData.walking) {
            s.userData.walking = false;
            s.userData.timer = 60 + Math.random() * 100;
          } else {
            s.userData.walking = true;
            s.userData.targetAngle += (Math.random() - 0.5) * 2;
            s.userData.targetRadius = 1 + Math.random() * 3;
            s.userData.timer = 60 + Math.random() * 100;
          }
        }
        
        if(s.userData.walking) {
          let tx = Math.cos(s.userData.targetAngle) * s.userData.targetRadius;
          let tz = Math.sin(s.userData.targetAngle) * s.userData.targetRadius;
          let dx = tx - s.position.x;
          let dz = tz - s.position.z;
          let dist = Math.sqrt(dx*dx + dz*dz);
          if(dist > 0.01) {
            s.position.x += (dx/dist) * s.userData.speed;
            s.position.z += (dz/dist) * s.userData.speed;
            s.rotation.y = Math.atan2(-dz, dx);
          }
        }
        // Bobbing animation for sheep
        s.children[0].position.y = 0.15 + (s.userData.walking ? Math.abs(Math.sin(time*15))*0.03 : 0);
        s.children[1].position.y = 0.22 + (s.userData.walking ? Math.abs(Math.sin(time*15))*0.02 : 0);
      });
    }

    if (waterfall.visible) {
      const positions = waterfall.geometry.attributes.position.array;
      for(let i=0; i<particleCount; i++) {
        wVelocities[i] -= 0.01; 
        positions[i*3+1] += wVelocities[i];
        if (positions[i*3+1] < -3) {
          positions[i*3+1] = 1.0; 
          wVelocities[i] = -(0.02 + Math.random()*0.02);
        }
      }
      waterfall.geometry.attributes.position.needsUpdate = true;
    }

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
