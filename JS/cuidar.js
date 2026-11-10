const tipoPlanta = localStorage.getItem("tipoPlanta");
// "modoIrrigacao" é o que as Configurações salvam; "irrigacao" é o do cadastro
const irrigacao =
    localStorage.getItem("modoIrrigacao") ||
    localStorage.getItem("irrigacao");

const tipoPlantaElemento = document.getElementById("tipo_planta");
const dicaElemento = document.getElementById("dica");
const irrigacaoElemento = document.getElementById("irrigacaoAutomatica");

const btnRegar = document.getElementById("btnRegar");
const listaHistorico = document.getElementById("listaHistorico");

const nomesPlantas = {
    cactos: "Cactos",
    suculentas: "Suculenta",
    tropicais: "Planta tropical",
    floridas: "Planta florida",
    samambaias: "Samambaia",
    orquideas: "Orquídea",
    temperos: "Tempero",
    frutiferas: "Planta frutífera"
};

const dicasPlantas = {
    cactos: "Essa planta precisa de pouca água!",
    suculentas: "Essa planta prefere pouca água!",
    tropicais: "Essa planta gosta bastante de água!",
    floridas: "Essa planta precisa de cuidados frequentes!",
    samambaias: "Essa planta gosta de umidade!",
    orquideas: "Essa planta precisa de regas moderadas!",
    temperos: "Essa planta precisa de regas regulares!",
    frutiferas: "Essa planta precisa de bastante cuidado!"
};


tipoPlantaElemento.textContent = nomesPlantas[tipoPlanta];

dicaElemento.textContent = dicasPlantas[tipoPlanta];

// irrigação
if (irrigacao === "automatica") {
    irrigacaoElemento.textContent = "Ativa";
    irrigacaoElemento.classList.add("ativa");
} else {
    irrigacaoElemento.textContent = "Desativada";
    irrigacaoElemento.classList.add("desativada");
}

// botão regar
let historico = JSON.parse(localStorage.getItem("historicoRegas")) || [];

btnRegar.addEventListener("click", function() {

    const agora = new Date();

    const dia = agora.getDate().toString().padStart(2, "0");
    const mes = (agora.getMonth() + 1).toString().padStart(2, "0");
    const ano = agora.getFullYear();

    const hora = agora.getHours().toString().padStart(2, "0");
    const minutos = agora.getMinutes().toString().padStart(2, "0");

    const data = `${dia}/${mes}/${ano}`;
    const horario = `${hora}:${minutos}`;

    localStorage.setItem("ultimaRega", `${data} às ${horario}`);

    const novaRega = {
        data: data,
        horario: horario,
        tipo: "manual"
    };

    historico.unshift(novaRega);

    historico = historico.slice(0, 8);

    localStorage.setItem("historicoRegas", JSON.stringify(historico));

    mostrarHistorico();

});

mostrarHistorico();

function mostrarHistorico() {
    listaHistorico.innerHTML = "";
    historico.forEach(function(rega) {
        const item = document.createElement("p");

        const tipo = rega.tipo === "manual" ? "Manual" : "Automática";

        item.textContent = `💧 ${rega.data} às ${rega.horario} — ${tipo}`;

        listaHistorico.appendChild(item);
    });
}