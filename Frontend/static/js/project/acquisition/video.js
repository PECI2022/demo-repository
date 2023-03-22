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
    record_button.disabled = false;
    
    media_recorder = new MediaRecorder(camera_stream, {mimeType: 'video/webm'});
    media_recorder.addEventListener('dataavailable', (e) => {
        blobs_recorded.push(e.data);
    });
    media_recorder.addEventListener('stop', async () => {
        let recording = new Blob(blobs_recorded, {type:'video/webm'});
        lauchDataPreview(recording);
        /*
        let recording = new Blob(blobs_recorded, {type:'video/webm'});
        let data = new FormData();
        data.append('file', recording);

        // data.append('description', JSON.stringify({name:prompt("File Name?")}))
        let description = lauchDataPreview(recording)

        if(!description) return;

        data.append('description', JSON.stringify(description))

        let response = await fetch('http://127.0.0.1:5001/upload', {
            method: "POST",
            body: data
        });
        alert("Video Saved on the Server"); // TODO: create a stylized popup
        list_videos_fetch();
        */
    });
    //different type of recording
    //start recording automatically
    // blobs_recorded = [];
    // media_recorder.start(5);
    // setTimeout(()=>{ // duration delay
    //     media_recorder.stop();
    // }, duration_input.value*1000);
});

record_button.addEventListener('click', async () => {
    record_button.disabled = true;

    blobs_recorded = [];

    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown

    // })

    setTimeout(()=>{ // countdown delay
        media_recorder.start(100);
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

const storeCurrentBlob = async (blob) => {
    let data = new FormData();
    data.append('file', blob);

    let descriptionName = document.querySelector("#acquisitionVideoPreviewModalDescriptionName").value;
    console.log(descriptionName)
    data.append('description', JSON.stringify({name:descriptionName}))

    $('#acquisitionVideoPreviewModal').modal('hide')
    
    let response = await fetch('http://127.0.0.1:5001/upload', {
        method: "POST",
        body: data
    });
    
    alert("Video Saved on the Server"); // TODO: create a stylized popup
    record_button.disabled = false;
    list_videos_fetch();
}

const lauchDataPreview = videoBlob => {
    $('#acquisitionVideoPreviewModal').modal('show')
    console.log(URL.createObjectURL(videoBlob))
    document.querySelector('#acquisitionVideoPreviewModalVideo').src = URL.createObjectURL(videoBlob)
    document.querySelector('#acquisitionVideoPreviewModalStore').addEventListener('click', () => storeCurrentBlob(videoBlob))
}


 // upload video
 let fileInput = document.getElementById("file-upload");
 let fileNameSpan = document.getElementById("file-name");

 fileInput.setAttribute("accept", "video/*"); // Only accept video inputs

 fileInput.addEventListener("change", function() {
 let file = fileInput.files[0];
 let fileName = file.name;
 let lastWord = fileName.split("_").pop().split(".")[0];
 let videoName = "video_" + lastWord;

 if (confirm("Do you want to upload " + fileName + "?")) {
     // show message
     fileNameSpan.innerHTML = "<b>NEW FILE NAME: </b>" + videoName + ".webm";

     let formData = new FormData();
     formData.append("file", file);
     formData.append("description", JSON.stringify({name: videoName}));

     fetch("http://127.0.0.1:5001/upload", {
         method: "POST",
         body: formData
     })
     .then(response => response.json())
     .then(data => console.log(data))
     .catch(error => console.error(error));
 } else {
     // do nothing
 }
 });
