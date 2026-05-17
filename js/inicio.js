import { db } from "./firebase.js";

import {
    ref,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.getElementById("logout").addEventListener("click", function() {

    localStorage.removeItem("imcCurrentRA");

    window.location.href = "index.html";
});

carregarInicio();

function carregarInicio() {

    const ra = localStorage.getItem("imcCurrentRA");

    if (!ra) {

        window.location.href = "index.html";

        return;
    }

    const dbRef = ref(db);

    get(child(dbRef, 'alunos/' + ra))

        .then((snapshot) => {

            if (!snapshot.exists()) {

                localStorage.removeItem("imcCurrentRA");

                window.location.href = "index.html";

                return;
            }

            const aluno = snapshot.val();

            document.getElementById("student-name")
                .textContent = aluno.nome;

            document.getElementById("student-ra")
                .textContent = aluno.ra;

            mostrarHistorico(aluno.historico || []);
        })

        .catch(() => {

            alert("Erro ao carregar aluno.");
        });
}

function mostrarHistorico(historico) {

    const historyList =
        document.getElementById("history-list");

    const emptyHistory =
        document.getElementById("empty-history");

    historyList.innerHTML = "";

    if (historico.length === 0) {

        emptyHistory.classList.remove("hidden");

        return;
    }

    emptyHistory.classList.add("hidden");

    historico.forEach(function(registro) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${registro.dataHora}</td>
            <td>${formatarDecimal(registro.peso)} kg</td>
            <td>${formatarDecimal(registro.altura)} m</td>
            <td>${registro.imc.replace(".", ",")}</td>
            <td>${registro.classificacao}</td>
        `;

        historyList.appendChild(row);
    });
}

function formatarDecimal(valor) {

    return String(valor).replace(".", ",");
}