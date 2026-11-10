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
            "Por que muitos cactos possuem um caule grosso e carnudo?",
        opcoes: [
            "Para armazenar água",
            "Para absorver mais luz",
            "Para produzir mais espinhos",
            "Para manter o solo úmido"
        ],
        respostaCorreta: 0,
        explicacao:
            "O caule de muitos cactos consegue armazenar água, ajudando a planta a enfrentar períodos de pouca chuva."
    },
    {
        pergunta:
            "Os espinhos dos cactos são, na verdade, estruturas modificadas de qual parte da planta?",
        opcoes: [
            "Das raízes",
            "Das folhas",
            "Das flores",
            "Dos frutos"
        ],
        respostaCorreta: 1,
        explicacao:
            "Os espinhos dos cactos são folhas modificadas. Eles ajudam principalmente na proteção da planta e podem contribuir para reduzir a perda de água."
    },
    {
        pergunta:
            "Um cacto está com o solo ainda úmido. Qual atitude é mais adequada?",
        opcoes: [
            "Regar novamente para garantir que ele tenha água",
            "Esperar e observar a umidade antes de regar novamente",
            "Colocar água diretamente nas raízes",
            "Regar todos os dias até o solo secar"
        ],
        respostaCorreta: 1,
        explicacao:
            "Cactos costumam precisar de pouca água. Se o solo ainda está úmido, é melhor observar antes de fazer uma nova rega."
    },
    {
        pergunta:
            "Por que um vaso com boa drenagem é importante para um cacto?",
        opcoes: [
            "Para manter toda a água dentro do vaso",
            "Para deixar o solo sempre encharcado",
            "Para permitir que o excesso de água saia",
            "Para impedir que as raízes cresçam"
        ],
        respostaCorreta: 2,
        explicacao:
            "A boa drenagem permite que o excesso de água saia do vaso. O acúmulo de água pode prejudicar as raízes do cacto."
    },
    {
        pergunta:
            "Qual afirmação sobre os cactos é verdadeira?",
        opcoes: [
            "Todos os cactos possuem exatamente o mesmo formato",
            "Cactos nunca produzem flores",
            "Todos os cactos precisam ser regados todos os dias",
            "Existem cactos de diferentes formatos e eles também podem produzir flores"
        ],
        respostaCorreta: 3,
        explicacao:
            "Existem cactos com diferentes formatos, tamanhos e características. Muitos também produzem flores."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz5QuestoesAcertadas")
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
                "quiz5QuestoesAcertadas",
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
            "🌵 Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "💚 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
