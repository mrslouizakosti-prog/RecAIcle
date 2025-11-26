const URL = "https://teachablemachine.withgoogle.com/models/YIf5c0Y8X/";
let model, webcam, maxPredictions;
let webcamRunning = false;

const webcamContainer = document.getElementById("webcam-container");
const uploadedImage = document.getElementById("uploadedImage");
const loading = document.getElementById("loading");
const predictionBox = document.getElementById("prediction");

async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

loadModel();

// -------------------------
// START WEBCAM
// -------------------------
document.getElementById("startWebcamBtn").onclick = async () => {
    if (webcamRunning) return;

    uploadedImage.classList.add("hidden");
    predictionBox.textContent = "";

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();
    webcamRunning = true;

    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(webcam.canvas);

    document.getElementById("stopWebcamBtn").classList.remove("hidden");

    window.requestAnimationFrame(loop);
};

// -------------------------
// STOP WEBCAM
// -------------------------
document.getElementById("stopWebcamBtn").onclick = () => {
    if (webcam && webcam.stream) {
        webcam.stop();
        webcamRunning = false;
        document.getElementById("stopWebcamBtn").classList.add("hidden");
        webcamContainer.innerHTML = "";
    }
};

// -------------------------
// WEBCAM LOOP
// -------------------------
async function loop() {
    if (!webcamRunning) return;
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// -------------------------
// FILE UPLOAD
// -------------------------
document.getElementById("imageUpload").onchange = async function (event) {
    if (webcamRunning) {
        webcam.stop();
        webcamRunning = false;
        webcamContainer.innerHTML = "";
        document.getElementById("stopWebcamBtn").classList.add("hidden");
    }

    const file = event.target.files[0];
    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.classList.remove("hidden");

    loading.classList.remove("hidden");

    setTimeout(async () => {
        await predict(uploadedImage);
        loading.classList.add("hidden");
    }, 500);
};

// -------------------------
// PREDICT ONE BEST CLASS
// -------------------------
async function predict(input) {
    const prediction = await model.predict(input);

    prediction.sort((a, b) => b.probability - a.probability);

    const best = prediction[0];

    predictionBox.textContent = `${best.className}`;
}
