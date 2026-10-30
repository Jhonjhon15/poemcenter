/**
 * PoemCenter — Atmosfera Poética (Jukebox & Pensamentos Diários)
 * Compatível com file:/// e servidores HTTP (sem bloqueio de CORS)
 */

(function () {
  const selectJukebox = document.getElementById("select-jukebox");
  const btnPlay = document.getElementById("btn-play-jukebox");
  const disco = document.getElementById("disco-vinil");
  const audio = document.getElementById("audio-jukebox");
  const chama = document.querySelector(".chama");

  let tocando = false;
  let intervalVolume = null;

  const PLAYLIST = [
    { id: "piano", url: "https://figuringoutmelody.com/wp-content/uploads/adore-you-piano.mp3" },
    { id: "lofi", url: "musicas/lofi.mp3" },
    { id: "bossa", url: "musicas/bossa.mp3" },
    { id: "violao", url: "musicas/violao.mp3" }
  ];

  function getIcon(name) {
    if (window.PoemIcons && window.PoemIcons.getIcon) {
      return window.PoemIcons.getIcon(name);
    }
    return '';
  }

  function ajustarVolumeSuave(volumeAlvo, callback) {
    if (!audio) return;
    clearInterval(intervalVolume);
    const passo = 0.05;
    intervalVolume = setInterval(function () {
      if (audio.volume < volumeAlvo) {
        audio.volume = Math.min(audio.volume + passo, volumeAlvo);
      } else if (audio.volume > volumeAlvo) {
        audio.volume = Math.max(audio.volume - passo, volumeAlvo);
      }
      if (Math.abs(audio.volume - volumeAlvo) < 0.01) {
        audio.volume = volumeAlvo;
        clearInterval(intervalVolume);
        if (callback) callback();
      }
    }, 60);
  }

  function atualizarBotaoPlay(emReproducao) {
    if (!btnPlay) return;
    if (emReproducao) {
      btnPlay.innerHTML = getIcon("pause") + " <span>Pausar Som</span>";
    } else {
      btnPlay.innerHTML = getIcon("play") + " <span>Ligar Som</span>";
    }
  }

  function alternarSom() {
    if (!audio || !btnPlay) return;

    if (tocando) {
      ajustarVolumeSuave(0, function () {
        audio.pause();
        atualizarBotaoPlay(false);
        if (disco) disco.classList.remove("girando");
        if (chama) chama.style.animation = "tremularSuave 1.4s infinite alternate";
      });
      tocando = false;
    } else {
      const idMusica = selectJukebox ? selectJukebox.value : "piano";
      let track = null;
      for (let i = 0; i < PLAYLIST.length; i++) {
        if (PLAYLIST[i].id === idMusica) {
          track = PLAYLIST[i];
          break;
        }
      }
      if (!track) track = PLAYLIST[0];

      audio.src = track.url;
      audio.volume = 0;
      audio.play().then(function () {
        ajustarVolumeSuave(0.35);
        atualizarBotaoPlay(true);
        if (disco) disco.classList.add("girando");
        if (chama) chama.style.animation = "tremularSuave 0.7s infinite alternate";
        tocando = true;
      }).catch(function (e) {
        console.warn("Reprodução de áudio necessita de interação prévia.", e);
      });
    }
  }

  function mudarTrilha(event) {
    if (!audio) return;
    const idMusica = event.target.value;
    let track = null;
    for (let i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].id === idMusica) {
        track = PLAYLIST[i];
        break;
      }
    }
    if (!track) track = PLAYLIST[0];

    if (tocando) {
      ajustarVolumeSuave(0, function () {
        audio.src = track.url;
        audio.play().then(function () {
          ajustarVolumeSuave(0.35);
        });
      });
    }
  }

  function configurarAbas() {
    const botoesAbas = document.querySelectorAll(".aba-btn");
    const colunas = document.querySelectorAll(".coluna-aba");

    botoesAbas.forEach(function (botao) {
      botao.addEventListener("click", function () {
        if (window.innerWidth > 768) return;
        botoesAbas.forEach(function (b) { b.classList.remove("ativa"); });
        botao.classList.add("ativa");

        const abaAlvo = botao.getAttribute("data-aba");
        colunas.forEach(function (coluna) {
          coluna.style.display = coluna.id === abaAlvo ? "flex" : "none";
        });
      });
    });

    if (window.location.hash === "#pensamentos") {
      const btnPensamentos = document.querySelector('[data-aba="coluna-pensamentos"]');
      if (btnPensamentos) btnPensamentos.click();
    }
  }

  const CHAVE_PENSAMENTOS = "poemcenter-pensamentos";
  const PENSAMENTOS_PADRAO = [
    { id: "1", texto: "O silêncio da noite é onde as palavras encontram sua verdadeira cor.", musica: "piano" },
    { id: "2", texto: "Guardei no papel aquilo que o tempo não soube esperar.", musica: "lofi" },
    { id: "3", texto: "A poesia não explica o mundo: ilumina as sombras que ele insiste em carregar.", musica: "bossa" }
  ];

  function carregarMural() {
    const muralEl = document.getElementById("mural-posts");
    if (!muralEl) return;
    muralEl.innerHTML = "";

    let pensamentos = [];
    try {
      const salvos = localStorage.getItem(CHAVE_PENSAMENTOS);
      pensamentos = salvos ? JSON.parse(salvos) : PENSAMENTOS_PADRAO;
    } catch (e) {
      pensamentos = PENSAMENTOS_PADRAO;
    }

    pensamentos.forEach(function (p) {
      const card = document.createElement("div");
      card.className = "mural-card";
      card.innerHTML =
        '<div class="mural-card-texto">“' + p.texto + '”</div>' +
        '<div class="mural-card-meta">' +
          '<span>' + getIcon("music") + ' Trilha: ' + p.musica + '</span>' +
          '<span class="ornamento">❧</span>' +
        '</div>';
      muralEl.appendChild(card);
    });
  }

  function adicionarNovoPensamento() {
    const texto = prompt("Escreva seu pensamento poético:");
    if (!texto || !texto.trim()) return;
    const musica = prompt("Qual estilo de trilha acoplar? (piano, lofi, bossa, violao):", "piano") || "piano";

    let pensamentos = [];
    try {
      const salvos = localStorage.getItem(CHAVE_PENSAMENTOS);
      pensamentos = salvos ? JSON.parse(salvos) : [].concat(PENSAMENTOS_PADRAO);
    } catch (e) {
      pensamentos = [].concat(PENSAMENTOS_PADRAO);
    }

    pensamentos.unshift({
      id: String(Date.now()),
      texto: texto.trim(),
      musica: musica.trim().toLowerCase()
    });

    try {
      localStorage.setItem(CHAVE_PENSAMENTOS, JSON.stringify(pensamentos));
    } catch (e) {}
    carregarMural();
  }

  window.mudarFonte = function (direcao) {
    const pensamentos = document.querySelectorAll(".mural-card-texto");
    pensamentos.forEach(function (p) {
      const tamanhoAtual = parseFloat(window.getComputedStyle(p).fontSize);
      p.style.fontSize = (tamanhoAtual + direcao * 2) + "px";
    });
  };

  function inicializarAtmosfera() {
    if (btnPlay) {
      atualizarBotaoPlay(false);
      btnPlay.addEventListener("click", alternarSom);
    }
    if (selectJukebox) {
      selectJukebox.addEventListener("change", mudarTrilha);
    }

    configurarAbas();
    carregarMural();
  }

  window.PoemAtmosfera = {
    alternarSom: alternarSom,
    adicionarNovoPensamento: adicionarNovoPensamento,
    inicializarAtmosfera: inicializarAtmosfera
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarAtmosfera);
  } else {
    inicializarAtmosfera();
  }
})();
