<!-- IMPORTANT: Teachable Machine library -->
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>

<script>
const URL = "https://teachablemachine.withgoogle.com/models/YIf5c0Y8X/";
let model, webcam, maxPredictions;
let webcamRunning = false;

const webcamContainer = document.getElementById("webcam-container");
const uploadedImage = document.getElementById("uploadedImage");
const loading = document.getElementById("loading");
const predictionBox = document.getElementById("prediction");

// -------------------------
// LOAD TEACHABLE MACHINE MODEL
// -------------------------
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded");
}

// Ensure model is loaded before anything else
window.onload = async () => {
    loading.classList.remove("hidden");
    await loadModel();
    loading.classList.add("hidden");
};

// -------------------------
// START WEBCAM
// -------------------------
document.getElementById("startWebcamBtn").onclick = async () => {
    if (webcamRunning) return;

    uploadedImage.classList.add("hidden");
    predictionBox.textContent = "";

    webcam = new tmImage.Webcam(300, 300, true);

    try {
        await webcam.setup(); // request permissions
        await webcam.play();
    } catch (err) {
        alert("Webcam access blocked or not supported.");
        console.error(err);
        return;
    }

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
        webcamContainer.innerHTML = "";
        document.getElementById("stopWebcamBtn").classList.add("hidden");
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
    if (!file) return;

    loading.classList.remove("hidden");

    uploadedImage.onload = async () => {
        await predict(uploadedImage);
        loading.classList.add("hidden");
    };

    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.classList.remove("hidden");
};

// -------------------------
// PREDICT
// -------------------------
async function predict(source) {
    loading.style.display = "block";

    const prediction = await model.predict(source);
    
    // Find the highest probability class
    let best = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));

    loading.style.display = "none";
    predictionBox.innerHTML = `${best.className} — ${(best.probability * 100).toFixed(1)}%`;
}
</script>
