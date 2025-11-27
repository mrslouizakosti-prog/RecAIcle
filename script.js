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
async function startWebcam(){
  try{
    uploadContainer.style.display='none';
    webcamContainer.style.display='grid';

    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup({ facingMode: "user" }); // show prompt; may throw
    await webcam.play();
    webcamOn = true;

    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcam.canvas);
    document.getElementById('stopWebcamBtn').disabled = false;

    window.requestAnimationFrame(loop);
  } catch (e) {
    console.error(e);
    statusEl.className = 'badge err';
    statusEl.textContent = (e.name ? e.name + ': ' : '') + (e.message || 'Webcam failed');
  }
}
async function loop(){
  if(!webcamOn) return;
  webcam.update();
  await predictFromElement(webcam.canvas);
  window.requestAnimationFrame(loop);
}

function stopWebcam(){
  if(webcam){ webcam.stop(); webcamOn = false; }
  webcamContainer.innerHTML='';
  webcamContainer.style.display='none';
  uploadContainer.style.display='grid';
  document.getElementById('stopWebcamBtn').disabled=true;
}
document.getElementById('fileInput').addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  stopWebcam();
  const url = URL.createObjectURL(file);
  uploadImg.onload = ()=>{ URL.revokeObjectURL(url); predictFromElement(uploadImg); };
  uploadImg.src = url;
});

// Buttons
document.getElementById('webcamBtn').addEventListener('click', startWebcam);
document.getElementById('stopWebcamBtn').addEventListener('click', stopWebcam);
document.getElementById('reloadModel').addEventListener('click', ()=>{
  const base = modelBase.value.trim();
  loadModel(base);
});

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

