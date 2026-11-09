
document.addEventListener("DOMContentLoaded", function () {

    const formPlanta = document.getElementById("formPlanta");
    const nomePlanta = document.getElementById("nomePlanta");
    const tipoPlanta = document.getElementById("tipoPlanta");
    const mensagemPlanta = document.getElementById("mensagemPlanta");

    const irrigacaoAutomatica = document.getElementById("irrigacaoAutomatica");
    const irrigacaoManual = document.getElementById("irrigacaoManual");
    const btnSalvarIrrigacao = document.getElementById("btnSalvarIrrigacao");
    const mensagemIrrigacao = document.getElementById("mensagemIrrigacao");

    const sonsAtivados = document.getElementById("sonsAtivados");
    const btnSalvarSons = document.getElementById("btnSalvarSons");
    const mensagemSons = document.getElementById("mensagemSons");

    function carregarConfiguracoes() {

        const nomeSalvo = localStorage.getItem("nomePlanta");
        const tipoSalvo = localStorage.getItem("tipoPlanta");

        const modoSalvo =
            localStorage.getItem("modoIrrigacao") ||
            localStorage.getItem("irrigacao");

        const sonsSalvos = localStorage.getItem("sonsAtivados");

        // Informações da planta
        if (nomeSalvo !== null) {
            nomePlanta.value = nomeSalvo;
        }

        if (tipoSalvo !== null) {
            tipoPlanta.value = tipoSalvo;
        }

        // Modo de irrigação
        if (modoSalvo === "automatica") {
            irrigacaoAutomatica.checked = true;
        } else if (modoSalvo === "manual") {
            irrigacaoManual.checked = true;
        }

        // Preferência de sons
        if (sonsSalvos !== null) {
            sonsAtivados.checked = sonsSalvos === "true";
        }
    }


    function exibirMensagem(elemento, texto, sucesso = true) {

        elemento.textContent = texto;
        elemento.classList.toggle("erro", !sucesso);
        elemento.classList.toggle("sucesso", sucesso);
    }


    // ========================================
    // SALVAR INFORMAÇÕES DA PLANTA
    // ========================================

    formPlanta.addEventListener("submit", function (evento) {

        evento.preventDefault();

        const nome = nomePlanta.value.trim();
        const tipo = tipoPlanta.value;

        if (nome === "" || tipo === "") {
            exibirMensagem(
                mensagemPlanta,
                "Preencha o nome e a categoria da planta.",
                false
            );

            return;
        }

        try {
            localStorage.setItem("nomePlanta", nome);
            localStorage.setItem("tipoPlanta", tipo);

            exibirMensagem(
                mensagemPlanta,
                "Informações da planta salvas com sucesso! 🌱"
            );

        } catch (erro) {
            exibirMensagem(
                mensagemPlanta,
                "Não foi possível salvar as informações.",
                false
            );
        }
    });


    // ========================================
    // SALVAR MODO DE IRRIGAÇÃO
    // ========================================

    btnSalvarIrrigacao.addEventListener("click", function () {

        let modoSelecionado;

        if (irrigacaoAutomatica.checked) {
            modoSelecionado = "automatica";
        } else if (irrigacaoManual.checked) {
            modoSelecionado = "manual";
        } else {
            exibirMensagem(
                mensagemIrrigacao,
                "Selecione um modo de irrigação.",
                false
            );

            return;
        }

        try {
            localStorage.setItem("modoIrrigacao", modoSelecionado);

            exibirMensagem(
                mensagemIrrigacao,
                "Modo de irrigação salvo com sucesso! 💧"
            );

        } catch (erro) {
            exibirMensagem(
                mensagemIrrigacao,
                "Não foi possível salvar o modo de irrigação.",
                false
            );
        }
    });


    // ========================================
    // SALVAR PREFERÊNCIA DE SONS
    // ========================================

    btnSalvarSons.addEventListener("click", function () {

        const ativarSons = sonsAtivados.checked;

        try {
            localStorage.setItem(
                "sonsAtivados",
                String(ativarSons)
            );

            exibirMensagem(
                mensagemSons,
                ativarSons
                    ? "Sons ativados! 🔊"
                    : "Sons desativados! 🔇"
            );

        } catch (erro) {
            exibirMensagem(
                mensagemSons,
                "Não foi possível salvar a preferência de sons.",
                false
            );
        }
    });


    // ========================================
    // INICIALIZAR A PÁGINA
    // ========================================

    carregarConfiguracoes();

});