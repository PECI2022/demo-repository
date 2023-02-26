let recorder, chunks = [];
const constraints = { audio: true };

function startRecording() {
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.start();
    });
}

function stopRecording() {
    recorder.stop();
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    chunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    alert("Audio Stopped!");
    audio.play();
}

function playRecording() {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    const audioURL = window.URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    audio.play(); // not working on safari and firefox
    alert("Audio Playing!"); 
}

async function downloadRecording() {
    let recording = new File(chunks, 'recording.ogg', {type:'audio/ogg; codecs=opus'});
    
    let data = new FormData();
    data.append('file', recording);
    data.append('description', JSON.stringify({name:prompt("File Name?")}))

    let response = await fetch('http://127.0.0.1:5001/upload_audio', {
        method: "POST",
        body: data
    });


    alert("Video Saved on the Server");
    list_audio_fetch();
};


const list_audio_fetch = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_audio');
    let list = await response.json()
    if(!list) return;

    list_audio.innerHTML = "";
    list.sort();
    for(let i of list) {
        let li = document.createElement('li');
        li.innerHTML = i;
        li.addEventListener('click', () => load_audio(i));
        list_audio.appendChild(li);
    }
};list_audio_fetch()

const load_audio = async (name) => {
    console.log(name)
    let response = await fetch('http://127.0.0.1:5001/download_audio', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name}) 
    });
    let blob = await response.blob();
    audio_url = URL.createObjectURL(blob);
    let audio = new Audio(audio_url);
    audio.play();
}