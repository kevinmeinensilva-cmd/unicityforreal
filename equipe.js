
const EQUIPE = [
    { nome: 'Angelo', cargo: 'Gerente do Painel de Administração', desc: 'Competente em tudo o que assume. Se surge um problema, ele resolve.', foto: 'angelo.jpg', fala: 'Bom, sou alegre, nunca fico triste, e tento deixar todo mundo irritado e gosto de deixar as pessoas felizes e satisfeitas.' },
    { nome: 'Alexandre', cargo: 'Funcionário da Recepção Administrativa', desc: 'Legal e divertido: faz do check-in o primeiro bom momento da viagem.', foto: 'alexandre.jpg', fala: 'Não tenho nada além da minha tristeza, e nada mais desejo. Ela tem sido — e ainda é — fiel a mim. Por que haveria de me queixar dela, se, nos momentos em que minha alma esmagava as profundezas do meu coração, ela estava ali, sentada ao meu lado? Ó tristeza, acabei, veja bem, por respeitá-la, pois tenho a certeza de que você jamais me deixará...' },
    { nome: 'Kevin', cargo: 'Responsavél pela Segurança do Hotel', desc: 'Gente boa e sempre pronto para ajudar, do café da manhã até a saída.', foto: 'kevin.jpg', fala: 'Um homem cuja origem foi selada pelo destino mortal de um plebeu.' },
    { nome: 'Matheus', cargo: 'Chefe de Cozinha', desc: 'Fantástico no que faz, com um ar misterioso de castelo da Transilvânia.', foto: 'matheus.jpg', fala: 'Um dia enquanto ainda morava na transilvania meu tatatataravô dracula me levou pra um quarto e quando eu vi no quarto não tinha nada lá' },
    { nome: 'Safira', cargo: 'Estratégia e operações', desc: 'Estrategista: planeja cada detalhe antes mesmo de o hóspede chegar.', foto: 'safira.jpg', fala: '' },
    { nome: 'Melissa', cargo: 'Análise e qualidade', desc: 'Analítica: confere os números e cuida para que tudo funcione do jeito certo.', foto: 'melissa.jpg', fala: '' },
    { nome: 'Eduardo', cargo: 'Coringa da equipe', desc: 'Imprevisível e cheio de ideias inesperadas, o que deixa o dia a dia mais divertido.', foto: 'eduardo.jpg', fala: '' }];

(() => {
    const box = document.getElementById('equipe'); if (!box) return;
    const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e };
    const foto = (p, g) => {
        const w = el('div', 'foto-eq' + (g ? ' grande' : ''));
        const av = () => { const a = el('div', 'av', p.nome[0]); a.setAttribute('aria-hidden', 'true'); return a };
        const i = new Image(); i.alt = 'Foto de ' + p.nome; i.src = '' + p.foto;
        i.onerror = () => i.replaceWith(av()); w.append(i); return w
    };
    const fala = p => p.fala.trim() ? '“' + p.fala.trim() + '”' : 'A fala de ' + p.nome + ' entra em cena aqui.';
    EQUIPE.forEach((p, n) => {
        const c = el('button', 'pessoa c' + (n % 4)); c.type = 'button';
        const q = el('p', 'fala' + (p.fala.trim() ? '' : ' vazia'), fala(p));
        c.append(foto(p), el('h3', '', p.nome), el('p', 'cargo', p.cargo), el('p', '', p.desc), q, el('span', 'cena', 'Ver em cena'));
        c.onclick = () => cena(p); box.append(c)
    });
    const d = document.createElement('dialog'); d.className = 'modal palco'; d.setAttribute('aria-label', 'Em cena'); document.body.append(d);
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('.x')) d.close() });
    function cena(p) {
        d.replaceChildren();
        const x = el('button', 'x', '×'); x.setAttribute('aria-label', 'Fechar');
        const t = el('div', 'texto');
        t.append(el('small', '', p.cargo), el('h2', '', p.nome), el('blockquote', p.fala.trim() ? '' : 'vazia', fala(p)));
        d.append(x, foto(p, true), t); d.showModal()
    }
})();
