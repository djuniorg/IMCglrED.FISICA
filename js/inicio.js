import { db } from "./firebase.js";

import {
    ref,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Variáveis globais para controle de estado
let alunoLogado = null;
let isLoading = true;

// Elementos do DOM
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("form");

// Inicializar após DOM estar pronta
document.addEventListener("DOMContentLoaded", function() {
    initializeApp();
});

async function initializeApp() {
    // Primeiro: carregar dados do aluno
    await carregarInicio();
    
    // Segundo: adicionar listener de logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem("imcCurrentRA");
    window.location.href = "index.html";
}

async function carregarInicio() {
    const ra = localStorage.getItem("imcCurrentRA");
    
    console.log("RA do localStorage:", ra);
    
    if (!ra) {
        console.log("RA não encontrado, redirecionando para login");
        window.location.href = "index.html";
        return;
    }
    
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'alunos/' + ra));
        
        if (!snapshot.exists()) {
            console.log("Aluno não encontrado no Firebase");
            localStorage.removeItem("imcCurrentRA");
            window.location.href = "index.html";
            return;
        }
        
        alunoLogado = snapshot.val();
        
        console.log("Aluno carregado:", alunoLogado);
        
        // Atualizar informações do aluno na tela
        const studentNameElement = document.getElementById("student-name");
        const studentRaElement = document.getElementById("student-ra");
        
        if (studentNameElement) {
            studentNameElement.textContent = alunoLogado.nome || "Não informado";
        }
        
        if (studentRaElement) {
            studentRaElement.textContent = ra;
        }
        
        // Carregar histórico
        const historico = alunoLogado.historico || [];
        
        console.log("Histórico carregado:", historico);
        
        // Exibir histórico
        mostrarHistorico(historico);
        
        isLoading = false;
        
    } catch (error) {
        console.error("Erro ao carregar aluno:", error);
        alert("Erro ao carregar dados. Faça login novamente.");
        window.location.href = "index.html";
    }
}

function mostrarHistorico(historico) {
    const historyList = document.getElementById("history-list");
    const emptyHistory = document.getElementById("empty-history");
    
    console.log("Elementos encontrados:", {
        historyList: !!historyList,
        emptyHistory: !!emptyHistory
    });
    
    // Verificar se elementos existem
    if (!historyList) {
        console.error("Elemento history-list não encontrado!");
        return;
    }
    
    // Limpar lista existente
    historyList.innerHTML = "";
    
    // Verificar se histórico está vazio ou não existe
    if (!historico || !Array.isArray(historico) || historico.length === 0) {
        console.log("Histórico vazio, mostrando mensagem");
        
        if (emptyHistory) {
            emptyHistory.classList.remove("hidden");
        }
        return;
    }
    
    // Ocultar mensagem de histórico vazio
    if (emptyHistory) {
        emptyHistory.classList.add("hidden");
    }
    
    console.log("Exibindo", historico.length, "registros");
    
    // Percorrer histórico e criar linhas da tabela
    historico.forEach(function(registro, indice) {
        console.log("Registro", indice + 1, ":", registro);
        
        const row = document.createElement("tr");
        
        // Formatando valores para exibição
        const pesoFormatado = formatarDecimal(registro.peso);
        const alturaFormatada = formatarDecimal(registro.altura);
        const imcFormatado = formatarDecimal(registro.imc);
        const classificacao = registro.classificacao || "Não classificado";
        const dataHora = registro.dataHora || "Data não informada";
        
        row.innerHTML = `
            <td>${dataHora}</td>
            <td>${pesoFormatado} kg</td>
            <td>${alturaFormatada} m</td>
            <td>${imcFormatado}</td>
            <td>${classificacao}</td>
        `;
        
        historyList.appendChild(row);
    });
    
    console.log("Histórico exibido com sucesso!");
}

function formatarDecimal(valor) {
    if (valor === undefined || valor === null) {
        return "0";
    }
    
    // Converter para string e substituir ponto por vírgula
    return String(valor).replace(".", ",");
}

// Exportar para debug
window.debugInicio = {
    getAlunoLogado: () => alunoLogado,
    getIsLoading: () => isLoading,
    carregarInicio: carregarInicio,
    mostrarHistorico: mostrarHistorico
};
