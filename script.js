import { db } from "./js/firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Variável global para controlar o estado de carregamento
let alunoLogado = null;
let isLoading = true;
let loadError = false;

// Elementos do DOM
const form = document.getElementById("form");
const logoutBtn = document.getElementById("logout");

// Inicializar após DOM estar pronto
document.addEventListener("DOMContentLoaded", function() {
    initializeApp();
});

async function initializeApp() {
    // Primeiro: carregar dados do aluno
    await carregarAlunoLogado();
    
    // Segundo: verificar se há elementos existentes e adicionar listeners
    if (form) {
        form.addEventListener("submit", handleCalcularSubmit);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem("imcCurrentRA");
    window.location.href = "index.html";
}

async function handleCalcularSubmit(event) {
    event.preventDefault();
    
    // VERIFICAÇÃO 1: Aguardar carregamento
    if (isLoading) {
        alert("Aguarde o carregamento dos dados...");
        return;
    }
    
    // VERIFICAÇÃO 2: Erro no carregamento
    if (loadError) {
        alert("Erro ao carregar dados do aluno. Faça login novamente.");
        window.location.href = "index.html";
        return;
    }
    
    // VERIFICAÇÃO 3: Aluno não encontrado
    if (!alunoLogado) {
        alert("Aluno não encontrado. Faça login novamente.");
        window.location.href = "index.html";
        return;
    }
    
    // Ler dados do formulário
    const pesoInput = document.getElementById("weight");
    const alturaInput = document.getElementById("height");
    
    if (!pesoInput || !alturaInput) {
        alert("Campos não encontrados.");
        return;
    }
    
    const peso = lerNumeroDecimal(pesoInput.value);
    const altura = lerNumeroDecimal(alturaInput.value);
    
    // Validações
    if (!peso || !altura || peso <= 0 || altura <= 0) {
        alert("Digite peso e altura válidos.");
        return;
    }
    
    if (altura > 3) {
        alert("Altura deve ser em metros (ex: 1.75).");
        return;
    }
    
    // Calcular IMC
    const imc = peso / (altura * altura);
    const classificacao = classificarIMC(imc);
    
    // Criar registro
    const dataHora = new Date();
    const registro = {
        peso: peso,
        altura: altura,
        imc: parseFloat(imc.toFixed(2)),
        classificacao: classificacao,
        dataHora: dataHora.toLocaleString("pt-BR"),
        timestamp: dataHora.getTime()
    };
    
    console.log("Registro criado:", registro);
    
    // Inicializar histórico se não existir
    if (!alunoLogado.historico) {
        alunoLogado.historico = [];
    }
    
    // Adicionar ao início do histórico
    alunoLogado.historico.unshift(registro);
    
    console.log("Histórico após adição:", alunoLogado.historico);
    
    // Salvar no Firebase
    try {
        await salvarAluno(alunoLogado);
        
        // Mostrar resultado
        mostrarResultado(registro);
        
        alert("Cálculo salvo com sucesso!");
        
        // Limpar campos do formulário
        pesoInput.value = "";
        alturaInput.value = "";
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar cálculo: " + error.message);
    }
}

function lerNumeroDecimal(valor) {
    if (!valor) return null;
    
    // Substituir vírgula por ponto
    const valorFormatado = valor.replace(",", ".");
    const numero = parseFloat(valorFormatado);
    
    if (isNaN(numero)) {
        return null;
    }
    
    return numero;
}

function classificarIMC(imc) {
    if (isNaN(imc) || imc === undefined) {
        return "Erro";
    }
    
    if (imc < 18.5) {
        return "Abaixo do peso";
    } else if (imc < 25) {
        return "Peso normal";
    } else if (imc < 30) {
        return "Sobrepeso";
    } else if (imc < 35) {
        return "Obesidade grau 1";
    } else if (imc < 40) {
        return "Obesidade grau 2";
    } else {
        return "Obesidade grau 3";
    }
}

async function carregarAlunoLogado() {
    const ra = localStorage.getItem("imcCurrentRA");
    
    console.log("RA do localStorage:", ra);
    
    if (!ra) {
        console.log("RA não encontrado no localStorage");
        window.location.href = "index.html";
        return;
    }
    
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'alunos/' + ra));
        
        if (!snapshot.exists()) {
            console.log("Aluno não encontrado no Firebase");
            localStorage.removeItem("imcCurrentRA");
            loadError = true;
            window.location.href = "index.html";
            return;
        }
        
        alunoLogado = snapshot.val();
        
        console.log("Aluno carregado:", alunoLogado);
        console.log("Histórico do aluno:", alunoLogado.historico);
        
        isLoading = false;
        
    } catch (error) {
        console.error("Erro ao carregar aluno:", error);
        loadError = true;
        isLoading = false;
    }
}

async function salvarAluno(aluno) {
    if (!aluno || !aluno.ra) {
        throw new Error("Dados do aluno inválidos");
    }
    
    console.log("Salvando aluno:", aluno.ra);
    console.log("Dados a serem salvos:", JSON.stringify(aluno, null, 2));
    
    // Usar set para substituir completamente o nó do aluno
    // Isso garante que todas as propriedades sejam mantidas
    const alunoRef = ref(db, 'alunos/' + aluno.ra);
    await set(alunoRef, aluno);
    
    console.log("Aluno salvo com sucesso!");
}

function mostrarResultado(registro) {
    const valueElement = document.getElementById("value");
    const descriptionElement = document.getElementById("description");
    const infosElement = document.getElementById("infos");
    
    if (!infosElement) {
        console.log("Elemento infos não encontrado");
        return;
    }
    
    // Mostrar container de resultados
    infosElement.classList.remove("hidden");
    
    // Formatar IMC para exibição (usar vírgula)
    const imcFormatado = String(registro.imc).replace(".", ",");
    
    // Atualizar valor do IMC
    if (valueElement) {
        valueElement.textContent = imcFormatado;
        
        // Aplicar classe de cor baseada na classificação
        valueElement.classList.remove("normal", "attention");
        
        if (registro.classificacao === "Peso normal") {
            valueElement.classList.add("normal");
        } else {
            valueElement.classList.add("attention");
        }
    }
    
    // Atualizar descrição (classificação)
    if (descriptionElement) {
        descriptionElement.textContent = registro.classificacao;
    }
    
    console.log("Resultado exibido:", {
        imc: imcFormatado,
        classificacao: registro.classificacao
    });
}

// Exportar para debug (opcional)
window.debugIMC = {
    getAlunoLogado: () => alunoLogado,
    getIsLoading: () => isLoading,
    getLoadError: () => loadError,
    carregarAlunoLogado: carregarAlunoLogado
};
