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
            "Por que muitas orquídeas não são plantadas em terra comum?",
        opcoes: [
            "Porque suas raízes gostam de ar",
            "Porque elas odeiam vasos",
            "Porque não têm raízes",
            "Porque só vivem na água"
        ],
        respostaCorreta: 0,
        explicacao:
            "Muitas orquídeas têm raízes que gostam de ar, por isso usam substratos próprios, como casca de árvore."
    },
    {
        pergunta:
            "Muitas orquídeas vivem apoiadas em árvores. Isso faz mal às árvores?",
        opcoes: [
            "Sim, sempre",
            "Não, elas só se apoiam",
            "Sim, elas comem a árvore",
            "Só se for pequena"
        ],
        respostaCorreta: 1,
        explicacao:
            "As orquídeas epífitas só se apoiam nas árvores e não as prejudicam."
    },
    {
        pergunta:
            "O que pode prejudicar as raízes de uma orquídea?",
        opcoes: [
            "Água parada no vaso",
            "Ar fresco",
            "Luz clara",
            "Um substrato próprio"
        ],
        respostaCorreta: 0,
        explicacao:
            "Água parada pode causar o apodrecimento das raízes."
    },
    {
        pergunta:
            "As flores da orquídea caíram. O que isso significa?",
        opcoes: [
            "Que a planta morreu com certeza",
            "Que pode ser normal e a planta está descansando",
            "Que a planta virou cacto",
            "Que ela precisa de sol forte"
        ],
        respostaCorreta: 1,
        explicacao:
            "Depois de florir, muitas orquídeas descansam e podem florescer de novo com bons cuidados."
    },
    {
        pergunta:
            "Que luz costuma agradar a uma orquídea?",
        opcoes: [
            "Sol forte direto o dia todo",
            "Escuridão total",
            "Luz clara, sem sol forte direto",
            "Luz de velas"
        ],
        respostaCorreta: 2,
        explicacao:
            "Muitas orquídeas gostam de bastante claridade, mas o sol forte direto pode queimar as folhas."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz10QuestoesAcertadas")
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
                "quiz10QuestoesAcertadas",
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
            "🌸 Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "💚 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
