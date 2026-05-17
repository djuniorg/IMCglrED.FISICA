import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Variável global para controlar primeiro acesso
let raPrimeiroAcesso = "";

// Inicializar após DOM estar pronta
document.addEventListener("DOMContentLoaded", function() {
    initializeLogin();
});

function initializeLogin() {
    const formLogin = document.getElementById("form");
    const firstAccessForm = document.getElementById("first-access-form");
    
    if (formLogin) {
        formLogin.addEventListener("submit", handleLoginSubmit);
    }
    
    if (firstAccessForm) {
        firstAccessForm.addEventListener("submit", handleFirstAccessSubmit);
    }
    
    console.log("Login inicializado");
}

function handleLoginSubmit(event) {
    event.preventDefault();
    
    const raInput = document.getElementById("ra");
    const passwordInput = document.getElementById("password");
    
    if (!raInput || !passwordInput) {
        console.error("Elementos do formulário não encontrados");
        return;
    }
    
    const ra = raInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!ra || !password) {
        mostrarMensagem("Preencha RA e senha.", "red");
        return;
    }
    
    // Buscar aluno no Firebase
    buscarAluno(ra, function(aluno) {
        if (!aluno) {
            // Primeiro acesso - usar RA como senha
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
        
        // Verificar se é primeiro acesso ou senha não definida
        const primeiroAcesso = aluno.primeiroAcesso;
        const senhaDefinida = aluno.senha && aluno.senha !== ra;
        
        if ((primeiroAcesso || !senhaDefinida) && password === ra) {
            abrirPrimeiroAcesso(ra);
            return;
        }
        
        // Verificar senha
        if (aluno.senha === password) {
            // Login bem-sucedido
            localStorage.setItem("imcCurrentRA", aluno.ra);
            
            console.log("Login bem-sucedido para:", aluno.ra);
            
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
}

function handleFirstAccessSubmit(event) {
    event.preventDefault();
    
    const nomeInput = document.getElementById("nome");
    const newPasswordInput = document.getElementById("new-password");
    
    if (!nomeInput || !newPasswordInput) {
        console.error("Elementos do formulário não encontrados");
        return;
    }
    
    const nome = nomeInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    
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
    
    // Buscar aluno existente ou criar novo
    buscarAluno(raPrimeiroAcesso, function(alunoExistente) {
        const aluno = alunoExistente || {
            ra: raPrimeiroAcesso,
            historico: []
        };
        
        // Atualizar dados do aluno
        aluno.nome = nome;
        aluno.senha = newPassword;
        aluno.primeiroAcesso = false;
        
        // Inicializar histórico se não existir
        if (!aluno.historico) {
            aluno.historico = [];
        }
        
        console.log("Salvando aluno:", aluno);
        
        // Salvar no Firebase
        salvarAluno(aluno, function() {
            localStorage.setItem(
                "imcCurrentRA",
                aluno.ra
            );
            
            console.log("Aluno salvo, redirecionando...");
            
            window.location.href = "inicio.html";
        });
    });
}

function abrirPrimeiroAcesso(ra) {
    raPrimeiroAcesso = ra;
    
    const formElement = document.getElementById("form");
    const infosElement = document.getElementById("infos");
    const changePasswordElement = document.getElementById("change-password");
    
    if (formElement) {
        formElement.classList.add("hidden");
    }
    
    if (infosElement) {
        infosElement.classList.add("hidden");
    }
    
    if (changePasswordElement) {
        changePasswordElement.classList.remove("hidden");
    }
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
        .catch((error) => {
            console.error("Erro ao buscar aluno:", error);
            mostrarMensagem(
                "Erro ao buscar aluno.",
                "red"
            );
        });
}

function salvarAluno(aluno, callback) {
    set(ref(db, 'alunos/' + aluno.ra), aluno)
        .then(() => {
            console.log("Aluno salvo com sucesso");
            callback();
        })
        .catch((error) => {
            console.error("Erro ao salvar aluno:", error);
            mostrarMensagem(
                "Erro ao salvar aluno.",
                "red"
            );
        });
}

function mostrarMensagem(texto, cor) {
    const infosElement = document.getElementById("infos");
    const messageElement = document.getElementById("message");
    
    if (infosElement) {
        infosElement.classList.remove("hidden");
    }
    
    if (messageElement) {
        messageElement.textContent = texto;
        messageElement.style.color = cor;
    }
}

// Exportar para debug
window.debugLogin = {
    getRaPrimeiroAcesso: () => raPrimeiroAcesso,
    abrirPrimeiroAcesso: abrirPrimeiroAcesso
};
