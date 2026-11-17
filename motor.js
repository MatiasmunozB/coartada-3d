/* COARTADA — motor de lógica (compartido por el juego, el generador y el verificador) */
(function (root) {
  const OBJ_INFO = {
    maquina: { nombre: 'Máquina de curación', de: 'de una máquina de curación', pisable: false },
    pc: { nombre: 'PC', de: 'de una PC', pisable: false },
    estante: { nombre: 'Estante', de: 'de un estante', pisable: false },
    mesa: { nombre: 'Mesa', de: 'de una mesa', pisable: false },
    arbol: { nombre: 'Árbol', de: 'de un árbol', pisable: false },
    roca: { nombre: 'Roca', de: 'de una roca', pisable: false },
    nevera: { nombre: 'Nevera', de: 'de una nevera', pisable: false },
    planta: { nombre: 'Planta', de: 'de una planta', pisable: false },
    estatua: { nombre: 'Estatua', de: 'de una estatua', pisable: false },
    caja: { nombre: 'Caja', de: 'de una caja', pisable: false },
    lapida: { nombre: 'Lápida', de: 'de una lápida', pisable: false },
    traga: { nombre: 'Tragamonedas', de: 'de una tragamonedas', pisable: false },
    barril: { nombre: 'Barril', de: 'de un barril', pisable: false },
    sofa: { nombre: 'Sofá', de: 'de un sofá', pisable: false },
    tele: { nombre: 'Televisor', de: 'de un televisor', pisable: false },
    copiadora: { nombre: 'Fotocopiadora', de: 'de una fotocopiadora', pisable: false },
    archivador: { nombre: 'Archivador', de: 'de un archivador', pisable: false },
    dispensador: { nombre: 'Dispensador de agua', de: 'del dispensador de agua', pisable: false },
    capsula: { nombre: 'Nave cápsula', de: 'de una nave cápsula', pisable: false },
    esfera: { nombre: 'Esfera del dragón', de: 'de una esfera del dragón', pisable: false },
    fogata: { nombre: 'Fogata', de: 'de una fogata', pisable: false },
    remolachas: { nombre: 'Cajón de betarragas', de: 'del cajón de betarragas de Dwight', pisable: false },
    dundie: { nombre: 'Vitrina de Dundies', de: 'de la vitrina de los Dundies', pisable: false },
    duff: { nombre: 'Barril de Duff', de: 'de un barril de Duff', pisable: false },
    rosquillas: { nombre: 'Caja de rosquillas', de: 'de una caja de rosquillas', pisable: false },
    nave: { nombre: 'Nave de Freezer', de: 'de la nave de Freezer', pisable: false },
    gungi: { nombre: 'Tablero de Gungi', de: 'de un tablero de Gungi', pisable: false },
    trono: { nombre: 'Trono', de: 'del trono', pisable: false },
    cofre: { nombre: 'Cofre', de: 'de un cofre', pisable: false },
    nube: { nombre: 'Nube voladora', de: 'de la nube voladora', sobre: 'sobre la nube voladora', pisable: true },
    colchoneta: { nombre: 'Colchoneta', de: 'de una colchoneta', sobre: 'sobre una colchoneta', pisable: true },
    agua: { nombre: 'Agua', de: 'del agua', sobre: 'dentro del agua', pisable: true },
    hierba: { nombre: 'Hierba alta', de: 'de la hierba alta', sobre: 'entre la hierba alta', pisable: true },
    alfombra: { nombre: 'Alfombra', de: 'de una alfombra', sobre: 'sobre una alfombra', pisable: true },
  };
  const PERSONAJES = {
    snorlax: { nombre: 'Snorlax', color: '#3f8496' }, pikachu: { nombre: 'Pikachu', color: '#f5c518' },
    meowth: { nombre: 'Meowth', color: '#d9c48f' }, squirtle: { nombre: 'Squirtle', color: '#4aa3e0' },
    charmander: { nombre: 'Charmander', color: '#f0803c' }, bulbasaur: { nombre: 'Bulbasaur', color: '#5fbf7a' },
    jigglypuff: { nombre: 'Jigglypuff', color: '#f59ac0' }, gengar: { nombre: 'Gengar', color: '#7a56b0' },
    psyduck: { nombre: 'Psyduck', color: '#f2c230' }, ditto: { nombre: 'Ditto', color: '#b98ae0' },
    voltorb: { nombre: 'Voltorb', color: '#e8413c' }, diglett: { nombre: 'Diglett', color: '#b5793a' },
    oddish: { nombre: 'Oddish', color: '#5878b8' }, eevee: { nombre: 'Eevee', color: '#c88a4a' },
    slowpoke: { nombre: 'Slowpoke', color: '#f08fb0' }, geodude: { nombre: 'Geodude', color: '#9a9a8a' },
    cubone: { nombre: 'Cubone', color: '#c8a070' },
    rattata: { nombre: 'Rattata', color: '#a06cc0' }, chansey: { nombre: 'Chansey', color: '#f7a8c4' },
    growlithe: { nombre: 'Growlithe', color: '#f08a3c' }, zubat: { nombre: 'Zubat', color: '#5a8fd8' },
    sandshrew: { nombre: 'Sandshrew', color: '#e0c060' }, staryu: { nombre: 'Staryu', color: '#d8a23c' },
    horsea: { nombre: 'Horsea', color: '#6ab8e8' }, krabby: { nombre: 'Krabby', color: '#f0703c' },
    pidgey: { nombre: 'Pidgey', color: '#c89a60' }, seel: { nombre: 'Seel', color: '#dfe8f4' },
    gastly: { nombre: 'Gastly', color: '#8a5cc0' }, vulpix: { nombre: 'Vulpix', color: '#d8703c' },
    abra: { nombre: 'Abra', color: '#e8c840' }, koffing: { nombre: 'Koffing', color: '#9a78c0' },
    caterpie: { nombre: 'Caterpie', color: '#7ac850' }, mankey: { nombre: 'Mankey', color: '#e8d8b8' },
    magnemite: { nombre: 'Magnemite', color: '#a8b8c8' }, dratini: { nombre: 'Dratini', color: '#7a9ae8' },
    mew: { nombre: 'Mew', color: '#f8a8d0' },
    ash: { nombre: 'Ash', color: '#e33b3b' }, misty: { nombre: 'Misty', color: '#f59a3c' }, brock: { nombre: 'Brock', color: '#8a9a50' },
    oak: { nombre: 'Oak', color: '#c8ccd8' }, jessie: { nombre: 'Jessie', color: '#d8408a' }, james: { nombre: 'James', color: '#7a7ae0' },
    // Springfield
    homero: { nombre: 'Homero', color: '#ffffff' }, marge: { nombre: 'Marge', color: '#7ac850' }, bart: { nombre: 'Bart', color: '#f0603c' },
    lisa: { nombre: 'Lisa', color: '#e8508a' }, maggie: { nombre: 'Maggie', color: '#6ab8e8' }, abuelo: { nombre: 'Abuelo', color: '#b8a888' },
    skinner: { nombre: 'Skinner', color: '#6a7ab0' }, milhouse: { nombre: 'Milhouse', color: '#b060d0' }, nelson: { nombre: 'Nelson', color: '#e8903c' },
    gorgory: { nombre: 'Gorgory', color: '#3b5fa8' }, moe: { nombre: 'Moe', color: '#8f97a8' }, barney: { nombre: 'Barney', color: '#c06a8a' },
    lenny: { nombre: 'Lenny', color: '#5fbf9a' }, carl: { nombre: 'Carl', color: '#d8b03c' }, krusty: { nombre: 'Krusty', color: '#3fbfb0' },
    burns: { nombre: 'Burns', color: '#5a8a5a' }, smithers: { nombre: 'Smithers', color: '#8a6ad0' }, flanders: { nombre: 'Flanders', color: '#3fa55a' },
    frink: { nombre: 'Prof. Frink', color: '#6ab8e8' },
    // Scranton
    michael: { nombre: 'Michael', color: '#3b5fa8' }, dwight: { nombre: 'Dwight', color: '#c9a227' }, jim: { nombre: 'Jim', color: '#8fa8c8' },
    pam: { nombre: 'Pam', color: '#f4a8c0' }, angela: { nombre: 'Angela', color: '#e8dcb0' }, kevin: { nombre: 'Kevin', color: '#b05a4a' },
    creed: { nombre: 'Creed', color: '#7a8a7a' }, toby: { nombre: 'Toby', color: '#a8a078' }, meredith: { nombre: 'Meredith', color: '#3fa58a' },
    stanley: { nombre: 'Stanley', color: '#b08a4a' }, oscar: { nombre: 'Oscar', color: '#6a9ad8' }, andy: { nombre: 'Andy', color: '#c2152b' },
    kelly: { nombre: 'Kelly', color: '#ff7ab0' }, ryan: { nombre: 'Ryan', color: '#5a5a6a' }, darryl: { nombre: 'Darryl', color: '#3a8ab0' },
    // Guerreros Z
    goku: { nombre: 'Gokú', color: '#f28c28' }, vegeta: { nombre: 'Vegeta', color: '#2a4fb0' }, gohan: { nombre: 'Gohan', color: '#8a5ad0' },
    piccolo: { nombre: 'Piccolo', color: '#6a3fb0' }, krilin: { nombre: 'Krilin', color: '#e8603c' }, bulma: { nombre: 'Bulma', color: '#3fc0c8' },
    roshi: { nombre: 'Roshi', color: '#e8a03c' }, yamcha: { nombre: 'Yamcha', color: '#d8703c' }, satan: { nombre: 'Satán', color: '#7a3a1a' },
    trunks: { nombre: 'Trunks', color: '#b8a0e0' }, a18: { nombre: 'N.º 18', color: '#5ab0e0' }, freezer: { nombre: 'Freezer', color: '#b070d0' },
    cell: { nombre: 'Cell', color: '#7ab04a' }, milk: { nombre: 'Milk', color: '#c05ab0' }, buu: { nombre: 'Buu', color: '#f4a6c0' },
    // Hunter × Hunter
    gon: { nombre: 'Gon', color: '#3fa55a' }, killua: { nombre: 'Killua', color: '#9ab8e8' }, kurapika: { nombre: 'Kurapika', color: '#5a8ad8' },
    leorio: { nombre: 'Leorio', color: '#2a3a6a' }, hisoka: { nombre: 'Hisoka', color: '#e8508a' }, illumi: { nombre: 'Illumi', color: '#6a5a8a' },
    netero: { nombre: 'Netero', color: '#e8e0c8' }, bisky: { nombre: 'Bisky', color: '#f2c230' }, chrollo: { nombre: 'Chrollo', color: '#3a3a4a' },
    tonpa: { nombre: 'Tonpa', color: '#c8905a' }, wing: { nombre: 'Wing', color: '#8a7ab0' }, zushi: { nombre: 'Zushi', color: '#e8603c' },
    meruem: { nombre: 'Meruem', color: '#5ab08a' }, komugi: { nombre: 'Komugi', color: '#b0c8e8' }, alluka: { nombre: 'Alluka', color: '#f08fb0' },
    machi: { nombre: 'Machi', color: '#d870c0' }, knuckle: { nombre: 'Knuckle', color: '#7a6a5a' }, ging: { nombre: 'Ging', color: '#c0603a' },
    // Tierra Media
    frodo: { nombre: 'Frodo', color: '#5a8a4a' }, sam: { nombre: 'Sam', color: '#c8a050' }, gandalf: { nombre: 'Gandalf', color: '#a8a8b8' },
    aragorn: { nombre: 'Aragorn', color: '#5a6a4a' }, legolas: { nombre: 'Legolas', color: '#8ac85a' }, gimli: { nombre: 'Gimli', color: '#c0603a' },
    boromir: { nombre: 'Boromir', color: '#b0302a' }, merry: { nombre: 'Merry', color: '#e8a03c' }, pippin: { nombre: 'Pippin', color: '#6ab0d8' },
    gollum: { nombre: 'Gollum', color: '#b8c098' }, bilbo: { nombre: 'Bilbo', color: '#d8b070' }, elrond: { nombre: 'Elrond', color: '#8a5ab0' },
    theoden: { nombre: 'Théoden', color: '#c9a227' }, eowyn: { nombre: 'Éowyn', color: '#e8e0b0' }, saruman: { nombre: 'Saruman', color: '#f4f4f4' },
    barbol: { nombre: 'Bárbol', color: '#7a5a3a' },
  };
  const nom = (id) => PERSONAJES[id].nombre;
  const LETRAS = 'ABCDEFGHIJKL';
  const celdaNombre = (r, c) => LETRAS[c] + (r + 1);

  const objAt = (caso, r, c) => caso.objs.find((o) => o.r === r && o.c === c) || null;
  const bloqueada = (caso, r, c) => { const o = objAt(caso, r, c); return !!(o && !OBJ_INFO[o.t].pisable); };
  const roomAt = (caso, r, c) => caso.rooms[r][c];
  const partes = (p) => (p.tipo === 'todas' ? p.de : [p]);
  const esUnaria = (q) => !q.con && q.tipo !== 'solo' && q.tipo !== 'acompanado';

  // Evalúa una pista. pos = {id:[r,c]} (puede ser parcial para pistas unarias/binarias)
  function evalPista(caso, pista, id, pos) {
    const [r, c] = pos[id];
    const enMiSala = () => Object.keys(pos).filter((k) => k !== id && roomAt(caso, pos[k][0], pos[k][1]) === roomAt(caso, r, c)).length;
    const o = pista.con ? pos[pista.con] : null;
    switch (pista.tipo) {
      case 'libre': return true;
      case 'sobre': { const ob = objAt(caso, r, c); return !!ob && ob.t === pista.obj; }
      // "al lado" = comparte un lado Y está en la misma habitación (las paredes separan)
      case 'junto': return caso.objs.some((ob) => ob.t === pista.obj && Math.abs(ob.r - r) + Math.abs(ob.c - c) === 1 && caso.rooms[ob.r][ob.c] === caso.rooms[r][c]);
      case 'sala': return roomAt(caso, r, c) === pista.sala;
      case 'salaO': return pista.salas.includes(roomAt(caso, r, c));
      case 'fila': return r === pista.n;
      case 'columna': return c === pista.n;
      case 'acompanado': return enMiSala() >= 1;
      case 'solo': return enMiSala() === 0;
      case 'mismaSala': return roomAt(caso, r, c) === roomAt(caso, o[0], o[1]);
      case 'norte': return r < o[0];
      case 'sur': return r > o[0];
      case 'oeste': return c < o[1];
      case 'este': return c > o[1];
      case 'diagonal': return Math.abs(r - o[0]) === 1 && Math.abs(c - o[1]) === 1;
      case 'todas': return pista.de.every((p) => evalPista(caso, p, id, pos));
      default: throw new Error('Tipo de pista desconocido: ' + pista.tipo);
    }
  }

  // Texto de la coartada
  function fraseParte(caso, q) {
    switch (q.tipo) {
      case 'sobre': return `<b>${OBJ_INFO[q.obj].sobre}</b>`;
      case 'junto': return `justo al lado <b>${OBJ_INFO[q.obj].de}</b>`;
      case 'sala': return `<b>${caso.salas[q.sala].en}</b>`;
      case 'salaO': return q.salas.map((s) => `<b>${caso.salas[s].en}</b>`).join(' o ');
      case 'fila': return `en la <b>fila ${q.n + 1}</b>`;
      case 'columna': return `en la <b>columna ${LETRAS[q.n]}</b>`;
      case 'mismaSala': return `en la <b>misma habitación que ${nom(q.con)}</b>`;
      case 'norte': return `<b>más al norte</b> (más arriba) que <b>${nom(q.con)}</b>`;
      case 'sur': return `<b>más al sur</b> (más abajo) que <b>${nom(q.con)}</b>`;
      case 'oeste': return `<b>más al oeste</b> (más a la izquierda) que <b>${nom(q.con)}</b>`;
      case 'este': return `<b>más al este</b> (más a la derecha) que <b>${nom(q.con)}</b>`;
      case 'diagonal': return `en una casilla <b>en diagonal, contigua a la de ${nom(q.con)}</b>`;
    }
  }
  function textoPista(caso, p) {
    if (p.texto) return p.texto;
    const q = p.pista;
    if (q.tipo === 'libre') return 'Es la víctima: no tiene coartada. Ocupa <b>la casilla que quede libre</b> cuando ubiques al resto.';
    if (q.tipo === 'acompanado') return '<b>Compartía habitación</b> con alguien más.';
    if (q.tipo === 'solo') return '<b>No había nadie más</b> en su habitación.';
    return 'Estaba ' + partes(q).map((x) => fraseParte(caso, x)).join(', ') + '.';
  }

  // Valida una ubicación (completa o parcial). Devuelve qué personajes fallan.
  function validar(caso, pos) {
    const ids = caso.personajes.map((p) => p.id);
    const fallos = new Set();
    for (const a of ids) for (const b of ids)
      if (a < b && pos[a] && pos[b] && (pos[a][0] === pos[b][0] || pos[a][1] === pos[b][1])) { fallos.add(a); fallos.add(b); }
    const completo = ids.every((i) => pos[i]);
    if (completo) for (const p of caso.personajes) if (!evalPista(caso, p.pista, p.id, pos)) fallos.add(p.id);
    return { completo, ok: completo && fallos.size === 0, fallos: [...fallos] };
  }

  // Culpable = quien está a solas con la víctima en su habitación
  function culpable(caso, pos) {
    const v = caso.personajes.find((p) => p.victima).id;
    const sala = roomAt(caso, pos[v][0], pos[v][1]);
    const otros = Object.keys(pos).filter((k) => k !== v && roomAt(caso, pos[k][0], pos[k][1]) === sala);
    return otros.length === 1 ? otros[0] : null;
  }

  function libres(caso) {
    const out = [];
    for (let r = 0; r < caso.size; r++) for (let c = 0; c < caso.size; c++) if (!bloqueada(caso, r, c)) out.push([r, c]);
    return out;
  }
  function candidatosUnarios(caso) {
    const L = libres(caso), cands = {};
    for (const p of caso.personajes)
      cands[p.id] = L.filter((rc) => partes(p.pista).every((q) => !esUnaria(q) || evalPista(caso, q, p.id, { [p.id]: rc })));
    return cands;
  }

  // Fuerza bruta: todas las soluciones (usa SOLO filas/columnas + coartadas; no la regla del culpable)
  function soluciones(caso, limite = 2) {
    const P = caso.personajes, cands = candidatosUnarios(caso);
    const orden = [...P].sort((a, b) => cands[a.id].length - cands[b.id].length);
    const pos = {}, F = new Set(), C = new Set(), out = [];
    const okParcial = () => {
      for (const p of P) {
        if (!pos[p.id]) continue;
        for (const q of partes(p.pista)) {
          if (q.con) { if (pos[q.con] && !evalPista(caso, q, p.id, pos)) return false; }
          else if (q.tipo === 'solo' && !evalPista(caso, q, p.id, pos)) return false;
        }
      }
      return true;
    };
    (function rec(i) {
      if (out.length >= limite) return;
      if (i === orden.length) { if (P.every((p) => evalPista(caso, p.pista, p.id, pos))) out.push(JSON.parse(JSON.stringify(pos))); return; }
      const id = orden[i].id;
      for (const [r, c] of cands[id]) {
        if (F.has(r) || C.has(c)) continue;
        pos[id] = [r, c]; F.add(r); C.add(c);
        if (okParcial()) rec(i + 1);
        F.delete(r); C.delete(c); delete pos[id];
        if (out.length >= limite) return;
      }
    })(0);
    return out;
  }

  // Solver "humano": deduce paso a paso; cuando se traba, prueba una hipótesis (sondeo) y busca la contradicción.
  function resolverLogico(caso) {
    const n = caso.size, P = caso.personajes, ids = P.map((p) => p.id);
    const R = (i) => Math.floor(i / n), C = (i) => i % n, sala = (i) => caso.rooms[R(i)][C(i)];
    const pista = {}; for (const p of P) pista[p.id] = partes(p.pista);
    const cu = candidatosUnarios(caso), totalLibres = libres(caso).length;
    const cand = {}; for (const id of ids) cand[id] = new Set(cu[id].map(([r, c]) => r * n + c));
    const razones = {}, pasos = [], fijo = new Set(), elim = {};
    let sondeos = 0;
    const nota = (id, r) => { (razones[id] = razones[id] || []); if (!razones[id].includes(r)) razones[id].push(r); };
    for (const id of ids) if (cand[id].size < totalLibres) nota(id, `su coartada solo deja ${cand[id].size} ${cand[id].size === 1 ? 'casilla posible' : 'casillas posibles'}`);
    const lista = (s) => { const a = [...s].sort((x, y) => x - y).map((c) => celdaNombre(R(c), C(c))); return a.length <= 3 ? a.join(' o ') : a.length + ' casillas'; };
    // por qué se descartó cada casilla, agrupado (para las pistas)
    const descartes = (id, final) => {
      const g = new Map();
      for (const [r, c] of cu[id]) {
        const i = r * n + c; if (i === final) continue;
        const why = (elim[id] && elim[id][i]) || 'queda descartada por las demás';
        if (!g.has(why)) g.set(why, []); g.get(why).push(celdaNombre(r, c));
      }
      return [...g].map(([razon, celdas]) => ({ razon, celdas }));
    };
    const registrar = () => {
      for (const id of ids) if (cand[id].size === 1 && !fijo.has(id)) {
        fijo.add(id); const c = [...cand[id]][0];
        pasos.push({ id, r: R(c), c: C(c), razones: (razones[id] || []).slice(-4), inicial: cu[id].map(([a, b]) => celdaNombre(a, b)), descartes: descartes(id, c) });
      }
    };
    function propagar(cd, anota, alIterar) {
      let cambio = true;
      const quitar = (id, pred, razon) => {
        let q = false;
        for (const c of [...cd[id]]) if (pred(c)) { cd[id].delete(c); q = true; if (anota) { elim[id] = elim[id] || {}; if (!elim[id][c]) elim[id][c] = typeof razon === 'function' ? razon(c) : razon; } }
        if (q) { cambio = true; if (anota && typeof razon !== 'function') anota(id, razon); }
      };
      while (cambio) {
        cambio = false;
        if (alIterar) alIterar();
        for (const id of ids) if (!cd[id].size) return { ok: false, quien: id };
        for (const id of ids) {
          const fs = new Set([...cd[id]].map(R)), cs = new Set([...cd[id]].map(C));
          const quien = cd[id].size === 1 ? `ya es de ${nom(id)} (${lista(cd[id])})` : `es de ${nom(id)}: solo puede estar en ${lista(cd[id])}`;
          if (fs.size === 1) { const f = [...fs][0]; for (const o of ids) if (o !== id) quitar(o, (c) => R(c) === f, `la fila ${f + 1} ${quien}`); }
          if (cs.size === 1) { const k = [...cs][0]; for (const o of ids) if (o !== id) quitar(o, (c) => C(c) === k, `la columna ${LETRAS[k]} ${quien}`); }
        }
        for (let f = 0; f < n; f++) {
          const q = ids.filter((id) => [...cd[id]].some((c) => R(c) === f));
          if (!q.length) return { ok: false, fila: f };
          if (q.length === 1) quitar(q[0], (c) => R(c) !== f, `la fila ${f + 1} necesita a alguien y nadie más puede ir ahí, así que ${nom(q[0])} tiene que estar en la fila ${f + 1}`);
          const q2 = ids.filter((id) => [...cd[id]].some((c) => C(c) === f));
          if (!q2.length) return { ok: false, col: f };
          if (q2.length === 1) quitar(q2[0], (c) => C(c) !== f, `la columna ${LETRAS[f]} necesita a alguien y nadie más puede ir ahí, así que ${nom(q2[0])} tiene que estar en la columna ${LETRAS[f]}`);
        }
        for (const id of ids) for (const q of pista[id]) {
          if (q.con) {
            const y = q.con;
            const par = (c, d) => R(d) !== R(c) && C(d) !== C(c) && evalPista(caso, q, id, { [id]: [R(c), C(c)], [y]: [R(d), C(d)] });
            quitar(id, (c) => ![...cd[y]].some((d) => par(c, d)), () => `ahí no cumpliría su coartada con ninguna casilla que le queda a ${nom(y)} (${lista(cd[y])})`);
            quitar(y, (d) => ![...cd[id]].some((c) => par(c, d)), () => `si estuviera ahí, ${nom(id)} no podría cumplir su coartada (a ${nom(id)} le queda ${lista(cd[id])})`);
          } else if (q.tipo === 'acompanado') {
            quitar(id, (c) => !ids.some((o) => o !== id && [...cd[o]].some((d) => sala(d) === sala(c) && R(d) !== R(c) && C(d) !== C(c))), 'ahí no tendría compañía: nadie más puede estar en esa habitación');
          } else if (q.tipo === 'solo') {
            quitar(id, (c) => ids.some((o) => o !== id && [...cd[o]].every((d) => sala(d) === sala(c))), (c) => `${caso.salas[sala(c)].nombre} ya tiene a alguien seguro, y no compartía habitación`);
            const ss = new Set([...cd[id]].map(sala));
            if (ss.size === 1) { const s = [...ss][0]; for (const o of ids) if (o !== id) quitar(o, (d) => sala(d) === s, `${nom(id)} estaba en ${caso.salas[s].nombre} sin nadie más`); }
          }
        }
      }
      return { ok: true };
    }
    let res = propagar(cand, nota, registrar);
    registrar();
    let avance = res.ok;
    while (avance && ids.some((id) => cand[id].size > 1)) {
      avance = false;
      const orden = ids.filter((id) => cand[id].size > 1).sort((a, b) => cand[a].size - cand[b].size);
      busca: for (const id of orden) for (const c of [...cand[id]]) {
        const cl = {}; for (const k of ids) cl[k] = new Set(cand[k]);
        cl[id] = new Set([c]);
        const r = propagar(cl);
        if (!r.ok) {
          cand[id].delete(c); sondeos++;
          const porque = r.quien ? `${nom(r.quien)} se quedaría sin ninguna casilla posible` : r.fila != null ? `la fila ${r.fila + 1} quedaría sin nadie` : `la columna ${LETRAS[r.col]} quedaría sin nadie`;
          elim[id] = elim[id] || {}; elim[id][c] = `prueba ponerlo ahí: siguiendo las reglas, ${porque}`;
          nota(id, `no puede estar en ${celdaNombre(R(c), C(c))}: ${porque}`);
          res = propagar(cand, nota, registrar); registrar();
          avance = res.ok; break busca;
        }
      }
    }
    const pos = {}; let completo = res.ok;
    for (const id of ids) { if (cand[id].size !== 1) completo = false; else { const c = [...cand[id]][0]; pos[id] = [R(c), C(c)]; } }
    return { ok: completo && validar(caso, pos).ok, pasos, sondeos, pos };
  }

  /* Una coartada es "coherente" si no menciona nada imposible:
     - cada habitación que nombra (sala / "X o Y") tiene al menos una casilla libre que cumple el resto de la coartada
       (p. ej. "en la Cocina o en Ventas, al lado de una mesa" exige una mesa utilizable EN la Cocina y EN Ventas)
     - cada objeto que nombra existe en el mapa y la coartada se puede cumplir en alguna casilla */
  function pistaCoherente(caso, pista) {
    const ps = partes(pista), L = libres(caso);
    const cumple = (r, c, salvo) => ps.every((x) => x === salvo || !esUnaria(x) || x.tipo === 'libre' || evalPista(caso, x, '_', { _: [r, c] }));
    for (const q of ps) {
      if (q.obj && !caso.objs.some((o) => o.t === q.obj)) return false;
      const salas = q.tipo === 'salaO' ? q.salas : q.tipo === 'sala' ? [q.sala] : null;
      if (salas) for (const s of salas) if (!L.some(([r, c]) => caso.rooms[r][c] === s && cumple(r, c, q))) return false;
    }
    return L.some(([r, c]) => cumple(r, c, null));
  }

  /* Dónde va el cartel con el nombre de cada habitación: el tramo horizontal (hasta 3 casillas) de la habitación
     con más ancho y menos objetos debajo. Si solo cabe en 1 casilla, el cartel usa 2 de ancho para no cortarse. */
  function etiquetas(caso) {
    const n = caso.size, out = {};
    for (const s of Object.keys(caso.salas)) {
      let mejor = null;
      for (let r = 0; r < n; r++) for (let a = 0; a < n; a++) {
        if (caso.rooms[r][a] !== s) continue;
        for (let L = 1; L <= 3 && a + L <= n && caso.rooms[r][a + L - 1] === s; L++) {
          let objs = 0; for (let k = a; k < a + L; k++) if (objAt(caso, r, k)) objs++;
          const score = Math.min(L, 2) * 10 + L - objs * 3;
          if (!mejor || score > mejor.score) mejor = { r, c: a, len: L, score };
        }
      }
      const nombre = caso.salas[s].nombre.toUpperCase();
      let { r, c, len } = mejor;
      if (len === 1) { len = 2; if (c === n - 1) c--; }
      out[s] = { r, c, len, palabra: Math.max(...nombre.split(/\s+/).map((w) => w.length)), total: nombre.length };
    }
    return out;
  }
  // tamaño de letra (px) que usa el cartel para un tamaño de casilla dado (mismo cálculo que el CSS del juego)
  const letraEtiqueta = (e, cell) => Math.max(6, Math.min(cell * 0.105, (cell * e.len - 10) / (e.palabra * 0.78), ((cell * e.len - 10) * 2) / (e.total * 0.78)));

  // Iniciales únicas por caso: el prefijo más corto del nombre que no se repita
  function iniciales(caso) {
    const nombres = caso.personajes.map((p) => nom(p.id).replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/g, '')), out = {};
    caso.personajes.forEach((p, i) => {
      let n = 1;
      while (n < nombres[i].length && nombres.some((o, j) => j !== i && o.slice(0, n).toLowerCase() === nombres[i].slice(0, n).toLowerCase())) n++;
      out[p.id] = nombres[i].slice(0, n);
    });
    return out;
  }

  const api = { OBJ_INFO, PERSONAJES, LETRAS, nom, celdaNombre, objAt, bloqueada, roomAt, partes, esUnaria, evalPista, textoPista, validar, culpable, libres, soluciones, resolverLogico, iniciales, pistaCoherente, etiquetas, letraEtiqueta };
  if (typeof window !== 'undefined') { api.CASOS = window.COARTADA_CASOS || []; window.COARTADA = api; }
  else module.exports = api;
})(this);
