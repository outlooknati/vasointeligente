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
        pergunta:
            "De onde nascem os frutos?",
        opcoes: [
            "Das raízes",
            "Das flores",
            "Do vaso",
            "Do solo"
        ],
        respostaCorreta: 1,
        explicacao:
            "Os frutos se formam a partir das flores, depois da polinização."
    },
    {
        pergunta:
            "O que costuma ficar dentro dos frutos?",
        opcoes: [
            "Sementes",
            "Pedras",
            "Água do mar",
            "Terra"
        ],
        respostaCorreta: 0,
        explicacao:
            "Dentro dos frutos ficam as sementes, que podem dar origem a novas plantas."
    },
    {
        pergunta:
            "Como as abelhas ajudam as frutíferas?",
        opcoes: [
            "Comendo todas as folhas",
            "Levando pólen de uma flor para outra",
            "Derrubando os frutos",
            "Regando as plantas"
        ],
        respostaCorreta: 1,
        explicacao:
            "As abelhas levam o pólen de flor em flor, ajudando na polinização."
    },
    {
        pergunta:
            "Uma frutífera ainda não deu frutos e está em um lugar escuro. O que pode ajudar?",
        opcoes: [
            "Deixá-la ali",
            "Mudá-la para um lugar mais claro e ter paciência",
            "Parar de cuidar",
            "Regar sem parar"
        ],
        respostaCorreta: 1,
        explicacao:
            "Muitas frutíferas precisam de bastante luz e de tempo para dar frutos."
    },
    {
        pergunta:
            "O que fazer antes de comer uma fruta colhida?",
        opcoes: [
            "Lavar bem e pedir ajuda a um adulto",
            "Comer sem lavar",
            "Dar para o cachorro",
            "Enterrar"
        ],
        respostaCorreta: 0,
        explicacao:
            "É importante lavar bem os frutos e contar com a ajuda de um adulto na colheita."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz12QuestoesAcertadas")
) || [];
const progressoBarra =
    document.getElementById("progressoBarra");
const numeroPergunta =
    document.getElementById("numeroPergunta");
const pontosQuiz =
    document.getElementById("pontosQuiz");
const pergunta =
    document.getElementById("pergunta");
const opcoesQuiz =
    document.querySelector(".opcoesQuiz");
const cabecalhoQuiz =
    document.querySelector(".cabecalhoQuiz");
const perguntaQuizSecao =
    document.querySelector(".perguntaQuiz");
const feedbackQuiz =
    document.getElementById("feedbackQuiz");
const tituloFeedback =
    document.getElementById("tituloFeedback");
const textoFeedback =
    document.getElementById("textoFeedback");
const btnProxima =
    document.getElementById("btnProxima");
const resultadoQuiz =
    document.getElementById("resultadoQuiz");
const pontosFinais =
    document.getElementById("pontosFinais");
const mensagemResultado =
    document.getElementById("mensagemResultado");
function mostrarPergunta() {
    const questao =
        perguntas[perguntaAtual];
    respondeu = false;
    numeroPergunta.textContent =
        perguntaAtual + 1;
    pergunta.textContent =
        questao.pergunta;
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
    btnProxima.classList.remove(
        "mostrar"
    );
    opcoesQuiz.innerHTML = "";
    questao.opcoes.forEach(
        function (opcao, indice) {
            const botao =
                document.createElement("button");
            botao.classList.add(
                "opcaoQuiz"
            );
            botao.type = "button";
            botao.textContent =
                opcao;
            botao.addEventListener(
                "click",
                function () {
                    verificarResposta(
                        indice,
                        botao
                    );
                }
            );
            opcoesQuiz.appendChild(
                botao
            );
        }
    );
}
function verificarResposta(
    indiceEscolhido,
    botaoEscolhido
) {
    if (respondeu) return;
    respondeu = true;
    const questao =
        perguntas[perguntaAtual];
    const botoes =
        document.querySelectorAll(
            ".opcaoQuiz"
        );
    botoes.forEach(
        function (botao) {
            botao.disabled = true;
        }
    );
    if (
        indiceEscolhido ===
        questao.respostaCorreta
    ) {
        botaoEscolhido.classList.add(
            "correta"
        );
        feedbackQuiz.classList.add(
            "acerto"
        );
        tocarSom("acerto");
        if (
            !questoesAcertadas.includes(
                perguntaAtual
            )
        ) {
            pontosGanhosNaTentativa += 3;
            questoesAcertadas.push(
                perguntaAtual
            );
            localStorage.setItem(
                "quiz12QuestoesAcertadas",
                JSON.stringify(
                    questoesAcertadas
                )
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
        botaoEscolhido.classList.add(
            "incorreta"
        );
        botoes[
            questao.respostaCorreta
        ].classList.add(
            "correta"
        );
        feedbackQuiz.classList.add(
            "erro"
        );
        tocarSom("erro");
        tituloFeedback.textContent =
            "🌱 Quase!";
        textoFeedback.textContent =
            "A resposta correta era: " +
            questao.opcoes[
                questao.respostaCorreta
            ] +
            ". " +
            questao.explicacao;
    }
    pontosQuiz.textContent =
        pontos + pontosGanhosNaTentativa;
    feedbackQuiz.classList.add(
        "mostrar"
    );
    btnProxima.classList.add(
        "mostrar"
    );
}
btnProxima.addEventListener(
    "click",
    function () {
        perguntaAtual++;
        if (
            perguntaAtual <
            perguntas.length
        ) {
            mostrarPergunta();
        } else {
            finalizarQuiz();
        }
    }
);
function finalizarQuiz() {
    pontos +=
        pontosGanhosNaTentativa;
    progressoBarra.style.width =
        "100%";
    cabecalhoQuiz.classList.add(
        "oculto"
    );
    perguntaQuizSecao.classList.add(
        "oculto"
    );
    feedbackQuiz.classList.remove(
        "mostrar",
        "acerto",
        "erro"
    );
    btnProxima.classList.remove(
        "mostrar"
    );
    resultadoQuiz.classList.add(
        "mostrar"
    );
    tocarSom("fim_quiz");
    pontosFinais.textContent =
        pontos;
    if (
        questoesAcertadas.length ===
        perguntas.length
    ) {
        mensagemResultado.textContent =
            "🌟 Você já conquistou todos os pontos deste quiz!";
    } else if (
        pontosGanhosNaTentativa > 0
    ) {
        mensagemResultado.textContent =
            "🍓 Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "💚 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
