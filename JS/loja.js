// ---- sons: carrega o som.js se a página ainda não carregou ----
if (typeof Som === "undefined") {
    const scriptSom = document.createElement("script");
    scriptSom.src = new URL("som.js", document.currentScript.src).href;
    document.head.appendChild(scriptSom);
}

function tocarSom(nome) {
    if (typeof Som !== "undefined") {
        Som.efeito(nome);
    }
}


document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // ELEMENTOS DO HTML
    // ========================================

    const palco = document.getElementById("mascoteVisual");
    const nomeChapeuAtual = document.getElementById("nomeChapeuAtual");
    const pontosLoja = document.getElementById("pontosLoja");
    const cards = document.querySelectorAll(".cardChapeu");
    const btnSalvar = document.getElementById("btnSalvarChapeu");
    const mensagem = document.getElementById("mensagemChapeu");

    const dialogo = document.getElementById("dialogoCompra");
    const dialogoImagem = document.getElementById("dialogoImagem");
    const dialogoTitulo = document.getElementById("dialogoTitulo");
    const dialogoTexto = document.getElementById("dialogoTexto");
    const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");
    const btnCancelarCompra = document.getElementById("btnCancelarCompra");


    // ========================================
    // ESTADO
    // ========================================

    // "" = sem chapéu
    let chapeuSalvo = chapeuEquipado();       // o que está vestindo
    let chapeuEscolhido = chapeuSalvo;        // o que está experimentando

    let mascoteSalvo = null;

    try {
        mascoteSalvo = localStorage.getItem("mascote");
    } catch (erro) {
        mascoteSalvo = null;
    }


    // ========================================
    // SELOS DE PREÇO NOS CARDS
    // (criados aqui para você não precisar mexer no HTML)
    // ========================================

    cards.forEach(function (card) {

        const selo = document.createElement("span");

        selo.className = "seloPreco";
        selo.innerHTML =
            '<i class="icone icone-estrela"></i>' +
            "<span>" + precoDoChapeu(card.dataset.chapeu) + "</span>";

        card.appendChild(selo);
    });


    // ========================================
    // ATUALIZAR A TELA
    // ========================================

    function atualizarPontos() {
        pontosLoja.textContent = lerPontos();
    }

    function atualizarCards() {

        const comprados = lerComprados();

        cards.forEach(function (card) {

            const id = card.dataset.chapeu;
            const marcado = id === chapeuEscolhido;
            const bloqueado = !comprados.includes(id);

            card.classList.toggle("selecionado", marcado);
            card.classList.toggle("bloqueado", bloqueado);
            card.setAttribute("aria-pressed", marcado);

            // leitores de tela: avisa o preço
            const nome = acharChapeu(id).nome;

            card.setAttribute(
                "aria-label",
                bloqueado ? nome + ", " + precoDoChapeu(id) + " pontos" : nome
            );
        });
    }

    function atualizarNome() {

        const dados = acharChapeu(chapeuEscolhido);

        nomeChapeuAtual.textContent = dados ? dados.nome : "Sem chapéu";
    }

    // Estados do botão:
    //   "nada"    → sem nada para fazer (desligado)
    //   "salvar"  → chapéu já comprado (ou sem chapéu) ainda não vestido
    //   "comprar" → chapéu que precisa ser comprado
    //   "faltam"  → chapéu que precisa ser comprado, mas faltam pontos
    function estadoBotao() {

        if (chapeuEscolhido === "") {
            return chapeuSalvo === "" ? "nada" : "salvar";
        }

        if (!jaComprou(chapeuEscolhido)) {
            return lerPontos() >= precoDoChapeu(chapeuEscolhido)
                ? "comprar"
                : "faltam";
        }

        return chapeuEscolhido === chapeuSalvo ? "nada" : "salvar";
    }

    function atualizarBotao() {

        const estado = estadoBotao();

        btnSalvar.disabled = (estado === "nada" || estado === "faltam");

        if (estado === "comprar") {

            btnSalvar.textContent =
                "Comprar por " + precoDoChapeu(chapeuEscolhido) + " pontos";

        } else if (estado === "faltam") {

            const faltam = precoDoChapeu(chapeuEscolhido) - lerPontos();

            btnSalvar.textContent =
                "Faltam " + faltam + (faltam === 1 ? " ponto" : " pontos");

        } else if (estado === "salvar") {

            btnSalvar.textContent = chapeuEscolhido
                ? "Usar chapéu"
                : "Ficar sem chapéu";

        } else {

            btnSalvar.textContent = chapeuSalvo
                ? "Chapéu salvo ✓"
                : "Escolha um chapéu";
        }
    }

    function atualizarTudo() {

        atualizarPontos();
        atualizarCards();
        atualizarNome();
        atualizarBotao();
    }


    // ========================================
    // INICIAR
    // ========================================

    montarMascote(palco, mascoteSalvo, chapeuEscolhido);

    atualizarTudo();


    // ========================================
    // ESCOLHER / EXPERIMENTAR UM CHAPÉU
    // Experimentar é de graça. Tocar de novo tira o chapéu.
    // ========================================

    cards.forEach(function (card) {

        card.addEventListener("click", function () {

            const id = card.dataset.chapeu;

            chapeuEscolhido = (chapeuEscolhido === id) ? "" : id;

            trocarChapeu(palco, chapeuEscolhido, true);

            // som ao experimentar (não toca ao tirar o chapéu)
            if (chapeuEscolhido) {
                tocarSom("chapeu");
            }

            mensagem.textContent = "";
            mensagem.classList.remove("erro");

            atualizarCards();
            atualizarNome();
            atualizarBotao();
        });
    });


    // ========================================
    // SALVAR OU COMPRAR
    // ========================================

    function salvarChapeu() {

        try {
            if (chapeuEscolhido) {
                localStorage.setItem("chapeu", chapeuEscolhido);
            } else {
                localStorage.removeItem("chapeu");
            }

            chapeuSalvo = chapeuEscolhido;

            mensagem.classList.remove("erro");
            mensagem.textContent = chapeuSalvo
                ? "Salvo! Seu mascote ficou estiloso."
                : "Salvo! Seu mascote está sem chapéu.";

        } catch (erro) {
            mensagem.classList.add("erro");
            mensagem.textContent = "Não foi possível salvar o chapéu.";
        }
    }

    btnSalvar.addEventListener("click", function () {

        const estado = estadoBotao();

        if (estado === "salvar") {
            salvarChapeu();
            atualizarTudo();
            return;
        }

        if (estado === "comprar") {
            abrirConfirmacao();
        }
    });


    // ========================================
    // CONFIRMAR A COMPRA (janelinha)
    // ========================================

    function abrirConfirmacao() {

        const dados = acharChapeu(chapeuEscolhido);
        const preco = precoDoChapeu(chapeuEscolhido);
        const sobra = lerPontos() - preco;

        dialogoImagem.src = dados.img;
        dialogoTitulo.textContent = "Comprar " + dados.nome + "?";
        dialogoTexto.textContent =
            "Custa " + preco + " pontos. Depois da compra, você fica com " +
            sobra + (sobra === 1 ? " ponto." : " pontos.");

        // navegadores sem <dialog>: usa a caixinha simples
        if (typeof dialogo.showModal !== "function") {

            if (window.confirm(dialogoTitulo.textContent + " " + dialogoTexto.textContent)) {
                concluirCompra();
            }

            return;
        }

        dialogo.showModal();
    }

    function concluirCompra() {

        const resultado = comprarChapeu(chapeuEscolhido);

        if (!resultado.ok) {

            mensagem.classList.add("erro");
            mensagem.textContent = resultado.motivo === "pontos"
                ? "Você ainda não tem pontos suficientes."
                : "Não foi possível comprar o chapéu.";

            atualizarTudo();
            return;
        }

        // comprou: já veste o chapéu novo
        salvarChapeu();

        // sonzinho de compra
        tocarSom("compra");

        mensagem.classList.remove("erro");
        mensagem.textContent = "Comprado! Seu mascote ficou estiloso.";

        atualizarTudo();
    }

    btnConfirmarCompra.addEventListener("click", function () {

        dialogo.close();
        concluirCompra();
    });

    btnCancelarCompra.addEventListener("click", function () {
        dialogo.close();
    });

});
