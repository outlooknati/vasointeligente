const nomesPartes = {
    raiz: "Raiz",
    caule: "Caule",
    folhas: "Folhas",
    flores: "Flores",
    frutos: "Frutos e sementes"
};

// Explicações das partes
const informacoesPartes = {
    raiz: "Ajuda a planta a ficar firme no solo e absorve água e nutrientes.",

    caule: "Sustenta a planta e ajuda a transportar água e nutrientes.",

    folhas: "Usam a luz do Sol para ajudar a planta a produzir seu alimento.",

    flores: "Ajudam na reprodução de muitas plantas e podem dar origem aos frutos.",

    frutos: "Protegem as sementes, que podem dar origem a novas plantas."
};

// Seleciona todos os botões
const partesPlanta = document.querySelectorAll(".partePlanta");


// Adiciona o evento de clique
partesPlanta.forEach(function (parte) {
    parte.addEventListener("click", function () {
        // Verifica se o card clicado já está selecionado
        const estaSelecionado = parte.classList.contains("selecionado");

        // Fecha todos os cards e devolve o texto original
        partesPlanta.forEach(function (outraParte) {
            outraParte.classList.remove("selecionado");
            const nome = outraParte.querySelector("strong");
            nome.textContent = nomesPartes[outraParte.id];
        });

        if (estaSelecionado) {
            return;
        }

        // Seleciona o card clicado
        parte.classList.add("selecionado");

        // Mostra a explicação dentro do próprio botão
        const nome = parte.querySelector("strong");
        nome.textContent =
            nomesPartes[parte.id] +
            " — " +
            informacoesPartes[parte.id];
    });
});