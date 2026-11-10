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
            "Antes de regar sua planta, qual informação é mais importante observar?",
        opcoes: [
            "O tamanho do vaso",
            "A umidade do solo",
            "A quantidade de folhas",
            "A cor do vaso"
        ],
        respostaCorreta: 1,
        explicacao:
            "Observar a umidade do solo ajuda a entender se a planta realmente precisa de água."
    },
    {
        pergunta:
            "Sua planta está em um lugar com pouca luz. Qual atitude faz mais sentido?",
        opcoes: [
            "Regar mais vezes",
            "Colocar a planta em um local adequado à sua necessidade de luz",
            "Trocar a terra imediatamente",
            "Colocar água nas folhas"
        ],
        respostaCorreta: 1,
        explicacao:
            "Cada planta tem uma necessidade de luz. O ideal é colocá-la em um local adequado para aquela planta."
    },
    {
        pergunta:
            "Você percebeu que o solo está muito molhado. O que deve fazer?",
        opcoes: [
            "Regar novamente para ajudar a planta",
            "Adicionar mais terra por cima",
            "Evitar regar novamente até avaliar a umidade do solo",
            "Colocar a planta na luz para a água evaporar"
        ],
        respostaCorreta: 2,
        explicacao:
            "O excesso de água também pode prejudicar a planta. Por isso, é importante observar a umidade antes de regar novamente."
    },
    {
        pergunta:
            "Por que observar as folhas pode ajudar nos cuidados com uma planta?",
        opcoes: [
            "Porque as folhas mostram exatamente quanto de água colocar",
            "Porque as folhas podem apresentar sinais de que algo precisa de atenção",
            "Porque folhas saudáveis não precisam de luz",
            "Porque as folhas substituem a raiz na absorção de água"
        ],
        respostaCorreta: 1,
        explicacao:
            "As folhas podem apresentar sinais de que alguma condição de cuidado precisa ser observada."
    },
    {
        pergunta:
            "Uma planta precisa de pouca água e está com o solo ainda úmido. Qual atitude é mais adequada?",
        opcoes: [
            "Regar imediatamente porque toda planta precisa de água todos os dias",
            "Esperar e observar novamente a umidade antes de regar",
            "Colocar a planta diretamente no sol intenso",
            "Adicionar água até o reservatório ficar cheio"
        ],
        respostaCorreta: 1,
        explicacao:
            "Se o solo ainda está úmido e a planta precisa de pouca água, não é necessário regar imediatamente. Observar a umidade ajuda a evitar excesso de água."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz4QuestoesAcertadas")
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
                "quiz4QuestoesAcertadas",
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
            "🌱 Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "💚 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
