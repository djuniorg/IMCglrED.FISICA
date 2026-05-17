import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let alunoLogado;

document.getElementById("logout").addEventListener("click", function() {

    localStorage.removeItem("imcCurrentRA");

    window.location.href = "index.html";
});

document.getElementById("form").addEventListener("submit", function(event) {

    event.preventDefault();

    if (!alunoLogado) {

        alert("Aluno ainda carregando.");

        return;
    }

    const peso = lerNumeroDecimal("weight");

    const altura = lerNumeroDecimal("height");

    if (!peso || !altura || peso <= 0 || altura <= 0) {

        alert("Digite peso e altura válidos.");

        return;
    }

    const imc = peso / (altura * altura);

    const classificacao =
        classificarIMC(imc);

    const dataHora = new Date();

    const registro = {
        peso,
        altura,
        imc: imc.toFixed(2),
        classificacao,
        dataHora:
            dataHora.toLocaleString("pt-BR"),
        timestamp:
            dataHora.getTime()
    };

    alunoLogado.historico =
        alunoLogado.historico || [];

    alunoLogado.historico.unshift(registro);

    salvarAluno(alunoLogado, function() {

        mostrarResultado(registro);
    });
});

carregarAlunoLogado();

function carregarAlunoLogado() {

    const ra =
        localStorage.getItem("imcCurrentRA");

    if (!ra) {

        window.location.href = "index.html";

        return;
    }

    const dbRef = ref(db);

    get(child(dbRef, 'alunos/' + ra))

        .then((snapshot) => {

            if (!snapshot.exists()) {

                localStorage.removeItem(
                    "imcCurrentRA"
                );

                window.location.href =
                    "index.html";

                return;
            }

            alunoLogado = snapshot.val();
        })

        .catch(() => {

            alert(
                "Erro ao carregar aluno."
            );
        });
}

function lerNumeroDecimal(id) {

    const valor =
        document.getElementById(id)
        .value.replace(",", ".");

    return parseFloat(valor);
}

function classificarIMC(imc) {

    if (imc < 18.5)
        return "Abaixo do peso";

    if (imc < 25)
        return "Peso normal";

    if (imc < 30)
        return "Sobrepeso";

    if (imc < 35)
        return "Obesidade grau 1";

    if (imc < 40)
        return "Obesidade grau 2";

    return "Obesidade grau 3";
}

function salvarAluno(aluno, callback) {

    set(ref(db, 'alunos/' + aluno.ra), aluno)

        .then(() => {

            callback();
        })

        .catch(() => {

            alert(
                "Erro ao salvar cálculo."
            );
        });
}

function mostrarResultado(registro) {

    const value =
        document.getElementById("value");

    const description =
        document.getElementById("description");

    value.classList.remove(
        "normal",
        "attention"
    );

    value.classList.add(
        registro.classificacao ===
        "Peso normal"
            ? "normal"
            : "attention"
    );

    value.textContent =
        registro.imc.replace(".", ",");

    description.textContent =
        registro.classificacao;

    document.getElementById("infos")
        .classList.remove("hidden");
}