let db;

const request = indexedDB.open("imcDB", 2);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains("alunos")) {
        const objectStore = db.createObjectStore("alunos", { keyPath: "ra" });
        objectStore.createIndex("senha", "senha", { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    carregarInicio();
};

request.onerror = function() {
    alert("Erro ao abrir banco de dados.");
};

document.getElementById("logout").addEventListener("click", function() {
    localStorage.removeItem("imcCurrentRA");
    window.location.href = "index.html";
});

function carregarInicio() {
    const ra = localStorage.getItem("imcCurrentRA");

    if (!ra) {
        window.location.href = "index.html";
        return;
    }

    const transaction = db.transaction(["alunos"], "readonly");
    const objectStore = transaction.objectStore("alunos");
    const requestAluno = objectStore.get(ra);

    requestAluno.onsuccess = function() {
        const aluno = requestAluno.result;

        if (!aluno) {
            localStorage.removeItem("imcCurrentRA");
            window.location.href = "index.html";
            return;
        }

        document.getElementById("student-name").textContent = aluno.nome;
        document.getElementById("student-ra").textContent = aluno.ra;
        mostrarHistorico(aluno.historico || []);
    };
}

function mostrarHistorico(historico) {
    const historyList = document.getElementById("history-list");
    const emptyHistory = document.getElementById("empty-history");

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
