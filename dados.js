/* ============================================================
   dados.js — ÚNICO arquivo que conversa com a fonte de dados.
   Para ligar ao banco: preencha CONFIG.API com a URL do seu
   servidor (ex.: 'https://meuhotel.com/api'). Vazio = modo local.
   ============================================================ */
const CONFIG = { API: '' };

// Catálogo usado só no modo local (demonstração).
const CATALOGO = {
  duplo:     { n: 'Standard Solteiro',  t: 'Padrão', cap: 3, qtd: 4, p: 280,  img: 'standard_solteiro.png', d: 'Camas de solteiro, ar-condicionado e silêncio para descansar de verdade.' },
  conforto:  { n: 'Standard Casal',     t: 'Padrão', cap: 2, qtd: 3, p: 340,  img: 'standard_casal.png',    d: 'Cama de casal, iluminação suave e roupa de cama premium.' },
  imperial:  { n: 'Superior',           t: 'VIP',    cap: 3, qtd: 2, p: 890,  img: 'superior.png',          d: 'Cama king, acabamentos em madeira e janelão com vista para o jardim.' },
  elegance:  { n: 'Família',            t: 'VIP',    cap: 4, qtd: 2, p: 1150, img: 'familia.png',           d: 'Três camas e espaço de sobra para toda a família descansar junta.' },
  premium:   { n: 'Suíte Luxo',         t: 'VIP',    cap: 4, qtd: 1, p: 1480, img: 'premium.jpg',           d: 'Dois ambientes, escada interna e bar privativo.' },
  exclusive: { n: 'Suíte Presidencial', t: 'VIP',    cap: 6, qtd: 1, p: 2100, img: 'exclusive.jpg',         d: 'Salão clássico com lustres, tapeçaria e sofás de veludo.' }
};

const lerLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };

const Dados = {
  /* Retorna { id: { n, t, cap, qtd, p, d, img, livres } }
     API esperada: GET {API}/quartos -> o mesmo formato acima. */
  async quartos() {
    if (CONFIG.API) {
      const r = await fetch(CONFIG.API + '/quartos');
      if (!r.ok) throw new Error('Falha ao carregar quartos (' + r.status + ')');
      return r.json();
    }
    const reservas = lerLS('reservas', []);
    const out = {};
    for (const [id, q] of Object.entries(CATALOGO))
      out[id] = { ...q, livres: Math.max(0, q.qtd - reservas.filter(r => r.id === id).length) };
    return out;
  },

  /* Cria a reserva e devolve o código.
     API esperada: POST {API}/reservas (JSON) -> { cod: 'UC-XXXXXX' }
     O servidor deve checar se ainda há quarto livre antes de gravar. */
  async reservar(dados) {
    if (CONFIG.API) {
      const r = await fetch(CONFIG.API + '/reservas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).erro || 'Não foi possível reservar.');
      return (await r.json()).cod;
    }
    const cod = 'UC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem('reservas', JSON.stringify([...lerLS('reservas', []), { cod, ...dados }]));
    return cod;
  }
};
