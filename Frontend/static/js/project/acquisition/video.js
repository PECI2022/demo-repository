const camera_button_back = document.querySelector("#startDisplayButtonBack")
const camera_button = document.querySelector("#start-camera");
const record_button = document.querySelector("#record-video"); 
const countdown_input = document.querySelector("#video-countdown");
const duration_input = document.querySelector("#video-duration");
const recording_message = document.querySelector("#recording-message");
const countdown = document.querySelector('#countdown');
const video_table = document.querySelector('#video_table')
const class_adition = document.querySelector('#addClass')

let camera_stream;
let media_recorder;
let blobs_recorded;

let classes = ['Thumbsup','Thumbsdown','Peace']; // TODO: delete and replace this variable with a fetch to the db
 

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

record_button.disabled=true;
record_button.addEventListener('click', async () => {
    record_button.disabled = true;
    
    blobs_recorded = [];
    
    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown
    
    // })
    
    let timeLeft = countdown_input.value;
    // Update the countdown display every second
    let countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            countdown.innerHTML = timeLeft;
        } else {
            clearInterval(countdownInterval);
        }
        
    }, 1000);


    setTimeout(()=>{ // countdown delay
        countdown.innerHTML = "";
        recording_message.style.display = "block";

        recording_message.innerHTML = "Recording for <b>" + duration_input.value + "</b> seconds";
        media_recorder.start(100); //
        setTimeout(()=>{ // duration delay
            recording_message.innerHTML = "";
            media_recorder.stop(); //
        }, duration_input.value*1000);
    }, countdown_input.value*1000);
})

const list_videos_fetch = async () => {
    console.log(class_adition.innerHTML)
    // console.log(video_table)
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return;
    video_table.innerHTML = ""
    // console.log("LLL")
    // console.log(list)
    // list_videos.innerHTML = "";
    // list.sort();
    for(let i of list) {
        console.log(i)
        let s = `<tr><th scope="row">1</th><td>${i.name}</td><td>${i.video_class}</td><td>${i.length}</td><td><span class="material-icons" style="cursor: pointer;">edit</span><span class="material-icons text-danger" style="cursor: pointer;">delete_forever</span></td> </tr>` 
        let newElem = document.createElement('tr');
        newElem.innerHTML=s
        video_table.appendChild(newElem);
    }
};list_videos_fetch()

const list_classes_fetch = async () => {
    // TODO: get classes from a fetch to server
    // const response = await fetch('http://127.0.0.1:5001/list_classes');
    // let classes = await response.json()
    // if(!classes) return;

    document.querySelector("#acquisitionClassesDropdown").innerHTML = ""
    classes.forEach( c => {
        let s = `<li><button class="dropdown-item block" onclick="document.querySelector('#classDropdown').innerHTML='${c}'">${c}</button></li>`;
        let obj = document.createElement('li');
        obj.innerHTML = s;
        document.querySelector("#acquisitionClassesDropdown").appendChild(obj);
    })
};list_classes_fetch()

// STORE VIDEO IN DB
const storeCurrentBlob = async (blob) => {
    let video_class = document.querySelector("#classDropdown").innerHTML
    let data = new FormData();
    data.append('file', blob);

    let descriptionName = document.querySelector("#acquisitionVideoPreviewModalDescriptionName").value;
    console.log(descriptionName)
    data.append('description', JSON.stringify({name:descriptionName, class:video_class, length:duration_input.value}))

    $('#acquisitionVideoPreviewModal').modal('hide')
    
    let response = await fetch('http://127.0.0.1:5001/upload', {
        method: "POST",
        body: data
    });
    let a = await response.json()
    console.log(a['result'])
    if(a['result'] == "Correct"){
        alert("Video Saved on the Server"); // TODO: create a stylized popup
        record_button.disabled = false;
        list_videos_fetch();
    }else{
        alert("Name already in use in this project")
    }
}

// VIDEO PREVIEWER + SEND TO DB
const lauchDataPreview = videoBlob => {
    $('#acquisitionVideoPreviewModal').modal('show')
    console.log(URL.createObjectURL(videoBlob))
    document.querySelector('#acquisitionVideoPreviewModalVideo').src = URL.createObjectURL(videoBlob)
    document.querySelector('#acquisitionVideoPreviewModalStore').addEventListener('click', () => storeCurrentBlob(videoBlob))
}


// upload video
let fileInput = document.getElementById("file-upload");
let fileNameSpan = document.getElementById("file-name"); 
const filePreviewModal = document.querySelector("#filePreviewModal"); // modal
const filePreview = document.querySelector("#file-preview");

fileInput.setAttribute("accept", "video/*"); // Only accept video inputs

fileInput.addEventListener("change", function() {
let file = fileInput.files[0];
let fileName = file.name;
let lastWord = fileName.split("_").pop().split(".")[0]; // get the last word of the file name
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
const addProjectClass = async () => {
    let name = prompt("New class name?");
    classes.push(name);
    list_classes_fetch();
}

fileInput.addEventListener("change", function (event) {
    document.getElementById("preview-button").disabled = false;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    filePreview.src = url;
    filePreviewModal.show();
});


// const addProjectClass = async () => {
//     let name = prompt("New class name?");
//     classes.push(name);
//     list_classes_fetch();
// }
