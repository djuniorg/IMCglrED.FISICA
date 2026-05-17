import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyBdfuUoDsUKwi_6AakQrwcaqNabZOZT-hs",
    authDomain: "imc-app-b0248.firebaseapp.com",
    databaseURL: "https://imc-app-b0248-default-rtdb.firebaseio.com",
    projectId: "imc-app-b0248",
    storageBucket: "imc-app-b0248.firebasestorage.app",
    messagingSenderId: "40271439826",
    appId: "1:40271439826:web:3d20bca8817efa70af4a0b",
    measurementId: "G-BS2M03DPHK"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);