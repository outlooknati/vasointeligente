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
        pergunta: "Por que a água é importante para as plantas?",
        opcoes: [
            "Porque todas as plantas vivem dentro da água",
            "Porque ajuda a planta a se manter hidratada e a transportar substâncias",
            "Porque substitui a luz do Sol",
            "Porque a água consegue produzir alimento pra planta sozinha"
        ],
        respostaCorreta: 1,
        explicacao:
            "A água ajuda a planta a se manter hidratada e também participa do transporte de substâncias."
    },
    {
        pergunta: "O que pode acontecer quando o solo está muito seco?",
        opcoes: [
            "As folhas ficam secas e quebradiças",
            "A raiz da planta fica 'afogada' porque recebeu muita água",
            "A planta não precisa mais de água",
            "A planta passa a produzir mais flores"
        ],
        respostaCorreta: 0,
        explicacao:
            "Quando o solo está muito seco, a planta  precisa de água porque a falta de água faz as folhas quebrarem."
    },
    {
        pergunta: "Qual estrutura da planta é a principal responsável por absorver a água do solo?",
        opcoes: [
            "Folha",
            "Caule",
            "Raiz",
            "Flor"
        ],
        respostaCorreta: 2,
        explicacao:
            "Como a raiz fica embaixo da terra, ela consegue absorver a água para a plantinha."
    },
    {
        pergunta: "O que acontece com a raiz da planta se a terra ficar cheia de água por muito tempo?",
        opcoes: [
            "Ela aprende a nadar na terra",
            "Ela apodrece e a planta não consegue mais comer nem beber",
            "Ela cresce porque tem muita água",
            "Ela fica mais forte para puxar a água"
        ],
        respostaCorreta: 1,
        explicacao:
            "Assim como a falta de água pode ser um problema, o excesso de água também pode prejudicar a planta."
    },
    {
        pergunta: "Qual afirmação sobre a quantidade de água das plantas é verdadeira?",
        opcoes: [
            "Todas as plantas precisam da mesma quantidade de água",
            "Todas as plantas precisam ser regadas todos os dias",
            "Cada planta pode precisar de uma quantidade diferente de água",
            "Quanto mais água, melhor para qualquer planta"
        ],
        respostaCorreta: 2,
        explicacao:
            "Cada planta pode ter necessidades diferentes de água. Por isso, é importante conhecer o tipo de planta."
    }
];
// VARIÁVEIS
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
// QUESTÕES JÁ CONQUISTADAS
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz2QuestoesAcertadas")
) || [];
// ELEMENTOS DO HTML
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
// MOSTRAR PERGUNTA
function mostrarPergunta() {
    const questao = perguntas[perguntaAtual];
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
    btnProxima.classList.remove("mostrar");
    opcoesQuiz.innerHTML = "";
    questao.opcoes.forEach((opcao, indice) => {
        const botao =
            document.createElement("button");
        botao.classList.add("opcaoQuiz");
        botao.type = "button";
        botao.textContent = opcao;
        botao.addEventListener("click", function () {
            verificarResposta(
                indice,
                botao
            );
        });
        opcoesQuiz.appendChild(botao);
    });
}
// VERIFICAR RESPOSTA
function verificarResposta(
    indiceEscolhido,
    botaoEscolhido
) {
    if (respondeu) {
        return;
    }
    respondeu = true;
    const questao =
        perguntas[perguntaAtual];
    const botoes =
        document.querySelectorAll(".opcaoQuiz");
    botoes.forEach(botao => {
        botao.disabled = true;
    });
    // RESPOSTA CORRETA
    if (
        indiceEscolhido ===
        questao.respostaCorreta
    ) {
        botaoEscolhido.classList.add("correta");
        feedbackQuiz.classList.add("acerto");
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
            // salva a questão e os 3 pontos juntos (sair no meio não perde pontos)
            localStorage.setItem(
                "quiz2QuestoesAcertadas",
                JSON.stringify(
                    questoesAcertadas
                )
            );
            const pontosAtuais =
                Number(
                    localStorage.getItem("pontos")
                ) || 0;
            localStorage.setItem(
                "pontos",
                pontosAtuais + 3
            );
            tituloFeedback.textContent =
                "🎉 Muito bem!";
            textoFeedback.textContent =
                questao.explicacao +
                " Você ganhou 3 pontos!";
        } else {
            tituloFeedback.textContent =
                "🌟 Você já conquistou essa questão!";
            textoFeedback.textContent =
                questao.explicacao +
                " Você não ganha pontos novamente por ela.";
        }
    // RESPOSTA INCORRETA
    } else {
        botaoEscolhido.classList.add(
            "incorreta"
        );
        botoes[
            questao.respostaCorreta
        ].classList.add("correta");
        feedbackQuiz.classList.add("erro");
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
    feedbackQuiz.classList.add("mostrar");
    btnProxima.classList.add("mostrar");
}
// PRÓXIMA PERGUNTA
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
// FINALIZAR QUIZ
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
    // MENSAGEM FINAL
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
// INICIAR QUIZ
mostrarPergunta();
