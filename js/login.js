import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let raPrimeiroAcesso = "";

const formLogin = document.getElementById("form");
const firstAccessForm = document.getElementById("first-access-form");

formLogin.addEventListener("submit", function(event) {
    event.preventDefault();

    const ra = document.getElementById("ra").value.trim();
    const password = document.getElementById("password").value.trim();

    buscarAluno(ra, function(aluno) {

        if (!aluno) {

            if (password === ra) {
                abrirPrimeiroAcesso(ra);
                return;
            }

            mostrarMensagem(
                "Primeiro acesso: use o RA como login e senha.",
                "red"
            );

            return;
        }

        if (
            (aluno.primeiroAcesso ||
            !aluno.senha ||
            aluno.senha === ra) &&
            password === ra
        ) {
            abrirPrimeiroAcesso(ra);
            return;
        }

        if (aluno.senha === password) {

            localStorage.setItem("imcCurrentRA", aluno.ra);

            mostrarMensagem(
                "Login bem-sucedido! Redirecionando...",
                "green"
            );

            setTimeout(function() {
                window.location.href = "inicio.html";
            }, 800);

            return;
        }

        mostrarMensagem("Senha incorreta.", "red");
    });
});

firstAccessForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    const newPassword =
        document.getElementById("new-password").value.trim();

    if (!nome || !newPassword) {

        mostrarMensagem(
            "Preencha nome e nova senha.",
            "red"
        );

        return;
    }

    if (newPassword === raPrimeiroAcesso) {

        mostrarMensagem(
            "A nova senha precisa ser diferente do RA.",
            "red"
        );

        return;
    }

    buscarAluno(raPrimeiroAcesso, function(alunoExistente) {

        const aluno = alunoExistente || {
            ra: raPrimeiroAcesso,
            historico: []
        };

        aluno.nome = nome;
        aluno.senha = newPassword;
        aluno.primeiroAcesso = false;
        aluno.historico = aluno.historico || [];

        salvarAluno(aluno, function() {

            localStorage.setItem(
                "imcCurrentRA",
                aluno.ra
            );

            window.location.href = "inicio.html";
        });
    });
});

function abrirPrimeiroAcesso(ra) {

    raPrimeiroAcesso = ra;

    document.getElementById("form")
        .classList.add("hidden");

    document.getElementById("infos")
        .classList.add("hidden");

    document.getElementById("change-password")
        .classList.remove("hidden");
}

function buscarAluno(ra, callback) {

    const dbRef = ref(db);

    get(child(dbRef, 'alunos/' + ra))

        .then((snapshot) => {

            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(null);
            }
        })

        .catch(() => {

            mostrarMensagem(
                "Erro ao buscar aluno.",
                "red"
            );
        });
}

function salvarAluno(aluno, callback) {

    set(ref(db, 'alunos/' + aluno.ra), aluno)

        .then(() => {
            callback();
        })

        .catch(() => {

            mostrarMensagem(
                "Erro ao salvar aluno.",
                "red"
            );
        });
}

function mostrarMensagem(texto, cor) {

    const infos = document.getElementById("infos");

    const message =
        document.getElementById("message");

    infos.classList.remove("hidden");

    message.textContent = texto;

    message.style.color = cor;
}