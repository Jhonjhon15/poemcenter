document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("menuGaveta")) {
        const estruturaMenu = `
            <div id="menuOverlay" class="menu-overlay"></div>
            <aside id="menuGaveta" class="menu-gaveta">
                <div class="menu-cabecalho">
                    <span>☰ MENU POÉMICO</span>
                    <button id="btnFecharMenu" class="btn-fechar-menu">&times;</button>
                </div>
                <nav class="menu-nav-conteudo">
                    <div class="secao-titulo">Navegação Principal</div>
                    <ul class="menu-lista">
                        <li><a href="#" data-tipo="inicio">🏠 Início</a></li>
                        <li><a href="#" data-tipo="estante">📚 Estante Poética</a></li>
                        <li><a href="#" data-tipo="atmosfera">🎧 Atmosfera Poética</a></li>
                        <li><a href="#" data-tipo="pensamentos">✍️ Pensamentos</a></li>
                    </ul>

                    <div class="secao-titulo">Área do Leitor</div>
                    <ul class="menu-lista">
                        <li><a href="#" data-tipo="biblioteca">📖 Minha Biblioteca</a></li>
                        <li><a href="#" data-tipo="favoritos">⭐ Favoritos</a></li>
                    </ul>

                    <div class="secao-titulo">Personalización & Temas</div>
                    <ul class="menu-lista">
                        <li><a href="#" data-tipo="temas">🎨 Seletor de Temas</a></li>
                        <li><a href="#" data-tipo="caos">🌌 Caos Infinito</a></li>
                    </ul>

                    <div class="secao-titulo">Acessibilidade & Ajustes</div>
                    <ul class="menu-lista">
                        <li><a href="#" data-tipo="fonte">🔠 A+ / A-</a></li>
                        <li><a href="#" data-tipo="zen">🌙 Modo Zen</a></li>
                        <li><a href="#" data-tipo="vela">🕯️ Vela Virtual</a></li>
                    </ul>

                    <div class="secao-titulo">Comunidade & Sobre</div>
                    <ul class="menu-lista">
                        <li><a href="#" data-tipo="autor">👤 Sobre o Autor</a></li>
                        <li><a href="#" data-tipo="manifesto">📜 Manifesto</a></li>
                    </ul>
                </nav>
            </aside>
        `;
        document.body.insertAdjacentHTML("beforeend", estruturaMenu);
    }

    const gaveta = document.getElementById("menuGaveta");
    const overlay = document.getElementById("menuOverlay");
    const btnFechamento = document.getElementById("btnFecharMenu");

    const btnAbrir1 = document.getElementById("btnMenu");
    const btnAbrir2 = document.getElementById("btnMenuInterno");

    function abrirMenu(e) {
        if (e) e.preventDefault();
        if (gaveta) gaveta.classList.add("ativo");
        if (overlay) overlay.classList.add("ativo");
    }

    function fecharMenu() {
        if (gaveta) gaveta.classList.remove("ativo");
        if (overlay) overlay.classList.remove("ativo");
    }

    if (btnAbrir1) btnAbrir1.addEventListener("click", abrirMenu);
    if (btnAbrir2) btnAbrir2.addEventListener("click", abrirMenu);
    
    if (btnFechamento) btnFechamento.addEventListener("click", fecharMenu);
    if (overlay) overlay.addEventListener("click", fecharMenu);
});