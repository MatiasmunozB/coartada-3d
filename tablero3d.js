/* COARTADA 3D — el tablero como maqueta (diorama). Solo dibuja: la lógica sigue en motor.js y en index.html.
   API (window.T3):
     construir(caso, contenedor, {alTocar(r,c,ev)})   arma la escena
     pintar({pos, marcas, notas, sel, fin, choque, vistas, ini, victima})   refleja el estado
     escena(salaVictima | null)   foco en la habitación del crimen al resolver
     temblar(r, c)   la casilla "rechaza" (mueble)
     vista('inclinada' | 'cenital')
*/
import * as THREE from 'three';

const K = window.COARTADA, A = window.COARTADA_ARTE;
let renderer, scene, camera, raiz, caso, n, cont, capaHtml, opts;
let hemi, sol, celdas = [], fichas = {}, marcas = {}, notasM = {}, vistasM = [], hoverM, focoLuz, sombraSalas = [];
const cam = { mira: 0, az: 0, pol: 38, radio: 12, azObj: 0, polObj: 48, radioObj: 12, min: 6, max: 26 };
const reloj = new THREE.Clock();
let animaciones = [];

/* ---------- utilidades ---------- */
const X = (c) => c - (n - 1) / 2, Z = (r) => r - (n - 1) / 2;
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: 0, ...o });
function caja(w, h, d, color, x = 0, y = 0, z = 0, o) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'object' ? color : mat(color, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cil(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function esfera(r, color, x, y, z, s = [1, 1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(color)); m.position.set(x, y, z); m.scale.set(...s); m.castShadow = true; return m; }
function lienzo(w, h, dibuja) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; dibuja(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
// SVG (caras y objetos del juego 2D) → textura
const cacheSvg = {};
function texturaSvg(svg, px = 256, fondo = null, circulo = false) {
  const clave = svg + px + fondo + circulo;
  if (cacheSvg[clave]) return cacheSvg[clave];
  const cv = document.createElement('canvas'); cv.width = cv.height = px; const g = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const img = new Image();
  img.onload = () => {
    if (circulo) { g.beginPath(); g.arc(px / 2, px / 2, px / 2 - 2, 0, Math.PI * 2); g.clip(); }
    if (fondo) { g.fillStyle = fondo; g.fillRect(0, 0, px, px); }
    g.drawImage(img, 0, 0, px, px); t.needsUpdate = true;
  };
  const s = svg.includes('xmlns') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  return (cacheSvg[clave] = t);
}

/* ---------- pisos (misma paleta que el 2D) ---------- */
const PISOS = {
  moqueta: (g, w) => { g.fillStyle = '#4a6a9a'; g.fillRect(0, 0, w, w); g.strokeStyle = '#41608c'; g.lineWidth = 6; for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + w, w); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(20 + i * 48, 20 + j * 48, 6, 0, 7); g.fill(); } },
  torre: (g, w) => { const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#4d4470'); gr.addColorStop(1, '#372f57'); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(255,255,255,.1)'; [[.3, .3, 10], [.75, .7, 8], [.6, .2, 6]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x * w, y * w, r, 0, 7); g.fill(); }); },
  lab: (g, w) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#eaf6f7' : '#cfe6ea'; g.fillRect(i * w / 2, j * w / 2, w / 2, w / 2); } },
  cocina: (g, w) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#e59a78' : '#f7e9d0'; g.fillRect(i * w / 2, j * w / 2, w / 2, w / 2); } },
  metal: (g, w) => { const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#8d9bb0'); gr.addColorStop(1, '#6f7c92'); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.fillStyle = '#5d6b82'; [[.12, .12], [.88, .12], [.12, .88], [.88, .88]].forEach(([x, y]) => { g.beginPath(); g.arc(x * w, y * w, 7, 0, 7); g.fill(); }); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3; for (let i = 30; i < w; i += 40) { g.beginPath(); g.moveTo(i, 20); g.lineTo(i + 20, 40); g.stroke(); } },
  madera: (g, w) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#b07a46' : '#c48a52'; g.fillRect(0, i * w / 4, w, w / 4); } },
};
const texPiso = {};
const pisoTex = (p) => texPiso[p] || (texPiso[p] = lienzo(256, 256, (g, w) => (PISOS[p] || PISOS.madera)(g, w)));

/* ---------- muebles en 3D (escala: 1 casilla) ---------- */
const MADERA = '#c8915a', MADERA2 = '#9a6a3c';
function papeles(gr, x, z) { gr.add(caja(.16, .01, .2, '#ffffff', x, .455, z)); gr.add(cil(.05, .045, .1, '#ffffff', x + .22, .5, z - .05)); }
const MUEBLES = {
  mesa: () => { const g = new THREE.Group(); g.add(caja(.82, .06, .6, MADERA, 0, .42, 0)); for (const [x, z] of [[-.36, -.24], [.36, -.24], [-.36, .24], [.36, .24]]) g.add(caja(.05, .4, .05, MADERA2, x, .2, z)); papeles(g, -.12, .05); return g; },
  pc: () => { const g = MUEBLES.mesa(); g.add(caja(.44, .3, .04, '#3b3f52', 0, .66, -.12)); const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(.38, .24), new THREE.MeshStandardMaterial({ color: '#4be3ff', emissive: '#2ab8d8', emissiveIntensity: .9 })); pantalla.position.set(0, .66, -.098); g.add(pantalla); g.add(caja(.06, .1, .06, '#2a2d3b', 0, .5, -.12)); g.add(caja(.36, .02, .12, '#c9cede', 0, .46, .12)); return g; },
  tele: () => { const g = new THREE.Group(); g.add(caja(.6, .3, .36, MADERA2, 0, .15, 0)); g.add(caja(.7, .44, .1, '#7a4bb3', 0, .54, -.04)); const p = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32), new THREE.MeshStandardMaterial({ color: '#bfe9ff', emissive: '#7ab8e8', emissiveIntensity: .8 })); p.position.set(-.04, .54, .013); g.add(p); g.add(esfera(.03, '#ffd23f', .27, .6, .02)); return g; },
  planta: () => { const g = new THREE.Group(); g.add(cil(.2, .15, .3, '#c9683a', 0, .15, 0)); g.add(cil(.21, .21, .04, '#e08352', 0, .3, 0)); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, h = esfera(.09, i % 2 ? '#2f9a4b' : '#3fb85a', Math.cos(a) * .1, .52, Math.sin(a) * .1, [.6, 2.3, .6]); h.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(h); } return g; },
  copiadora: () => { const g = new THREE.Group(); g.add(caja(.72, .5, .58, '#d9dde6', 0, .25, 0)); g.add(caja(.72, .06, .58, '#aab2c2', 0, .53, 0)); g.add(caja(.4, .02, .32, '#ffffff', -.05, .57, 0)); g.add(caja(.16, .08, .02, '#3b3f52', .2, .4, .3)); g.add(esfera(.025, '#5cf08a', .32, .4, .3)); g.add(caja(.5, .03, .3, '#aab2c2', 0, .12, .3)); return g; },
  remolachas: () => { const g = new THREE.Group(); g.add(caja(.72, .3, .56, '#b9813f', 0, .15, 0)); for (const y of [.08, .2]) g.add(caja(.74, .03, .58, '#8f5f2a', 0, y, 0)); [[-.2, -.12], [0, -.14], [.2, -.1], [-.12, .1], [.1, .12], [.24, .14]].forEach(([x, z]) => { g.add(esfera(.1, '#8a1f5a', x, .38, z)); const h = esfera(.03, '#3fa55a', x, .5, z, [1, 3, 1]); g.add(h); }); return g; },
  caja: () => { const g = new THREE.Group(); g.add(caja(.6, .5, .55, '#c49052', 0, .25, 0)); g.add(caja(.62, .04, .1, '#e8d8a8', 0, .5, 0)); g.add(caja(.5, .4, .45, '#b07a3c', .05, .2, 0)); g.children[2].scale.set(0, 0, 0); return g; },
  nevera: () => { const g = new THREE.Group(); g.add(caja(.56, 1.0, .5, '#eef6fd', 0, .5, 0)); g.add(caja(.57, .02, .51, '#9db4c8', 0, .68, 0)); g.add(caja(.03, .16, .03, '#7d94a8', -.2, .82, .26)); g.add(caja(.03, .26, .03, '#7d94a8', -.2, .45, .26)); g.add(esfera(.025, '#e8413c', .18, .9, .26)); return g; },
  archivador: () => { const g = new THREE.Group(); g.add(caja(.46, .9, .5, '#8f97a8', 0, .45, 0)); [.2, .45, .7].forEach((y) => { g.add(caja(.4, .2, .02, '#b9c0cd', 0, y, .26)); g.add(caja(.12, .03, .02, '#5d6577', 0, y + .04, .275)); }); return g; },
  dispensador: () => { const g = new THREE.Group(); g.add(caja(.34, .62, .34, '#eef1f6', 0, .31, 0)); const b = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .32, 20), new THREE.MeshStandardMaterial({ color: '#8fd0f4', transparent: true, opacity: .75, roughness: .1 })); b.position.y = .8; g.add(b); g.add(caja(.05, .05, .04, '#3b8ad8', -.07, .48, .18)); g.add(caja(.05, .05, .04, '#e3172f', .07, .48, .18)); return g; },
  dundie: () => { const g = new THREE.Group(); g.add(caja(.7, .12, .4, '#6d4220', 0, .06, 0)); const v = new THREE.Mesh(new THREE.BoxGeometry(.7, .7, .4), new THREE.MeshStandardMaterial({ color: '#bfe6ff', transparent: true, opacity: .25, roughness: .05 })); v.position.y = .47; g.add(v); [-.17, .17].forEach((x) => { g.add(cil(.06, .08, .28, '#ffd23f', x, .3, 0)); g.add(esfera(.06, '#ffd23f', x, .5, 0)); }); return g; },
  estante: () => { const g = new THREE.Group(); g.add(caja(.8, .9, .3, '#6d4220', 0, .45, 0)); [.2, .48, .76].forEach((y, j) => { for (let i = 0; i < 6; i++) g.add(caja(.08, .2, .22, ['#e8413c', '#4be3ff', '#ffd23f', '#5cf08a', '#b46cff', '#f7f1e0'][(i + j) % 6], -.3 + i * .12, y, .04)); }); return g; },
};
// objetos sin modelo 3D: un bloque con el dibujo del 2D encima
function generico(t) { const g = new THREE.Group(); const top = new THREE.MeshStandardMaterial({ map: texturaSvg(A.objSvg(t), 256, '#e8e2d4') }); const lado = mat('#bdb5a2'); const m = new THREE.Mesh(new THREE.BoxGeometry(.78, .34, .78), [lado, lado, top, lado, lado, lado]); m.position.y = .17; m.castShadow = m.receiveShadow = true; g.add(m); return g; }

/* ---------- figuritas de los personajes ---------- */
function figura(id) {
  const g = new THREE.Group(), color = K.PERSONAJES[id].color;
  const base = cil(.34, .38, .08, color, 0, .04, 0, 32); g.add(base);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(.4, .035, 8, 40), new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb000', emissiveIntensity: .9 }));
  aro.rotation.x = Math.PI / 2; aro.position.y = .05; aro.visible = false; g.add(aro);
  const carta = new THREE.Group(); carta.position.y = .62; carta.scale.setScalar(1.25); carta.rotation.order = 'YXZ'; g.add(carta);
  const borde = new THREE.Mesh(new THREE.CircleGeometry(.4, 40), new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide })); borde.castShadow = true; carta.add(borde);
  const cara = new THREE.Mesh(new THREE.CircleGeometry(.36, 40), new THREE.MeshStandardMaterial({ map: texturaSvg(A.cara(id), 256, color, true), transparent: true }));
  cara.position.z = .004; carta.add(cara);
  const dorso = cara.clone(); dorso.rotation.y = Math.PI; dorso.position.z = -.004; carta.add(dorso);
  const palo = cil(.03, .03, .2, '#e8e8f0', 0, .14, 0, 8); g.add(palo);
  g.userData = { id, aro, carta, base };
  g.traverse((o) => { o.userData.ficha = id; });
  return g;
}
const texX = lienzo(128, 128, (g, w) => { g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.lineCap = 'round'; g.shadowColor = 'rgba(20,16,44,.9)'; g.shadowBlur = 6; g.beginPath(); g.moveTo(30, 30); g.lineTo(98, 98); g.moveTo(98, 30); g.lineTo(30, 98); g.stroke(); });
const texVista = lienzo(128, 128, (g, w) => { g.strokeStyle = 'rgba(18,14,40,.5)'; g.lineWidth = 7; for (let i = -w; i < w * 2; i += 20) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - w, w); g.stroke(); } });
const texNotas = {};
const notaTex = (id, ini) => texNotas[id] || (texNotas[id] = lienzo(128, 128, (g) => { g.fillStyle = K.PERSONAJES[id].color; g.strokeStyle = '#14102c'; g.lineWidth = 8; g.beginPath(); g.roundRect(8, 8, 112, 112, 22); g.fill(); g.stroke(); g.fillStyle = '#14102c'; g.font = `bold ${ini.length > 2 ? 44 : ini.length > 1 ? 56 : 72}px "Chakra Petch", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ini, 64, 70); }));

/* ---------- escena ---------- */
function construir(c, contenedor, o) {
  caso = c; n = c.size; cont = contenedor; opts = o || {};
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    controles();
    new ResizeObserver(tamano).observe(cont);
    renderer.setAnimationLoop(cuadro);
  }
  cont.innerHTML = ''; cont.appendChild(renderer.domElement);
  capaHtml = document.createElement('div'); capaHtml.className = 'capa3d'; cont.appendChild(capaHtml);
  scene = new THREE.Scene(); raiz = new THREE.Group(); scene.add(raiz);
  celdas = []; fichas = {}; marcas = {}; notasM = {}; vistasM = []; sombraSalas = [];

  // luces: cálidas de oficina
  hemi = new THREE.HemisphereLight('#fff4e0', '#3a3550', 1.15); scene.add(hemi);
  sol = new THREE.DirectionalLight('#fff1d6', 1.9); sol.position.set(-6, 12, 7); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); const s = n * .75 + 1; Object.assign(sol.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 40 }); sol.shadow.bias = -.0015; sol.shadow.radius = 4;
  scene.add(sol);
  focoLuz = new THREE.SpotLight('#ffe9a8', 0, 0, Math.PI / 7, .5, 1); focoLuz.position.set(0, 9, 0); scene.add(focoLuz, focoLuz.target);

  // mesa sobre la que está la maqueta
  const base = caja(n + 1.1, .4, n + 1.1, '#2a2340', 0, -.26, 0); base.receiveShadow = true; raiz.add(base);
  raiz.add(caja(n + 1.3, .08, n + 1.3, '#1d1933', 0, -.5, 0));

  for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
    const sala = c.rooms[r][cc];
    const piso = new THREE.Mesh(new THREE.BoxGeometry(1, .06, 1), [mat('#cfc7b5'), mat('#cfc7b5'), mat('#ffffff', { map: pisoTex(c.salas[sala].piso) }), mat('#cfc7b5'), mat('#cfc7b5'), mat('#cfc7b5')]);
    piso.position.set(X(cc), -.03, Z(r)); piso.receiveShadow = true; piso.userData.celda = [r, cc]; raiz.add(piso); celdas.push(piso);
    const ob = K.objAt(c, r, cc);
    if (ob) {
      if (K.OBJ_INFO[ob.t].pisable) { const al = new THREE.Mesh(new THREE.PlaneGeometry(.92, .92), new THREE.MeshStandardMaterial({ map: texturaSvg(A.objSvg(ob.t), 256), transparent: true })); al.rotation.x = -Math.PI / 2; al.position.set(X(cc), .005, Z(r)); al.receiveShadow = true; raiz.add(al); }
      else { const m = (MUEBLES[ob.t] || (() => generico(ob.t)))(); m.position.set(X(cc), 0, Z(r)); m.rotation.y = ((r * 7 + cc * 3) % 4) * Math.PI / 2 * 0 + (((r + cc) % 2) ? .08 : -.06); m.traverse((x) => { if (x.isMesh) { x.castShadow = x.receiveShadow = true; x.userData.celda = [r, cc]; } }); raiz.add(m); }
    }
    // capas por casilla: rayado de "vista", ✕ y sombra del final
    const v = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texVista, transparent: true, depthWrite: false })); v.rotation.x = -Math.PI / 2; v.position.set(X(cc), .012, Z(r)); v.visible = false; raiz.add(v); vistasM.push(v);
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#0b0820', transparent: true, opacity: 0, depthWrite: false })); sm.rotation.x = -Math.PI / 2; sm.position.set(X(cc), .018, Z(r)); sm.renderOrder = 5; sm.userData.sala = sala; raiz.add(sm); sombraSalas.push(sm);
  }
  // paredes: bajas entre habitaciones, más altas en el borde (así no tapan el tablero)
  const pared = mat('#efe6d2'), tope = mat('#3a3350');
  const muro = (x, z, largo, vertical, alto) => { const g = new THREE.Group(); const w = caja(vertical ? .09 : largo, alto, vertical ? largo : .09, pared, 0, alto / 2, 0); const t = caja(vertical ? .11 : largo + .02, .035, vertical ? largo + .02 : .11, tope, 0, alto + .017, 0); g.add(w, t); g.position.set(x, 0, z); raiz.add(g); };
  for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
    if (cc < n - 1 && c.rooms[r][cc] !== c.rooms[r][cc + 1]) muro(X(cc) + .5, Z(r), 1.09, true, .34);
    if (r < n - 1 && c.rooms[r][cc] !== c.rooms[r + 1][cc]) muro(X(cc), Z(r) + .5, 1.09, false, .34);
  }
  const h = n / 2;
  muro(0, -h, n + .18, false, .62); muro(0, h, n + .18, false, .22); muro(-h, 0, n + .18, true, .44); muro(h, 0, n + .18, true, .44);

  // resaltado al pasar el mouse
  hoverM = new THREE.Mesh(new THREE.PlaneGeometry(.94, .94), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .28, depthWrite: false })); hoverM.rotation.x = -Math.PI / 2; hoverM.position.y = .014; hoverM.visible = false; raiz.add(hoverM);

  // carteles HTML: habitaciones y coordenadas (texto nítido, se reposicionan cada cuadro)
  carteles = [];
  for (const [sala, e] of Object.entries(K.etiquetas(c))) carteles.push({ el: etiqueta('eti3d', c.salas[sala].nombre), p: new THREE.Vector3(X(e.c) + (e.len - 1) / 2, .02, Z(e.r) + .4) });
  for (let i = 0; i < n; i++) {
    carteles.push({ el: etiqueta('coord3d', K.LETRAS[i]), p: new THREE.Vector3(X(i), .65, -h - .5) });
    carteles.push({ el: etiqueta('coord3d', String(i + 1)), p: new THREE.Vector3(-h - .5, .45, Z(i)) });
  }
  carteles.push({ el: etiqueta('norte3d', '▲ NORTE'), p: new THREE.Vector3(0, .65, -h - 1.05) });
  vista('inclinada', true); tamano();
}
let carteles = [];
const etiqueta = (cls, txt) => { const e = document.createElement('i'); e.className = cls; e.textContent = txt; capaHtml.appendChild(e); return e; };

/* ---------- estado → escena ---------- */
function pintar(s) {
  const vic = s.victima;
  // figuritas
  for (const id of Object.keys(fichas)) if (!s.pos[id]) { raiz.remove(fichas[id]); delete fichas[id]; }
  for (const [id, [r, cc]] of Object.entries(s.pos)) {
    let f = fichas[id];
    if (!f) { f = fichas[id] = figura(id); f.position.set(X(cc), 1.6, Z(r)); raiz.add(f); animar(f.position, 'y', 0, .32, 'rebote'); }
    else if (f.userData.r !== r || f.userData.c !== cc) { f.position.x = X(cc); f.position.z = Z(r); }
    f.userData.r = r; f.userData.c = cc;
    f.userData.aro.visible = s.choque.includes(id);
    f.userData.aro.material.color.set(s.choque.includes(id) ? '#ff1f3d' : '#ffd23f'); f.userData.aro.material.emissive.set(s.choque.includes(id) ? '#ff1f3d' : '#ffb000');
    f.userData.victima = id === vic; f.userData.caida = s.fin && id === vic;
  }
  // ✕
  for (const k of Object.keys(marcas)) if (!s.marcas[k] || quien(s, k)) { raiz.remove(marcas[k]); delete marcas[k]; }
  for (const k of Object.keys(s.marcas)) if (!marcas[k] && !quien(s, k)) { const [r, cc] = k.split(',').map(Number); const m = new THREE.Mesh(new THREE.PlaneGeometry(.62, .62), new THREE.MeshBasicMaterial({ map: texX, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(X(cc), .03, Z(r)); raiz.add(m); marcas[k] = m; }
  // notas en las esquinas
  for (const k of Object.keys(notasM)) { notasM[k].forEach((m) => raiz.remove(m)); delete notasM[k]; }
  for (const [k, arr] of Object.entries(s.notas)) {
    if (quien(s, k)) continue; const [r, cc] = k.split(',').map(Number); notasM[k] = [];
    arr.forEach((id, i) => { if (!id) return; const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ map: notaTex(id, s.ini[id]), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(X(cc) + (i % 2 ? .3 : -.3), .035, Z(r) + (i < 2 ? -.3 : .3)); raiz.add(m); notasM[k].push(m); });
  }
  // casillas "vistas" (alguien ya ocupa su fila o columna)
  const filas = new Set(Object.values(s.pos).map((p) => p[0])), cols = new Set(Object.values(s.pos).map((p) => p[1]));
  vistasM.forEach((v, i) => { const r = Math.floor(i / n), cc = i % n; v.visible = !s.fin && !quien(s, r + ',' + cc) && !K.bloqueada(caso, r, cc) && (filas.has(r) || cols.has(cc)); });
  seleccion = s.sel;
  for (const f of Object.values(fichas)) f.userData.base.material.emissive?.set(f.userData.id === s.sel ? '#665500' : '#000000');
}
let seleccion = null;
const quien = (s, k) => Object.keys(s.pos).find((id) => s.pos[id][0] + ',' + s.pos[id][1] === k);

function escena(sala) {
  sombraSalas.forEach((m) => animar(m.material, 'opacity', sala && m.userData.sala !== sala ? .45 : 0, .8));
  animar(hemi, 'intensity', sala ? .35 : 1.15, 1); animar(sol, 'intensity', sala ? .45 : 1.9, 1);
  if (sala) {
    const cs = []; for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) if (caso.rooms[r][cc] === sala) cs.push([X(cc), Z(r)]);
    const cx = cs.reduce((a, p) => a + p[0], 0) / cs.length, cz = cs.reduce((a, p) => a + p[1], 0) / cs.length;
    focoLuz.position.set(cx, 8, cz + 1); focoLuz.target.position.set(cx, 0, cz); focoLuz.angle = Math.PI / 6; focoLuz.penumbra = .6; focoLuz.decay = 0; animar(focoLuz, 'intensity', 4.5, 1.2);
  } else animar(focoLuz, 'intensity', 0, .6);   // reemplaza cualquier animación pendiente del foco
}
function temblar(r, cc) { const base = raiz.position.x; let t = 0; const id = setInterval(() => { t++; raiz.position.x = base + (t < 8 ? Math.sin(t * 2.4) * .06 : 0); if (t >= 8) clearInterval(id); }, 30); }

/* ---------- cámara: inclinada con giro limitado; botón cenital ---------- */
function vista(tipo, inmediato) {
  cam.azObj = 0; cam.polObj = tipo === 'cenital' ? .01 : 38;
  if (inmediato) { cam.az = cam.azObj; cam.pol = cam.polObj; }
  if (cont && cont.clientWidth) { const r = cam.radio, m = cam.mira; ajustarRadio(); if (!inmediato) { cam.radioObj = cam.radio; cam.radio = r; cam.miraObj = cam.mira; cam.mira = m; } }
}
function posCam(c, radio, az, pol) {
  const a = THREE.MathUtils.degToRad(az), p = THREE.MathUtils.degToRad(Math.max(.01, pol));
  c.position.set(radio * Math.sin(p) * Math.sin(a), radio * Math.cos(p), radio * Math.sin(p) * Math.cos(a) + cam.mira);
  c.up.set(0, 1, 0); if (pol < 1) c.up.set(-Math.sin(a), 0, -Math.cos(a));
  c.lookAt(0, 0, cam.mira); c.updateMatrixWorld();
}
// encuadre: proyecta las esquinas del tablero (con sus carteles) y ajusta distancia y centro hasta que todo quepa
function ajustarRadio() {
  const h = n / 2 + .6, prueba = camera.clone(), pts = [];
  for (const x of [-h, h]) for (const z of [-h, h]) for (const y of [-.1, .6]) pts.push(new THREE.Vector3(x, y, z));
  let radio = n * 3; cam.mira = 0;
  for (let it = 0; it < 6; it++) {
    posCam(prueba, radio, cam.azObj, cam.polObj);
    let minY = 9, maxY = -9, maxX = 0;
    for (const p of pts) { const q = p.clone().project(prueba); minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); maxX = Math.max(maxX, Math.abs(q.x)); }
    const alto = (maxY - minY) / 2, cy = (maxY + minY) / 2;
    radio *= Math.max(alto, maxX) / .96;
    cam.mira -= cy * (n / 2) * (cam.polObj < 1 ? 0 : 1) * .9;   // corrige el centro vertical
  }
  cam.radioBase = radio; cam.min = radio * .55; cam.max = radio * 1.4;
  cam.radio = cam.radioObj = radio; cam.miraObj = cam.mira;
}
function tamano() {
  const w = cont.clientWidth, h = cont.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
  camera.aspect = w / h; camera.updateProjectionMatrix(); ajustarRadio();
}
function controles() {
  const el = renderer.domElement, ptrs = new Map(); let ini = null, pinch = 0, movido = false;
  el.style.touchAction = 'pan-y';   // en el celular: deslizar vertical = scroll de la página; horizontal = girar; dos dedos = acercar
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) { ini = { x: e.clientX, y: e.clientY, az: cam.azObj, pol: cam.polObj, t: performance.now() }; movido = false; } else { pinch = dist(); movido = true; } });
  el.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) { hover(e); return; }
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) { const d = dist(); cam.radioObj = THREE.MathUtils.clamp(cam.radioObj * pinch / d, cam.min, cam.max); pinch = d; return; }
    const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
    if (Math.hypot(dx, dy) > 7) movido = true;
    if (movido) { cam.azObj = THREE.MathUtils.clamp(ini.az - dx * .25, -38, 38); if (e.pointerType === 'mouse') cam.polObj = THREE.MathUtils.clamp(ini.pol - dy * .25, .01, 62); }
  });
  const fin = (e) => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (ptrs.size === 0 && !movido && ini && performance.now() - ini.t < 700) tocar(e);
  };
  el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', (e) => { ptrs.delete(e.pointerId); ini = null; });
  el.addEventListener('pointerleave', () => { if (hoverM) hoverM.visible = false; });
  el.addEventListener('wheel', (e) => { e.preventDefault(); cam.radioObj = THREE.MathUtils.clamp(cam.radioObj * (1 + Math.sign(e.deltaY) * .1), cam.min, cam.max); }, { passive: false });
  const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
}
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
function celdaEn(e) {
  const b = renderer.domElement.getBoundingClientRect();
  v2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
  ray.setFromCamera(v2, camera);
  for (const h of ray.intersectObjects(raiz.children, true)) {
    let o = h.object; while (o && !o.userData.celda && !o.userData.ficha) o = o.parent;
    if (!o) continue;
    if (o.userData.ficha) { const f = fichas[o.userData.ficha]; if (f) return [f.userData.r, f.userData.c]; }
    if (o.userData.celda) return o.userData.celda;
  }
  return null;
}
function tocar(e) { const rc = celdaEn(e); if (rc && opts.alTocar) opts.alTocar(rc[0], rc[1], e); }
function hover(e) { if (e.pointerType !== 'mouse') return; const rc = celdaEn(e); hoverM.visible = !!rc; if (rc) hoverM.position.set(X(rc[1]), .014, Z(rc[0])); renderer.domElement.style.cursor = rc ? (K.bloqueada(caso, rc[0], rc[1]) ? 'not-allowed' : 'pointer') : 'grab'; }

/* ---------- animación ---------- */
function animar(obj, prop, hasta, dur, tipo) { animaciones = animaciones.filter((a) => !(a.obj === obj && a.prop === prop)); animaciones.push({ obj, prop, desde: obj[prop], hasta, dur, t: 0, tipo }); }
const suave = (t) => 1 - Math.pow(1 - t, 3);
const rebote = (t) => { const n1 = 7.5625, d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + .75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + .9375; return n1 * (t -= 2.625 / d1) * t + .984375; };
const vp = new THREE.Vector3();
function cuadro() {
  if (!scene || document.hidden) return;
  const dt = Math.min(.05, reloj.getDelta()), t = reloj.elapsedTime;
  animaciones = animaciones.filter((a) => { a.t = Math.min(1, a.t + dt / a.dur); a.obj[a.prop] = a.desde + (a.hasta - a.desde) * (a.tipo === 'rebote' ? rebote(a.t) : suave(a.t)); return a.t < 1; });
  // cámara con inercia
  const k = 1 - Math.pow(.0015, dt);
  cam.az += (cam.azObj - cam.az) * k; cam.pol += (cam.polObj - cam.pol) * k; cam.radio += (cam.radioObj - cam.radio) * k;
  if (cam.miraObj != null) cam.mira += (cam.miraObj - cam.mira) * k;
  posCam(camera, cam.radio, cam.az, cam.pol);
  // figuritas: miran a la cámara (solo giran en Y); la seleccionada flota; la víctima cae al resolver
  for (const f of Object.values(fichas)) {
    const c = f.userData.carta;
    c.rotation.y = Math.atan2(camera.position.x - f.position.x, camera.position.z - f.position.z);
    const objX = f.userData.caida ? -1.35 : cam.pol < 20 ? -1.2 + cam.pol / 20 * 1.2 : 0;   // en vista cenital la carta se inclina para que se vea la cara
    c.rotation.x += (objX - c.rotation.x) * k;
    c.position.y = .62 + (f.userData.id === seleccion ? .12 + Math.sin(t * 5) * .05 : 0) - (f.userData.caida ? .3 : 0);
  }
  renderer.render(scene, camera);
  // carteles HTML
  const w = cont.clientWidth, h = cont.clientHeight;
  for (const c of carteles) { vp.copy(c.p).project(camera); c.el.style.transform = `translate(${(vp.x * .5 + .5) * w}px,${(-vp.y * .5 + .5) * h}px) translate(-50%,-50%)`; }
}

// para revisar el estado de la escena desde la consola (pruebas)
const inspeccionar = () => ({ fichas: Object.fromEntries(Object.entries(fichas).map(([id, f]) => [id, { r: f.userData.r, c: f.userData.c, aro: f.userData.aro.visible, rojo: f.userData.aro.material.color.getHexString(), caida: !!f.userData.caida }])), marcas: Object.keys(marcas), notas: Object.keys(notasM), vistas: vistasM.filter((v) => v.visible).length, foco: focoLuz.intensity, hemi: hemi.intensity, sol: sol.intensity, cam: { az: cam.azObj, pol: cam.polObj }, animando: animaciones.map((a) => (a.obj === focoLuz ? 'foco' : a.obj === hemi ? 'ambiente' : a.obj === sol ? 'sol' : 'otro') + '.' + a.prop + '→' + (+a.hasta).toFixed(2)) });
window.T3 = { construir, pintar, escena, temblar, vista, inspeccionar, _tocar: (r, c) => opts.alTocar(r, c, { clientX: 200, clientY: 200 }) };
window.dispatchEvent(new Event('t3-listo'));
