/**
 * PoemCenter — Navegação do Dashboard Lateral e Barra Mobile Apple
 * Compatível com file:/// e servidores HTTP (sem bloqueio de CORS)
 */

(function () {
  function inicializarNavegacao() {
    const telaInicio = document.getElementById("tela-inicio");
    const telaBiblioteca = document.getElementById("tela-biblioteca");
    const telaLivro = document.getElementById("tela-livro");

    // Alternância de Telas
    function mostrarTela(nome) {
      if (telaInicio) telaInicio.classList.add("escondido");
      if (telaBiblioteca) telaBiblioteca.classList.add("escondido");
      if (telaLivro) telaLivro.classList.add("escondido");

      if (nome === "inicio") {
        if (telaInicio) telaInicio.classList.remove("escondido");
      } else if (nome === "biblioteca") {
        if (telaBiblioteca) telaBiblioteca.classList.remove("escondido");
      } else if (nome === "livro") {
        if (telaLivro) telaLivro.classList.remove("escondido");
      }

      // Atualiza tabs e links ativos
      document.querySelectorAll("[data-nav]").forEach(function (btn) {
        if (btn.getAttribute("data-nav") === nome) {
          btn.classList.add("ativo");
        } else {
          btn.classList.remove("ativo");
        }
      });
      document.querySelectorAll(".mobile-tab-item[data-nav]").forEach(function (tab) {
        if (tab.getAttribute("data-nav") === nome) {
          tab.classList.add("ativo");
        } else {
          tab.classList.remove("ativo");
        }
      });

      // Rola para o topo suavemente
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.mostrarTelaInicio = function () {
      mostrarTela("inicio");
    };

    window.mostrarTelaBiblioteca = function () {
      mostrarTela("biblioteca");
    };

    window.mostrarTelaLivro = function () {
      mostrarTela("livro");
    };

    // Cliques em itens com [data-nav]
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        const destino = el.getAttribute("data-nav");
        if (destino) {
          e.preventDefault();
          mostrarTela(destino);
        }
      });
    });

    // 1. Elementos Interativos do Cenário (Desktop e Mobile)
    function ligarClique(ids, handler) {
      ids.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener("click", handler);
          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handler();
            }
          });
        }
      });
    }

    // Orbe 1: A Estante
    ligarClique(["cardEstante", "cardEstanteMobile"], function () {
      mostrarTela("biblioteca");
    });

    // Orbe 2: Manuscritos
    ligarClique(["cardManuscritos", "cardManuscritosMobile"], function () {
      if (typeof window.abrirUltimoManuscrito === "function") {
        window.abrirUltimoManuscrito();
      } else {
        mostrarTela("biblioteca");
      }
    });

    // Orbe 3: Modo Imersivo
    ligarClique(["cardImersivo", "cardImersivoMobile"], function () {
      alternarModoZen();
    });

    // Pergaminho: Manifesto Eterno
    ligarClique(["cenarioPergaminho", "cenarioPergaminhoMobile"], function () {
      abrirModal("modal-manifesto");
    });

    // Livro Aberto: Manuscrito
    ligarClique(["cenarioLivroAberto", "cenarioLivroAbertoMobile"], function () {
      if (typeof window.abrirUltimoManuscrito === "function") {
        window.abrirUltimoManuscrito();
      } else {
        mostrarTela("biblioteca");
      }
    });

    // Botões de Retorno
    const btnVoltarBiblioteca = document.getElementById("btn-voltar-biblioteca");
    if (btnVoltarBiblioteca) {
      btnVoltarBiblioteca.addEventListener("click", function (e) {
        e.preventDefault();
        mostrarTela("biblioteca");
      });
    }

    const btnVoltarInicio = document.getElementById("btn-voltar-inicio");
    if (btnVoltarInicio) {
      btnVoltarInicio.addEventListener("click", function (e) {
        e.preventDefault();
        mostrarTela("inicio");
      });
    }

    // Modais
    function abrirModal(idModal) {
      const modal = document.getElementById(idModal);
      if (modal) modal.classList.add("ativo");
    }

    function fecharModais() {
      document.querySelectorAll(".modal-overlay").forEach(function (m) {
        m.classList.remove("ativo");
      });
    }

    document.querySelectorAll(".modal-fechar").forEach(function (btn) {
      btn.addEventListener("click", fecharModais);
    });

    document.querySelectorAll(".modal-overlay").forEach(function (m) {
      m.addEventListener("click", function (e) {
        if (e.target === m) fecharModais();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharModais();
    });

    // Modo Zen
    function alternarModoZen() {
      document.body.classList.toggle("modo-zen-ativo");
      const sidebar = document.querySelector(".dashboard-sidebar");
      const editorSidebar = document.querySelector(".editor-sidebar-interna");
      const ativo = document.body.classList.contains("modo-zen-ativo");

      if (sidebar) sidebar.style.display = ativo ? "none" : "";
      if (editorSidebar && telaLivro && !telaLivro.classList.contains("escondido")) {
        editorSidebar.style.display = ativo ? "none" : "";
      }
    }

    // Ajuste de Fonte
    let nivelFonte = 0;
    function ajustarFonte(delta) {
      nivelFonte = Math.max(-2, Math.min(3, nivelFonte + delta));
      const px = 19 + nivelFonte * 2;
      document.querySelectorAll("#texto-capitulo, #texto-nota-final, #texto-biografia").forEach(function (el) {
        el.style.fontSize = px + "px";
      });
    }

    // Itens com [data-acao]
    document.querySelectorAll("[data-acao]").forEach(function (el) {
      el.addEventListener("click", function () {
        const acao = el.getAttribute("data-acao");
        if (!acao) return;

        if (acao === "zen") alternarModoZen();
        else if (acao === "fonte") ajustarFonte(1);
        else if (acao === "fonte-menos") ajustarFonte(-1);
        else if (acao === "autor") abrirModal("modal-autor");
        else if (acao === "manifesto") abrirModal("modal-manifesto");
        else if (acao === "ajustes-mobile") abrirModal("modal-ajustes-mobile");
        else if (acao === "vela") document.body.classList.toggle("vela-ativa");
      });
    });

    // Hash inicial
    const hash = window.location.hash;
    if (hash === "#estante" || hash === "#biblioteca") {
      mostrarTela("biblioteca");
    } else {
      mostrarTela("inicio");
    }
  }

  window.PoemNavigation = {
    inicializarNavegacao: inicializarNavegacao
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarNavegacao);
  } else {
    inicializarNavegacao();
  }
})();
