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

let classes = ['Thumbsup','Thumbsdown','Peace']; // TODO: delete and replace this variable with a fetch to the db
 

camera_button.addEventListener('click', async () => {
    // let response = await async ()
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
    let recording_number = 0;
    media_recorder.addEventListener('stop', async () => {
        let recording = new Blob(blobs_recorded, {type:'video/webm'}); 
        let filename = "recording" + recording_number + ".webm";
        recording_number++;
        let url = URL.createObjectURL(recording);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename;  
        blobs_recorded = [];
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

    let number_of_recordings = number_of_recordings_input.value;
    // TODO: make a way to visualize the tempos
    // let time = 0;
    // let interval = setInterval(()=>{ // display countdown
    
    // })

    function recordVideo(){
        let timeLeft = countdown_input.value;
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
                number_of_recordings--;
                if(number_of_recordings > 0){
                    recordVideo();
                }else{
                    return;
                }
            }, duration_input.value*1000);
        }, countdown_input.value*1000);
    }
    recordVideo();

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
                        <span class="material-icons" style="cursor: pointer; onclick="edit_video('${i._id}')">edit</span>
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
        list_videos_fetch();
    }else{
        alert("Name already in use in this project")
    }
    record_button.disabled = false;
}

// VIDEO PREVIEWER + SEND TO DB
const lauchDataPreview = videoBlob => {
    $('#acquisitionVideoPreviewModal').modal('show')
    console.log(URL.createObjectURL(videoBlob))
    document.querySelector('#acquisitionVideoPreviewModalVideo').src = URL.createObjectURL(videoBlob)
    document.querySelector('#acquisitionVideoPreviewModalStore').onclick = () => storeCurrentBlob(videoBlob)
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
    // get uploaded video file duration
    let lastWord = fileName.split("_").pop().split(".")[0]; // get the last word of the file name
    let videoName = "video_" + lastWord;

    if (confirm("Do you want to upload " + fileName + "?")) {
        // show message
        fileNameSpan.innerHTML = "<b>NEW FILE NAME: </b>" + videoName + ".webm";

        let formData = new FormData();
        formData.append("file", file);
        // get file video duration 
        // let video = document.createElement("video");
        // video.preload = "metadata";
        // video.onloadedmetadata = function() {
        //     window.URL.revokeObjectURL(video.src);
        //     let duration = video.duration;
        //     formData.append("description", JSON.stringify({name: videoName, length: duration}));
        // }

        formData.append("description", JSON.stringify({name: videoName}));

        fetch("http://127.0.0.1:5001/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {console.log(data)})

        //.catch(error => console.error(error));
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