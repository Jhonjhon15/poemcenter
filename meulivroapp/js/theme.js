/**
 * PoemCenter — Gerenciador Unificado de Temas
 * Compatível com file:/// e servidores HTTP (sem bloqueio de CORS)
 */

(function () {
  const CHAVE_TEMA = "tema-preferido";
  const TEMAS_DISPONIVEIS = ["noite", "livro", "floresta", "nevoa", "crepusculo", "azul", "cobre", "sol", "infinito"];

  function obterTemaSalvo() {
    try {
      const salvo = localStorage.getItem(CHAVE_TEMA) || "noite";
      return TEMAS_DISPONIVEIS.includes(salvo) ? salvo : "noite";
    } catch (e) {
      return "noite";
    }
  }

  function gerarTemaInfinito() {
    const matiz = Math.floor(Math.random() * 360);
    const corFundo = 'hsl(' + matiz + ', 15%, 8%)';
    const corSidebar = 'hsl(' + matiz + ', 18%, 10%)';
    const corEditor = 'hsl(' + matiz + ', 20%, 12%)';
    const corAcento = 'hsl(' + matiz + ', 70%, 60%)';
    const corAcentoForte = 'hsl(' + matiz + ', 80%, 75%)';

    const raiz = document.documentElement;
    raiz.style.setProperty("--cor-fundo-app", corFundo);
    raiz.style.setProperty("--cor-fundo-sidebar", corSidebar);
    raiz.style.setProperty("--cor-fundo-editor", corEditor);
    raiz.style.setProperty("--cor-acento", corAcento);
    raiz.style.setProperty("--cor-acento-forte", corAcentoForte);
  }

  function aplicarTema(nomeTema) {
    if (!TEMAS_DISPONIVEIS.includes(nomeTema)) {
      nomeTema = "noite";
    }

    const raiz = document.documentElement;
    raiz.style.removeProperty("--cor-fundo-app");
    raiz.style.removeProperty("--cor-fundo-sidebar");
    raiz.style.removeProperty("--cor-fundo-editor");
    raiz.style.removeProperty("--cor-acento");
    raiz.style.removeProperty("--cor-acento-forte");

    document.body.classList.remove(
      "tema-livro", "tema-floresta", "tema-nevoa", "tema-crepusculo",
      "tema-azul", "tema-cobre", "tema-sol"
    );

    if (nomeTema === "infinito") {
      gerarTemaInfinito();
    } else if (nomeTema !== "noite") {
      document.body.classList.add("tema-" + nomeTema);
    }

    try {
      localStorage.setItem(CHAVE_TEMA, nomeTema);
    } catch (e) {}

    // Sincroniza selects se existirem na página
    const selects = document.querySelectorAll("#select-tema-estante, #select-tema-sidebar, #select-tema-lateral");
    selects.forEach(function (s) {
      if (s) s.value = nomeTema;
    });

    // Atualiza classe ativa nos itens de tema
    document.querySelectorAll("[data-tema]").forEach(function (btn) {
      if (btn.getAttribute("data-tema") === nomeTema) {
        btn.classList.add("ativo");
      } else {
        btn.classList.remove("ativo");
      }
    });
  }

  function inicializarTemas() {
    const temaAtual = obterTemaSalvo();
    aplicarTema(temaAtual);

    document.addEventListener("click", function (e) {
      const el = e.target.closest("[data-tema]");
      if (el) {
        const novoTema = el.getAttribute("data-tema");
        aplicarTema(novoTema);
      }
    });

    const selects = document.querySelectorAll("#select-tema-estante, #select-tema-sidebar, #select-tema-lateral");
    selects.forEach(function (s) {
      s.addEventListener("change", function (e) {
        aplicarTema(e.target.value);
      });
    });
  }

  window.PoemTheme = {
    obterTemaSalvo: obterTemaSalvo,
    aplicarTema: aplicarTema,
    gerarTemaInfinito: gerarTemaInfinito,
    inicializarTemas: inicializarTemas
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarTemas);
  } else {
    inicializarTemas();
  }
})();
