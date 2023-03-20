const camera_button_back = document.querySelector("#startDisplayButtonBack")
const camera_button = document.querySelector("#start-camera");
const record_button = document.querySelector("#record-video"); 
const countdown_input = document.querySelector("#video-countdown");
const duration_input = document.querySelector("#video-duration");

let camera_stream;
let media_recorder;
let blobs_recorded;

camera_button.addEventListener('click', async () => {
    camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
    
    camera_button.style.display = "none";
    camera_button_back.style.display = "none";
    
    video.srcObject = camera_stream;
    video.style.display = 'block';
<<<<<<< HEAD
    loaded_video.style.display = 'none';
    start_button.disabled = false;
    camera_button.disabled = true;
});

start_button.addEventListener('click', () => {
    start_button.disabled = true;
    stop_button.disabled = false;
    video.style.display = 'block';
    loaded_video.style.display = 'none';
9
    media_recorder = new MediaRecorder(camera_stream, {mimeType: VIDEO_TYPE});
=======
    record_button.disabled = false;
    
    media_recorder = new MediaRecorder(camera_stream, {mimeType: 'video/webm'});
>>>>>>> b1b23c090a615e76443b395251e0b4b18ff0e4f9
    media_recorder.addEventListener('dataavailable', (e) => {
        blobs_recorded.push(e.data);
    });
    media_recorder.addEventListener('stop', async () => {
        let recording = new File(blobs_recorded, 'recording.webm', {type:'video/webm'});
        let data = new FormData();
        data.append('file', recording);
        data.append('description', JSON.stringify({name:prompt("File Name?")}))
        let response = await fetch('http://127.0.0.1:5001/upload', {
            method: "POST",
            body: data
        });
        alert("Video Saved on the Server");
        // list_videos_fetch();
    });
});

record_button.addEventListener('click', async () => {
    record_button.disabled = true;

    blobs_recorded = [];

    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown

    // })

    setTimeout(()=>{ // countdown delay
        media_recorder.start(1000);
        setTimeout(()=>{ // duration delay
            media_recorder.stop();
        }, duration_input.value*1000);
    }, countdown_input.value*1000);
})

const list_videos_fetch = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return;
    console.log(list)
    // list_videos.innerHTML = "";
    // list.sort();
    // for(let i of list) {
    //     let newElem = document.createElement('li');
    //     newElem.innerHTML = `<a style="cursor:pointer;" onclick="load_video('${i}')">${i}</a>`;
    //     list_videos.appendChild(newElem);
    // }
};list_videos_fetch()

// let camera_button_back = document.querySelector("#startDisplayButtonBack")
// let camera_button = document.querySelector("#start-camera");
// let video = document.querySelector("#video");
// let loaded_video = document.querySelector("#video_loader");
// let start_button = document.querySelector("#start-record");
// let stop_button = document.querySelector("#stop-record");
// let save_button = document.querySelector("#save-video");
// // let list_videos = document.querySelector("#list_videos");

// let camera_stream = null;
// let media_recorder = null;
// let blobs_recorded = [];

// const VIDEO_TYPE = 'video/webm'

// let video_blob;
// let video_url;

// camera_button.addEventListener('click', async () => {
//     camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});

//     camera_button.style.display = "none";
//     camera_button_back.style.display = "none";

//     video.srcObject = camera_stream;
//     video.style.display = 'block';
//     loaded_video.style.display = 'none';
//     start_button.disabled = false;
//     camera_button.disabled = true;
// });

// start_button.addEventListener('click', () => {
//     start_button.disabled = true;
//     stop_button.disabled = false;
//     video.style.display = 'block';
//     loaded_video.style.display = 'none';

//     media_recorder = new MediaRecorder(camera_stream, {mimeType: VIDEO_TYPE});
//     media_recorder.addEventListener('dataavailable', (e) => {
//         blobs_recorded.push(e.data);
//     });

//     media_recorder.addEventListener('stop', () => {
//         start_button.disabled = true;
//         save_button.disabled = false;
//     });

//     media_recorder.start(1000);
//     blobs_recorded = [];
// });

// save_button.addEventListener('click', async () => {
//     save_button.disabled = true;
//     start_button.disabled = false;

//     let recording = new File(blobs_recorded, 'recording.webm', {type:'video/webm'});

//     let data = new FormData();
//     data.append('file', recording);
//     data.append('description', JSON.stringify({name:prompt("File Name?")}))

//     let response = await fetch('http://127.0.0.1:5001/upload', {
//         method: "POST",
//         body: data
//     });


//     alert("Video Saved on the Server");
//     list_videos_fetch();
// });

// stop_button.addEventListener('click', ()=>{
//     start_button.disabled = false;
//     stop_button.disabled = true;

//     media_recorder.stop();
// });

// const list_videos_fetch = async () => {
//     const response = await fetch('http://127.0.0.1:5001/list_videos');
//     let list = await response.json()
//     if(!list) return;

//     list_videos.innerHTML = "";
//     list.sort();
//     for(let i of list) {
//         let newElem = document.createElement('li');
//         newElem.innerHTML = `<a style="cursor:pointer;" onclick="load_video('${i}')">${i}</a>`;
//         list_videos.appendChild(newElem);
//     }
// };list_videos_fetch()

/*
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
    video.style.display = 'none';
    loaded_video.style.display = 'block';
    start_button.disabled = false;
    loaded_video.src = video_url;
}

<<<<<<< HEAD

/* <script>
    const startCameraButton = document.querySelector('#start-camera');
=======
const startCameraButton = document.querySelector('#start-camera');
>>>>>>> b1b23c090a615e76443b395251e0b4b18ff0e4f9
    const saveVideoButton = document.querySelector('#save-video');

    let isCameraOn = false;
    let mediaRecorder;
    let recordedChunks = [];

    startCameraButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoElement = document.querySelector('#video');
        videoElement.srcObject = stream;
        videoElement.play();
        isCameraOn = true;
        saveVideoButton.removeAttribute('disabled'); // enable the "Record" button
        startCameraButton.style.display = 'none'; // hide the "Start Camera" button

<<<<<<< HEAD
        create a MediaRecorder object to record video
=======
        // create a MediaRecorder object to record video
>>>>>>> b1b23c090a615e76443b395251e0b4b18ff0e4f9
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener('dataavailable', event => {
        recordedChunks.push(event.data);
        });
        mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedChunks = [];
        const videoName = prompt('Enter video name:', 'myvideo');
        if (videoName !== null) {
            const videoUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = videoUrl;
            downloadLink.download = `${videoName}.webm`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
        });
    } catch (error) {
        console.error('Error starting camera:', error);
    }
    });

    saveVideoButton.setAttribute('disabled', 'true'); // disable the "Record" button by default

    saveVideoButton.addEventListener('click', () => {
    if (isCameraOn) {
        if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        saveVideoButton.innerHTML = 'Record';
        } else {
        recordedChunks = [];
        mediaRecorder.start();
        saveVideoButton.innerHTML = 'Stop';
        }
    }
    });
<<<<<<< HEAD


</script> */
=======
    */
>>>>>>> b1b23c090a615e76443b395251e0b4b18ff0e4f9
