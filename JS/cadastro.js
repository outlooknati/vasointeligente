const nomeUsuario = document.getElementById("nomeUsuario");
const nomePlanta = document.getElementById("nomePlanta");

const cardsPlanta = document.querySelectorAll(".cardPlanta");
const cardsMascote = document.querySelectorAll(".cardMascote");
const cardsIrrigacao = document.querySelectorAll(".cardIrrigacao");

const btnComecar = document.getElementById("btnComecar");


// cards das plantas
let tipoPlanta;
cardsPlanta.forEach(function(card) {
    card.addEventListener("click", function() {
        if (card.classList.contains("selecionado")) {
            card.classList.remove("selecionado");
            tipoPlanta = undefined;

        } else {
            cardsPlanta.forEach(function(card) {
                card.classList.remove("selecionado");
            });
            tipoPlanta = card.dataset.planta;
            card.classList.add("selecionado");

        }
        console.log(tipoPlanta);
    });
});

// cards dos mascotes
let mascote;
cardsMascote.forEach(function(card) {
    card.addEventListener("click", function() {
        if (card.classList.contains("selecionado")) {
            card.classList.remove("selecionado");
            mascote = undefined;

        } else {
            cardsMascote.forEach(function(card) {
                card.classList.remove("selecionado");
            });
            mascote = card.dataset.mascote;
            card.classList.add("selecionado");
        }
        console.log(mascote);
    });
});

// card irrigação
let irrigacao;
cardsIrrigacao.forEach(function(card) {
    card.addEventListener("click", function() {
        if (card.classList.contains("selecionado")) {
            card.classList.remove("selecionado");
            irrigacao = undefined;
        } else {
            cardsIrrigacao.forEach(function(card) {
                card.classList.remove("selecionado");
            });
            irrigacao = card.dataset.irrigacao;
            card.classList.add("selecionado");
        }
        console.log(irrigacao);
    });
});

// botão começar + validação
btnComecar.addEventListener("click", function() {
    const nome = nomeUsuario.value.trim();
    const planta = nomePlanta.value.trim();
    if (nome === "") {
        alert("Digite seu nome!");
        return;
    }

    if (planta === "") {
        alert("Digite o nome da sua planta!");
        return;
    }

    if (!tipoPlanta) {
        alert("Escolha um tipo de planta!");
        return;
    }

    if (!mascote) {
        alert("Escolha um mascote!");
        return;
    }

    if (!irrigacao) {
        alert("Escolha como sua planta será regada!");
        return;
    }

    localStorage.clear();

    localStorage.setItem("nomeUsuario", nome);
    localStorage.setItem("nomePlanta", planta);
    localStorage.setItem("tipoPlanta", tipoPlanta);
    localStorage.setItem("mascote", mascote);
    localStorage.setItem("irrigacao", irrigacao);

    console.log("Cadastro salvo!");

    window.location.href = "home.html";
});