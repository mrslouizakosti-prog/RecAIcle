<!-- IMPORTANT: Teachable Machine library -->
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>

<script>
const URL = "https://teachablemachine.withgoogle.com/models/YIf5c0Y8X/";
let model, webcam, maxPredictions;
let webcamRunning = false;

let webcamContainer, uploadedImage, loading, predictionBox;

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

// -------------------------
// START WEBCAM
// -------------------------
async function startWebcam() {
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
}

// -------------------------
// STOP WEBCAM
// -------------------------
function stopWebcam() {
    if (webcam && webcam.stream) {
        // Explicitly stop all tracks
        webcam.stream.getTracks().forEach(track => track.stop());
        webcam.stop();
    }
    webcamRunning = false;
    webcamContainer.innerHTML = "";
    document.getElementById("stopWebcamBtn").classList.add("hidden");
}

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
async function handleImageUpload(event) {
    stopWebcam();

    const file = event.target.files[0];
    if (!file) return;

    loading.classList.remove("hidden");

    const objectURL = URL.createObjectURL(file);
    uploadedImage.src = objectURL;
    uploadedImage.classList.remove("hidden");

    uploadedImage.onload = async () => {
        await predict(uploadedImage);
        loading.classList.add("hidden");
        URL.revokeObjectURL(objectURL); // cleanup
    };
}

// -------------------------
// PREDICT
// -------------------------
async function predict(source) {
    loading.classList.remove("hidden");

    const prediction = await model.predict(source);
    
    // Find the highest probability class
    let best = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));

    loading.classList.add("hidden");
    predictionBox.innerHTML = `${best.className} — ${(best.probability * 100).toFixed(1)}%`;
}

// -------------------------
// INITIALIZE AFTER DOM LOAD
// -------------------------
window.onload = async () => {
    webcamContainer = document.getElementById("webcam-container");
    uploadedImage = document.getElementById("uploadedImage");
    loading = document.getElementById("loading");
    predictionBox = document.getElementById("prediction");

    loading.classList.remove("hidden");
    await loadModel();
    loading.classList.add("hidden");

    // Attach event listeners AFTER DOM is ready
    document.getElementById("startWebcamBtn").onclick = startWebcam;
    document.getElementById("stopWebcamBtn").onclick = stopWebcam;
    document.getElementById("imageUpload").onchange = handleImageUpload;
};
</script>

