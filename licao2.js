const informacoesUmidade = {

    soloSeco:
        "O solo está com pouca água e precisamos regá-la. A planta fica com tanta sede que perde a força e murcha, parecendo cansada. As folhas ficam secas e quebradiças",

    soloAdequado:
        "O solo tem uma quantidade boa de umidade para a planta. Ela bebe a água na medida certa, usa a luz do sol para fazer sua comida e fica com folhas bem verdes, firmes e floridas, crescendo forte e feliz",

    soloUmido:
        "O solo está com muita água. A raiz fica 'afogada' porque a terra fica cheia de água e sem ar para ela respirar. As raízes apodrecem e a planta não consegue mais comer nem beber, ficando amarela e molenga"
};

const opcoesUmidade = document.querySelectorAll(".opcaoUmidade");

opcoesUmidade.forEach(function (opcao) {
    opcao.addEventListener("click", function () {
        // Verifica se o card clicado já está selecionado
        const estaSelecionado =
            opcao.classList.contains("selecionado");

        // Fecha todas as opções
        opcoesUmidade.forEach(function (outraOpcao) {

            outraOpcao.classList.remove("selecionado");
            const explicacao =
                outraOpcao.querySelector(".explicacaoUmidade");

            if (explicacao) {
                explicacao.remove();
            }
        });

        if (estaSelecionado) {
            return;
        }

        // Seleciona a opção clicada
        opcao.classList.add("selecionado");

        // Cria o texto da explicação
        const explicacao = document.createElement("p");
        explicacao.classList.add("explicacaoUmidade");
        explicacao.textContent =
            informacoesUmidade[opcao.id];

        // Coloca a explicação dentro do próprio botão
        opcao.appendChild(explicacao);
    });
});