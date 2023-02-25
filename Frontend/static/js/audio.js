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
    audio.play(); // not working

    
    alert("Audio Playing!"); 
}

function downloadRecording() {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    const audioURL = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
}


