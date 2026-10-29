const formulario = document.getElementById("formulario-nombre");
const entrada = document.getElementById("entrada");
const partida = document.getElementById("partida");
const tablero = document.getElementById("tablero");
const tiempoTexto = document.getElementById("tiempo");
const puntuacionTexto = document.getElementById("puntuacion");
const simbolos = ["img/Tiranido1.png", "🛡️", "💀", "🔥", "⚡", "👑", "🦅", "🔨", "🪓", "🗡️", "🚀", "💣", "⚙️", "🌟", "🏴"];

let nombre = "";
let primeraCarta = null;
let bloqueado = false;
let puntos = 0;
let parejas = 0;
let finDelTiempo;
let temporizador;
let terminada = false;

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    nombre = document.getElementById("nombre").value.trim();

    if (nombre === "") {
        document.getElementById("nombre").focus();
        return;
    }

    localStorage.setItem("nombreJugador", nombre);
    document.getElementById("jugador").textContent = nombre;
    crearTablero();
    entrada.hidden = true;
    partida.hidden = false;
    finDelTiempo = Date.now() + 60000;
    temporizador = setInterval(actualizarTiempo, 100);
});

function crearTablero() {
    const cartas = [...simbolos, ...simbolos];

    for (let i = cartas.length - 1; i > 0; i--) {
        const posicion = Math.floor(Math.random() * (i + 1));
        [cartas[i], cartas[posicion]] = [cartas[posicion], cartas[i]];
    }

    cartas.forEach(function (simbolo, indice) {
        const carta = document.createElement("button");
        carta.type = "button";
        carta.className = "carta";
        carta.textContent = "";
        carta.dataset.simbolo = simbolo;
        carta.setAttribute("aria-label", "Carta " + (indice + 1));
        carta.addEventListener("click", function () {
            girarCarta(carta);
        });
        tablero.appendChild(carta);
    });
}

function actualizarTiempo() {
    const restante = Math.max(0, Math.ceil((finDelTiempo - Date.now()) / 1000));
    tiempoTexto.textContent = restante;

    if (restante === 0) {
        terminarPartida(false);
    }
}

function girarCarta(carta) {
    if (terminada || bloqueado || carta.disabled) {
        return;
    }

    if (Date.now() >= finDelTiempo) {
        actualizarTiempo();
        return;
    }

    if (carta.dataset.simbolo.endsWith(".png")) {
        const imagen = document.createElement("img");
        imagen.src = carta.dataset.simbolo;
        imagen.alt = "Tiránido 1";
        carta.textContent = "";
        carta.appendChild(imagen);
    } else {
        carta.textContent = carta.dataset.simbolo;
    }
    carta.classList.add("descubierta");
    carta.disabled = true;

    if (primeraCarta === null) {
        primeraCarta = carta;
        return;
    }

    if (primeraCarta.dataset.simbolo === carta.dataset.simbolo) {
        puntos += 50;
        parejas++;
        primeraCarta.classList.add("encontrada");
        carta.classList.add("encontrada");
        primeraCarta = null;
    } else {
        puntos = Math.max(0, puntos - 10);
        bloqueado = true;
        const anterior = primeraCarta;
        primeraCarta = null;

        setTimeout(function () {
            if (terminada) {
                return;
            }

            anterior.textContent = "";
            carta.textContent = "";
            anterior.classList.remove("descubierta");
            carta.classList.remove("descubierta");
            anterior.disabled = false;
            carta.disabled = false;
            bloqueado = false;
        }, 700);
    }

    puntuacionTexto.textContent = puntos;

    if (parejas === 15) {
        terminarPartida(true);
    }
}

function terminarPartida(victoria) {
    if (terminada) {
        return;
    }

    terminada = true;
    clearInterval(temporizador);

    const resultado = {
        nombre: nombre,
        tiempo: Math.min(60, Math.ceil((Date.now() - (finDelTiempo - 60000)) / 1000)),
        puntuacion: puntos,
        victoria: victoria
    };

    localStorage.setItem("ultimaPartida", JSON.stringify(resultado));
    partida.hidden = true;
    document.getElementById("resultado").hidden = false;
    document.getElementById("titulo-resultado").textContent = victoria ? "¡Victoria!" : "Derrota";
    document.getElementById("detalle-resultado").textContent = nombre + " · " + puntos + " puntos · " + resultado.tiempo + " segundos";
}
