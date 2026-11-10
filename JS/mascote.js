const mascote = localStorage.getItem("mascote");

const imagemMascote = document.getElementById("mascoteMascote");

// monta o mascote escolhido no cadastro, já com o chapéu que ele está usando
montarMascote(imagemMascote, mascote, chapeuEquipado());

// pontos
let pontos = Number(localStorage.getItem("pontos")) || 0;

const quantidadePontos = document.getElementById("quantidadePontos");

quantidadePontos.textContent = pontos;

function adicionarPontos(valor) {
    pontos += valor;

    localStorage.setItem("pontos", pontos);

    quantidadePontos.textContent = pontos;

}

// botão personalizar
const btnPersonalizar = document.getElementById("btnPersonalizar");

btnPersonalizar.addEventListener("click", function() {
    window.location.href = "loja.html";
});