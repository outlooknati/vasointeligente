const PRECO_PADRAO = 30;

const CHAPEUS = [
    { id: "cartola", numero: 1, nome: "Cartola",           img: "../IMG/chapeu1.webp", escala: 0.60, afundar: 8 },
    { id: "flores", numero: 2,  nome: "Coroa de flores",   img: "../IMG/chapeu2.webp",  escala: 1.00, afundar: 30 },
    { id: "laco", numero: 3,    nome: "Laço",              img: "../IMG/chapeu3.webp",    escala: 0.55, afundar: 25, dx: 0.22, rot: 14 },
    { id: "helice", numero: 4,  nome: "Chapéu de hélice",  img: "../IMG/chapeu4.webp",  escala: 0.78, afundar: 10 },
    { id: "coroa", numero: 5,   nome: "Coroa de cristal",  img: "../IMG/chapeu5.webp",   escala: 0.70, afundar: 15 },
    { id: "sol", numero: 6,     nome: "Chapéu de sol",     img: "../IMG/chapeu6.webp",     escala: 1.35, afundar: 18 }
];

const MASCOTES = {
    sapo:    { img: "../IMG/mascote_sapo.webp",    largura: 417, altura: 474, x: 0.50, topo: 0.09, cabeca: 0.635, prontos: true },
    axolote: { img: "../IMG/mascote_axolote.webp", largura: 497, altura: 430, x: 0.50, topo: 0.13, cabeca: 0.45, prontos: true }
};


function normalizarMascote(valor) {

    const texto = String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

    return texto.includes("axol") ? "axolote" : "sapo";
}


function acharChapeu(id) {
    return CHAPEUS.find(function (chapeu) {
        return chapeu.id === id;
    });
}


// Monta o mascote
function montarMascote(container, valorMascote, idChapeu) {

    const id = normalizarMascote(valorMascote);
    const dados = MASCOTES[id];

    container.innerHTML = "";
    container.classList.add("mascoteVisual");

    container.style.setProperty("--proporcao", dados.largura + " / " + dados.altura);
    container.style.setProperty("--x", dados.x);
    container.style.setProperty("--topo", dados.topo);
    container.style.setProperty("--cabeca", dados.cabeca);

    container.dataset.mascote = id;

    const corpo = document.createElement("img");
    corpo.className = "mascoteCorpo";

    if (dados.prontos) {
        corpo.addEventListener("load", function () {
            container.style.setProperty(
                "--proporcao",
                corpo.naturalWidth + " / " + corpo.naturalHeight
            );
        });
    }

    corpo.src = dados.img;
    corpo.alt = "Seu mascote";
    container.appendChild(corpo);

    const chapeu = document.createElement("img");
    chapeu.className = "mascoteChapeu";
    chapeu.alt = "";
    chapeu.hidden = true;
    container.appendChild(chapeu);

    trocarChapeu(container, idChapeu, false);
}


// Troca o chapéu
function trocarChapeu(container, idChapeu, animar) {

    const id = container.dataset.mascote;
    const mascote = MASCOTES[id];
    const corpo = container.querySelector(".mascoteCorpo");
    const imagem = container.querySelector(".mascoteChapeu");
    const dados = acharChapeu(idChapeu);

    if (mascote.prontos) {
        imagem.hidden = true;
        corpo.onerror = function () {
            corpo.onerror = null;
            corpo.src = mascote.img;
        };
        corpo.src = dados
            ? "../IMG/" + id + "_" + dados.numero + ".webp"
            : mascote.img;
        reiniciarAnimacao(animar ? corpo : null);
        return;
    }

    if (!dados) {
        imagem.hidden = true;
        return;
    }

    imagem.src = dados.img;
    imagem.style.setProperty("--escala", dados.escala);
    imagem.style.setProperty("--afundar", dados.afundar);
    imagem.style.setProperty("--dx", dados.dx || 0);
    imagem.style.setProperty("--rot", (dados.rot || 0) + "deg");
    imagem.hidden = false;
    reiniciarAnimacao(animar ? imagem : null);
}

function reiniciarAnimacao(elemento) {

    if (!elemento) {
        return;
    }

    elemento.classList.remove("troca");
    void elemento.offsetWidth;
    elemento.classList.add("troca");
}


// ==========================================================
// PONTOS E COMPRAS
// ==========================================================

function precoDoChapeu(id) {
    const dados = acharChapeu(id);

    return dados && dados.preco !== undefined ? dados.preco : PRECO_PADRAO;
}


function lerPontos() {
    try {
        return Number(localStorage.getItem("pontos")) || 0;
    } catch (erro) {
        return 0;
    }
}


function lerComprados() {
    try {
        const lista = JSON.parse(localStorage.getItem("chapeusComprados"));

        return Array.isArray(lista) ? lista.filter(acharChapeu) : [];

    } catch (erro) {
        return [];
    }
}


function jaComprou(id) {
    return lerComprados().includes(id);
}

function comprarChapeu(id) {
    if (!acharChapeu(id)) {
        return { ok: false, motivo: "inexistente" };
    }

    if (jaComprou(id)) {
        return { ok: false, motivo: "ja_tem" };
    }

    const preco = precoDoChapeu(id);
    const pontos = lerPontos();

    if (pontos < preco) {
        return { ok: false, motivo: "pontos", faltam: preco - pontos };
    }

    try {
        const comprados = lerComprados();
        comprados.push(id);

        localStorage.setItem("chapeusComprados", JSON.stringify(comprados));
        localStorage.setItem("pontos", pontos - preco);

        return { ok: true, pontos: pontos - preco };

    } catch (erro) {
        return { ok: false, motivo: "erro" };
    }
}


// Chapéu que o mascote está usando
function chapeuEquipado() {
    try {
        const id = localStorage.getItem("chapeu");
        return acharChapeu(id) && jaComprou(id) ? id : "";
    } catch (erro) {
        return "";
    }
}