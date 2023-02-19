let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let loaded_video = document.querySelector("#loaded-video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let save_button = document.querySelector("#save-video");
let list_videos = document.querySelector("#list_videos");

let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];

const VIDEO_TYPE = 'video/webm'

let video_blob;
let video_url;

camera_button.addEventListener('click', async () => {
    camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
    video.srcObject = camera_stream;
    start_button.disabled = false;
    camera_button.disabled = true;
});

start_button.addEventListener('click', () => {
    start_button.disabled = true;
    stop_button.disabled = false;

    media_recorder = new MediaRecorder(camera_stream, {mimeType: VIDEO_TYPE});

    media_recorder.addEventListener('dataavailable', (e) => {
        blobs_recorded.push(e.data);
    });

    media_recorder.addEventListener('stop', () => {
        start_button.disabled = true;
        save_button.disabled = false;
    });

    media_recorder.start(1000);
    blobs_recorded = [];
});

save_button.addEventListener('click', async () => {
    save_button.disabled = true;
    start_button.disabled = false;

    let recording = new File(blobs_recorded, 'recording.webm', {type:'video/webm'});

    let data = new FormData();
    data.append('file', recording);
    data.append('description', JSON.stringify({name:prompt("File Name?")}))

    let response = await fetch('http://127.0.0.1:5001/upload', {
        method: "POST",
        body: data
    });

    alert("Video Saved on the Server");
    list_videos_fetch();
});

stop_button.addEventListener('click', ()=>{
    start_button.disabled = false;
    stop_button.disabled = true;

    media_recorder.stop();
});

const list_videos_fetch = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return;

    list_videos.innerHTML = "";
    list.sort();
    for(let i of list) {
        let newElem = document.createElement('li');
        newElem.innerHTML = `<a onclick="load_video('${i}')">${i}</a>`;
        list_videos.appendChild(newElem);
    }
};list_videos_fetch()

const load_video = async (name) => {
    console.log(name)
    let response = await fetch('http://127.0.0.1:5001/download', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name}) 
    });
    let blob = await response.blob();
    video_url = URL.createObjectURL(blob);
    loaded_video.src = video_url;
}

let recorder, chunks = [];
    const constraints = { audio: true };

    function startRecording() {
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            recorder = mediaRecorder;
            mediaRecorder.start();

            mediaRecorder.addEventListener("dataavailable", event => {
            chunks.push(event.data);
            });
        });
    }

    function stopRecording() {
        recorder.stop();

        recorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const audioURL = URL.createObjectURL(blob);
        const audio = document.querySelector("audio");
        audio.src = audioURL;

        chunks = [];
        });
    }

    function playRecording() {
        const audio = document.querySelector("audio");
        audio.play();
    }

    async function downloadRecording() {
        let recording = new File(chunks, 'recording.webm', {type:'audio/mp3'});
        let data = new FormData();
        data.append('file', recording);
        data.append('description', JSON.stringify({name:prompt("File Name?")}))

        let response = await fetch('http://127.0.0.1:5001/upload', {
            method: "POST",
            body: data
        });
        

        alert("Audio Saved on the Server");

    }

// no need 
let audio_button = document.querySelector("#start-audio");
let audio = document.querySelector("#audio");
let loaded_audio = document.querySelector("#loaded-audio");
let start_audio_button = document.querySelector("#start-audio-record");
let stop_audio_button = document.querySelector("#stop-audio-record");
let save_audio_button = document.querySelector("#save-audio");
let list_audios = document.querySelector("#list_audios");

let audio_stream = null;
let audio_recorder = null;
let audio_blobs_recorded = [];

const AUDIO_TYPE = 'audio/webm'

let audio_blob;
let audio_url;

audio_button.addEventListener('click', async () => {
    audio_stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true});
    audio.srcObject = audio_stream;
    start_audio_button.disabled = false;
    audio_button.disabled = true;
});

start_audio_button.addEventListener('click', () => {
    start_audio_button.disabled = true;
    stop_audio_button.disabled = false;

    audio_recorder = new MediaRecorder(audio_stream, {mimeType: AUDIO_TYPE});

    audio_recorder.addEventListener('dataavailable', (e) => {
        audio_blobs_recorded.push(e.data);
    });

    audio_recorder.addEventListener('stop', () => {
        start_audio_button.disabled = true;
        save_audio_button.disabled = false;
    });

    audio_recorder.start(1000);
    audio_blobs_recorded = [];
});

save_audio_button.addEventListener('click', async () => {
    save_audio_button.disabled = true;
    start_audio_button.disabled = false;

    let recording = new File(audio_blobs_recorded, 'recording.webm', {type:'audio/webm'});

    let data = new FormData();
    data.append('file', recording);
    data.append('description', JSON.stringify({name:prompt("File Name?")}))

    let response = await fetch('http://127.0.0.1:5001/upload', {
        method: "POST",
        body: data
    });

    alert("Audio Saved on the Server");
    list_audios_fetch();
});

stop_audio_button.addEventListener('click', ()=>{
    start_audio_button.disabled = false;
    stop_audio_button.disabled = true;

    audio_recorder.stop();
});

const list_audios_fetch = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return;
    
    list_audios.innerHTML = "";
    list.sort();
    for(let i of list) {
        let newElem = document.createElement('li');
        newElem.innerHTML = `<a onclick="load_audio('${i}')">${i}</a>`;
        list_audios.appendChild(newElem);
    }
};list_audios_fetch()

const load_audio = async (name) => {
    console.log(name)
    let response = await fetch('http://127.0.0.1:5001/download', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name}) 
    });

    let blob = await response.blob();
    audio_url = URL.createObjectURL(blob);
    loaded_audio.src = audio_url;
}