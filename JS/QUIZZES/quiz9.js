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
            "Como as samambaias se reproduzem?",
        opcoes: [
            "Por flores e sementes",
            "Por esporos",
            "Só por frutos",
            "Elas não se reproduzem"
        ],
        respostaCorreta: 1,
        explicacao:
            "As samambaias se reproduzem por esporos, não por flores nem sementes."
    },
    {
        pergunta:
            "Como são chamadas as folhas das samambaias?",
        opcoes: [
            "Pétalas",
            "Espinhos",
            "Frondes",
            "Raízes"
        ],
        respostaCorreta: 2,
        explicacao:
            "As folhas das samambaias são chamadas de frondes."
    },
    {
        pergunta:
            "Que tipo de ambiente costuma agradar a uma samambaia?",
        opcoes: [
            "Muito seco e com sol forte",
            "Úmido e com luz clara e indireta",
            "Totalmente escuro",
            "Sem água nenhuma"
        ],
        respostaCorreta: 1,
        explicacao:
            "Muitas samambaias gostam de umidade e de luz clara e indireta."
    },
    {
        pergunta:
            "As bolinhas marrons atrás das folhas de uma samambaia costumam ser:",
        opcoes: [
            "Sempre doenças",
            "Insetos que devem ser eliminados",
            "Estruturas que guardam esporos",
            "Sujeira que deve ser lixada"
        ],
        respostaCorreta: 2,
        explicacao:
            "Em muitas samambaias, essas bolinhas guardam os esporos, que ajudam na reprodução. Em geral, elas são normais."
    },
    {
        pergunta:
            "Uma samambaia está com as pontas secas e a terra seca. O que ajuda?",
        opcoes: [
            "Deixar a planta no sol forte",
            "Observar a luz e regular a rega, mantendo o solo úmido",
            "Parar de regar",
            "Cobrir a planta"
        ],
        respostaCorreta: 1,
        explicacao:
            "Ajustar a luz e manter o solo úmido, sem encharcar, costuma ajudar."
    }
];
let perguntaAtual = 0;
let pontos = 0;
let pontosGanhosNaTentativa = 0;
let respondeu = false;
let questoesAcertadas = JSON.parse(
    localStorage.getItem("quiz9QuestoesAcertadas")
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
                "quiz9QuestoesAcertadas",
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
            "🌿 Muito bem! Você conquistou novos pontos nesta tentativa.";
    } else {
        mensagemResultado.textContent =
            "💚 Você não ganhou novos pontos desta vez, mas pode continuar praticando!";
    }
}
mostrarPergunta();
