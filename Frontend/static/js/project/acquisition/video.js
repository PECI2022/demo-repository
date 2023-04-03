const camera_button_back = document.querySelector("#startDisplayButtonBack")
const camera_button = document.querySelector("#start-camera");
const record_button = document.querySelector("#record-video"); 
const countdown_input = document.querySelector("#video-countdown");
const duration_input = document.querySelector("#video-duration");
const recording_message = document.querySelector("#recording-message");
const countdown = document.querySelector('#countdown');
const class_adition = document.querySelector('#addClass')
const preview_button = document.querySelector('#preview-button1')
const number_of_videos = document.querySelector('#numberOfVideos');
const number_of_recordings = document.querySelector('#numberOfRecordings');
const number_of_recordings_input = document.querySelector('#numberOfRecordingsInput');

let camera_stream;
let media_recorder;
let blobs_recorded;
let blobs = [];

let classes = ['Thumbsup','Thumbsdown','Peace']; // TODO: delete and replace this variable with a fetch to the db
 

camera_button.addEventListener('click', async () => {
    camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
    
    camera_button.style.display = "none";
    camera_button_back.style.display = "none";

   // make preview button invisible
    preview_button.style.display = "none";
    
    video.srcObject = camera_stream;
    video.style.display = 'block';
    record_button.disabled = false;
    
    media_recorder = new MediaRecorder(camera_stream, {mimeType: 'video/webm'});
    media_recorder.addEventListener('dataavailable', (e) => {
        blobs_recorded.push(e.data);
    });
    media_recorder.addEventListener('stop', async () => {
        let recording = new Blob(blobs_recorded, {type:'video/webm'}); 
        blobs.push(recording)
        //lauchDataPreview([recording]); 
        
    });
});

record_button.disabled=true;
record_button.addEventListener('click', async () => {
    record_button.disabled = true;
    
    blobs = [];

    // let number_of_recordings = number_of_recordings_input.value;
    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown
    
    // })

    function recordVideo(counter){
        let timeLeft = countdown_input.value;
        let countdownInterval = setInterval(() => {
            timeLeft-=100/1000;
            if (timeLeft >= 0) {
                countdown.innerHTML = timeLeft;
            } else {
                clearInterval(countdownInterval);
            }
            
        }, 100);


        let t1 = setTimeout(()=>{ // countdown delay
            countdown.innerHTML = "";
            recording_message.style.display = "block";

            recording_message.innerHTML = "Recording for <b>" + duration_input.value + "</b> seconds";
            blobs_recorded = []
            media_recorder.start(100); //
            let t2 = setTimeout(()=>{ // duration delay
                recording_message.innerHTML = "";
                media_recorder.stop() //
                if(counter > 0){
                    recordVideo(counter-1);
                }else{
                    lauchDataPreview(blobs);
                    record_button.disabled = false;
                    return;
                }
                clearInterval(t1);
                clearInterval(t2);
            }, duration_input.value*1000);
        }, countdown_input.value*1000);
    }
    recordVideo(number_of_recordings_input.value);

});
const list_videos_fetch = async () => {
    console.log(class_adition.innerHTML)
    // console.log(video_table)
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return;    
    list.sort((a, b) => a.name.localeCompare(b.name)); // Sort list alphabetically by name
    video_table.innerHTML = ""
    // console.log("LLL")
    // console.log(list)
    // list_videos.innerHTML = "";
    // list.sort();
    let rowNumber = 1;
    for(let i of list) {
        // console.log(i._id)
        let s = `<tr>
                    <td>${i.name}</td>
                    <td>${i.video_class}</td>
                    <td>${i.length}</td>
                    <td>
                        <span class="material-icons" style="cursor: pointer;">edit</span>
                        <span class="material-icons" style="cursor: pointer;">shuffle</span>
                        <span class="material-icons" style="cursor: pointer;" data-bs-toggle="collapse" href="#collapse${i._id}" onclick="tableLoadvideo('${i._id}')">visibility</span>
                        <span class="material-icons text-danger" style="cursor: pointer;" onclick="delete_video('${i._id}')">delete_forever</span>
                    </td>
                </tr>` 
        let newElem = document.createElement('tr');
        newElem.innerHTML=s  
        let newElem2 = document.createElement('tr');
        newElem2.innerHTML = `<td colspan="4" class="text-center"><video id="video${i._id}" width="640" height="480" autoplay controls/></td>`
        newElem2.classList.add("collapse")
        newElem2.id = `collapse${i._id}`
        newElem2.colSpan = "4"
        // newElem.onclick = () => fetchRecordingAndPlay(i._id)
        video_table.appendChild(newElem);
        video_table.appendChild(newElem2)
    }
};list_videos_fetch()

const delete_video = async (_id) => {
    console.log("WWWWWWWWWWWWWWWWWWWW")
    let data = new FormData()
    data.append('_id', JSON.stringify({_id:_id}))
    // console.log(data)
    let response = await fetch('http://127.0.0.1:5001/delete_video', {
        method: "POST",
        body: data
    })
    // let a = await response.json()
    // console.log("WWW")
    // console.log(a['result'])
    list_videos_fetch()
}

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
const storeCurrentBlobs = (blobs) => {
    blobs.forEach( async (blob) => {
        let data = new FormData();
        data.append('file', blob.blob);
        
        data.append('description', JSON.stringify({name:blob.name, class:blob.class, length:0}))
        
        $('#acquisitionVideoPreviewModal').modal('hide')
        
        let response = await fetch('http://127.0.0.1:5001/upload', {
            method: "POST",
            body: data
        });
        let a = await response.json()
        console.log(a['result'])
        if(a['result'] == "Correct"){
            alert("Video Saved on the Server"); // TODO: create a stylized popup
            list_videos_fetch();
        }else{
            alert("Name already in use in this project")
        }
    })
}

// VIDEO PREVIEWER + SEND TO DB
const lauchDataPreview = videoBlobs => {
    $('#acquisitionVideoPreviewModal').modal('show');
    document.querySelector('#acquisitionVideoPreviewModalStore').onclick = () => {
        let blobs = []
        for(let n of document.querySelector('#previewAcquisitionList').childNodes) {
            if( n.id && n.id.startsWith("previewListId") ) {
                let idSplit = n.id.split("-")
                blobs.push({
                    name: n.querySelector('.previewNameList').innerText,
                    blob: videoBlobs[idSplit[1]],
                    class: idSplit[2]
                })
            }
        }
        storeCurrentBlobs(blobs)
    }



    previewVideo = document.querySelector('#acquisitionVideoPreviewModalVideo');

    document.querySelector('#previewAcquisitionList').innerHTML = "";
    for(let i=0; i<videoBlobs.length; i++) {
        let e = document.createElement('li');
        e.setAttribute('class', 'list-group-item flex');
        e.setAttribute('id', 'previewListId-'+i+'-'+document.querySelector('#classDropdown').innerText)
        e.innerHTML = `
            <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
            <span class="previewNameList">${document.querySelector('#video_table').childNodes.length+i}_${document.querySelector('#classDropdown').innerText}</span>
            <span class="material-icons text-danger" style="cursor: pointer;float:right" onclick="preview_discard(this)">close</span>
        `;
        e.onclick = () => { previewVideo.src = URL.createObjectURL(videoBlobs[i]); }
        if(i==0) e.click();

        document.querySelector('#previewAcquisitionList').appendChild(e);
    }
}
window.onload = () => $('#acquisitionVideoPreviewModal').modal('show') // dev


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
    preview_button.style.display = "block"; // show preview button
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    filePreview.src = url;
});


// const addProjectClass = async () => {
//     let name = prompt("New class name?");
//     classes.push(name);
//     list_classes_fetch();
// }

// const fetchRecordingAndPlay = async (id) => {
//     let data = new FormData();
//     data.append('_id', id);
//     const response = await fetch('http://127.0.0.1:5001/download', {method:'POST',body:data})
//     let blob = await response.blob();
//     // video_url = URL.createObjectURL(blob);
//     video.src = URL.createObjectURL(blob)
//     video.style.display = 'block'
// }

const tableLoadvideo = async (id) => {
    let v = document.querySelector("#video"+id);
    console.log(v.src)
    if( v.src=="" ) {
        console.log(id)
        let data = new FormData();
        data.append('_id', id);
        const response = await fetch('http://127.0.0.1:5001/download', {method:'POST',body:data})
        console.log("responded")
        let blob = await response.blob();
        // video_url = URL.createObjectURL(blob);
        v.src = URL.createObjectURL(blob)
    } else {
        v.removeAttribute('src')
    }
}

const preview_discard = (elem) => {
    let list = document.querySelector('#previewAcquisitionList')
    list.removeChild(elem.parentNode);
    // TODO, if(list.childNodes.length==0)
}

const preview_edit = (elem) => {
    elem.style.color = "#3a3";
    let nameElem = elem.parentNode.querySelector('.previewNameList');
    nameElem.style.display = 'none';
    let input = document.createElement('input');
    input.placeholder = nameElem.innerText;
    input.style.width = "70%";
    elem.parentNode.insertBefore(input, nameElem);

    elem.onclick = () => {
        elem.style.color = "";
        if( input.value != '' ) nameElem.innerText = input.value;
        elem.parentNode.removeChild(input);
        nameElem.style.display = '';
        elem.onclick = () => preview_edit(elem);
    }
}