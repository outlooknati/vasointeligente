const informacoesCuidados = {

    plantaSeca:
        "💧 Se o solo estiver seco e a planta precisar de água, é hora de regar.",

    plantaEscura:
        "☀️ Descubra quanta luz sua planta precisa e coloque-a em um local adequado para ela.",

    plantaFolhas:
        "🍃 Manter as folhas limpas ajuda você a observar melhor a saúde da planta.",

    plantaMuitoMolhada:
        "💦 Cuidado! O excesso de água também pode prejudicar a planta. Observe a umidade antes de regar novamente."
};

const opcoesCuidado =
    document.querySelectorAll(".opcaoCuidado");

opcoesCuidado.forEach(function (opcao) {
    opcao.addEventListener("click", function () {
        const estaSelecionado =
            opcao.classList.contains("selecionado");

        // Remove a seleção e as explicações anteriores
        opcoesCuidado.forEach(function (outraOpcao) {
            outraOpcao.classList.remove("selecionado");
            const explicacao =
                outraOpcao.querySelector(".explicacaoCuidado");
            if (explicacao) {
                explicacao.remove();
            }
        });

        if (estaSelecionado) {
            return;
        }
        // Seleciona a opção
        opcao.classList.add("selecionado");
        // Cria a explicação
        const explicacao =
            document.createElement("p");
        explicacao.classList.add("explicacaoCuidado");
        explicacao.textContent =
            informacoesCuidados[opcao.id];

        // Coloca a explicação dentro da opção
        opcao.appendChild(explicacao);
    });
});