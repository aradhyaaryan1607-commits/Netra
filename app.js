const video = document.getElementById("video");
const espImage = document.getElementById("espImage");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("status");

let cameraStream = null;
let model = null;
let detectionRunning = false;
let voiceEnabled = true;
let cameraType = "";


// LOAD AI MODEL AUTOMATICALLY

async function loadAI() {

    statusText.innerText = "Loading AI model...";

    try {

        if (!window.tf || !window.cocoSsd) {
            throw new Error("AI libraries did not load. Check internet.");
        }

        await tf.ready();

        model = await cocoSsd.load();

        statusText.innerText = "🟢 AI Model Ready";

    } catch (error) {

        statusText.innerText = "❌ AI Error: " + error.message;

        console.error(error);

    }

}

loadAI();


// PHONE CAMERA

document.getElementById("phoneBtn").onclick = async function() {

    try {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            throw new Error("Camera API unavailable. Open using HTTPS.");

        }

        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "environment"
            },

            audio: false

        });

        video.srcObject = cameraStream;

        video.style.display = "block";
        espImage.style.display = "none";

        cameraType = "phone";

        await video.play();

        resizeCanvas();

        statusText.innerText = model
            ? "🟢 Camera connected - AI ready"
            : "Camera connected - AI still loading";

    } catch (error) {

        alert("Camera Error: " + error.message);

    }

};


// ESP32 CAMERA

document.getElementById("espBtn").onclick = function() {

    document.getElementById("espControls").style.display = "block";

};


// CONNECT ESP32

document.getElementById("connectEsp").onclick = function() {

    const url = document.getElementById("espUrl").value.trim();

    if (!url) {

        alert("Enter ESP32 camera URL first.");
        return;

    }

    stopCamera();

    espImage.onload = function() {

        espImage.style.display = "block";
        video.style.display = "none";

        cameraType = "esp";

        resizeCanvas();

        statusText.innerText = model
            ? "🟢 ESP32 connected - AI ready"
            : "ESP32 connected - AI still loading";

    };

    espImage.onerror = function() {

        alert("Cannot connect to ESP32. Check URL and Wi-Fi.");

    };

    espImage.src = url;

};


// STOP CAMERA

function stopCamera() {

    detectionRunning = false;

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => track.stop());

        cameraStream = null;

    }

    video.srcObject = null;
    video.style.display = "none";

    espImage.removeAttribute("src");
    espImage.style.display = "none";

    cameraType = "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

document.getElementById("stopBtn").onclick = stopCamera;


// CANVAS SIZE

function resizeCanvas() {

    const box = document.getElementById("cameraBox");

    canvas.width = box.clientWidth;
    canvas.height = box.clientHeight;

}


// VOICE

function speak(message) {

    if (!voiceEnabled) return;

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speechSynthesis.speak(speech);

}


// DETECTION

document.getElementById("detectBtn").onclick = async function() {

    if (!model) {

        alert("AI model is not ready. Check your internet and reload.");

        return;

    }

    if (!cameraType) {

        alert("Start a camera first.");

        return;

    }

    detectionRunning = !detectionRunning;

    this.innerText = detectionRunning
        ? "Pause Detection"
        : "Start Detection";

    if (detectionRunning) detectObjects();

};


async function detectObjects() {

    if (!detectionRunning) return;

    const element = cameraType === "phone" ? video : espImage;

    const width = cameraType === "phone"
        ? video.videoWidth
        : espImage.naturalWidth;

    const height = cameraType === "phone"
        ? video.videoHeight
        : espImage.naturalHeight;

    if (!width || !height) {

        requestAnimationFrame(detectObjects);
        return;

    }

    const box = document.getElementById("cameraBox");

    canvas.width = box.clientWidth;
    canvas.height = box.clientHeight;

    const predictions = await model.detect(element);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sx = canvas.width / width;
    const sy = canvas.height / height;

    let output = "";

    for (const object of predictions) {

        if (object.score < 0.55) continue;

        const [x, y, w, h] = object.bbox;

        const px = x * sx;
        const py = y * sy;
        const pw = w * sx;
        const ph = h * sy;

        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 3;

        ctx.strokeRect(px, py, pw, ph);

        ctx.fillStyle = "#00aa88";
        ctx.font = "14px Arial";

        ctx.fillText(
            object.class,
            px,
            Math.max(15, py - 5)
        );

        const position =
            x + w / 2 < width * 0.36
            ? "left"
            : x + w / 2 > width * 0.64
            ? "right"
            : "ahead";

        output += `
        <p>
        ${object.class} -
        ${position} -
        Confidence: ${(object.score * 100).toFixed(0)}%
        </p>
        `;

    }

    document.getElementById("results").innerHTML =
        output || "No familiar objects detected.";

    requestAnimationFrame(detectObjects);

}


// PRODUCT AND CURRENCY PLACEHOLDERS

document.getElementById("productBtn").onclick = function() {

    alert("Product recognition will be added in the next development stage.");

};

document.getElementById("currencyBtn").onclick = function() {

    alert("Currency recognition will be added in the next development stage.");

};


// VOICE CONTROL

document.addEventListener("dblclick", function() {

    voiceEnabled = !voiceEnabled;

    alert("Voice " + (voiceEnabled ? "enabled" : "disabled"));

});
