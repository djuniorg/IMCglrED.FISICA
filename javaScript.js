import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let alunos = [];

carregarAlunos();

function carregarAlunos() {

    const dbRef = ref(db);

    get(child(dbRef, 'alunos'))

        .then((snapshot) => {

            if (snapshot.exists()) {

                const dados = snapshot.val();

                alunos = Object.values(dados);

                mostrarAlunos();
            }
        })

        .catch(() => {

            console.log(
                "Erro ao carregar alunos"
            );
        });
}

function calcularIMC(peso, altura) {

    return (
        peso / (altura * altura)
    ).toFixed(2);
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

window.cadastrarAluno = function () {

    const nome =
        document.getElementById("nome").value;

    const ra =
        document.getElementById("ra").value;

    const peso = parseFloat(
        document.getElementById("peso").value
    );

    const altura = parseFloat(
        document.getElementById("altura").value
    );

    if (!nome || !ra || !peso || !altura) {

        alert("Preencha todos os campos!");

        return;
    }

    const imc = calcularIMC(peso, altura);

    const classificacao =
        classificarIMC(imc);

    const aluno = {
        nome,
        ra,
        peso,
        altura,
        imc,
        classificacao,
        senha: ra,
        historico: []
    };

    set(ref(db, 'alunos/' + ra), aluno)

        .then(() => {

            alunos.push(aluno);

            mostrarAlunos();

            limparCampos();
        })

        .catch(() => {

            alert(
                "Erro ao salvar aluno."
            );
        });
};

function mostrarAlunos() {

    const lista =
        document.getElementById("lista");

    lista.innerHTML = "";

    alunos.forEach((aluno) => {

        lista.innerHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td>${aluno.ra}</td>
                <td>${aluno.peso}</td>
                <td>${aluno.altura}</td>
                <td>${aluno.imc}</td>
                <td>${aluno.classificacao}</td>
            </tr>
        `;
    });
}

function limparCampos() {

    document.getElementById("nome").value = "";

    document.getElementById("ra").value = "";

    document.getElementById("peso").value = "";

    document.getElementById("altura").value = "";
}