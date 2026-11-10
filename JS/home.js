const nomePlanta = localStorage.getItem("nomePlanta");
const mascote = localStorage.getItem("mascote");
const ultimaRega = localStorage.getItem("ultimaRega");

const ultimaRegaElemento = document.getElementById("ultimaRega");

const mascoteMensagem = document.getElementById("mascoteMensagem");
const mascoteHome = document.getElementById("mascoteHome");

const umidadeElemento = document.getElementById("umidade");
const nivelReservatorio = document.getElementById("nivelReservatorio");
const porcentagemReservatorio = document.getElementById("porcentagemReservatorio");
const secaoMascote = document.querySelector(".mascote");


montarMascote(mascoteHome, mascote, chapeuEquipado());


// ========================================
// ESTADO DA PLANTA
// Hoje os valores são de teste. Você vai ter que mudar aqui Nati Sales 
//   umidade     → "seca", "adequada" ou "encharcada"
//   reservatorio → número de 0 a 100 (porcentagem)
// ========================================

function lerEstadoDaPlanta() {

    const parametros = new URLSearchParams(window.location.search);

    const umidade = parametros.get("umidade");
    const reservatorio = Number(parametros.get("reservatorio"));

    return {
        umidade: ["seca", "adequada", "encharcada"].includes(umidade)
            ? umidade
            : "adequada",

        reservatorio: parametros.get("reservatorio") !== null
            && !Number.isNaN(reservatorio)
            ? Math.min(100, Math.max(0, reservatorio))
            : 98
    };
}


// ========================================
// MENSAGENS DO MASCOTE
// ========================================

const LIMITE_RESERVATORIO_VAZIO = 10;     // % ou menos: quase vazio
const LIMITE_RESERVATORIO_BAIXO = 25;     // % ou menos: ficando baixo

const MENSAGENS = {

    seca_e_sem_agua: [
        "{nome} está com sede e o reservatório está quase vazio! Vamos encher?"
    ],

    seca: [
        "{nome} está com sede! Que tal regar?",
        "Glub, glub... {nome} quer água!",
        "A terra de {nome} está seca. Hora de regar!"
    ],

    encharcada: [
        "Ops! {nome} recebeu água demais. Vamos esperar a terra secar?",
        "A terra de {nome} está bem molhada. Nada de regar agora!"
    ],

    reservatorio_vazio: [
        "O reservatório está quase vazio! Precisamos encher.",
        "Socorro, a água está acabando! Vamos encher o reservatório?"
    ],

    reservatorio_baixo: [
        "{nome} está bem, mas o reservatório está baixo.",
        "Tudo certo com {nome}! Só fique de olho na água do reservatório."
    ],

    tudo_bem: [
        "{nome} está saudável!",
        "{nome} está bem feliz hoje!",
        "Tudo certo com {nome}!",
        "{nome} agradece o seu carinho!"
    ]
};


// Descobre qual situação vale agora (a mais urgente ganha).
function situacaoDaPlanta(estado) {

    const semAgua = estado.reservatorio <= LIMITE_RESERVATORIO_VAZIO;
    const aguaBaixa = estado.reservatorio <= LIMITE_RESERVATORIO_BAIXO;

    if (estado.umidade === "seca" && semAgua) {
        return "seca_e_sem_agua";
    }

    if (estado.umidade === "seca") {
        return "seca";
    }

    if (estado.umidade === "encharcada") {
        return "encharcada";
    }

    if (semAgua) {
        return "reservatorio_vazio";
    }

    if (aguaBaixa) {
        return "reservatorio_baixo";
    }

    return "tudo_bem";
}


function escolherMensagem(situacao, nome) {

    const lista = MENSAGENS[situacao];
    const texto = lista[Math.floor(Math.random() * lista.length)];

    return texto.replace(/\{nome\}/g, nome);
}


// ========================================
// ATUALIZAR A TELA
// ========================================

const TEXTO_UMIDADE = {
    seca: "Baixa",
    adequada: "Adequada",
    encharcada: "Alta"
};

let situacaoAtual = null;

function atualizarTela(estado) {

    const situacao = situacaoDaPlanta(estado);

    // só sorteia uma mensagem nova quando a situação MUDA
    if (situacao !== situacaoAtual) {
        situacaoAtual = situacao;

        mascoteMensagem.textContent =
            escolherMensagem(situacao, nomePlanta || "Sua planta");

        secaoMascote.dataset.situacao = situacao;

        anunciarSituacao(situacao);
    }

    umidadeElemento.textContent = TEXTO_UMIDADE[estado.umidade];

    porcentagemReservatorio.textContent = estado.reservatorio + "%";
    nivelReservatorio.style.width = estado.reservatorio + "%";
}


// ========================================
// VOZ DO MASCOTE
// Tocar no mascote: faz o sonzinho da situação
// Quando a situação muda: ele fala sozinho UMA vez.
// ========================================

const CHAVE_ULTIMA_FALADA = "ultimaSituacaoFalada";

const SOM_AO_MUDAR = {
    tudo_bem: "feliz"
};

let situacaoPendente = null;

function lembrarSituacaoFalada(situacao) {
    localStorage.setItem(CHAVE_ULTIMA_FALADA, situacao);
}

function mascoteFalando() {

    mascoteHome.classList.remove("querFalar");
    mascoteHome.classList.remove("falando");

    void mascoteHome.offsetWidth;

    mascoteHome.classList.add("falando");

    setTimeout(function () {
        mascoteHome.classList.remove("falando");
    }, 1000);
}

async function anunciarSituacao(situacao) {

    const anterior = localStorage.getItem(CHAVE_ULTIMA_FALADA);

    // mesma situação de antes: não repete
    if (anterior === situacao) return;

    // primeira vez que abre o app e está tudo bem: não precisa falar
    if (anterior === null && situacao === "tudo_bem") {
        lembrarSituacaoFalada(situacao);
        return;
    }

    const somDaMudanca = SOM_AO_MUDAR[situacao] || situacao;

    const resultado = await Som.tocarVoz(somDaMudanca);

    if (resultado === "ok") {
        lembrarSituacaoFalada(situacao);
        mascoteFalando();
        return;
    }

    if (resultado === "bloqueado") {
        situacaoPendente = situacao;
        mascoteHome.classList.add("querFalar");
        return;
    }

    lembrarSituacaoFalada(situacao);
}

async function aoTocarNoMascote() {
    const situacao = situacaoPendente || situacaoAtual;
    if (!situacao) return;
    const nomeSom = situacaoPendente
        ? (SOM_AO_MUDAR[situacaoPendente] || situacaoPendente)
        : situacao;
    const resultado = await Som.tocarVoz(nomeSom);
    if (resultado === "ok") {
        mascoteFalando();
        if (situacaoPendente) {
            lembrarSituacaoFalada(situacaoPendente);
            situacaoPendente = null;
        }
        return;
    }
    if (resultado === "sem-arquivo") {
        mascoteFalando();
    }
}

mascoteHome.setAttribute("role", "button");
mascoteHome.setAttribute("tabindex", "0");
mascoteHome.setAttribute("aria-label", "Toque para ouvir o mascote");

mascoteHome.addEventListener("click", aoTocarNoMascote);

mascoteHome.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        aoTocarNoMascote();
    }
});

atualizarTela(lerEstadoDaPlanta());

if (ultimaRega) {
    ultimaRegaElemento.textContent = ultimaRega;
}
