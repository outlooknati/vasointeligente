// carrega o som.js se a página ainda não carregou
if (typeof Som === "undefined") {
    const scriptSom = document.createElement("script");
    scriptSom.src = new URL("../som.js", document.currentScript.src).href;
    document.head.appendChild(scriptSom);
}
function tocarSom(nome) {
    if (typeof Som !== "undefined") {
        Som.efeito(nome);
    }
}
const perguntas = [
    {
        pergunta: "Por que a luz é importante para as plantas?",
        opcoes: [
            "Porque substitui a água",
            "Porque fornece energia para a planta produzir seu alimento",
            "Porque faz a raiz absorver nutrientes",
            "Porque mantém o solo úmido"
        ],
        respostaCorreta: 1,
        explicacao:
            "A luz fornece a energia necessária para a planta produzir seu próprio alimento durante a fotossíntese."
    },
    {
        pergunta: "O que é a fotossíntese?",
        opcoes: [
            "O processo pelo qual a planta usa a luz solar para fabricar seu próprio alimento",
            "O processo de absorção de água pelas raízes da planta",
            "O movimento das folhas em direção ao vento",
            "A queda das folhas durante o outono"
        ],
        respostaCorreta: 0,
        explicacao:
            "A fotossíntese é a forma como a planta produz energia (glicose) utilizando a luz do sol, a água do solo e o gás carbônico do ar."
    },
    {
        pergunta: "O que a planta produz durante a fotossíntese?",
        opcoes: [
            "Apenas água",
            "Somente gás carbônico",
            "Glicose e oxigênio",
            "Apenas nutrientes do solo"
        ],
        respostaCorreta: 2,
        explicacao:
            "Durante a fotossíntese, a planta produz glicose, que utiliza como alimento e fonte de energia, e libera oxigênio para o ambiente."
    },
    {
        pergunta: "Qual gás entra pelas folhas e participa da fotossíntese?",
        opcoes: [
            "Oxigênio",
            "Gás carbônico",
            "Vapor de água",
            "Nitrogênio"
        ],
        respostaCorreta: 1,
        explicacao:
            "O gás carbônico entra pelas folhas e participa da produção de glicose durante a fotossíntese."
    },
    {
        pergunta: "Qual afirmação sobre a necessidade de luz das plantas é verdadeira?",
        opcoes: [
            "Todas as plantas precisam da mesma quantidade de luz",
            "Nenhuma planta precisa de luz direta",
            "Cada planta pode ter uma necessidade diferente de luz",
            "Todas as plantas precisam ficar sob sol intenso"
        ],
        respostaCorreta: 2,
        explicacao:
            "Cada planta pode ter uma necessidade diferente de luz. Algumas gostam de bastante luz, enquanto outras preferem claridade sem sol direto intenso."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz3QuestoesAcertadas")
) || [];
const progressoBarra = document.getElementById("progressoBarra");
const numeroPergunta = document.getElementById("numeroPergunta");
const pontosQuiz = document.getElementById("pontosQuiz");
const pergunta = document.getElementById("pergunta");
const opcoesQuiz = document.querySelector(".opcoesQuiz");
const cabecalhoQuiz = document.querySelector(".cabecalhoQuiz");
const perguntaQuizSecao = document.querySelector(".perguntaQuiz");
const feedbackQuiz = document.getElementById("feedbackQuiz");
const tituloFeedback = document.getElementById("tituloFeedback");
const textoFeedback = document.getElementById("textoFeedback");
const btnProxima = document.getElementById("btnProxima");
const resultadoQuiz = document.getElementById("resultadoQuiz");
const pontosFinais = document.getElementById("pontosFinais");
const mensagemResultado = document.getElementById("mensagemResultado");
function mostrarPergunta() {
    const questao = perguntas[perguntaAtual];
    respondeu = false;
    numeroPergunta.textContent = perguntaAtual + 1;
    pergunta.textContent = questao.pergunta;
    pontosQuiz.textContent =
        pontos + pontosGanhosNaTentativa;
    progressoBarra.style.width =
        (perguntaAtual / perguntas.length * 100) + "%";
    feedbackQuiz.classList.remove(
        "mostrar",
        "acerto",
        "erro"
    );
    tituloFeedback.textContent = "";
    textoFeedback.textContent = "";
    btnProxima.classList.remove("mostrar");
    opcoesQuiz.innerHTML = "";
    questao.opcoes.forEach(function (opcao, indice) {
        const botao = document.createElement("button");
        botao.classList.add("opcaoQuiz");
        botao.type = "button";
        botao.textContent = opcao;
        botao.addEventListener("click", function () {
            verificarResposta(indice, botao);
        });
        opcoesQuiz.appendChild(botao);
    });
}
function verificarResposta(indiceEscolhido, botaoEscolhido) {
    if (respondeu) return;
    respondeu = true;
    const questao = perguntas[perguntaAtual];
    const botoes =
        document.querySelectorAll(".opcaoQuiz");
    botoes.forEach(function (botao) {
        botao.disabled = true;
    });
    if (indiceEscolhido === questao.respostaCorreta) {
        botaoEscolhido.classList.add("correta");
        feedbackQuiz.classList.add("acerto");
        tocarSom("acerto");
        if (!questoesAcertadas.includes(perguntaAtual)) {
            pontosGanhosNaTentativa += 3;
            questoesAcertadas.push(perguntaAtual);
            localStorage.setItem(
                "quiz3QuestoesAcertadas",
                JSON.stringify(questoesAcertadas)
            );
            // salva a questão e os 3 pontos juntos (sair no meio não perde pontos)
            const pontosAtuais =
                Number(localStorage.getItem("pontos")) || 0;
            localStorage.setItem("pontos", pontosAtuais + 3);
            tituloFeedback.textContent =
                "🎉 Muito bem!";
            textoFeedback.textContent =
                questao.explicacao +
                " Você ganhou 3 pontos.";
        } else {
            tituloFeedback.textContent =
                "🌟 Você já conquistou essa questão!";
            textoFeedback.textContent =
                questao.explicacao +
                " Você não ganha pontos novamente por ela.";
        }
    } else {
        botaoEscolhido.classList.add("incorreta");
        botoes[
            questao.respostaCorreta
        ].classList.add("correta");
        feedbackQuiz.classList.add("erro");
        tocarSom("erro");
        tituloFeedback.textContent =
            "🌱 Quase!";
        textoFeedback.textContent =
            "A resposta correta era: " +
            questao.opcoes[questao.respostaCorreta] +
            ". " +
            questao.explicacao;
    }
    pontosQuiz.textContent =
        pontos + pontosGanhosNaTentativa;
    feedbackQuiz.classList.add("mostrar");
    btnProxima.classList.add("mostrar");
}
btnProxima.addEventListener("click", function () {
    perguntaAtual++;
    if (perguntaAtual < perguntas.length) {
        mostrarPergunta();
    } else {
        finalizarQuiz();
    }
});
function finalizarQuiz() {
    pontos += pontosGanhosNaTentativa;
    progressoBarra.style.width = "100%";
    cabecalhoQuiz.classList.add("oculto");
    perguntaQuizSecao.classList.add("oculto");
    feedbackQuiz.classList.remove(
        "mostrar",
        "acerto",
        "erro"
    );
    btnProxima.classList.remove("mostrar");
    resultadoQuiz.classList.add("mostrar");
    tocarSom("fim_quiz");
    pontosFinais.textContent = pontos;
    if (questoesAcertadas.length === perguntas.length) {
        mensagemResultado.textContent =
            "🌟 Você já conquistou todos os pontos deste quiz!";
    } else if (pontosGanhosNaTentativa > 0) {
        mensagemResultado.textContent =
            "☀️ Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "🌱 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
