const SUPABASE_URL = "https://brjwpghnpgbkuexhpsyj.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_7ZujRiFKXUW1vby5uQwGlA_I7pzESGp"; 
const AUTOR_UID = "jhon-dev"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isAutor = false;

const CHAVE_STORAGE_BIBLIOTECA = "biblioteca-de-livros";
const CHAVE_STORAGE_ANTIGA = "entre-versos-e-silencios-livro";
const NOME_ROMANOS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"];

let biblioteca = [];
let livro = null;
let selecao = { tipo: "capa", parteId: null, poemaId: null };
let timerAutosave = null;

const telaBiblioteca = document.getElementById("tela-biblioteca");
const telaLivro = document.getElementById("tela-livro");
const estanteEl = document.getElementById("estante");
const btnVoltarBiblioteca = document.getElementById("btn-voltar-biblioteca");
const livroTituloSidebar = document.getElementById("livro-titulo-sidebar");

const partesWrap = document.getElementById("partes-wrap");
const itensNav = document.querySelectorAll(".item-nav");

const painelCapa = document.getElementById("painel-capa");
const painelSumario = document.getElementById("painel-sumario");
const painelPoema = document.getElementById("painel-poema");
const painelNotaFinal = document.getElementById("painel-notafinal");
const painelSobreAutor = document.getElementById("painel-sobreautor");

const capaTitulo = document.getElementById("capa-titulo");
const capaSubtitulo = document.getElementById("capa-subtitulo");
const capaAutor = document.getElementById("capa-autor");
const capaEpiteto = document.getElementById("capa-epiteto");
const capaDedicatoria = document.getElementById("capa-dedicatoria");

const sumarioConteudo = document.getElementById("sumario-conteudo");

const estadoVazio = document.getElementById("estado-vazio");
const editorConteudo = document.getElementById("editor-conteudo");
const editorParteLabel = document.getElementById("editor-parte-label");
const inputTitulo = document.getElementById("titulo-capitulo");
const textareaTexto = document.getElementById("texto-capitulo");
const contadorPalavras = document.getElementById("contador-palavras");
const statusSalvamento = document.getElementById("status-salvamento");
const respiroEl = document.getElementById("respiro");
const btnExcluir = document.getElementById("btn-excluir");
const btnExportarPoema = document.getElementById("btn-exportar-poema");
const btnSalvar = document.getElementById("btn-salvar");

const textoNotaFinal = document.getElementById("texto-nota-final");
const respiroNota = document.getElementById("respiro-nota");
const statusSalvamentoNota = document.getElementById("status-salvamento-nota");

const textoBiografia = document.getElementById("texto-biografia");
const respiroBio = document.getElementById("respiro-bio");
const statusSalvamentoBio = document.getElementById("status-salvamento-bio");

const statPartes = document.getElementById("stat-partes");
const statPoemas = document.getElementById("stat-poemas");
const statPalavras = document.getElementById("stat-palavras");
const btnNovaParte = document.getElementById("btn-nova-parte");
const btnExportarTudo = document.getElementById("btn-exportar-tudo");
const btnPreviewLivro = document.getElementById("btn-preview-livro");

supabaseClient.auth.onAuthStateChange((event, session) => {
  const user = session?.user;
  if (user && user.id === AUTOR_UID) {
    isAutor = true;
    console.log("🔑 Modo Autor ATIVADO.");
  } else {
    isAutor = false;
    console.log("📖 Modo Leitor ATIVADO. Apenas leitura.");
  }

  controlarInterfaceEdicao();
  renderizarEstante();

  if (livro) {
    renderizarTudo();
  }
});

function controlarInterfaceEdicao() {
  const cardNovo = document.querySelector(".livro-card.novo");
  if (cardNovo) cardNovo.style.display = isAutor ? "flex" : "none";

  const sidebarActions = document.querySelector(".sidebar-actions");
  if (sidebarActions) sidebarActions.style.display = isAutor ? "flex" : "none";

  if (btnExcluir) btnExcluir.style.display = isAutor ? "inline-block" : "none";
  if (btnSalvar) btnSalvar.style.display = isAutor ? "inline-block" : "none";

  const botoesIcone = document.querySelectorAll(".btn-icone");
  botoesIcone.forEach(btn => btn.style.display = isAutor ? "inline-block" : "none");

  const inputsEscrita = [
    capaTitulo, capaSubtitulo, capaAutor, capaEpiteto, capaDedicatoria,
    inputTitulo, textareaTexto, textoNotaFinal, textoBiografia
  ];

  inputsEscrita.forEach(input => {
    if (input) {
      if (isAutor) {
        input.removeAttribute("readonly");
        input.style.cursor = "text";
      } else {
        input.setAttribute("readonly", "true");
        input.style.cursor = "default";
      }
    }
  });
}

function configurarPortaSecreta() {
  const logos = [
    document.querySelector(".biblioteca-logo"),
    document.querySelector(".sidebar-logo"),
    document.querySelector(".biblioteca-header h1"),
    document.querySelector(".sidebar-marca span")
  ];

  logos.forEach(logo => {
    if (logo) {
      logo.style.cursor = "pointer";
      logo.addEventListener("dblclick", async () => {
        if (isAutor) {
          if (confirm("Você já está logado como Autor. Deseja sair (fazer logout)?")) {
            await supabaseClient.auth.signOut();
            alert("Você saiu do modo Autor. O site agora está no modo de Leitura Pública.");
            location.reload();
          }
        } else {
          const email = prompt("E-mail do Autor:");
          if (!email) return;
          const senha = prompt("Senha do Autor:");
          if (!senha) return;

          const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password: senha
          });

          if (error) {
            alert("Credenciais incorretas ou erro de conexão.");
            console.error(error);
          } else {
            alert("Acesso autorizado!");
          }
        }
      });
    }
  });
}

async function inicializarApp() {
  try {
    console.log("Conectando ao Supabase...");
    const { data, error } = await supabaseClient.from("books").select("*");

    if (error) throw error;

    biblioteca = (data || []).map(normalizarLivro);

    if (biblioteca.length === 0) {
      console.log("Banco na nuvem vazio. Verificando dados locais...");
      const dadosLocais = localStorage.getItem(CHAVE_STORAGE_BIBLIOTECA) || localStorage.getItem(CHAVE_STORAGE_ANTIGA);
      if (dadosLocais) {
        console.log("Encontrados dados no localStorage! Migrando...");
        const bibliotecaLocal = JSON.parse(dadosLocais);
        const listaLivros = Array.isArray(bibliotecaLocal) ? bibliotecaLocal : [bibliotecaLocal];

        for (let l of listaLivros) {
          const livroNorm = normalizarLivro(l);
          await supabaseClient.from("books").upsert({ id: String(livroNorm.id), ...livroNorm });
          biblioteca.push(livroNorm);
        }
        console.log("Migração concluída!");
      }
    } else {
      console.log("Livros carregados do Supabase com sucesso!");
    }
  } catch (erro) {
    console.error("Erro ao conectar ao Supabase. Usando cache local...", erro);
    const dadosBackup = localStorage.getItem(CHAVE_STORAGE_BIBLIOTECA);
    if (dadosBackup) {
      biblioteca = JSON.parse(dadosBackup).map(normalizarLivro);
    }
  }

  mostrarTelaBiblioteca();
  renderizarEstante();
  configurarPortaSecreta();
}

async function salvarNoStorage() {
  if (!isAutor) return;

  localStorage.setItem(CHAVE_STORAGE_BIBLIOTECA, JSON.stringify(biblioteca));

  if (livro) {
    try {
      const { error } = await supabaseClient.from("books").upsert({ id: String(livro.id), ...livro });
      if (error) throw error;
      console.log(`Livro "${livro.capa.titulo || "Sem título"}" sincronizado.`);
    } catch (erro) {
      console.error("Erro ao sincronizar com o Supabase:", erro);
    }
  }
}

async function excluirLivro(id) {
  if (!isAutor) return;

  const l = biblioteca.find((x) => x.id === id);
  if (!l) return;
  const stats = estatisticasDoLivro(l);
  const aviso = `Excluir "${l.capa.titulo || "Sem título"}" (${stats.poemas} poema(s))? Essa ação não pode ser desfeita.`;
  if (!confirm(aviso)) return;

  biblioteca = biblioteca.filter((x) => x.id !== id);

  try {
    const { error } = await supabaseClient.from("books").delete().eq("id", String(id));
    if (error) throw error;
    console.log("Livro excluído do Supabase!");
  } catch (erro) {
    console.error("Erro ao excluir do Supabase:", erro);
  }

  localStorage.setItem(CHAVE_STORAGE_BIBLIOTECA, JSON.stringify(biblioteca));
  renderizarEstante();
}

function livroVazio(tituloInicial = "") {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    capa: {
      titulo: tituloInicial,
      subtitulo: "",
      autor: "Jhonatan Mendes",
      epiteto: "O Último Romântico",
      dedicatoria: "",
    },
    partes: [{ id: Date.now() + 1, titulo: "Parte I", poemas: [] }],
    notaFinal: "",
    biografia: "",
  };
}

function normalizarLivro(dados) {
  const padrao = livroVazio();
  return {
    ...padrao,
    ...dados,
    id: dados.id || padrao.id,
    capa: { ...padrao.capa, ...(dados.capa || {}) },
  };
}

function assinaturaAutor() {
  if (!livro.capa.autor) return "";
  return livro.capa.epiteto
    ? `${livro.capa.autor}, "${livro.capa.epiteto}"`
    : livro.capa.autor;
}

function contarPalavras(texto) {
  const t = (texto || "").trim();
  return t.length > 0 ? t.split(/\s+/).length : 0;
}

function todosOsPoemas() {
  return livro.partes.flatMap((parte) => parte.poemas);
}

function totalDePalavras() {
  return todosOsPoemas().reduce((soma, p) => soma + contarPalavras(p.texto), 0) + contarPalavras(livro.notaFinal);
}

function encontrarParte(parteId) {
  return livro.partes.find((p) => p.id === parteId);
}

function encontrarPoema(parteId, poemaId) {
  const parte = encontrarParte(parteId);
  return parte ? parte.poemas.find((p) => p.id === poemaId) : null;
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

function irPara(tipo, parteId = null, poemaId = null) {
  salvarTudoSilenciosamente();
  selecao = { tipo, parteId, poemaId };
  renderizarTudo();
}

function mostrarPainel(tipo) {
  [painelCapa, painelSumario, painelPoema, painelNotaFinal, painelSobreAutor].forEach((p) => p.classList.remove("visivel"));
  const mapa = { capa: painelCapa, sumario: painelSumario, poema: painelPoema, notafinal: painelNotaFinal, sobreautor: painelSobreAutor };
  mapa[tipo].classList.add("visivel");
}

function renderizarNavTopo() {
  itensNav.forEach((el) => {
    el.classList.toggle("ativo", el.dataset.tipo === selecao.tipo);
  });
}

function renderizarPartes() {
  partesWrap.innerHTML = "";

  livro.partes.forEach((parte, index) => {
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
    tituloInput.addEventListener("change", () => {
      if (!isAutor) return;
      parte.titulo = tituloInput.value.trim() || `Parte ${NOME_ROMANOS[index] || index + 1}`;
      salvarNoStorage();
      renderizarPartes();
    });

    const btnAddPoema = document.createElement("button");
    btnAddPoema.className = "btn-icone";
    btnAddPoema.title = "Novo poema nesta parte";
    btnAddPoema.textContent = "+";
    btnAddPoema.addEventListener("click", () => criarNovoPoema(parte.id));

    const btnDelParte = document.createElement("button");
    btnDelParte.className = "btn-icone perigo";
    btnDelParte.title = "Excluir parte";
    btnDelParte.textContent = "✕";
    btnDelParte.addEventListener("click", () => excluirParte(parte.id));

    header.append(numero, tituloInput, btnAddPoema, btnDelParte);
    bloco.appendChild(header);

    [btnAddPoema, btnDelParte].forEach(btn => btn.style.display = isAutor ? "inline-block" : "none");

    if (parte.poemas.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "parte-vazia-aviso";
      aviso.textContent = "sem poemas ainda";
      bloco.appendChild(aviso);
    } else {
      const ul = document.createElement("ul");
      ul.className = "poemas-da-parte";

      parte.poemas.forEach((poema) => {
        const li = document.createElement("li");
        li.className = "item-poema" + (selecao.tipo === "poema" && selecao.poemaId === poema.id ? " ativo" : "");
        li.tabIndex = 0;

        const cesura = document.createElement("span");
        cesura.className = "item-cesura";
        cesura.textContent = "‖";

        const titulo = document.createElement("span");
        titulo.className = "item-titulo";
        titulo.textContent = poema.titulo || "Sem título";

        const palavras = document.createElement("span");
        palavras.className = "item-palavras";
        palavras.textContent = contarPalavras(poema.texto);

        li.append(cesura, titulo, palavras);
        li.addEventListener("click", () => irPara("poema", parte.id, poema.id));
        li.addEventListener("keydown", (e) => { if (e.key === "Enter") irPara("poema", parte.id, poema.id); });

        ul.appendChild(li);
      });

      bloco.appendChild(ul);
    }

    partesWrap.appendChild(bloco);
  });

  statPartes.textContent = livro.partes.length;
  statPoemas.textContent = todosOsPoemas().length;
  statPalavras.textContent = totalDePalavras();
}

function renderizarCapa() {
  capaTitulo.value = livro.capa.titulo;
  capaSubtitulo.value = livro.capa.subtitulo;
  capaAutor.value = livro.capa.autor;
  capaEpiteto.value = livro.capa.epiteto;
  capaDedicatoria.value = livro.capa.dedicatoria;
}

[capaTitulo, capaSubtitulo, capaAutor, capaEpiteto, capaDedicatoria].forEach((el) => {
  el.addEventListener("input", () => {
    if (!isAutor) return;
    livro.capa.titulo = capaTitulo.value;
    livro.capa.subtitulo = capaSubtitulo.value;
    livro.capa.autor = capaAutor.value;
    livro.capa.epiteto = capaEpiteto.value;
    livro.capa.dedicatoria = capaDedicatoria.value;
    salvarNoStorage();
  });
});

function renderizarSumario() {
  sumarioConteudo.innerHTML = "";

  if (livro.partes.every((p) => p.poemas.length === 0)) {
    const vazio = document.createElement("p");
    vazio.className = "sumario-vazio";
    vazio.textContent = "Ainda não há poemas no livro. O sumário vai se preencher conforme você escreve.";
    sumarioConteudo.appendChild(vazio);
    return;
  }

  livro.partes.forEach((parte, index) => {
    if (parte.poemas.length === 0) return;

    const bloco = document.createElement("div");
    bloco.className = "sumario-parte";

    const tituloParte = document.createElement("div");
    tituloParte.className = "sumario-parte-titulo";
    tituloParte.textContent = `Parte ${NOME_ROMANOS[index] || index + 1} — ${parte.titulo}`;
    bloco.appendChild(tituloParte);

    parte.poemas.forEach((poema) => {
      const inline = document.createElement("div");
      inline.className = "sumario-linha";
      inline.tabIndex = 0;

      const titulo = document.createElement("span");
      titulo.textContent = poema.titulo || "Sem título";

      const pontilhado = document.createElement("span");
      pontilhado.className = "sumario-pontilhado";

      inline.append(titulo, pontilhado);
      inline.addEventListener("click", () => irPara("poema", parte.id, poema.id));
      inline.addEventListener("keydown", (e) => { if (e.key === "Enter") irPara("poema", parte.id, poema.id); });

      bloco.appendChild(inline);
    });

    sumarioConteudo.appendChild(bloco);
  });
}

function renderizarPoema() {
  const poema = selecao.poemaId ? encontrarPoema(selecao.parteId, selecao.poemaId) : null;
  const parte = selecao.parteId ? encontrarParte(selecao.parteId) : null;

  const temPoema = !!poema;
  estadoVazio.classList.toggle("visivel", !temPoema);
  editorConteudo.classList.toggle("visivel", temPoema);
  if (!temPoema) return;

  const indexParte = livro.partes.findIndex((p) => p.id === parte.id);
  editorParteLabel.textContent = `Parte ${NOME_ROMANOS[indexParte] || indexParte + 1} — ${parte.titulo}`;

  inputTitulo.value = poema.titulo;
  textareaTexto.value = poema.texto;
  atualizarContadorPoema();
  marcarComoSalvo();
}

function atualizarContadorPoema() {
  contadorPalavras.textContent = `${contarPalavras(textareaTexto.value)} palavras`;
}

function marcarComoPendente() {
  respiroEl.classList.add("pendente");
  statusSalvamento.textContent = "escrevendo...";
}

function marcarComoSalvo() {
  respiroEl.classList.remove("pendente");
  statusSalvamento.textContent = "tudo salvo";
}

function criarNovoPoema(parteId) {
  if (!isAutor) return;
  const parte = encontrarParte(parteId);
  if (!parte) return;

  const novo = { id: Date.now(), titulo: "Novo poema", texto: "" };
  parte.poemas.push(novo);
  salvarNoStorage();
  irPara("poema", parte.id, novo.id);
  setTimeout(() => { inputTitulo.focus(); inputTitulo.select(); }, 0);
}

btnNovaParte.addEventListener("click", () => {
  if (!isAutor) return;
  const novaParte = { id: Date.now(), titulo: `Parte ${NOME_ROMANOS[livro.partes.length] || livro.partes.length + 1}`, poemas: [] };
  livro.partes.push(novaParte);
  salvarNoStorage();
  renderizarPartes();
});

function excluirParte(parteId) {
  if (!isAutor) return;
  const parte = encontrarParte(parteId);
  if (!parte) return;

  const aviso = parte.poemas.length > 0
    ? `Excluir "${parte.titulo}" e os ${parte.poemas.length} poema(s) dentro dela? Essa ação não pode ser desfeita.`
    : `Excluir a parte "${parte.titulo}"?`;
  if (!confirm(aviso)) return;

  livro.partes = livro.partes.filter((p) => p.id !== parteId);
  if (livro.partes.length === 0) {
    livro.partes.push({ id: Date.now(), titulo: "Parte I", poemas: [] });
  }
  salvarNoStorage();

  if (selecao.parteId === parteId) {
    irPara("sumario");
  } else {
    renderizarPartes();
  }
}

function salvarPoemaAtual() {
  if (!isAutor) return;
  if (selecao.tipo !== "poema" || !selecao.poemaId) return;
  const poema = encontrarPoema(selecao.parteId, selecao.poemaId);
  if (!poema) return;

  poema.titulo = inputTitulo.value.trim() || "Sem título";
  poema.texto = textareaTexto.value;
  salvarNoStorage();
  renderizarPartes();
  marcarComoSalvo();
}

btnSalvar.addEventListener("click", () => {
  if (!isAutor) return;
  salvarPoemaAtual();
  btnSalvar.textContent = "Salvo ✓";
  setTimeout(() => (btnSalvar.textContent = "Salvar"), 1100);
});

function agendarAutosavePoema() {
  if (!isAutor) return;
  marcarComoPendente();
  clearTimeout(timerAutosave);
  timerAutosave = setTimeout(salvarPoemaAtual, 900);
}

textareaTexto.addEventListener("input", () => { atualizarContadorPoema(); agendarAutosavePoema(); });
inputTitulo.addEventListener("input", agendarAutosavePoema);

btnExcluir.addEventListener("click", () => {
  if (!isAutor) return;
  const poema = encontrarPoema(selecao.parteId, selecao.poemaId);
  if (!poema) return;
  if (!confirm(`Excluir "${poema.titulo || "Sem título"}"? Essa ação não pode ser desfeita.`)) return;

  const parte = encontrarParte(selecao.parteId);
  parte.poemas = parte.poemas.filter((p) => p.id !== poema.id);
  salvarNoStorage();
  irPara("sumario");
});

btnExportarPoema.addEventListener("click", () => {
  const poema = encontrarPoema(selecao.parteId, selecao.poemaId);
  if (!poema) return;
  const conteudo = `${poema.titulo || "Sem título"}\n\n${poema.texto}`;
  const nomeArquivo = (poema.titulo || "poema").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".txt";
  baixarArquivo(nomeArquivo, conteudo);
});

function renderizarNotaFinal() {
  textoNotaFinal.value = livro.notaFinal;
  marcarNotaComoSalva();
}

function marcarNotaComoPendente() {
  respiroNota.classList.add("pendente");
  statusSalvamentoNota.textContent = "escrevendo...";
}
function marcarNotaComoSalva() {
  respiroNota.classList.remove("pendente");
  statusSalvamentoNota.textContent = "tudo salvo";
}

let timerAutosaveNota = null;
textoNotaFinal.addEventListener("input", () => {
  if (!isAutor) return;
  marcarNotaComoPendente();
  clearTimeout(timerAutosaveNota);
  timerAutosaveNota = setTimeout(() => {
    livro.notaFinal = textoNotaFinal.value;
    salvarNoStorage();
    marcarNotaComoSalva();
  }, 900);
});

function renderizarBiografia() {
  textoBiografia.value = livro.biografia;
  marcarBioComoSalva();
}

function marcarBioComoPendente() {
  respiroBio.classList.add("pendente");
  statusSalvamentoBio.textContent = "escrevendo...";
}
function marcarBioComoSalva() {
  respiroBio.classList.remove("pendente");
  statusSalvamentoBio.textContent = "tudo salvo";
}

let timerAutosaveBio = null;
textoBiografia.addEventListener("input", () => {
  if (!isAutor) return;
  marcarBioComoPendente();
  clearTimeout(timerAutosaveBio);
  timerAutosaveBio = setTimeout(() => {
    livro.biografia = textoBiografia.value;
    salvarNoStorage();
    marcarBioComoSalva();
  }, 900);
});

function salvarTudoSilenciosamente() {
  if (!isAutor) return;
  if (selecao.tipo === "poema") salvarPoemaAtual();
  if (selecao.tipo === "notafinal") {
    livro.notaFinal = textoNotaFinal.value;
    salvarNoStorage();
  }
  if (selecao.tipo === "sobreautor") {
    livro.biografia = textoBiografia.value;
    salvarNoStorage();
  }
}
window.addEventListener("blur", salvarTudoSilenciosamente);

itensNav.forEach((el) => {
  el.addEventListener("click", () => irPara(el.dataset.tipo));
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") irPara(el.dataset.tipo); });
});

function renderizarTudo() {
  renderizarNavTopo();
  renderizarPartes();
  mostrarPainel(selecao.tipo);

  if (selecao.tipo === "capa") renderizarCapa();
  if (selecao.tipo === "sumario") renderizarSumario();
  if (selecao.tipo === "poema") renderizarPoema();
  if (selecao.tipo === "notafinal") renderizarNotaFinal();
  if (selecao.tipo === "sobreautor") renderizarBiografia();
}

btnExportarTudo.addEventListener("click", () => {
  salvarTudoSilenciosamente();

  const linhaSep = "\n\n" + "—".repeat(44) + "\n\n";
  let partes = [];

  let capaTexto = livro.capa.titulo || "Entre Versos e Silêncios";
  if (livro.capa.subtitulo) capaTexto += `\n${livro.capa.subtitulo}`;
  if (livro.capa.autor) capaTexto += `\n\n${livro.capa.autor}`;
  if (livro.capa.dedicatoria) capaTexto += `\n\n${livro.capa.dedicatoria}`;
  partes.push(capaTexto);

  let sumarioTexto = "SUMÁRIO\n";
  livro.partes.forEach((parte, i) => {
    if (parte.poemas.length === 0) return;
    sumarioTexto += `\nParte ${NOME_ROMANOS[i] || i + 1} — ${parte.titulo}\n`;
    parte.poemas.forEach((p) => { sumarioTexto += `    ‖ ${p.titulo || "Sem título"}\n`; });
  });
  partes.push(sumarioTexto);

  const assinatura = assinaturaAutor();

  livro.partes.forEach((parte, i) => {
    if (parte.poemas.length === 0) return;
    let text = `PARTE ${NOME_ROMANOS[i] || i + 1} — ${parte.titulo.toUpperCase()}\n`;
    parte.poemas.forEach((p) => {
      text += `\n\n‖ ${p.titulo || "Sem título"}\n\n${p.texto}`;
      if (assinatura) text += `\n\n— ${assinatura}`;
    });
    partes.push(text);
  });

  if (livro.notaFinal.trim()) {
    partes.push(`NOTA FINAL\n\n${livro.notaFinal}`);
  }

  if (livro.biografia.trim()) {
    let bloco = "SOBRE O AUTOR\n\n";
    if (assinatura) bloco += `${assinatura}\n\n`;
    bloco += livro.biografia;
    partes.push(bloco);
  }

  const conteudo = partes.join(linhaSep);
  baixarArquivo("entre-versos-e-silencios.txt", conteudo);
});

btnPreviewLivro.addEventListener("click", () => {
  salvarTudoSilenciosamente();

  const escapar = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const quebraLinhas = (s) => escapar(s).split("\n").map((l) => l || "&nbsp;").join("<br>");

  let paginas = "";

  paginas += `
    <section class="pg pg-capa">
      <span class="pg-cesura">❧</span>
      <h1>${escapar(livro.capa.titulo || "Entre Versos e Silêncios")}</h1>
      ${livro.capa.subtitulo ? `<p class="pg-subtitulo">${escapar(livro.capa.subtitulo)}</p>` : ""}
      ${livro.capa.autor ? `<p class="pg-autor">${escapar(livro.capa.autor)}</p>` : ""}
      ${livro.capa.dedicatoria ? `<p class="pg-dedicatoria">${quebraLinhas(livro.capa.dedicatoria)}</p>` : ""}
    </section>`;

  let linhasSumario = "";
  livro.partes.forEach((parte, i) => {
    if (parte.poemas.length === 0) return;
    linhasSumario += `<p class="pg-sumario-parte">Parte ${NOME_ROMANOS[i] || i + 1} — ${escapar(parte.titulo)}</p>`;
    parte.poemas.forEach((p) => {
      linhasSumario += `<p class="pg-sumario-item">${escapar(p.titulo || "Sem título")}</p>`;
    });
  });
  paginas += `
    <section class="pg pg-sumario">
      <h2>Sumário</h2>
      ${linhasSumario || '<p class="pg-sumario-item"><em>ainda sem poemas</em></p>'}
    </section>`;

  livro.partes.forEach((parte, i) => {
    if (parte.poemas.length === 0) return;

    paginas += `
      <section class="pg pg-parte-abertura">
        <span class="pg-cesura">❧</span>
        <p class="pg-parte-numero">Parte ${NOME_ROMANOS[i] || i + 1}</p>
        <h2>${escapar(parte.titulo)}</h2>
      </section>`;

    parte.poemas.forEach((poema) => {
      paginas += `
        <section class="pg pg-poema">
          <h3>${escapar(poema.titulo || "Sem título")}</h3>
          <div class="pg-poema-texto">${quebraLinhas(poema.texto)}</div>
          ${assinaturaAutor() ? `<p class="pg-assinatura">— ${escapar(assinaturaAutor())}</p>` : ""}
        </section>`;
    });
  });

  if (livro.notaFinal.trim()) {
    paginas += `
      <section class="pg pg-notafinal">
        <span class="pg-cesura">❧</span>
        <h2>Nota final</h2>
        <div class="pg-poema-texto">${quebraLinhas(livro.notaFinal)}</div>
      </section>`;
  }

  if (livro.biografia.trim()) {
    paginas += `
      <section class="pg pg-notafinal">
        <span class="pg-cesura">❧</span>
        <h2>Sobre o autor</h2>
        ${assinaturaAutor() ? `<p class="pg-autor" style="margin-bottom:20px;">${escapar(assinaturaAutor())}</p>` : ""}
        <div class="pg-poema-texto">${quebraLinhas(livro.biografia)}</div>
      </section>`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${escapar(livro.capa.titulo || "Entre Versos e Silêncios")}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cormorant Garamond', Georgia, serif; color: #241c1c; background: #ddd6cc; }
  .pg {
    background: #fdfbf7;
    width: 21cm; min-height: 29.7cm;
    margin: 24px auto;
    padding: 3cm;
    break-after: page;
    display: flex; flex-direction: column;
  }
  .pg-capa, .pg-parte-abertura, .pg-notafinal { align-items: center; justify-content: center; text-align: center; }
  .pg-cesura { font-size: 34px; color: #8c3b4b; margin-bottom: 18px; }
  .pg-capa h1 { font-style: italic; font-weight: 500; font-size: 46px; margin-bottom: 14px; }
  .pg-subtitulo { font-size: 19px; color: #55483f; margin-bottom: 26px; }
  .pg-autor { font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b5f57; margin-top: 20px; }
  .pg-dedicatoria { font-style: italic; font-size: 15px; color: #6b5f57; margin-top: 30px; max-width: 340px; }
  .pg-sumario h2 { font-style: italic; font-size: 30px; margin-bottom: 26px; }
  .pg-sumario-parte { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #8c3b4b; margin-top: 20px; margin-bottom: 8px; }
  .pg-sumario-item { font-size: 18px; padding: 4px 0 4px 14px; }
  .pg-parte-numero { font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8c3b4b; margin-bottom: 10px; }
  .pg-parte-abertura h2 { font-style: italic; font-weight: 500; font-size: 38px; }
  .pg-poema h3 { font-style: italic; font-size: 27px; margin-bottom: 26px; color: #8c3b4b; }
  .pg-poema-texto { font-size: 19px; line-height: 1.9; }
  .pg-assinatura { font-style: italic; font-size: 14px; color: #8c3b4b; margin-top: 30px; align-self: flex-end; }
  @media print {
    body { background: none; }
    .pg { margin: 0; box-shadow: none; }
  }
</style>
</head>
<body>
${paginas}
<script>window.onload = () => setTimeout(() => window.print(), 400);<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
});

function estatisticasDoLivro(l) {
  const poemas = l.partes.flatMap((p) => p.poemas);
  const palavras = poemas.reduce((soma, p) => soma + contarPalavras(p.texto), 0);
  return { partes: l.partes.length, poemas: poemas.length, palavras };
}

function mostrarTelaBiblioteca() {
  telaLivro.classList.add("escondido");
  telaBiblioteca.classList.remove("escondido");
}

function mostrarTelaLivro() {
  telaBiblioteca.classList.add("escondido");
  telaLivro.classList.remove("escondido");
}

function renderizarEstante() {
  estanteEl.innerHTML = "";

  biblioteca.forEach((l) => {
    const stats = estatisticasDoLivro(l);
    const card = document.createElement("div");
    card.className = "livro-card";

    const cesura = document.createElement("span");
    cesura.className = "card-cesura";
    cesura.textContent = "❧";

    const titulo = document.createElement("h3");
    titulo.textContent = l.capa.titulo || "Sem título ainda";

    const autor = document.createElement("p");
    autor.className = "card-autor";
    autor.textContent = l.capa.autor || "";

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const infoTexto = document.createElement("span");
    infoTexto.textContent = `${stats.poemas} poema${stats.poemas === 1 ? "" : "s"} · ${stats.palavras} palavras`;

    const btnDel = document.createElement("button");
    btnDel.className = "card-excluir";
    btnDel.textContent = "excluir";
    btnDel.addEventListener("click", (e) => {
      e.stopPropagation();
      excluirLivro(l.id);
    });

    meta.append(infoTexto, btnDel);
    card.append(cesura, titulo, autor, meta);
    card.addEventListener("click", () => abrirLivro(l.id));

    estanteEl.appendChild(card);
  });

  const cardNovo = document.createElement("div");
  cardNovo.className = "livro-card novo";
  cardNovo.innerHTML = `<span class="card-cesura">+</span><span>Novo livro</span>`;
  cardNovo.addEventListener("click", criarNovoLivro);
  estanteEl.appendChild(cardNovo);

  controlarInterfaceEdicao();
}

function abrirLivro(id) {
  livro = biblioteca.find((l) => l.id === id);
  if (!livro) return;
  selecao = { tipo: "capa", parteId: null, poemaId: null };
  livroTituloSidebar.innerHTML = (livro.capa.titulo || "Sem título").replace(/\n/g, "<br>");
  mostrarTelaLivro();
  renderizarTudo();
}

function criarNovoLivro() {
  const novo = livroVazio("");
  biblioteca.push(novo);
  salvarNoStorage();
  abrirLivro(novo.id);
}

function inicializarControleTema() {
  const selectEstante = document.getElementById("select-tema-estante");
  const selectSidebar = document.getElementById("select-tema-sidebar");
  const temas = ["noite", "livro", "floresta", "nevoa", "crepusculo", "azul", "cobre", "sol", "infinito"];
  let temaAtual = "noite";

  const temaSalvo = localStorage.getItem("tema-preferido") || "noite";
  temaAtual = temaSalvo;
  if (!temas.includes(temaAtual)) temaAtual = "noite";
  aplicarTema(temaAtual);

  function gerarTemaInfinito() {
    const tom = Math.floor(Math.random() * 360); 
    document.body.style.setProperty("--cor-fundo-app", `hsl(${tom}, 18%, 10%)`);
    document.body.style.setProperty("--cor-fundo-sidebar", `hsl(${tom}, 18%, 7%)`);
    document.body.style.setProperty("--cor-fundo-editor", `hsl(${tom}, 18%, 13%)`);
    document.body.style.setProperty("--cor-texto", `hsl(${tom}, 12%, 91%)`);
    document.body.style.setProperty("--cor-texto-suave", `hsl(${tom}, 12%, 72%)`);
    document.body.style.setProperty("--cor-texto-fraco", `hsl(${tom}, 10%, 50%)`);
    document.body.style.setProperty("--cor-linha", `hsl(${tom}, 18%, 18%)`);
    document.body.style.setProperty("--cor-vinho-forte", `hsl(${(tom + 180) % 360}, 45%, 55%)`);
    document.body.style.setProperty("--cor-acento-forte", `hsl(${(tom + 45) % 360}, 50%, 65%)`);
  }

  function aplicarTema(nomeTema) {
    document.body.removeAttribute("style");
    document.body.classList.remove("tema-livro", "tema-floresta", "tema-nevoa", "tema-crepusculo", "tema-azul", "tema-cobre", "tema-sol");

    if (nomeTema === "livro") document.body.classList.add("tema-livro");
    if (nomeTema === "floresta") document.body.classList.add("tema-floresta");
    if (nomeTema === "nevoa") document.body.classList.add("tema-nevoa");
    if (nomeTema === "crepusculo") document.body.classList.add("tema-crepusculo");
    if (nomeTema === "azul") document.body.classList.add("tema-azul");
    if (nomeTema === "cobre") document.body.classList.add("tema-cobre");
    if (nomeTema === "sol") document.body.classList.add("tema-sol");
    if (nomeTema === "infinito") gerarTemaInfinito();

    if (selectEstante) selectEstante.value = nomeTema;
    if (selectSidebar) selectSidebar.value = nomeTema;
  }

  function mudarTemaSelecionado(event) {
    const novoTema = event.target.value;
    temaAtual = novoTema;
    aplicarTema(novoTema);
    localStorage.setItem("tema-preferido", novoTema);
  }

  if (selectEstante) {
    selectEstante.addEventListener("change", mudarTemaSelecionado);
    selectEstante.addEventListener("click", () => {
      if (selectEstante.value === "infinito") gerarTemaInfinito();
    });
  }
  if (selectSidebar) {
    selectSidebar.addEventListener("change", mudarTemaSelecionado);
    selectSidebar.addEventListener("click", () => {
      if (selectSidebar.value === "infinito") gerarTemaInfinito();
    });
  }
}

inicializarApp();
inicializarControleTema();

async function sincronizarLivrosDaNuvem() {
    const { data, error } = await supabaseClient
        .from('books') 
        .select('*');

    if (error) {
        console.error("Erro ao carregar do Supabase:", error.message);
        return;
    }

    if (data && data.length > 0) {
        localStorage.setItem("biblioteca-de-livros", JSON.stringify(data));
 
        if (typeof renderizarEstante === 'function') {
            renderizarEstante();
        } else {
            location.reload();
        }
    }
}

sincronizarLivrosDaNuvem();