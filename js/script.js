/* ==========================================================
   INTERAÇÕES DO SITE
   Cada parte é uma função "iniciarAlgo()", chamada quando a página carrega.
   ========================================================== */

// const = constante (valor que não muda): e-mail que recebe o formulário de contato
const CONTATO_EMAIL = "conectasaber.oficial@gmail.com";

// DOMContentLoaded = espera o HTML carregar inteiro e só então liga cada parte do site
document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();
  iniciarFormulario();
  iniciarSimulacao();
  iniciarGuiaEmergencia();
  iniciarSeletores();
  iniciarGlossario();
  iniciarAtalhosGlossario();
  iniciarBlog();
  iniciarEscalaHome();
  iniciarCardsDemo();
  iniciarPassos();
  iniciarEvidencias();
});

/* ---------- Menu do celular ---------- */
// function = bloco de código com nome, executado quando for chamado
function iniciarMenu() {
  // querySelector = procura no HTML o primeiro elemento com esse seletor (igual ao CSS)
  const btn = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");
  // se a página não tiver menu, para aqui (return) para não dar erro
  if (!btn || !menu) return;
  // addEventListener("click") = "quando clicar no botão, faça isto"
  btn.addEventListener("click", () => {
    // classList.toggle = liga/desliga a classe "open" (o CSS mostra ou esconde o menu)
    const aberto = menu.classList.toggle("open");
    // aria-expanded = avisa leitores de tela se o menu está aberto
    btn.setAttribute("aria-expanded", aberto);
  });
}

/* ---------- Formulário de contato -> envia por e-mail ---------- */
function iniciarFormulario() {
  const form = document.getElementById("form-contato");
  if (!form) return;
  const status = document.getElementById("form-status");
  const botao = form.querySelector('button[type="submit"]');

  function mostrar(texto, erro) {
    status.className = "form-status" + (erro ? " err" : "");
    status.textContent = texto;
  }
  function abrirEmail(d) {
    const corpo = "Nome: " + d.nome + "\nAssunto: " + d.assunto + "\n\n" + d.mensagem;
    window.location.href = "mailto:" + CONTATO_EMAIL + "?subject=" + encodeURIComponent("Conecta Saber: " + d.assunto) + "&body=" + encodeURIComponent(corpo);
  }

  // "submit" = quando a pessoa envia o formulário
  form.addEventListener("submit", (e) => {
    // preventDefault = impede o navegador de recarregar a página; o envio é feito pelo JavaScript
    e.preventDefault();
    const d = {
      nome: form.nome.value.trim(),
      assunto: form.assunto.value,
      mensagem: form.mensagem.value.trim(),
    };
    // validação: se algum campo estiver vazio, mostra aviso e não envia
    if (!d.nome || !d.assunto || !d.mensagem) {
      mostrar("Preencha todos os campos para continuar.", true);
      return;
    }
    if (form.website && form.website.value) return; /* campo isca: robôs preenchem */
    // aberto direto do computador (file://), o serviço de envio recusa: usa o app de e-mail
    if (location.protocol === "file:") {
      mostrar("O envio automático só funciona com o site publicado. Abrindo o seu aplicativo de e-mail com a mensagem pronta…", true);
      abrirEmail(d);
      return;
    }
    botao.disabled = true;
    mostrar("Enviando…", false);
    // AbortController = cancela o envio se o serviço demorar mais de 20 segundos
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 20000);
    // fetch = faz uma requisição pela internet: manda os dados para o serviço FormSubmit, que repassa para o e-mail
    fetch("https://formsubmit.co/ajax/" + CONTATO_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controle.signal,
      // JSON.stringify = transforma os dados em texto no formato JSON para enviar
      body: JSON.stringify({
        Nome: d.nome,
        Assunto: d.assunto,
        Mensagem: d.mensagem,
        _subject: "Conecta Saber: " + d.assunto,
        _template: "table",
        _captcha: "false",
      }),
    })
      // .then = "quando a resposta chegar, faça isto"
      .then((r) => r.json())
      .then((r) => {
        if (String(r.success) === "true") {
          form.reset();
          mostrar("Mensagem enviada! Obrigado pelo contato.", false);
          return;
        }
        // primeiro uso: o FormSubmit pede que o dono do e-mail ative o formulário
        if (/activ/i.test(r.message || "")) {
          mostrar("O formulário ainda está sendo ativado. Tente novamente em alguns minutos ou escreva direto para " + CONTATO_EMAIL + ".", true);
          return;
        }
        throw new Error("falha");
      })
      // .catch = se der erro ou demorar demais, abre o app de e-mail com a mensagem pronta
      .catch(() => {
        mostrar("Não foi possível enviar agora. Abrindo o seu aplicativo de e-mail com a mensagem pronta…", true);
        abrirEmail(d);
      })
      .finally(() => { clearTimeout(limite); botao.disabled = false; });
  });
}

/* ---------- Simulação: dados ---------- */
// array (lista) com as 8 situações: texto, se é golpe ou não, explicação e sinais
const SITUACOES = [
  {
    origem: "SMS · número desconhecido",
    texto: "“Seu CPF será bloqueado hoje. Regularize agora em: gov-regulariza.xyz/cpf e evite multa.”",
    golpe: true,
    explicacao: "Este é um golpe de phishing.",
    sinais: ["Urgência e ameaça (“hoje”, “bloqueado”).", "Endereço que imita órgãos oficiais, mas não é um site do governo.", "Órgãos públicos não regularizam CPF por link enviado em SMS."],
  },
  {
    origem: "Aplicativo do banco · notificação",
    texto: "Você abriu o app oficial do seu banco, instalado pela loja de aplicativos, e recebeu o aviso: “Nova versão disponível. Atualize para continuar usando.”",
    golpe: false,
    explicacao: "Tende a ser legítimo.",
    sinais: ["O aviso apareceu dentro do aplicativo oficial, sem link externo.", "Não pede senha, código nem dados pelo aviso.", "Mesmo assim, atualize sempre pela loja oficial de aplicativos."],
  },
  {
    origem: "WhatsApp · número novo com a foto da sua mãe",
    texto: "“Oi, filho! Troquei de número, salva esse. Preciso pagar um boleto urgente e meu banco travou. Consegue fazer um Pix pra mim? Te devolvo amanhã.”",
    golpe: true,
    explicacao: "Este é o golpe do “parente com número novo”.",
    sinais: ["Número desconhecido usando foto de alguém próximo.", "Pedido de dinheiro com urgência.", "Antes de pagar, ligue para o número antigo ou faça uma chamada de voz para confirmar."],
  },
  {
    origem: "E-mail · remetente: atendimento@lojaexemplo.com.br",
    texto: "Você comprou um fone na Loja Exemplo ontem, pelo site digitado por você. Chegou o e-mail: “Seu pedido nº 48213 foi enviado. Acompanhe pela sua conta no site.”",
    golpe: false,
    explicacao: "Tende a ser legítimo.",
    sinais: ["Você realmente fez a compra.", "A mensagem não pede dados nem pagamento extra.", "Em caso de dúvida, acesse o site digitando o endereço, sem clicar no e-mail."],
  },
  {
    origem: "Anúncio em rede social",
    texto: "“Smartphone de última geração por R$ 199! Só hoje, estoque de 3 unidades. Pague por Pix e garanta o seu.”",
    golpe: true,
    explicacao: "Provável loja falsa.",
    sinais: ["Preço muito abaixo do mercado.", "Pressão de tempo e estoque “quase esgotado”.", "Pagamento só por Pix, sem proteção de plataforma ou cartão.", "Pesquise o CNPJ e a reputação da loja antes de comprar."],
  },
  {
    origem: "Mensagem · “recrutadora” de uma empresa",
    texto: "“Parabéns! Você foi aprovado(a) para a vaga, sem entrevista. Para liberar o contrato, pague a taxa de R$ 120 de uniforme e exames.”",
    golpe: true,
    explicacao: "Este é um golpe de falsa vaga de emprego.",
    sinais: ["Aprovação sem processo seletivo.", "Cobrança para começar a trabalhar.", "Empresas sérias não cobram taxas de candidatos."],
  },
  {
    origem: "Ligação · “central de segurança do banco”",
    texto: "“Identificamos uma compra suspeita no seu cartão. Para cancelar, informe o código que vai chegar por SMS e instale o aplicativo de segurança que vou indicar.”",
    golpe: true,
    explicacao: "Este é o golpe da falsa central de atendimento.",
    sinais: ["Bancos não pedem código de SMS nem senha por telefone.", "Pedido para instalar aplicativo de acesso remoto.", "Desligue e ligue você mesmo para o número oficial do banco, no verso do cartão."],
  },
  {
    origem: "Mensagem do seu banco, no app que você já usa",
    texto: "Você pediu a redefinição da sua senha e recebeu um código de verificação por SMS. Ele só funciona dentro do aplicativo, onde você mesmo o digita.",
    golpe: false,
    explicacao: "Tende a ser legítimo.",
    sinais: ["Você iniciou o pedido.", "O código é usado apenas por você, dentro do app oficial.", "Nunca informe esse código a terceiros, mesmo que digam ser do banco."],
  },
];

/* ---------- Simulação: funcionamento ---------- */
// mostra uma situação por vez, recebe a resposta e calcula a pontuação
function iniciarSimulacao() {
  const raiz = document.getElementById("quiz");
  if (!raiz) return;
  const total = SITUACOES.length;
  const barra = raiz.querySelector(".qz-track span");
  const trilho = raiz.querySelector(".qz-track");
  const pctTxt = document.getElementById("qz-pct");
  const num = document.getElementById("qz-num");
  const area = document.getElementById("quiz-area");
  const origem = document.getElementById("sit-origem");
  const texto = document.getElementById("sit-texto");
  const feedback = document.getElementById("quiz-feedback");
  const resultado = document.getElementById("quiz-resultado");
  const opcoes = Array.from(raiz.querySelectorAll(".qz-opt"));
  const anterior = document.getElementById("qz-prev");
  const proxima = document.getElementById("qz-next");
  const scorePct = document.getElementById("qz-score-pct");
  const scoreTxt = document.getElementById("qz-score-txt");
  const lista = document.getElementById("qz-list");

  // let = variável que pode mudar. indice = qual situação está na tela (começa na 0 = primeira)
  let indice = 0;
  // null = não respondida; "golpe" | "legitima" = resposta enviada
  let respostas = new Array(total).fill(null);

  // arrow function (=>): função curta. Confere se a resposta dada bate com o gabarito
  const acertou = (i) => respostas[i] !== null && (respostas[i] === "golpe") === SITUACOES[i].golpe;
  const respondidas = () => respostas.filter((r) => r !== null).length;
  const acertos = () => respostas.filter((r, i) => r !== null && acertou(i)).length;

  // navegação lateral
  // .map = percorre a lista e cria um botão no menu lateral para cada situação
  const itens = SITUACOES.map((_, i) => {
    // createElement = cria um elemento HTML novo pelo JavaScript
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qz-item";
    b.innerHTML = '<span class="qz-dot" aria-hidden="true"></span><span><span class="qz-w">Situação </span>' + (i + 1) + "</span>";
    b.addEventListener("click", () => { indice = i; mostrar(); });
    li.appendChild(b);
    lista.appendChild(li);
    return b;
  });

  function atualizarPainel() {
    const n = respondidas(), c = acertos();
    const pct = n ? Math.round((c / n) * 100) : 0;
    scorePct.textContent = pct + "%";
    scoreTxt.textContent = n === 0 ? "Nenhuma resposta enviada"
      : "Você acertou " + c + (c === 1 ? " resposta" : " respostas") + " de " + n + (n === 1 ? " respondida" : " respondidas");
    const prog = Math.round((n / total) * 100);
    // muda a largura da barra de progresso direto no estilo do elemento
    barra.style.width = prog + "%";
    trilho.setAttribute("aria-valuenow", prog);
    pctTxt.textContent = prog + "%";
    itens.forEach((b, i) => {
      const est = respostas[i] === null ? "nao" : acertou(i) ? "ok" : "no";
      b.dataset.estado = est;
      b.setAttribute("aria-label", "Situação " + (i + 1) + ": " + (est === "nao" ? "não respondida" : est === "ok" ? "resposta correta" : "resposta incorreta"));
      if (i === indice) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
  }

  function mostrar() {
    resultado.hidden = true;
    area.hidden = false;
    const s = SITUACOES[indice];
    num.textContent = "Situação " + (indice + 1) + "/" + total + ":";
    origem.textContent = s.origem;
    // textContent = troca o texto do elemento na tela
    texto.textContent = s.texto;
    const r = respostas[indice];
    // forEach = repete o mesmo código para cada botão de resposta
    opcoes.forEach((o) => {
      o.disabled = r !== null;
      o.classList.remove("ok", "no", "gabarito");
      if (r !== null) {
        const ehGolpe = o.dataset.resposta === "golpe";
        if (ehGolpe === s.golpe) o.classList.add("gabarito");
        if (o.dataset.resposta === r) o.classList.add(acertou(indice) ? "ok" : "no");
      }
    });
    if (r === null) {
      feedback.className = "qz-fb";
      feedback.innerHTML = "";
    } else {
      feedback.className = "qz-fb " + (acertou(indice) ? "ok" : "no");
      feedback.innerHTML =
        "<strong>" + (acertou(indice) ? "Você acertou! " : "Não foi dessa vez. ") + s.explicacao + "</strong>" +
        "<ul>" + s.sinais.map((x) => "<li>" + x + "</li>").join("") + "</ul>";
    }
    anterior.disabled = indice === 0;
    const ultima = indice === total - 1;
    proxima.textContent = ultima ? "Ver resultado" : "Próxima";
    // disabled = desativa o botão até responder tudo
    proxima.disabled = ultima && respondidas() < total;
    atualizarPainel();
  }

  function responder(valor) {
    if (respostas[indice] !== null) return;
    respostas[indice] = valor;
    mostrar();
  }

  function fim() {
    area.hidden = true;
    const c = acertos();
    const pct = Math.round((c / total) * 100);
    let msg = "Continue praticando: dúvida é um bom sinal. Releia a página “Conheça os golpes”.";
    // if / else if = escolhe a mensagem final conforme a porcentagem de acertos
    if (pct >= 80) msg = "Excelente! Você reconhece bem os sinais de alerta.";
    else if (pct >= 50) msg = "Bom começo! Revise os sinais de alerta para ficar ainda mais seguro(a).";
    resultado.hidden = false;
    resultado.innerHTML =
      '<p>Seu resultado</p><div class="qz-big">' + c + "/" + total + "</div><p>" + msg + "</p>" +
      '<p class="qz-res-btns"><button class="qz-btn qz-next" id="quiz-reiniciar" type="button">Refazer a simulação</button> ' +
      '<a class="qz-btn qz-prev" href="golpes.html">Conheça os golpes</a></p>';
    document.getElementById("quiz-reiniciar").addEventListener("click", () => {
      respostas = new Array(total).fill(null);
      indice = 0;
      mostrar();
    });
    atualizarPainel();
  }

  opcoes.forEach((o) => o.addEventListener("click", () => responder(o.dataset.resposta)));
  anterior.addEventListener("click", () => { if (indice > 0) { indice--; mostrar(); } });
  proxima.addEventListener("click", () => {
    if (indice === total - 1) { if (respondidas() === total) fim(); }
    else { indice++; mostrar(); }
  });
  mostrar();
}

/* ---------- Guia de emergência: filtro por tipo ---------- */
// cada botão mostra só o painel do seu tipo de golpe
function iniciarGuiaEmergencia() {
  const botoes = document.querySelectorAll(".type-btn");
  const paineis = document.querySelectorAll(".panel");
  if (!botoes.length) return;
  function selecionar(id) {
    botoes.forEach((b) => b.setAttribute("aria-pressed", b.dataset.alvo === id));
    // hidden = esconde os painéis que não são o escolhido
    paineis.forEach((p) => (p.hidden = p.id !== id));
  }
  botoes.forEach((b) => b.addEventListener("click", () => selecionar(b.dataset.alvo)));
  selecionar(botoes[0].dataset.alvo);
}

/* ---------- Glossário: busca e filtro por letra ---------- */
// cria os botões de A a Z e filtra os termos pela letra ou pela busca
function iniciarGlossario() {
  const lista = document.getElementById("lista-termos");
  if (!lista) return;
  const termos = Array.from(lista.querySelectorAll(".term"));
  const busca = document.getElementById("busca-termo");
  const vazio = document.getElementById("sem-resultado");
  const letras = document.getElementById("letras");
  // ao abrir a página, a letra A já vem selecionada
  let letraAtual = "A";

  const disponiveis = new Set(termos.map((t) => t.dataset.letra));
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((l) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Termos com a letra " + l);
    if (!disponiveis.has(l)) b.disabled = true;
    b.addEventListener("click", () => {
      letraAtual = letraAtual === l ? "" : l;
      filtrar();
    });
    letras.appendChild(b);
  });

  // normalizar = tira acentos e deixa minúsculo, para "Phishing" e "phishing" darem o mesmo resultado
  function normalizar(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  function filtrar() {
    const q = normalizar(busca.value.trim());
    let visiveis = 0;
    termos.forEach((t) => {
      const ok = q ? normalizar(t.textContent).includes(q) : (!letraAtual || t.dataset.letra === letraAtual);
      t.hidden = !ok;
      if (ok) visiveis++;
    });
    letras.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.textContent === letraAtual));
    vazio.hidden = visiveis > 0;
  }
  // "input" = a cada letra digitada na busca, filtra de novo
  busca.addEventListener("input", filtrar);
  filtrar();
}

/* ---------- Blog: abas por categoria e setas do carrossel ---------- */
// abas de categoria e setas que rolam o carrossel de notícias
function iniciarBlog() {
  const trilho = document.getElementById("blog-track");
  if (!trilho) return;
  const abas = document.querySelectorAll(".blog-tab");
  const posts = trilho.querySelectorAll(".post");
  const titulo = document.getElementById("blog-cat-title");
  const desc = document.getElementById("blog-cat-desc");

  function selecionar(aba) {
    abas.forEach((a) => a.setAttribute("aria-pressed", a === aba));
    titulo.textContent = aba.dataset.title;
    desc.textContent = aba.dataset.desc;
    // dataset.cat lê o atributo data-cat do HTML: só aparecem as notícias da categoria escolhida
    posts.forEach((p) => (p.hidden = p.dataset.cat !== aba.dataset.cat));
    trilho.scrollTo({ left: 0 });
  }
  abas.forEach((a) => a.addEventListener("click", () => selecionar(a)));
  if (abas.length) selecionar(abas[0]);

  const passo = () => (trilho.querySelector(".post:not([hidden])")?.offsetWidth || 250) + 18;
  document.getElementById("blog-prev").addEventListener("click", () => trilho.scrollBy({ left: -passo() }));
  // scrollBy = rola o carrossel um card para o lado
  document.getElementById("blog-next").addEventListener("click", () => trilho.scrollBy({ left: passo() }));
}

/* ---------- Página inicial: escala das seções ---------- */
// calcula a escala (--z) para as seções acompanharem o tamanho do layout
function iniciarEscalaHome() {
  if (!document.body.classList.contains("home")) return;
  const raiz = document.documentElement;
  function ajustar() {
    // mesmo limite (1,08x) usado no CSS da seção 2
    const largura = Math.min(window.innerWidth, 2125);
    // 1821px = largura útil do layout; 1120px = largura original do container
    const z = (1821 * (largura / 1967)) / 1120;
    // setProperty = o JavaScript escreve uma variável CSS, que o CSS usa em zoom:var(--z)
    raiz.style.setProperty("--z", z.toFixed(4));
  }
  ajustar();
  // "resize" = recalcula quando a janela muda de tamanho
  window.addEventListener("resize", ajustar);
}

/* ---------- Proteja-se: seletor dos hábitos (card → painel) ---------- */
// clicar em um card mostra o painel de detalhes correspondente
function iniciarSeletores() {
  document.querySelectorAll("[data-seletor]").forEach((raiz) => {
    const gatilhos = Array.from(raiz.querySelectorAll("[data-alvo]"));
    const paineis = Array.from(raiz.querySelectorAll("[data-painel]"));
    if (!gatilhos.length || !paineis.length) return;
    function selecionar(id, rolar) {
      gatilhos.forEach((g) => {
        const ativo = g.dataset.alvo === id;
        g.classList.toggle("on", ativo);
        if (ativo) g.setAttribute("aria-current", "true"); else g.removeAttribute("aria-current");
      });
      paineis.forEach((p) => (p.hidden = p.dataset.painel !== id));
      if (rolar) {
        const alvo = paineis.find((p) => p.dataset.painel === id);
        // no celular, rola suavemente até o painel aberto
        if (alvo && window.innerWidth < 900) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    gatilhos.forEach((g) => g.addEventListener("click", (e) => { e.preventDefault(); selecionar(g.dataset.alvo, true); }));
    selecionar(gatilhos[0].dataset.alvo, false);
  });
}

/* ---------- Glossário: atalhos do topo ---------- */
// levam direto ao termo e o destacam por 2,6 segundos
function iniciarAtalhosGlossario() {
  const lista = document.getElementById("lista-termos");
  if (!lista) return;
  function ir(id) {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const busca = document.getElementById("busca-termo");
    if (busca && busca.value) { busca.value = ""; busca.dispatchEvent(new Event("input")); }
    const btnLetra = Array.from(document.querySelectorAll("#letras button")).find((b) => b.textContent === alvo.dataset.letra);
    if (btnLetra && btnLetra.getAttribute("aria-pressed") !== "true") btnLetra.click();
    alvo.hidden = false;
    alvo.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelectorAll(".term.destaque").forEach((t) => t.classList.remove("destaque"));
    alvo.classList.add("destaque");
    // setTimeout = executa algo depois de um tempo (em milissegundos)
    setTimeout(() => alvo.classList.remove("destaque"), 2600);
  }
  document.querySelectorAll("[data-termo]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); ir(a.dataset.termo); history.replaceState(null, "", "#" + a.dataset.termo); }));
  if (location.hash.startsWith("#termo-")) setTimeout(() => ir(location.hash.slice(1)), 200);
}

/* ---------- Rodapé: formulário de e-mail ---------- */
// só valida o campo: nenhum dado é coletado nem enviado
document.addEventListener("DOMContentLoaded", function () {
  var f = document.getElementById("ft-form");
  if (!f) return;
  var msg = document.getElementById("ft-msg");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = f.email.value.trim();
    // regex (expressão regular): confere se o texto tem formato de e-mail (algo@algo.algo)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      msg.textContent = "Digite um e-mail válido.";
      f.email.focus();
      return;
    }
    msg.textContent = "O cadastro de e-mails ainda não está ativo neste site. Nenhum dado foi enviado.";
  });
});

/* ---------- Cards de exemplo ("Conheça os golpes" e "Simulação") ---------- */
// clicar abre a explicação do card; o mini-teste diz se acertou
function iniciarCardsDemo() {
  var lista = document.querySelectorAll(".pv-chat .pv-card");
  lista.forEach(function (c) {
    function alternar() {
      var abrir = !c.classList.contains("open");
      lista.forEach(function (o) { o.classList.remove("open"); o.setAttribute("aria-expanded", "false"); });
      if (abrir) { c.classList.add("open"); c.setAttribute("aria-expanded", "true"); }
    }
    c.addEventListener("click", alternar);
    // keydown = também funciona pelo teclado (Enter ou espaço), para acessibilidade
    c.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); }
    });
  });

  var quiz = document.querySelector(".pv-quiz");
  if (quiz) {
    var botoes = quiz.querySelectorAll(".pv-btns button");
    var ok = quiz.querySelector(".pv-ok");
    var ponto = ok.querySelector(".pv-okdot");
    var texto = ok.querySelector(".pv-okt");
    botoes.forEach(function (b) {
      b.addEventListener("click", function () {
        botoes.forEach(function (o) { o.classList.remove("on"); o.setAttribute("aria-pressed", "false"); });
        b.classList.add("on"); b.setAttribute("aria-pressed", "true");
        var certo = b.getAttribute("data-r") === "golpe";
        ok.classList.toggle("errou", !certo);
        ponto.textContent = certo ? "✓" : "✕";
        texto.textContent = certo ? "Ótimo! Você identificou o golpe." : "Quase! Esta mensagem é um golpe.";
        ok.classList.remove("troca"); void ok.offsetWidth; ok.classList.add("troca");
      });
    });
  }
}

/* ---------- Passos numerados (Guia de emergência e Proteja-se) ---------- */
// clicar marca o passo como feito e atualiza o contador
function iniciarPassos() {
  document.querySelectorAll(".pn-steps").forEach(function (ol) {
    var itens = ol.querySelectorAll("li");
    if (!itens.length) return;
    var prog = document.createElement("p");
    prog.className = "pn-prog";
    prog.setAttribute("role", "status");
    // aria-live = leitores de tela anunciam quando o texto do contador muda
    prog.setAttribute("aria-live", "polite");
    var head = ol.parentElement.querySelector(".pn-head");
    function atualizar() {
      var n = ol.querySelectorAll("li.done").length;
      prog.textContent = n === 0 ? "Toque em um passo para marcá-lo como feito."
        : n === itens.length ? "Tudo certo: " + n + " de " + itens.length + " passos concluídos."
        : n + " de " + itens.length + " passos concluídos.";
      prog.classList.toggle("ok", n > 0);
    }
    itens.forEach(function (li) {
      li.tabIndex = 0;
      var s = document.createElement("span");
      s.className = "sr-only";
      s.textContent = " (passo pendente)";
      li.appendChild(s);
      function alternar() {
        var feito = li.classList.toggle("done");
        s.textContent = feito ? " (passo concluído)" : " (passo pendente)";
        atualizar();
      }
      li.addEventListener("click", function (e) { if (!e.target.closest("a")) alternar(); });
      li.addEventListener("keydown", function (e) {
        if (e.target === li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); alternar(); }
      });
    });
    if (head) head.appendChild(prog);
    atualizar();
  });
}

/* ---------- "Guardando evidências" ---------- */
// cada card funciona como uma caixinha de marcar (checkbox)
function iniciarEvidencias() {
  const grid = document.querySelector(".ev-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".ev-card");
  const prog = document.createElement("p");
  prog.className = "ev-prog";
  prog.setAttribute("role", "status");
  prog.setAttribute("aria-live", "polite");
  grid.insertAdjacentElement("afterend", prog);
  function atualizar() {
    const n = grid.querySelectorAll(".ev-card.done").length;
    prog.textContent = n === 0 ? "Toque nos cards para marcar o que você já guardou."
      : n === cards.length ? "Tudo guardado: " + n + " de " + cards.length + " cuidados feitos."
      : n + " de " + cards.length + " cuidados feitos.";
    prog.classList.toggle("ok", n > 0);
  }
  cards.forEach((c) => {
    c.tabIndex = 0;
    // role="checkbox" = diz aos leitores de tela que o card funciona como caixinha de marcar
    c.setAttribute("role", "checkbox");
    c.setAttribute("aria-checked", "false");
    const m = document.createElement("span");
    m.className = "ev-check";
    m.setAttribute("aria-hidden", "true");
    m.textContent = "✓";
    c.appendChild(m);
    function alternar() {
      const feito = c.classList.toggle("done");
      c.setAttribute("aria-checked", feito ? "true" : "false");
      atualizar();
    }
    c.addEventListener("click", alternar);
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); }
    });
  });
  atualizar();
}
