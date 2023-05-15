const camera_button_back = document.querySelector("#startDisplayButtonBack")
const camera_button = document.querySelector("#start-camera");
const record_button = document.querySelector("#record-video");
const countdown_input = document.querySelector("#video-countdown");
const duration_input = document.querySelector("#video-duration");
const recording_message = document.querySelector("#recording-message");
const countdown = document.querySelector('#countdown');
const class_adition = document.querySelector('#addClass')
// const preview_button = document.querySelector('#preview-button1')
const number_of_videos = document.querySelector('#numberOfVideos');
const number_of_recordings = document.querySelector('#numberOfRecordings');
const number_of_recordings_input = document.querySelector('#numberOfRecordingsInput');
const deleteVideoFromList = document.querySelector('#deleteVideoo');

let camera_stream;
let media_recorder;
let blobs_recorded;

let blobs = [];
let nextBlob = 0;

let classes = ['Thumbsup', 'Thumbsdown', 'Peace']; // TODO: delete and replace this variable with a fetch to the db


// SET SIZE OF VIDEO DISPLAY DYNAMICALLY
// window.addEventListener('load', ()=>{
//     // camera_button_back.style.width = camera_button_back.parentElement.style.width;
//     // camera_button_back.style.height = Math.round(camera_button_back.parentElement.style.width*(480/640));
//     console.log( camera_button_back.style.width ) ;
// })
// let parentWidth = camera_button_back.parentElement.clientWidth;
// console.log(parentWidth)
// camera_button_back.style.width = parentWidth + 'px';
// camera_button_back.style.height = parseInt(parentWidth)*(480/640) + "px" ;
// console.log(parentWidth, camera_button_back.style.width, camera_button_back.style.height)
camera_button_back.style.height = (camera_button_back.offsetWidth * (3 / 4)) + "px";
window.addEventListener('resize', function (event) {
    camera_button_back.style.height = (camera_button_back.offsetWidth * (3 / 4)) + "px";
}, false);

camera_button.addEventListener('click', async () => {
    // let response = await async ()
    camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

    camera_button.style.display = "none";
    camera_button_back.style.display = "none";


    //preview_button.style.display = "none";

    video.srcObject = camera_stream;
    video.style.display = 'block';
    record_button.disabled = false;

    media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });
    media_recorder.addEventListener('dataavailable', (e) => {
        blobs[nextBlob].blob_recorded.push(e.data);
    });
    media_recorder.addEventListener('stop', async () => {
        let recording = new Blob(blobs[nextBlob].blob_recorded, { type: 'video/webm' });
        blobs[nextBlob].blob = recording;
        blobs[nextBlob].url = URL.createObjectURL(recording)
        nextBlob++;
    });
});

record_button.disabled = true;
record_button.addEventListener('click', async () => {
    record_button.disabled = true;

    blobs = [];
    nextBlob = 0;

    // let number_of_recordings = number_of_recordings_input.value;
    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown

    // })

    const recordVideo = (counter) => {
        let timeLeft = countdown_input.value;
        let countdownInterval = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft >= 0) {
                countdown.innerHTML = timeLeft;
            } else {
                clearInterval(countdownInterval);
            }

        }, 1000);

        blobs.push({
            blob: null,
            url: null,
            blob_recorded: [],
            name: (document.querySelector('#video_table').childNodes.length / 3 + blobs.length) + "_" + document.querySelector('#classDropdown').innerText,
            class: document.querySelector('#classDropdown').innerText,
            duration: duration_input.value,
        })

        let t1 = setTimeout(() => { // countdown delay
            countdown.innerHTML = "";
            recording_message.style.display = "block";

            recording_message.innerHTML = "Recording for <b>" + duration_input.value + "</b> seconds";
            media_recorder.start(100);
            let t2 = setTimeout(() => { // duration delay
                recording_message.innerHTML = "";
                media_recorder.stop()
                if (counter > 1) {
                    recordVideo(counter - 1);
                } else {
                    // console.log("119 Launch:" ,blobs);
                    launchDataPreview(blobs);
                    record_button.disabled = false;
                    return;
                }
                clearInterval(t1);
                clearInterval(t2);
            }, duration_input.value * 1000);
        }, countdown_input.value * 1000);
    }
    recordVideo(number_of_recordings_input.value);

});
const list_videos_fetch = async () => {
    // console.log(class_adition.innerHTML)
    // console.log(video_table)
    let data = new FormData()
    data.append("id", JSON.stringify({ 'id': projectID }))
    const response = await fetch('http://127.0.0.1:5001/list_videos', {
        method: "POST",
        body: data
    });
    let list = await response.json()
    if (!list) return;

    // console.log(list)
    list.sort((a, b) => {
        // // console.log("sorting", a, tableSorting)
        if (tableSorting[0] == 1) return a[tableSorting[1]].localeCompare(b[tableSorting[1]])
        else return b[tableSorting[1]].localeCompare(a[tableSorting[1]])
    }); // Sort table

    video_table.innerHTML = ""

    for (let i of list) {
        if (acquisitionSearch.value != "" &&
            i.name.match(new RegExp(acquisitionSearch.value)) == null &&
            i.video_class.match(new RegExp(acquisitionSearch.value)) == null
        ) continue;
        let s = `<tr>
                    <td class="p-0 text-center TdCheckBox" onclick="toogleCheckBox(this)" style="cursor:pointer;display:${tableSorting[2]};">
                        <span class="material-icons checkbox" style="line-height:40px";>
                            check_box_outline_blank
                        </span>
                    </td>
                    <!-- <td>
                    <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
                    <span class="previewNameList">${i.name}</span>
                    </td> -->
                    <td class="acquisitionTableName" onclick="togglePreviewVideo('${i._id}','${i["Characteristics"]["brightness"]}','${i["Characteristics"]["contrast"]}','${i["Characteristics"]["sharpness"]}','${i["Characteristics"]["saturation"]}','${i["Characteristics"]["hue"]}')">${i.name}</td>
                    <td class="acquisitionTableClass">${i.video_class}</td>
                    <td class="acquisitionTableDuration">${i.length}</td>
                    <td class="acquisitionTableDate">${new Date(i.update).toLocaleDateString("en-GB")}</td>
                </tr>`
        let newElem = document.createElement('tr');
        newElem.innerHTML = s
        newElem.id = `acquisitionTR${i._id}`
        // newElem.onclick = () => 
        // let newElem2 = document.createElement('tr');
        // newElem2.innerHTML = `<td colspan="4" class="text-center"><video id="video${i._id}" width="360px" height="300px" autoplay controls/></td>`
        // newElem2.classList.add("collapse")
        // newElem2.id = `collapse${i._id}`
        // newElem2.colSpan = "4"
        // let empty = document.createElement('tr');
        // empty.innerHTML = ""
        // const ff = () => {
        //     for( let i of video_table.childNodes ) {
        //         if( i.id.startsWith('collapse') && !i.classList.contains('collapse') ) i.classList.add('collapse');
        //     }
        //     tableLoadvideo(i._id);
        //     newElem2.classList.remove('collapse');

        //     newElem.onclick = () => {
        //         newElem2.classList.add('collapse');
        //         newElem.onclick = ff;
        //     }
        // }
        //newElem.onclick = ff;
        video_table.appendChild(newElem);
        // video_table.appendChild(empty);
        // video_table.appendChild(newElem2)
    }
}; list_videos_fetch()
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// const previewVideo = document.getElementById("previewVideo");

// function togglePreviewVideo(video_id) {
//     const acquisitionTableName = document.getElementById('acquisitionTR' + video_id);
//     const acquisitionTableNameRect = acquisitionTableName.getBoundingClientRect();

//     const previewVideo = document.getElementById('previewVideo');
//     previewVideo.style.top = acquisitionTableNameRect.top + 'px';
//     previewVideo.style.left = acquisitionTableNameRect.left + 'px';


//     if (previewVideo.style.display === "none") {
//         previewVideo.style.display = "block";
//         const video = document.querySelector("#video");
//         video.setAttribute("id", "video" + video_id);
//         tableLoadvideo(video_id)
//         video.setAttribute("id", "video");
//     } else {

//         previewVideo.style.display = "none";

//     }
// };;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const tableLoadvideo = async (id) => {
    let v = document.querySelector("#video" + id);
    if (v.src == "") {
        console.log(id)
        let data = new FormData();
        data.append('_id', id);
        const response = await fetch('http://127.0.0.1:5001/download', { method: 'POST', body: data })
        // console.log("responded")
        let blob = await response.blob();
        // video_url = URL.createObjectURL(blob);
        v.src = URL.createObjectURL(blob)
    } else {
        v.removeAttribute('src')
    }
}

const edit_video = async (id) => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const name = row.querySelector("td:nth-child(1)").textContent;
    const oldClass = row.querySelector("td:nth-child(2)").textContent;

    const newName = prompt("Enter the new name", name);
    const newClass = prompt("Enter the new class", oldClass);

    if (newName === null || newClass === null) {
        return;
    }

    const data = { name: newName, video_class: newClass };

    try {
        const response = await fetch(`http://127.0.0.1:5001/edit_video/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        row.querySelector("td:nth-child(1)").textContent = newName;
        row.querySelector("td:nth-child(2)").textContent = newClass;
        tableLoadvideo
        alert("Video updated successfully");
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error updating the video");
    }
};

const delete_video = async (_id) => {
    let data = new FormData()
    data.append('_id', JSON.stringify({ video_id: _id, project_id: projectID }))

    $('#deleteVideo').modal('show')
    $('#deleteVideo').on('click', '#deleteVideoo', async () => {
        $('#deleteVideo').modal('hide')
        let response = await fetch('http://127.0.0.1:5001/delete_video', {
            method: "POST",
            body: data
        })
        list_videos_fetch()
    })
}

const list_classes_fetch = async () => {
    // TODO: get classes from a fetch to server
    // const response = await fetch('http://127.0.0.1:5001/list_classes');
    // let classes = await response.json()
    // if(!classes) return;

    document.querySelector("#acquisitionClassesDropdown").innerHTML = ""
    classes.forEach(c => {
        let s = `<li><button class="dropdown-item block" onclick="document.querySelector('#classDropdown').innerHTML='${c}'">${c}</button></li>`;
        let obj = document.createElement('li');
        obj.innerHTML = s;
        document.querySelector("#acquisitionClassesDropdown").appendChild(obj);
    })
}; list_classes_fetch()

// STORE VIDEO IN DB
const storeCurrentBlobs = async (blobs) => {
    for (let blob of blobs) {
        let data = new FormData();
        data.append('file', blob.blob);

        data.append('description', JSON.stringify({ name: blob.name, class: blob.class, length: blob.duration, id: projectID }))

        $('#acquisitionVideoPreviewModal').modal('hide')

        let response = await fetch('http://127.0.0.1:5001/upload', {
            method: "POST",
            body: data
        });
        let a = await response.json()
        console.log(a['result'])
        if (a['result'] == "Correct") {
            // alert("Video Saved on the Server"); // TODO: create a stylized popup
            list_videos_fetch();
        } else {
            alert("Name already in use in this project")
        }
    }
}

// VIDEO PREVIEWER + SEND TO DB
const launchDataPreview = (videoBlobs) => {
    // console.log("354 videoBlobs:", videoBlobs);
    $('#acquisitionVideoPreviewModal').modal('show');
    document.querySelector('#acquisitionVideoPreviewModalStore').onclick = () => {
        let selectedBlobs = []
        for (let n of document.querySelector('#previewAcquisitionList').childNodes) {
            if (n.id && n.id.startsWith("previewListId")) {
                let idSplit = n.id.split("-");
                videoBlobs[idSplit[1]].name = n.querySelector('.previewNameList').innerText;
                selectedBlobs.push(videoBlobs[idSplit[1]]);
            }
        }
        // console.log("365 selected Blobs",selectedBlobs)
        storeCurrentBlobs(selectedBlobs)
    }

    previewVideo = document.querySelector('#acquisitionVideoPreviewModalVideo');

    document.querySelector('#previewAcquisitionList').innerHTML = ''
    for (let i = 0; i < videoBlobs.length; i++) {
        let e = document.createElement('li');
        e.setAttribute('class', 'list-group-item flex');
        e.setAttribute('id', 'previewListId-' + i + '-' + videoBlobs[i].class)
        e.innerHTML = `
        <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
        <span class="previewNameList">${videoBlobs[i].name}</span>
        <span class="material-icons text-danger" style="cursor: pointer;float:right" onclick="preview_discard(this)">close</span>
        `;

        document.querySelector('#previewAcquisitionList').appendChild(e);

        e.onclick = () => {
            previewVideo.src = videoBlobs[i].url;

            let oldee = e.parentElement.querySelector('.ee')
            if (oldee) e.parentElement.removeChild(oldee)

            let ee = document.createElement('li');
            ee.setAttribute('class', 'ee list-group-item flex');

            // make options string
            let options = "<option >Choose...</option>"
            for (let c of classes) {
                options += `<option class="eeClasses" value="${i}" ${c == videoBlobs[i].class ? "selected" : ""}>${c}</option>`
            }

            ee.innerHTML = `
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                    <div class="input-group-text">class</div>
                    </div>
                    <select class="custom-select mr-sm-2 form-control h-100" id="inlineFormCustomSelect">
                        ${options}
                    </select>
                </div>
                <div class="input-group mb-2">
                    <div class="input-group-prepend">
                    <div class="input-group-text">duration</div>
                    </div>
                    <input type="text" class="form-control" id="inlineFormInputGroup" placeholder="00">
                    <div class="input-group-text">:</div>
                    <input type="text" class="form-control" id="inlineFormInputGroup" placeholder="xx">
                </div>
            `;
            e.after(ee);

            for (let nn of ee.querySelectorAll(".eeClasses")) {
                nn.onclick = () => {
                    videoBlobs[i].class = nn.innerText;
                }
            }
        }
        if (i == 0) e.click();

    }
}
// window.onload = () => $('#acquisitionVideoPreviewModal').modal('show') // dev




// input upload
document.getElementById("file-button").addEventListener("click", function () {
    document.getElementById("file-upload").click();
});

document.getElementById("file-upload").addEventListener("change", function () {
    var fileName = this.value.split("\\").pop();
    document.getElementById("file-name").innerHTML = fileName;

    // console.log("457: file-upload", fileName)
});

// input folder upload
document.getElementById("folder-button").addEventListener("click", function () {
    document.getElementById("folder-upload").click();
});

document.getElementById("folder-upload").addEventListener("change", function () {
    var folderName = this.value.split("\\").pop();
    document.getElementById("folder-name").innerHTML = folderName;
});

let fileInput = document.getElementById("file-upload");
let fileNameSpan = document.getElementById("file-name");
let folderInput = document.getElementById("folder-upload");
let folderNameSpan = document.getElementById("folder-name");


const filePreviewModal = document.querySelector("#filePreviewModal"); // modal
const filePreview = document.querySelector("#file-preview");

fileNameSpan.innerHTML = "No file/folder chosen";

fileNameSpan.style.display = "block";
fileNameSpan.style.textAlign = "center";


fileInput.setAttribute("accept", "video/*"); // Only accept video inputs

folderInput.setAttribute("webkitdirectory", ""); // Only accept video inputs
folderInput.setAttribute("directory", ""); // Only accept video inputs

folderInput.addEventListener("change", async () => {
    fileNameSpan.style.display = "none";
    // get folder name
    let folderName = folderInput.files[0].webkitRelativePath.split("/")[0];

    // console.log("FOLDERRR")
    folderNameSpan.innerHTML = "<b>Folder Name: </b>" + folderName;

    // get all files from folder
    let files = folderInput.files;

    // send videos from folder to server
    // print all files from folder
    let blobs = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let fileName = file.name;
        // check if the file is a video
        if (file.type.indexOf("video") !== -1) {
            // get uploaded video file duration
            let lastWord = fileName.split("_").pop().split(".")[0]; // get the last word of the file name
            // blob for each video
            let videoName = "video_" + lastWord;
            folderNameSpan.innerHTML += "<br>" + videoName;

            let videoElement = document.createElement("video");

            videoElement.preload = "metadata";
            videoElement.src = URL.createObjectURL(file);
            videoElement.onloadedmetadata = function () {
                let duration = Math.round(videoElement.duration); // get video duration
                console.log(duration);
                // blob for each video
                blobs.push({
                    blob: file,
                    name: videoName,
                    class: "test",
                    duration: duration
                });
                if (blobs.length == files.length) launchDataPreview(blobs)
            }

        }
    }
});



fileInput.addEventListener("change", function () {
    let file = fileInput.files[0];
    let fileName = file.name;
    let lastWord = fileName.split("_").pop().split(".")[0]; // get the last word of the file name
    let videoName = "video_" + lastWord;

    // console.log("544: ", URL.createObjectURL(file))

    if (confirm("Do you want to upload " + fileName + "?")) {
        fileNameSpan.innerHTML = "<b>NEW FILE NAME: </b>" + videoName + ".mp4";
        // console.log("549: ", URL.createObjectURL(file))

        let videoElement = document.createElement("video");

        videoElement.preload = "metadata";
        videoElement.src = URL.createObjectURL(file);
        videoElement.onloadedmetadata = function () {
            let duration = Math.round(videoElement.duration); // get video duration
            //console.log(duration);
            // blob for each video
            let blob = {
                blob: file,
                name: videoName,
                class: "test",
                duration: duration
            };
            launchDataPreview([{
                url: URL.createObjectURL(file),
                name: videoName,
                class: "test",
                duration: duration
            }]);
        }
        // console.log("531 videoElement: ", videoElement);
    }
});


const addProjectClass = async () => {
    let name = prompt("New class name?");
    classes.push(name);
    list_classes_fetch();
}

fileInput.addEventListener("change", function (event) {
    // preview_button.style.display = "block"; // show preview button
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


// jumbatron tabs
var tabLinks = document.querySelectorAll('.jumbotron .nav-link');

var activeTab = document.querySelector('.nav-link.active');
activeTab.style.color = 'black';

// Loop through tab links and add click event listener
for (var i = 0; i < tabLinks.length; i++) {
    tabLinks[i].addEventListener('click', function () {
        // Remove 'active' class from all tab links
        for (var j = 0; j < tabLinks.length; j++) {
            tabLinks[j].classList.remove('active');
            // Set the color to the previous color
            tabLinks[j].style.color = 'white';
        }
        // Add 'active' class to the clicked tab link
        this.classList.add('active');
        // Set the color to black
        this.style.color = 'black';
    });
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
    input.focus();

    input.addEventListener('input', () => {
        nameElem.innerText = input.value;
    })

    elem.onclick = () => {
        elem.style.color = "";
        if (input.value != '') nameElem.innerText = input.value;
        elem.parentNode.removeChild(input);
        nameElem.style.display = '';
        elem.onclick = () => preview_edit(elem);
    }
}


const previewVideoTable = document.getElementById("previewVideoTable");
let newVideoID = "videoPreview";
// Function to display preview of the data
function togglePreviewVideo(video_id, brightness, contrast, sharpness, saturation, hue) {
    const acquisitionTableName = document.getElementById('acquisitionTR' + video_id);
    const acquisitionTableNameRect = acquisitionTableName.getBoundingClientRect();

    const previewVideoTable = document.getElementById('previewVideoTable');
    previewVideoTable.style.top = acquisitionTableNameRect.top - 45 + 'px';
    previewVideoTable.style.left = acquisitionTableNameRect.left + 200 + 'px';

    const charsText = document.getElementById('chars-text');

    document.addEventListener('click', (e) => {
        let visible = false;

        if (e.target.parentElement == acquisitionTableName && !visible) {
            charsText.innerHTML = ""

            // let chars = "Brightness: " + Math.floor(brightness) + "    Contrast: " + Math.floor(contrast) + "    Sharpness: " + Math.floor(sharpness) + "          Saturation: " + Math.floor(saturation) + "    Hue: " + Math.floor(hue);
            let chars = `
                            <li class="list-group-item"><b>Brightness:</b> ${Math.floor(brightness)}</li>
                            <li class="list-group-item"><b>Contrast:</b> ${Math.floor(contrast)}</li>
                            <li class="list-group-item"><b>Sharpness:</b> ${Math.floor(sharpness)}</li>
                            <li class="list-group-item"><b>Saturation:</b> ${Math.floor(saturation)}</li>
                            <li class="list-group-item"><b>Hue:</b> ${Math.floor(hue)}</li>
                        `
            let newElem = document.createElement("ul");
            newElem.innerHTML = chars;
            newElem.className = "list-group";
            charsText.appendChild(newElem);

            const video = document.querySelector("#"+newVideoID);

            newVideoID = "videoPreview" + video_id;

            video.setAttribute("id", newVideoID);
            
            tableLoadvideoPreview(video_id);
            visible = true;

            previewVideoTable.style.display = "block";
        } else {
            previewVideoTable.style.display = "none";
            visible = false;
        }
    });
};

const tableLoadvideoPreview = async (id) => {
    let v = document.querySelector("#videoPreview" + id);

    if (v.src == "") {
        let data = new FormData();
        data.append('_id', id);
        const response = await fetch('http://127.0.0.1:5001/download', { method: 'POST', body: data });
        let blob = await response.blob();
        v.src = URL.createObjectURL(blob);
    } else {
        v.removeAttribute('src');
    }
};


// const tableLoadvideo = async (id) => {
//     let v = document.querySelector("#video" + id);
//     if (v.src == "") {
//         console.log(id)
//         let data = new FormData();
//         data.append('_id',id);
//         const response = await fetch('http://127.0.0.1:5001/download', { method: 'POST', body: data })
//         let blob = await response.blob();
//         v.src = URL.createObjectURL(blob)
//     } else {
//         v.removeAttribute('src')
//     }
// }