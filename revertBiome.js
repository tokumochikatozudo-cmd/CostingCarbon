const fs = require('fs');

let oldBiome = fs.readFileSync('c:/Users/neuronstar/.gemini/antigravity/brain/cb7b0d7a-5a84-464e-877a-54a165242946/scratch/createBiomeScene.js', 'utf8');

// Fix 1: Make base cylinder open-ended
oldBiome = oldBiome.replace(
  "new THREE.CylinderGeometry(5, 0.1, 4);",
  "new THREE.CylinderGeometry(5, 0.1, 4, 64, 1, true);"
);

// Fix 2: Constrain surface plane to a circle
const planeLoopStart = `for(let i=0; i<pos.count; i++) {`;
const planeFix = `
      let x = pos.getX(i);
      let z = pos.getZ(i);
      let r0 = Math.sqrt(x*x + z*z);
      if (r0 > 5.0) {
         let factor = 5.0 / r0;
         x *= factor;
         z *= factor;
         pos.setX(i, x);
         pos.setZ(i, z);
      }
`;
oldBiome = oldBiome.replace(
  "for(let i=0; i<pos.count; i++) {",
  "for(let i=0; i<pos.count; i++) {" + planeFix
);

// Fix 3: Constrain river plane to a circle
const riverLoopStart = `for(let i=0; i<rpos.count; i++) {`;
const riverFix = `
        let rx = rpos.getX(i);
        let rz = rpos.getZ(i);
        let rr0 = Math.sqrt(rx*rx + rz*rz);
        if (rr0 > 4.9) {
           let factor = 4.9 / rr0;
           rx *= factor;
           rz *= factor;
           rpos.setX(i, rx);
           rpos.setZ(i, rz);
        }
`;
oldBiome = oldBiome.replace(
  "for(let i=0; i<rpos.count; i++) {",
  "for(let i=0; i<rpos.count; i++) {" + riverFix
);

// Fix 4: Fix unescaped backtick which caused the original blank screen
oldBiome = oldBiome.replace(/\\`/g, '`');
oldBiome = oldBiome.replace(/\\\${/g, '${');

// Now read index.html
let html = fs.readFileSync('c:/EcoBalance1/index.html', 'utf8');

// Replace createBiomeScene entirely
const biomeStart = "function createBiomeScene(container, currentBudget, maxBudget, onExit) {";
const biomeEnd = "// ═══ planner.js ═══";
const sIdx = html.indexOf(biomeStart);
const eIdx = html.indexOf(biomeEnd);
if(sIdx > -1 && eIdx > -1) {
    html = html.substring(0, sIdx) + oldBiome + "\n    " + html.substring(eIdx);
}

// Attach the Confirm Limit button event listener in createPlannerPanel
const btnTarget = "const biomeBtn = container.querySelector('#enter-biome-btn');";
const btnInjection = `
      const saveBtn = container.querySelector('#save-limit-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          saveBud();
          const old = e.target.innerText;
          e.target.innerText = 'Saved!';
          setTimeout(() => e.target.innerText = old, 2000);
        });
      }
      ` + btnTarget;

if (html.indexOf(btnTarget) > -1 && html.indexOf("saveBtn.addEventListener") === -1) {
    html = html.replace(btnTarget, btnInjection);
}

fs.writeFileSync('c:/EcoBalance1/index.html', html);
console.log("Successfully reverted biome to old masterpiece and fixed clipping!");
