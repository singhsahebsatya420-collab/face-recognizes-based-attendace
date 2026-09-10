import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

let loaded = false;
let loadingPromise = null;

export async function loadFaceModels() {
    if (loaded) return;
    if (!loadingPromise) {
        loadingPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]).then(() => {
            loaded = true;
        });
    }
    await loadingPromise;
}

export async function getFaceDescriptor(video) {
    const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection?.descriptor ? Array.from(detection.descriptor) : null;
}
