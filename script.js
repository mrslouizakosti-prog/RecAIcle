// === MODEL LOAD ===
const URL = "https://teachablemachine.withgoogle.com/models/YIf5c0Y8X/";

let model, maxPredictions, webcam, labelContainer;

async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; 

    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

// === WEBCAM MODE ===
document.getElementById("startWebcamBtn").addEventListener("click", async () => {
    await loadModel();

    const flip = true;
    webcam = new tmImage.Webcam(250, 250, flip);

    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    document.getElementById("uploaded-image").style.display = "none";
});

async function loop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// === UPLOAD IMAGE MODE ===
document.getElementById("imageUpload").addEventListener("change", async (event) => {
    await loadModel();

    const file = event.target.files[0];
    const img = document.getElementById("uploaded-image");

    img.src = URL.createObjectURL(file);
    img.style.display = "block";

    document.getElementById("webcam-container").innerHTML = "";

    img.onload = async () => {
        await predict(img);
    };
});

// === PREDICT FUNCTION ===
async function predict(input) {
    const prediction = await model.predict(input);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(1)}%`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
