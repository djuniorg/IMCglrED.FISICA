let db;
let alunoLogado;

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
    carregarAlunoLogado();
};

request.onerror = function() {
    alert("Erro ao abrir banco de dados.");
};

document.getElementById("logout").addEventListener("click", function() {
    localStorage.removeItem("imcCurrentRA");
    window.location.href = "index.html";
});

document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!alunoLogado) {
        alert("Aluno ainda carregando. Tente novamente.");
        return;
    }

    const peso = lerNumeroDecimal("weight");
    const altura = lerNumeroDecimal("height");

    if (!peso || !altura || peso <= 0 || altura <= 0) {
        alert("Digite peso e altura validos.");
        return;
    }

    const imc = peso / (altura * altura);
    const classificacao = classificarIMC(imc);
    const dataHora = new Date();
    const registro = {
        peso,
        altura,
        imc: imc.toFixed(2),
        classificacao,
        dataHora: dataHora.toLocaleString("pt-BR"),
        timestamp: dataHora.getTime()
    };

    alunoLogado.historico = alunoLogado.historico || [];
    alunoLogado.historico.unshift(registro);

    salvarAluno(alunoLogado, function() {
        mostrarResultado(registro);
    });
});

function carregarAlunoLogado() {
    const ra = localStorage.getItem("imcCurrentRA");

    if (!ra) {
        window.location.href = "index.html";
        return;
    }

    const transaction = db.transaction(["alunos"], "readonly");
    const objectStore = transaction.objectStore("alunos");
    const requestAluno = objectStore.get(ra);

    requestAluno.onsuccess = function() {
        alunoLogado = requestAluno.result;

        if (!alunoLogado) {
            localStorage.removeItem("imcCurrentRA");
            window.location.href = "index.html";
        }
    };
}

function lerNumeroDecimal(id) {
    const valor = document.getElementById(id).value.replace(",", ".");
    return parseFloat(valor);
}

function classificarIMC(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    if (imc < 35) return "Obesidade grau 1";
    if (imc < 40) return "Obesidade grau 2";
    return "Obesidade grau 3";
}

function salvarAluno(aluno, callback) {
    const transaction = db.transaction(["alunos"], "readwrite");
    const objectStore = transaction.objectStore("alunos");
    const requestSalvar = objectStore.put(aluno);

    requestSalvar.onsuccess = callback;

    requestSalvar.onerror = function() {
        alert("Erro ao salvar calculo.");
    };
}

function mostrarResultado(registro) {
    const value = document.getElementById("value");
    const description = document.getElementById("description");

    value.classList.remove("normal", "attention");
    value.classList.add(registro.classificacao === "Peso normal" ? "normal" : "attention");
    value.textContent = registro.imc.replace(".", ",");
    description.textContent = registro.classificacao;
    document.getElementById("infos").classList.remove("hidden");
}
