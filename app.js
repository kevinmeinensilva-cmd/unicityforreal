const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } };
const sair = () => { try { localStorage.removeItem('sessao') } catch { } };
const sessao = ler('sessao', null);

const topo = $('.topo'), nav = $('nav');
if (topo) {
  const rolar = () => topo.classList.toggle('solido', scrollY > 40); rolar(); addEventListener('scroll', rolar, { passive: true });
  $('.burger')?.addEventListener('click', e => { const o = nav.classList.toggle('aberto'); e.currentTarget.setAttribute('aria-expanded', o) });
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('aberto') });
  const btn = $('nav .entrar');
  if (sessao && btn) {
    btn.textContent = 'Sair (' + sessao.nome.split(' ')[0] + ')'; btn.href = '#';
    btn.addEventListener('click', e => { e.preventDefault(); sair(); location.href = 'index.html' })
  }
}

$$('.abas button').forEach(b => b.addEventListener('click', () => {
  $$('.abas button').forEach(x => x.setAttribute('aria-pressed', x === b));
  $$('.quarto').forEach(q => q.hidden = b.dataset.f !== 'todos' && q.dataset.t !== b.dataset.f)
}));

const ci = $('#entrada'), co = $('#saida');
if (ci) {
  const hoje = new Date().toISOString().slice(0, 10); ci.min = co.min = hoje;
  ci.addEventListener('change', () => { co.min = ci.value; if (co.value < ci.value) co.value = ci.value })
}
$('#reserva')?.addEventListener('submit', e => {
  e.preventDefault(); const a = $('#aviso');
  if (!ci.value || !co.value) { a.textContent = 'Escolha as datas de entrada e saída.'; return }
  const tp = $('#tipo'); if (tp && !tp.value) { a.textContent = 'Escolha o tipo de quarto.'; return }
  if (tp && rest(tp.value) < 1) { dispTipo(); return }
  const n = Math.max(1, Math.round((new Date(co.value) - new Date(ci.value)) / 864e5));
  a.textContent = `Disponível! ${n} ${n > 1 ? 'diárias' : 'diária'} para ${$('#hospedes').value}. ` + (sessao ? 'Reserva pré-confirmada, ' + sessao.nome.split(' ')[0] + '!' : 'Entre na sua conta para confirmar.')
});

const form = $('form[data-modo]');
if (form) {
  const msg = $('.msg', form), modo = form.dataset.modo;
  const erro = t => { msg.style.color = '#a3262a'; msg.textContent = t };
  const ok = t => { msg.style.color = ''; msg.textContent = t; setTimeout(() => location.href = ler('pendente', null) ? 'quartos.html' : 'index.html', 900) };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase(), senha = form.senha.value, contas = ler('contas', []);
    const conta = contas.find(c => c.email === email);
    if (modo === 'cadastro') {
      if (senha.length < 6) return erro('A senha precisa ter pelo menos 6 caracteres.');
      if (conta) return erro('Este e-mail já tem conta. Use a opção Entrar.');
      const nova = { nome: form.nome.value.trim(), email, senha };
      gravar('contas', [...contas, nova]); gravar('sessao', { nome: nova.nome, email });
      ok('Conta criada! Entrando…');
    } else {
      if (!conta) return erro('Não encontramos esse e-mail. Cadastre-se primeiro.');
      if (conta.senha !== senha) return erro('Senha incorreta. Tente de novo.');
      gravar('sessao', { nome: conta.nome, email }); ok('Bem-vindo de volta, ' + conta.nome.split(' ')[0] + '!');
    }
  })
}

const Q = {}; // preenchido por Dados.quartos() (veja dados.js)
// lazer e serviços: inc = incluso na diária; por = como o preço é cobrado
const X = [
  { id: 'academia', n: 'Academia', d: 'Musculação e cardio, aberta das 6h às 22h.', inc: 1 },
  { id: 'piscinas', n: 'Piscinas', d: 'Três piscinas, com espreguiçadeiras e toalhas.', inc: 1 },
  { id: 'cafe', n: 'Café da manhã', d: 'Buffet completo, das 6h30 às 10h30.', inc: 1 },
  { id: 'jantar', n: 'Jantar no restaurante', d: 'Menu de três tempos no salão do hotel, com mesa reservada.', p: 120, por: 'pessoa' },
  { id: 'spa', n: 'Massagem relaxante', d: '50 minutos no spa, com horário marcado no primeiro dia.', p: 260, por: 'adulto' },
  { id: 'transfer', n: 'Transfer do aeroporto', d: 'Carro com motorista esperando na sua chegada.', p: 150, por: 'reserva' },
  { id: 'late', n: 'Saída até as 16h', d: 'Fique mais tempo no quarto no dia da saída.', p: 90, por: 'reserva' }];
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const rest = id => Q[id]?.livres ?? 0;
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function etiquetas() {
  $$('[data-cap]').forEach(e => e.textContent = 'Até ' + plural(Q[e.dataset.cap].cap, 'hóspede', 'hóspedes'));
  $$('[data-resta]').forEach(e => { const r = rest(e.dataset.resta); e.textContent = r ? (r === 1 ? 'Resta 1 quarto' : 'Restam ' + r + ' quartos') : 'Esgotado'; e.classList.toggle('esgotado', !r) })
}
const card = (id, q) => `<article class="quarto" data-id="${id}" data-t="${q.t === 'VIP' ? 'vip' : 'padrao'}"><div class="foto"><img src="${q.img}" alt="${esc(q.n)}" loading="lazy">${q.t === 'VIP' ? '<span class="selo">VIP</span>' : ''}</div><div class="info"><h3>${esc(q.n)}</h3><p>${esc(q.d || '')}</p><p class="meta"><span data-cap="${id}"></span><span class="resta" data-resta="${id}"></span></p><div class="preco"><small>a partir de</small><strong>R$ ${q.p.toLocaleString('pt-BR')}<small> /noite</small></strong></div><button class="btn escolher" type="button" data-acao="abrir" data-id="${id}">Escolher este quarto</button></div></article>`;
async function carregar() {
  const g = $('[data-quartos]');
  try { Object.assign(Q, await Dados.quartos()) }
  catch (err) { if (g) g.innerHTML = '<p class="nao">Não foi possível carregar os quartos agora. Tente novamente.</p>'; return false }
  if (g) g.innerHTML = Object.entries(Q).map(([id, q]) => card(id, q)).join('');
  const t = $('#tipo');
  if (t) {
    const v = t.value; t.innerHTML = '<option value="">Escolha o tipo</option>' + Object.entries(Q).map(([id, q]) => `<option value="${id}">${esc(q.n)} (${q.t})</option>`).join(''); t.value = v;
    t.onchange = dispTipo; dispTipo()
  }
  etiquetas(); return true
}
function dispTipo() {
  const t = $('#tipo'), a = $('#aviso'); if (!t || !a) return;
  const q = Q[t.value]; if (!q) { a.textContent = ''; return }
  const r = rest(t.value);
  a.textContent = r ? `${q.n}: ${r === 1 ? '1 quarto disponível' : r + ' quartos disponíveis'} (de ${q.qtd}) · até ${plural(q.cap, 'hóspede', 'hóspedes')} · ${brl(q.p)} por noite.` : `${q.n}: esgotado no momento.`
}
const dlg = document.createElement('dialog'); dlg.className = 'modal'; dlg.setAttribute('aria-labelledby', 'mt'); document.body.append(dlg);
let S;
const noites = () => S.ci && S.co ? Math.round((new Date(S.co) - new Date(S.ci)) / 864e5) : 0;
const fmt = d => new Date(d + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const qtdX = x => x.por === 'pessoa' ? S.ad + S.cr : x.por === 'adulto' ? S.ad : 1;
const porTxt = { pessoa: 'por pessoa', adulto: 'por adulto', reserva: 'por reserva' };
const escolhidos = () => X.filter(x => !x.inc && S.ex.includes(x.id));
const totalG = () => noites() * Q[S.id].p + escolhidos().reduce((s, x) => s + x.p * qtdX(x), 0);
function abrir(id, passo = 1, est = {}) { S = { id, ad: 2, cr: 0, ci: '', co: '', ex: [], passo, ...est }; desenhar(); dlg.showModal() }
const cab = () => { const q = Q[S.id]; return `<div class="m-cab"><img src="${q.img}" alt=""><div><small>${q.t}${S.passo < 5 ? ' · passo ' + S.passo + ' de 4' : ''}</small><h2 id="mt">${q.n}</h2></div><button class="x" data-acao="fechar" aria-label="Fechar">×</button></div>` };
const stepper = (l, sub, k) => `<div class="linha"><div><b>${l}</b><small>${sub}</small></div><div class="step"><button data-acao="${k}-" aria-label="Menos ${l}" ${S[k] <= (k === 'ad' ? 1 : 0) ? 'disabled' : ''}>−</button><output>${S[k]}</output><button data-acao="${k}+" aria-label="Mais ${l}" ${S[k] >= (k === 'ad' ? 6 : 4) ? 'disabled' : ''}>+</button></div></div>`;
function desenhar() {
  const y = dlg.scrollTop, q = Q[S.id], tot = S.ad + S.cr, r = rest(S.id); let h = cab() + '<div class="m-corpo">';
  if (S.passo === 1) {
    const cabe = tot <= q.cap && r > 0;
    const alt = Object.keys(Q).filter(i => i !== S.id && Q[i].cap >= tot && rest(i) > 0);
    h += `<h3>Para quantas pessoas é o quarto?</h3>${stepper('Adultos', '13 anos ou mais', 'ad')}${stepper('Crianças', 'de 0 a 12 anos', 'cr')}`;
    h += cabe ? `<p class="ok">✓ Disponível para ${plural(tot, 'pessoa', 'pessoas')}. ${r === 1 ? 'Resta 1 quarto' : 'Restam ' + r + ' quartos'} neste tipo.</p>`
      : `<p class="nao">${r ? `Este quarto acomoda até ${plural(q.cap, 'pessoa', 'pessoas')}.` : 'Este quarto está esgotado.'}</p>` +
      (alt.length ? `<p class="sug">Disponíveis para ${plural(tot, 'pessoa', 'pessoas')}:</p>${alt.map(i => `<button class="alt" data-acao="trocar" data-id="${i}"><span>${Q[i].n}<small>até ${Q[i].cap} pessoas</small></span><b>${brl(Q[i].p)}</b></button>`).join('')}` : '<p class="sug">Nenhum quarto livre para esse número de pessoas.</p>');
    h += `</div><div class="m-rod"><span><small>por noite</small><b>${brl(q.p)}</b></span><button class="btn" data-acao="ir2" ${cabe ? '' : 'disabled'}>Continuar</button></div>`;
  } else if (S.passo === 2) {
    const hoje = new Date().toISOString().slice(0, 10);
    h += `<h3>Quando você vai se hospedar?</h3><div class="datas"><label class="campo">Entrada<input type="date" id="mci" min="${hoje}" value="${S.ci}"></label><label class="campo">Saída<input type="date" id="mco" min="${S.ci || hoje}" value="${S.co}"></label></div><p class="resumo" id="mres"></p></div><div class="m-rod"><button class="btn claro" data-acao="ir1">Voltar</button><button class="btn" id="mgo" data-acao="ir3">Continuar</button></div>`;
  } else if (S.passo === 3) {
    h += `<h3>Lazer e serviços</h3><p class="sug">Já incluídos na sua estadia:</p><div class="incl">${X.filter(x => x.inc).map(x => `<div><b>${x.n}</b><small>${x.d}</small></div>`).join('')}</div><p class="sug" style="margin-top:8px">Adicione à sua reserva:</p>` +
      X.filter(x => !x.inc).map(x => { const on = S.ex.includes(x.id); return `<button class="extra" data-acao="ex" data-id="${x.id}" aria-pressed="${on}"><span class="chk">${on ? '✓' : ''}</span><span class="txt"><b>${x.n}</b><small>${x.d}</small></span><span class="vl">${brl(x.p)}<small>${porTxt[x.por]}</small></span></button>` }).join('');
    h += `</div><div class="m-rod"><span><small>total até agora</small><b>${brl(totalG())}</b></span><div class="acoes"><button class="btn claro" data-acao="ir2">Voltar</button><button class="btn" data-acao="ir4">Continuar</button></div></div>`;
  } else if (S.passo === 4) {
    const n = noites(), ex = escolhidos();
    h += `<h3>Confira sua reserva</h3><dl class="conf"><div><dt>Quarto</dt><dd>${q.n}</dd></div><div><dt>Hóspedes</dt><dd>${plural(S.ad, 'adulto', 'adultos')}${S.cr ? ', ' + plural(S.cr, 'criança', 'crianças') : ''}</dd></div><div><dt>Entrada</dt><dd>${fmt(S.ci)}</dd></div><div><dt>Saída</dt><dd>${fmt(S.co)}</dd></div><div><dt>${plural(n, 'diária', 'diárias')} × ${brl(q.p)}</dt><dd>${brl(n * q.p)}</dd></div>` +
      ex.map(x => `<div><dt>${x.n} (${qtdX(x)} × ${brl(x.p)})</dt><dd>${brl(x.p * qtdX(x))}</dd></div>`).join('') + `<div><dt>Total</dt><dd class="tot">${brl(totalG())}</dd></div></dl>`;
    h += sessao ? `<p class="ok">Reserva em nome de ${esc(sessao.nome)}.</p></div><div class="m-rod"><button class="btn claro" data-acao="ir3">Voltar</button><button class="btn" data-acao="confirmar">Confirmar reserva</button></div>`
      : `<p class="sug">Entre na sua conta para concluir. Sua escolha fica guardada.</p></div><div class="m-rod"><a class="btn claro" href="cadastro.html" data-acao="salvar">Criar conta</a><a class="btn" href="login.html" data-acao="salvar">Entrar</a></div>`;
  } else {
    h += `<div class="final"><div class="selo-ok">✓</div><h3>Reserva confirmada!</h3><p>${q.n} · ${fmt(S.ci)} a ${fmt(S.co)}</p><p class="cod">${S.cod}</p><p class="sug">Guarde este código para o check-in.</p></div>`;
    h += S.fbOk ? `<div class="fb"><p class="ok">Obrigado pelo seu feedback, ${esc(sessao.nome.split(' ')[0])}! Ele nos ajuda a melhorar.</p></div>`
      : `<div class="fb"><h4>Como foi reservar com a gente?</h4><div class="estrelas" role="group" aria-label="Nota de 1 a 5">${[1, 2, 3, 4, 5].map(i => `<button data-acao="nota" data-v="${i}" aria-label="${plural(i, 'estrela', 'estrelas')}" class="${i <= (S.nota || 0) ? 'on' : ''}">★</button>`).join('')}</div><label class="campo">Comentário (opcional)<textarea id="fbt" rows="3" placeholder="O que você gostou? O que podemos melhorar?">${esc(S.fb || '')}</textarea></label><button class="btn" data-acao="enviarfb" ${S.nota ? '' : 'disabled'}>Enviar feedback</button></div>`;
    h += `</div><div class="m-rod"><button class="btn" data-acao="fechar">Fechar</button></div>`;
  }
  dlg.innerHTML = h; if (S.passo === 2) resumo(); dlg.scrollTop = y;
}
function resumo() {
  const n = noites(), q = Q[S.id], ok = n > 0;
  $('#mres').innerHTML = ok ? `${plural(n, 'diária', 'diárias')} · <b>${brl(n * q.p)}</b>` : 'Escolha as duas datas para ver o valor.'; $('#mgo').disabled = !ok
}
dlg.addEventListener('change', e => {
  if (e.target.id === 'mci') { S.ci = e.target.value; $('#mco').min = S.ci; if (S.co <= S.ci) { S.co = ''; $('#mco').value = '' } }
  if (e.target.id === 'mco') S.co = e.target.value; if (S.passo === 2) resumo()
});
dlg.addEventListener('input', e => { if (e.target.id === 'fbt') S.fb = e.target.value });
dlg.addEventListener('click', e => {
  if (e.target === dlg) return dlg.close();
  const b = e.target.closest('[data-acao]'); if (!b) return; const a = b.dataset.acao;
  if (a === 'fechar') dlg.close();
  else if (a === 'salvar') { gravar('pendente', { id: S.id, ad: S.ad, cr: S.cr, ci: S.ci, co: S.co, ex: S.ex }) }
  else if (a === 'trocar') { S.id = b.dataset.id; desenhar() }
  else if (/^ir\d$/.test(a)) { S.passo = +a[2]; desenhar() }
  else if (a === 'ex') { const i = b.dataset.id; S.ex = S.ex.includes(i) ? S.ex.filter(x => x !== i) : [...S.ex, i]; desenhar() }
  else if (a === 'confirmar') {
    b.disabled = true;
    Dados.reservar({ id: S.id, ad: S.ad, cr: S.cr, ci: S.ci, co: S.co, ex: S.ex, total: totalG(), email: sessao.email })
      .then(async cod => { try { localStorage.removeItem('pendente') } catch { } S.cod = cod; S.passo = 5; await carregar(); desenhar() })
      .catch(err => { b.disabled = false; alert(err.message) })
  }
  else if (a === 'nota') { S.nota = +b.dataset.v; desenhar(); dlg.querySelector('#fbt')?.focus() }
  else if (a === 'enviarfb') { gravar('feedbacks', [...ler('feedbacks', []), { cod: S.cod, nome: sessao.nome, nota: S.nota, texto: (S.fb || '').trim() }]); S.fbOk = true; desenhar() }
  else if (/^(ad|cr)[+-]$/.test(a)) { S[a.slice(0, 2)] += a[2] === '+' ? 1 : -1; desenhar() }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-acao="abrir"]'); if (b) return abrir(b.dataset.id);
  const c = e.target.closest('.quarto'); if (c && !e.target.closest('a')) abrir(c.dataset.id)
});
if ($('.quarto') || $('[data-quartos]')) carregar().then(ok => {
  const pend = ler('pendente', null);
  if (ok && pend && sessao && Q[pend.id]) abrir(pend.id, 4, pend)
});

const avs = $('.avals');
if (avs) ler('feedbacks', []).filter(f => f.texto).slice(-3).forEach(f => {
  const d = document.createElement('div'); d.className = 'aval';
  const q = document.createElement('q'); q.textContent = f.texto;
  const st = document.createElement('span'); st.textContent = '★'.repeat(f.nota) + '☆'.repeat(5 - f.nota);
  const n = document.createElement('b'); n.textContent = f.nome; d.append(q, st, n); avs.append(d)
});
