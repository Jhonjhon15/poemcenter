/**
 * PoemCenter — Motor da Biblioteca e Editor de Poesias
 * Compatível com file:/// e servidores HTTP (sem bloqueio de CORS)
 */

(function () {
  const SUPABASE_URL = "https://brjwpghnpgbkuexhpsyj.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_7ZujRiFKXUW1vby5uQwGlA_I7pzESGp";
  const AUTOR_UID = "jhon-dev";

  let supabaseClient = null;
  if (typeof supabase !== "undefined" && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {}
  }

  let isAutor = false;
  const CHAVE_STORAGE_BIBLIOTECA = "biblioteca-de-livros";
  const CHAVE_STORAGE_ANTIGA = "entre-versos-e-silencios-livro";
  const NOME_ROMANOS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"];

  let biblioteca = [];
  let livro = null;
  let selecao = { tipo: "capa", parteId: null, poemaId: null };
  let timerAutosave = null;

  function getIcon(name) {
    if (window.PoemIcons && window.PoemIcons.getIcon) {
      return window.PoemIcons.getIcon(name);
    }
    return '';
  }

  function livroVazio(tituloInicial) {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      capa: {
        titulo: tituloInicial || "Novo Manuscrito",
        subtitulo: "manuscrito pessoal",
        autor: "Jhonatan Mendes",
        epiteto: "O Último Romântico",
        dedicatoria: "",
      },
      partes: [{ id: Date.now() + 1, titulo: "Parte I", poemas: [] }],
      notaFinal: "",
      biografia: "Poeta e escritor sob o silêncio da noite.",
    };
  }

  function normalizarLivro(dados) {
    const padrao = livroVazio();
    return Object.assign({}, padrao, dados, {
      id: dados.id || padrao.id,
      capa: Object.assign({}, padrao.capa, dados.capa || {})
    });
  }

  function assinaturaAutor() {
    if (!livro || !livro.capa || !livro.capa.autor) return "";
    return livro.capa.epiteto
      ? livro.capa.autor + ', "' + livro.capa.epiteto + '"'
      : livro.capa.autor;
  }

  function contarPalavras(texto) {
    const t = (texto || "").trim();
    return t.length > 0 ? t.split(/\s+/).length : 0;
  }

  function todosOsPoemas() {
    if (!livro || !livro.partes) return [];
    const lista = [];
    livro.partes.forEach(function (parte) {
      if (parte.poemas && Array.isArray(parte.poemas)) {
        lista.push.apply(lista, parte.poemas);
      }
    });
    return lista;
  }

  function totalDePalavras() {
    if (!livro) return 0;
    const somaPoemas = todosOsPoemas().reduce(function (soma, p) {
      return soma + contarPalavras(p.texto);
    }, 0);
    return somaPoemas + contarPalavras(livro.notaFinal);
  }

  function encontrarParte(parteId) {
    if (!livro || !livro.partes) return null;
    for (let i = 0; i < livro.partes.length; i++) {
      if (livro.partes[i].id === parteId) return livro.partes[i];
    }
    return null;
  }

  function encontrarPoema(parteId, poemaId) {
    const parte = encontrarParte(parteId);
    if (!parte || !parte.poemas) return null;
    for (let i = 0; i < parte.poemas.length; i++) {
      if (parte.poemas[i].id === poemaId) return parte.poemas[i];
    }
    return null;
  }

  function salvarNoStorage() {
    try {
      localStorage.setItem(CHAVE_STORAGE_BIBLIOTECA, JSON.stringify(biblioteca));
    } catch (e) {}

    if (supabaseClient && livro && isAutor) {
      try {
        supabaseClient.from("books").upsert(Object.assign({ id: String(livro.id) }, livro));
      } catch (e) {}
    }
  }

  function irPara(tipo, parteId, poemaId) {
    salvarTudoSilenciosamente();
    selecao = { tipo: tipo, parteId: parteId || null, poemaId: poemaId || null };
    renderizarTudo();
  }

  function mostrarPainel(tipo) {
    const mapa = {
      capa: document.getElementById("painel-capa"),
      sumario: document.getElementById("painel-sumario"),
      poema: document.getElementById("painel-poema"),
      notafinal: document.getElementById("painel-notafinal"),
      sobreautor: document.getElementById("painel-sobreautor")
    };

    for (let k in mapa) {
      if (mapa[k]) mapa[k].classList.remove("visivel");
    }
    if (mapa[tipo]) mapa[tipo].classList.add("visivel");
  }

  function renderizarNavTopo() {
    const itensNav = document.querySelectorAll(".lista-wrap .item-nav");
    itensNav.forEach(function (el) {
      el.classList.toggle("ativo", el.getAttribute("data-tipo") === selecao.tipo);
    });
  }

  function renderizarPartes() {
    const partesWrap = document.getElementById("partes-wrap");
    if (!partesWrap || !livro) return;
    partesWrap.innerHTML = "";

    livro.partes.forEach(function (parte, index) {
      const bloco = document.createElement("div");
      bloco.className = "parte-bloco";

      const header = document.createElement("div");
      header.className = "parte-header";

      const numero = document.createElement("span");
      numero.className = "parte-numero";
      numero.textContent = NOME_ROMANOS[index] || String(index + 1);

      const tituloInput = document.createElement("input");
      tituloInput.className = "parte-titulo-input";
      tituloInput.value = parte.titulo;
      tituloInput.addEventListener("change", function () {
        parte.titulo = tituloInput.value.trim() || ("Parte " + (NOME_ROMANOS[index] || (index + 1)));
        salvarNoStorage();
        renderizarPartes();
      });

      const acoes = document.createElement("div");
      acoes.className = "parte-acoes";

      const btnAddPoema = document.createElement("button");
      btnAddPoema.className = "btn-icone";
      btnAddPoema.title = "Adicionar poema";
      btnAddPoema.innerHTML = getIcon("plus");
      btnAddPoema.addEventListener("click", function () {
        criarNovoPoema(parte.id);
      });

      const btnDelParte = document.createElement("button");
      btnDelParte.className = "btn-icone";
      btnDelParte.title = "Excluir parte";
      btnDelParte.innerHTML = getIcon("trash");
      btnDelParte.addEventListener("click", function () {
        excluirParte(parte.id);
      });

      acoes.appendChild(btnAddPoema);
      acoes.appendChild(btnDelParte);
      header.appendChild(numero);
      header.appendChild(tituloInput);
      header.appendChild(acoes);
      bloco.appendChild(header);

      const listaPoemas = document.createElement("div");
      listaPoemas.className = "lista-poemas";

      (parte.poemas || []).forEach(function (poema) {
        const item = document.createElement("div");
        item.className = "poema-item";
        if (selecao.tipo === "poema" && selecao.poemaId === poema.id) {
          item.classList.add("ativo");
        }

        const tituloSpan = document.createElement("span");
        tituloSpan.textContent = poema.titulo || "Sem título";

        item.appendChild(tituloSpan);
        item.addEventListener("click", function () {
          irPara("poema", parte.id, poema.id);
        });

        listaPoemas.appendChild(item);
      });

      bloco.appendChild(listaPoemas);
      partesWrap.appendChild(bloco);
    });
  }

  function renderizarStats() {
    const statPartes = document.getElementById("stat-partes");
    const statPoemas = document.getElementById("stat-poemas");
    const statPalavras = document.getElementById("stat-palavras");

    if (statPartes) statPartes.textContent = (livro && livro.partes) ? livro.partes.length : 0;
    if (statPoemas) statPoemas.textContent = todosOsPoemas().length;
    if (statPalavras) statPalavras.textContent = totalDePalavras();
  }

  function renderizarCapa() {
    if (!livro) return;
    const capaTitulo = document.getElementById("capa-titulo");
    const capaSubtitulo = document.getElementById("capa-subtitulo");
    const capaAutor = document.getElementById("capa-autor");
    const capaEpiteto = document.getElementById("capa-epiteto");
    const capaDedicatoria = document.getElementById("capa-dedicatoria");

    if (capaTitulo) capaTitulo.value = livro.capa.titulo || "";
    if (capaSubtitulo) capaSubtitulo.value = livro.capa.subtitulo || "";
    if (capaAutor) capaAutor.value = livro.capa.autor || "";
    if (capaEpiteto) capaEpiteto.value = livro.capa.epiteto || "";
    if (capaDedicatoria) capaDedicatoria.value = livro.capa.dedicatoria || "";
  }

  function renderizarSumario() {
    const sumarioConteudo = document.getElementById("sumario-conteudo");
    if (!sumarioConteudo || !livro) return;
    sumarioConteudo.innerHTML = "";

    const vazio = livro.partes.every(function (p) {
      return (p.poemas || []).length === 0;
    });

    if (vazio) {
      const p = document.createElement("p");
      p.className = "sumario-vazio";
      p.textContent = "Ainda não há poemas no livro. Crie um poema para preencher o sumário.";
      sumarioConteudo.appendChild(p);
      return;
    }

    livro.partes.forEach(function (parte, index) {
      if ((parte.poemas || []).length === 0) return;

      const bloco = document.createElement("div");
      bloco.className = "sumario-parte";

      const tituloParte = document.createElement("div");
      tituloParte.className = "sumario-parte-titulo";
      tituloParte.textContent = "Parte " + (NOME_ROMANOS[index] || (index + 1)) + " — " + parte.titulo;
      bloco.appendChild(tituloParte);

      parte.poemas.forEach(function (poema) {
        const inline = document.createElement("div");
        inline.className = "sumario-linha";

        const titulo = document.createElement("span");
        titulo.textContent = poema.titulo || "Sem título";

        const pontilhado = document.createElement("span");
        pontilhado.className = "sumario-pontilhado";

        inline.appendChild(titulo);
        inline.appendChild(pontilhado);
        inline.addEventListener("click", function () {
          irPara("poema", parte.id, poema.id);
        });

        bloco.appendChild(inline);
      });

      sumarioConteudo.appendChild(bloco);
    });
  }

  function renderizarPoema() {
    const poema = selecao.poemaId ? encontrarPoema(selecao.parteId, selecao.poemaId) : null;
    const parte = selecao.parteId ? encontrarParte(selecao.parteId) : null;

    const estadoVazio = document.getElementById("estado-vazio");
    const editorConteudo = document.getElementById("editor-conteudo");
    const editorParteLabel = document.getElementById("editor-parte-label");
    const inputTitulo = document.getElementById("titulo-capitulo");
    const textareaTexto = document.getElementById("texto-capitulo");

    const temPoema = !!poema;
    if (estadoVazio) estadoVazio.classList.toggle("visivel", !temPoema);
    if (editorConteudo) editorConteudo.classList.toggle("visivel", temPoema);
    if (!temPoema) return;

    if (editorParteLabel && parte) {
      const indexParte = livro.partes.indexOf(parte);
      editorParteLabel.textContent = "Parte " + (NOME_ROMANOS[indexParte] || (indexParte + 1)) + " — " + parte.titulo;
    }

    if (inputTitulo) inputTitulo.value = poema.titulo || "";
    if (textareaTexto) textareaTexto.value = poema.texto || "";
    atualizarContadorPoema();
  }

  function atualizarContadorPoema() {
    const contadorPalavras = document.getElementById("contador-palavras");
    const textareaTexto = document.getElementById("texto-capitulo");
    if (contadorPalavras && textareaTexto) {
      contadorPalavras.textContent = contarPalavras(textareaTexto.value) + " palavras";
    }
  }

  function salvarPoemaAtual() {
    const poema = selecao.poemaId ? encontrarPoema(selecao.parteId, selecao.poemaId) : null;
    if (!poema) return;

    const inputTitulo = document.getElementById("titulo-capitulo");
    const textareaTexto = document.getElementById("texto-capitulo");

    if (inputTitulo) poema.titulo = inputTitulo.value.trim() || "Sem título";
    if (textareaTexto) poema.texto = textareaTexto.value;

    salvarNoStorage();
    renderizarPartes();
    renderizarStats();
  }

  function criarNovoPoema(parteId) {
    const parte = encontrarParte(parteId);
    if (!parte) return;

    const novo = { id: Date.now(), titulo: "Novo poema", texto: "" };
    if (!parte.poemas) parte.poemas = [];
    parte.poemas.push(novo);
    salvarNoStorage();
    irPara("poema", parte.id, novo.id);
  }

  function excluirParte(parteId) {
    const parte = encontrarParte(parteId);
    if (!parte) return;
    if (!confirm('Excluir a "' + parte.titulo + '" e todos os seus poemas?')) return;

    livro.partes = livro.partes.filter(function (p) { return p.id !== parteId; });
    if (livro.partes.length === 0) {
      livro.partes.push({ id: Date.now(), titulo: "Parte I", poemas: [] });
    }
    salvarNoStorage();
    irPara("sumario");
  }

  function salvarTudoSilenciosamente() {
    if (!livro) return;
    if (selecao.tipo === "poema") {
      salvarPoemaAtual();
    } else if (selecao.tipo === "notafinal") {
      const textoNotaFinal = document.getElementById("texto-nota-final");
      if (textoNotaFinal) livro.notaFinal = textoNotaFinal.value;
      salvarNoStorage();
    } else if (selecao.tipo === "sobreautor") {
      const textoBiografia = document.getElementById("texto-biografia");
      if (textoBiografia) livro.biografia = textoBiografia.value;
      salvarNoStorage();
    }
  }

  function renderizarTudo() {
    if (!livro) return;
    mostrarPainel(selecao.tipo);
    renderizarNavTopo();
    renderizarPartes();
    renderizarStats();

    if (selecao.tipo === "capa") renderizarCapa();
    if (selecao.tipo === "sumario") renderizarSumario();
    if (selecao.tipo === "poema") renderizarPoema();
    if (selecao.tipo === "notafinal") {
      const el = document.getElementById("texto-nota-final");
      if (el) el.value = livro.notaFinal || "";
    }
    if (selecao.tipo === "sobreautor") {
      const el = document.getElementById("texto-biografia");
      if (el) el.value = livro.biografia || "";
    }
  }

  function renderizarEstante() {
    const estanteEl = document.getElementById("estante");
    if (!estanteEl) return;
    estanteEl.innerHTML = "";

    biblioteca.forEach(function (l) {
      const poemas = (l.partes || []).flatMap(function (p) { return p.poemas || []; });
      const palavras = poemas.reduce(function (acc, p) { return acc + contarPalavras(p.texto); }, 0);

      const card = document.createElement("div");
      card.className = "livro-card";

      const cesura = document.createElement("span");
      cesura.className = "card-cesura";
      cesura.textContent = "❧";

      const titulo = document.createElement("h3");
      titulo.textContent = (l.capa && l.capa.titulo) ? l.capa.titulo : "Sem título ainda";

      const autor = document.createElement("p");
      autor.className = "card-autor";
      autor.textContent = (l.capa && l.capa.autor) ? l.capa.autor : "";

      const meta = document.createElement("div");
      meta.className = "card-meta";

      const infoTexto = document.createElement("span");
      infoTexto.textContent = poemas.length + (poemas.length === 1 ? " poema" : " poemas") + " · " + palavras + " palavras";

      const btnDel = document.createElement("button");
      btnDel.className = "card-excluir";
      btnDel.textContent = "excluir";
      btnDel.addEventListener("click", function (e) {
        e.stopPropagation();
        if (confirm('Excluir "' + (l.capa && l.capa.titulo ? l.capa.titulo : "Manuscrito") + '"?')) {
          biblioteca = biblioteca.filter(function (x) { return x.id !== l.id; });
          salvarNoStorage();
          renderizarEstante();
        }
      });

      meta.appendChild(infoTexto);
      meta.appendChild(btnDel);
      card.appendChild(cesura);
      card.appendChild(titulo);
      card.appendChild(autor);
      card.appendChild(meta);

      card.addEventListener("click", function () {
        abrirLivro(l.id);
      });

      estanteEl.appendChild(card);
    });

    const cardNovo = document.createElement("div");
    cardNovo.className = "livro-card novo";
    cardNovo.innerHTML = '<span class="card-cesura">+</span><span>Novo livro</span>';
    cardNovo.addEventListener("click", function () {
      const novo = livroVazio("Novo Manuscrito");
      biblioteca.push(novo);
      salvarNoStorage();
      abrirLivro(novo.id);
    });
    estanteEl.appendChild(cardNovo);
  }

  function abrirLivro(id) {
    for (let i = 0; i < biblioteca.length; i++) {
      if (biblioteca[i].id === id) {
        livro = biblioteca[i];
        break;
      }
    }
    if (!livro) return;

    selecao = { tipo: "capa", parteId: null, poemaId: null };
    const livroTituloSidebar = document.getElementById("livro-titulo-sidebar");
    if (livroTituloSidebar) {
      livroTituloSidebar.innerHTML = (livro.capa.titulo || "Sem título").replace(/\n/g, "<br>");
    }

    if (window.mostrarTelaLivro) {
      window.mostrarTelaLivro();
    }
    renderizarTudo();
  }

  window.abrirUltimoManuscrito = function () {
    if (biblioteca.length > 0) {
      abrirLivro(biblioteca[0].id);
    } else {
      if (window.mostrarTelaBiblioteca) window.mostrarTelaBiblioteca();
    }
  };

  function inicializarEventosInputs() {
    const camposCapa = [
      document.getElementById("capa-titulo"),
      document.getElementById("capa-subtitulo"),
      document.getElementById("capa-autor"),
      document.getElementById("capa-epiteto"),
      document.getElementById("capa-dedicatoria")
    ];

    camposCapa.forEach(function (el) {
      if (el) {
        el.addEventListener("input", function () {
          if (!livro) return;
          const ct = document.getElementById("capa-titulo");
          const cs = document.getElementById("capa-subtitulo");
          const ca = document.getElementById("capa-autor");
          const ce = document.getElementById("capa-epiteto");
          const cd = document.getElementById("capa-dedicatoria");

          if (ct) livro.capa.titulo = ct.value;
          if (cs) livro.capa.subtitulo = cs.value;
          if (ca) livro.capa.autor = ca.value;
          if (ce) livro.capa.epiteto = ce.value;
          if (cd) livro.capa.dedicatoria = cd.value;
          salvarNoStorage();
        });
      }
    });

    const inputTitulo = document.getElementById("titulo-capitulo");
    const textareaTexto = document.getElementById("texto-capitulo");

    if (inputTitulo) {
      inputTitulo.addEventListener("input", function () {
        clearTimeout(timerAutosave);
        timerAutosave = setTimeout(salvarPoemaAtual, 800);
      });
    }

    if (textareaTexto) {
      textareaTexto.addEventListener("input", function () {
        atualizarContadorPoema();
        clearTimeout(timerAutosave);
        timerAutosave = setTimeout(salvarPoemaAtual, 800);
      });
    }

    const btnSalvar = document.getElementById("btn-salvar");
    if (btnSalvar) {
      btnSalvar.addEventListener("click", function () {
        salvarPoemaAtual();
        alert("Poema salvo com sucesso!");
      });
    }

    const btnExcluir = document.getElementById("btn-excluir");
    if (btnExcluir) {
      btnExcluir.addEventListener("click", function () {
        const parte = encontrarParte(selecao.parteId);
        if (!parte) return;
        if (!confirm("Excluir este poema?")) return;
        parte.poemas = (parte.poemas || []).filter(function (p) {
          return p.id !== selecao.poemaId;
        });
        salvarNoStorage();
        irPara("sumario");
      });
    }

    const btnNovaParte = document.getElementById("btn-nova-parte");
    if (btnNovaParte) {
      btnNovaParte.addEventListener("click", function () {
        if (!livro) return;
        const num = (livro.partes || []).length + 1;
        livro.partes.push({ id: Date.now(), titulo: "Parte " + (NOME_ROMANOS[num - 1] || num), poemas: [] });
        salvarNoStorage();
        renderizarPartes();
      });
    }

    const itensNav = document.querySelectorAll(".lista-wrap .item-nav");
    itensNav.forEach(function (el) {
      el.addEventListener("click", function () {
        irPara(el.getAttribute("data-tipo"));
      });
    });

    const btnExportarPoema = document.getElementById("btn-exportar-poema");
    if (btnExportarPoema) {
      btnExportarPoema.addEventListener("click", function () {
        const poema = encontrarPoema(selecao.parteId, selecao.poemaId);
        if (!poema) return;
        const texto = (poema.titulo || "poema") + "\n\n" + (poema.texto || "") + "\n\n— " + assinaturaAutor();
        baixarArquivo((poema.titulo || "poema") + ".txt", texto);
      });
    }

    const btnExportarTudo = document.getElementById("btn-exportar-tudo");
    if (btnExportarTudo) {
      btnExportarTudo.addEventListener("click", function () {
        if (!livro) return;
        let txt = (livro.capa.titulo || "Manuscrito") + "\n" + (livro.capa.subtitulo || "") + "\n" + (livro.capa.autor || "") + "\n\n";
        livro.partes.forEach(function (parte) {
          txt += "\n=== " + parte.titulo + " ===\n\n";
          (parte.poemas || []).forEach(function (p) {
            txt += "--- " + (p.titulo || "Sem título") + " ---\n" + (p.texto || "") + "\n\n";
          });
        });
        baixarArquivo((livro.capa.titulo || "manuscrito") + ".txt", txt);
      });
    }
  }

  function baixarArquivo(nomeArquivo, conteudo) {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function inicializarApp() {
    try {
      const dadosLocais = localStorage.getItem(CHAVE_STORAGE_BIBLIOTECA) || localStorage.getItem(CHAVE_STORAGE_ANTIGA);
      if (dadosLocais) {
        const parsed = JSON.parse(dadosLocais);
        biblioteca = (Array.isArray(parsed) ? parsed : [parsed]).map(normalizarLivro);
      }
    } catch (e) {}

    if (!biblioteca || biblioteca.length === 0) {
      biblioteca = [
        {
          id: 1,
          capa: {
            titulo: "Entre Versos e Silêncios",
            subtitulo: "manuscrito pessoal",
            autor: "Jhonatan Mendes",
            epiteto: "O Último Romântico",
            dedicatoria: "Para quem encontra nas entrelinhas o que a voz não soube dizer.",
          },
          partes: [
            {
              id: 101,
              titulo: "Parte I — Silêncios da Noite",
              poemas: [
                {
                  id: 1001,
                  titulo: "Entre Versos e Silêncios",
                  texto: "Há palavras que não ousam sair —\ndormem entre as linhas como quem espera a manhã.\n\nEscrevo para dar corpo ao que sinto,\npois no silêncio do peito, o verso é infinito."
                },
                {
                  id: 1002,
                  titulo: "O Vinil e a Saudade",
                  texto: "A música gira no toca-discos da memória —\ne eu danço sozinho com quem já partiu.\n\nO som da agulha no sulco do disco\né o mesmo que o tempo gravou em meu coração."
                }
              ]
            }
          ],
          notaFinal: "Obrigado a cada alma que se demorou entre estas páginas.",
          biografia: "Poeta e escritor sob o silêncio da noite."
        }
      ];
    }

    renderizarEstante();
    inicializarEventosInputs();
  }

  window.PoemApp = {
    inicializarApp: inicializarApp,
    abrirLivro: abrirLivro,
    renderizarEstante: renderizarEstante
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarApp);
  } else {
    inicializarApp();
  }
})();
