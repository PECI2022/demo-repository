const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const projectID = urlParams.get('id')
// console.log(projectID)

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
            name: (document.querySelector('#video_table').childNodes.length + blobs.length) + "_" + document.querySelector('#classDropdown').innerText,
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
                    lauchDataPreview(blobs);
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
    console.log(class_adition.innerHTML)
    // console.log(video_table)
    let data = new FormData()
    data.append("id", JSON.stringify({ 'id': projectID }))
    const response = await fetch('http://127.0.0.1:5001/list_videos', {
        method: "POST",
        body: data
    });
    let list = await response.json()
    if (!list) return;

    console.log(list)
    list.sort((a, b) => {
        console.log("sorting", a, tableSorting)
        if( tableSorting[0]==1 ) return a[tableSorting[1]].localeCompare(b[tableSorting[1]])
        else return b[tableSorting[1]].localeCompare(a[tableSorting[1]])
    }); // Sort table

    video_table.innerHTML = ""
    // console.log("LLL")
    // console.log(list)
    // list_videos.innerHTML = "";
    // list.sort();
    let rowNumber = 1;
    console.log(new Date( list[0].update ).toLocaleDateString() )
    for (let i of list) {
        // console.log(i._id)
        let s = `<tr>
                    <td>
                        <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
                        <span class="previewNameList">${i.name}</span>
                    </td>
                    <td>${i.video_class}</td>
                    <td>${i.length}</td>
                    <td>${new Date( i.update ).toLocaleDateString("en-GB")}</td>
                    <td class="d-flex justify-content-center">
                        <!--<span class="material-icons" style="cursor: pointer; onclick="edit_video('${i._id}')">edit</span>-->
                        <!--<span class="material-icons" style="cursor: pointer;">shuffle</span>-->
                        <span class="material-icons" style="cursor: pointer;" data-bs-toggle="collapse" href="#collapse${i._id}" onclick="tableLoadvideo('${i._id}')">visibility</span>
                        <span class="material-icons text-danger" style="cursor: pointer;" onclick="delete_video('${i._id}')">delete_forever</span>
                    </td>
                </tr>`
        let newElem = document.createElement('tr');
        newElem.innerHTML = s
        let newElem2 = document.createElement('tr');
        newElem2.innerHTML = `<td colspan="4" class="text-center"><video id="video${i._id}" width="640" height="480" autoplay controls/></td>`
        newElem2.classList.add("collapse")
        newElem2.id = `collapse${i._id}`
        newElem2.colSpan = "4"
        let empty = document.createElement('tr');
        empty.innerHTML = ""
        // newElem.onclick = () => fetchRecordingAndPlay(i._id)
        video_table.appendChild(newElem);
        video_table.appendChild(empty);
        video_table.appendChild(newElem2)
    }
}; list_videos_fetch()


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

        alert("Video updated successfully");
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error updating the video");
    }
};


// const edit_video = async (id) => {

//     // loop through all edit icons and attach a click event listener
//     editIcons.forEach(editIcon => {
//     editIcon.addEventListener('click', () => {
//         // get the row element of the video
//         const row = editIcon.parentElement.parentElement;

//         // get the name and class elements of the video
//         const nameCell = row.children[0];
//         const classCell = row.children[1];

//         // create input elements to replace the name and class elements
//         const nameInput = document.createElement('input');
//         nameInput.type = 'text';
//         nameInput.value = nameCell.innerText;
//         const classInput = document.createElement('select');
//         classes.forEach(className => {
//         const option = document.createElement('option');
//         option.value = className;
//         option.text = className;
//         if (className === classCell.innerText) {
//             option.selected = true;
//         }
//         classInput.add(option);
//         });

//         // replace the name and class elements with the input elements
//         nameCell.replaceWith(nameInput);
//         classCell.replaceWith(classInput);

//         // create a save button
//         const saveButton = document.createElement('button');
//         saveButton.innerText = 'Save';

//         // add a click event listener to the save button
//         saveButton.addEventListener('click', async () => {
//         // get the new name and class from the input elements
//         const newName = nameInput.value;
//         const newClass = classInput.value;

//         // update the video in the database
//         const response = await fetch(`http://127.0.0.1:5001/update_video/${row.id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name: newName, video_class: newClass })
//         });

//         // if the update was successful, replace the input elements with the new name and class elements
//         if (response.ok) {
//             const newNameCell = document.createElement('td');
//             newNameCell.innerText = newName;
//             const newClassCell = document.createElement('td');
//             newClassCell.innerText = newClass;
//             nameInput.replaceWith(newNameCell);
//             classInput.replaceWith(newClassCell);
//         } else {
//             alert('Failed to update video');
//         }
//         });

//         // replace the edit icon with the save button
//         editIcon.replaceWith(saveButton);
//     });
//     });
// }


const delete_video = async (_id) => {
    console.log("WWWWWWWWWWWWWWWWWWWW")
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
            alert("Video Saved on the Server"); // TODO: create a stylized popup
            list_videos_fetch();
        } else {
            alert("Name already in use in this project")
        }
    }
}

// VIDEO PREVIEWER + SEND TO DB
const lauchDataPreview = (videoBlobs) => {
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
        console.log(selectedBlobs)
        storeCurrentBlobs(selectedBlobs)
    }

    previewVideo = document.querySelector('#acquisitionVideoPreviewModalVideo');

    document.querySelector('#previewAcquisitionList').innerHTML = "";
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
            if( oldee ) e.parentElement.removeChild(oldee)

            let ee = document.createElement('li');
            ee.setAttribute('class', 'ee list-group-item flex');

            // make options string
            let options = "<option >Choose...</option>"
            for(let c of classes) {
                options += `<option class="eeClasses" value="${i}" ${c==videoBlobs[i].class ? "selected" : ""}>${c}</option>`
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

            for( let nn of ee.querySelectorAll(".eeClasses") ) {
                nn.onclick = () => {
                    videoBlobs[i].class = nn.innerText;
                }
            }
        }
        if (i == 0) e.click();

    }
}
// window.onload = () => $('#acquisitionVideoPreviewModal').modal('show') // dev


const tableLoadvideo = async (id) => {
    let v = document.querySelector("#video" + id);
    console.log(v.src)
    if (v.src == "") {
        console.log(id)
        let data = new FormData();
        data.append('_id', id);
        const response = await fetch('http://127.0.0.1:5001/download', { method: 'POST', body: data })
        console.log("responded")
        let blob = await response.blob();
        // video_url = URL.createObjectURL(blob);
        v.src = URL.createObjectURL(blob)
    } else {
        v.removeAttribute('src')
    }
}

// input upload
document.getElementById("file-button").addEventListener("click", function () {
    document.getElementById("file-upload").click();
});

document.getElementById("file-upload").addEventListener("change", function () {
    var fileName = this.value.split("\\").pop();
    document.getElementById("file-name").innerHTML = fileName;
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

folderInput.addEventListener("change", function () {
    fileNameSpan.style.display = "none";
    // get folder name
    let folderName = folderInput.files[0].webkitRelativePath.split("/")[0];

    console.log("FOLDERRR")
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
                let blob = {
                    blob: file,
                    name: videoName,
                    class: "test",
                    duration: duration
                };
                storeCurrentBlobs([blob]);
            }
        }
    }

    storeCurrentBlobs(blobs);
});



fileInput.addEventListener("change", function () {
    let file = fileInput.files[0];
    let fileName = file.name;
    let lastWord = fileName.split("_").pop().split(".")[0]; // get the last word of the file name
    let videoName = "video_" + lastWord;
    console.log(URL.createObjectURL(file))

    if (confirm("Do you want to upload " + fileName + "?")) {
        fileNameSpan.innerHTML = "<b>NEW FILE NAME: </b>" + videoName + ".mp4";
        console.log(URL.createObjectURL(file))

        let videoElement = document.createElement("video");

        videoElement.preload = "metadata";
        videoElement.src = URL.createObjectURL(file);
        videoElement.onloadedmetadata = function () {
            let duration = Math.round(videoElement.duration); // get video duration
            console.log(duration);
            // blob for each video
            let blob = {
                blob: file,
                name: videoName,
                class: "test",
                duration: duration
            };
            storeCurrentBlobs([blob]);
        }
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
            tabLinks[j].style.color = '#61554d';
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

const preview_edit_class = (elem) => {
    elem.setAttribute('selected', 'true')
}