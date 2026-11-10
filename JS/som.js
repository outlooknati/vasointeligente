if (!window.Som) {

    window.Som = (function () {

        const PASTA_AUDIO = new URL("../AUDIO/", document.currentScript.src).href;
        const EXTENSAO = ".mp3";
        const VOLUME_GERAL = 0.9;

        let contexto = null;
        let saida = null;
        let somAtual = null;
        const carregados = {};


        function ligado() {
            return localStorage.getItem("sonsAtivados") !== "false";
        }


        function pegarContexto() {

            if (contexto) return contexto;

            const Classe = window.AudioContext || window.webkitAudioContext;
            if (!Classe) return null;

            contexto = new Classe();
            saida = contexto.createGain();
            saida.gain.value = VOLUME_GERAL;
            saida.connect(contexto.destination);

            return contexto;
        }


        // Na primeira vez que a criança toca na tela, libera o som.
        function destravar() {

            const c = pegarContexto();

            if (c && c.state === "suspended") {
                c.resume().catch(function () { });
            }
        }

        ["pointerdown", "touchend", "keydown"].forEach(function (evento) {
            document.addEventListener(evento, destravar, { passive: true });
        });


        // true se o som já pode tocar agora
        async function pronto() {

            const c = pegarContexto();
            if (!c) return false;

            if (c.state !== "running") {
                try {
                    await Promise.race([
                        c.resume(),
                        new Promise(function (r) { setTimeout(r, 200); })
                    ]);
                } catch (e) { }
            }

            return c.state === "running";
        }


        async function carregar(nome) {

            const resposta = await fetch(PASTA_AUDIO + nome + EXTENSAO);

            if (!resposta.ok) {
                throw new Error("sem arquivo");
            }

            const dados = await resposta.arrayBuffer();

            return new Promise(function (ok, erro) {
                contexto.decodeAudioData(dados, ok, erro);
            });
        }


        function parar() {

            if (somAtual) {
                try { somAtual.stop(); } catch (e) { }
                somAtual = null;
            }
        }


        async function tocar(nome) {

            if (!ligado()) return "mudo";
            if (!(await pronto())) return "bloqueado";

            let audio = carregados[nome];

            if (!audio) {
                try {
                    audio = await carregar(nome);
                    carregados[nome] = audio;
                } catch (e) {
                    return "sem-arquivo";
                }
            }

            parar();

            const fonte = contexto.createBufferSource();
            fonte.buffer = audio;
            fonte.connect(saida);
            fonte.onended = function () {
                if (somAtual === fonte) somAtual = null;
            };
            fonte.start();
            somAtual = fonte;

            return "ok";
        }

        return {
            ligado: ligado,
            tocarVoz: tocar,
            efeito: tocar,
            parar: parar
        };

    })();
}
