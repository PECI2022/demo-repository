const featuresList = document.querySelector("#features_list")
let category = "Feature"
// var project_id = localStorage.getItem("project_id");
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const projectID = urlParams.get('id')
console.log(projectID)
let checkedVideos = []
let currentFeature


// function newFeatureGo(pid) {
//     // TODO, make an API request to delete the account from the backend
//     // console.log(pid)
//     localStorage.setItem("project_id", pid);
//     window.location.href = "/project/features/features?id=" + pid;
//     // console.log(pid)
// }



// const create_feature = async () => {
//     let data = new FormData()
//     data.append('description', JSON.stringify({
//         name: document.querySelector("#name").value, 
//         subject: document.querySelector("#description").value, 
//         model: document.querySelector("#model").value, 
//         category: category,
//         project_id: localStorage.getItem("project_id")
//     }))    
//     let response = await fetch('http://127.0.0.1:5001/new_feature', {
//         method: "POST",
//         body: data
//     })
//     let a = await response.json()
//     alert("Feature Created! You will be redirected to the Features page!");
//     newFeatureGo(a['result'])
// }

// const load_feature = async (pid) =>{
//     newFeatureGo(pid)
//     console.log("HERE")
// }

function get_category(val){
    category = val
}

// window.onload = function(){
//     category = "Feature"
//     load_features()
// }

const createFeature = async () => {
    console.log(projectID)
    let featureName = document.querySelector("#name").value
    let data = new FormData()
    data.append('description', JSON.stringify({pid: projectID, feature:category, name: featureName}))
    let response = await fetch('http://127.0.0.1:5001/new_feature', {
        method: "POST",
        body: data
    })
    window.location.href='features?id='+projectID
    list_features()
}

const list_features = async () => {

    let data = new FormData()
    data.append('description', JSON.stringify({pid: projectID}))
    const response = await fetch('http://127.0.0.1:5001/list_features',{
        method: "POST",
        body: data
    })
    let list = await response.json()
    if(!list) return

    features_list.innerHTML = ""
    for(let i of list){
        // console.log(i)
        // let d = JSON.stringify(i)
        // console.log(d)
        let input = `<div class="col-8" id="${i._id}">
                        <div class="card h-100">
                        <div class="card-body">
                            <h3 class="card-title">${i.name}</h3>
                            <p class="card-text">${i.class}</p>
                        </div>
                        <div class="card-footer">
                            <small class="text-muted">${new Date( i.update ).toLocaleDateString("en-GB")}</small>
                        </div>
                        </div>
                    </div>` 
        
        let newElem = document.createElement('div')
        newElem.innerHTML= input   
        newElem.id = i.class
        newElem.onclick=()=>pop_table(i)
        featuresList.appendChild(newElem)
    }
}; list_features()

const calculate_features = async () => {
    
    let toCalculate = []

    for( let i of document.querySelectorAll('.TdCheckBox') ) {
        if( i.querySelector('span').innerText=='check_box' ) toCalculate.push(i.parentElement.id.substring('acquisitionTR'.length))
    }

    data = new FormData()
    data.append('description', JSON.stringify({pid: projectID, videos: toCalculate, feature: currentFeature['_id']}))
    let response = await fetch('http://127.0.0.1:5001/extract_features', {
        method: "POST",
        body: data
    })

    list_videos_fetch()
}

const download_features = async () => {
    data = new FormData()
    data.append('description', JSON.stringify({pid: projectID}))
    let response = await fetch('http://127.0.0.1:5001/download_features', {
        method: "POST",
        body: data
    })
}

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
        let s
        // console.log(i[currentFeature] == 0)
        if (i[currentFeature['class']] == 0){
            s = `<tr>
                        <td class="p-0 text-center TdCheckBox" onclick="toogleCheckBox(this)">
                            <span class="material-icons checkbox" style="line-height:40px";>
                                check_box_outline_blank
                            </span>
                        </td>
                        <!-- <td>
                        <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
                        <span class="previewNameList">${i.name}</span>
                        </td> -->
                        <td class="acquisitionTableName">${i.name}</td>
                        <td class="acquisitionTableClass">${i.video_class}</td>
                        <td class="acquisitionTableDuration">${i.length}</td>
                        <td class="acquisitionTableDate">${new Date( i.update ).toLocaleDateString("en-GB")}</td>
                    </tr>`
        }else{
            s = `<tr>
                        <td class="p-0 text-center">
                            <span class="material-icons checkbox" style="line-height:40px";>
                                check_box
                            </span>
                        </td>
                        <!-- <td>
                        <span class="material-icons" style="cursor: pointer;font-size: 1rem;" onclick="preview_edit(this)">edit</span>
                        <span class="previewNameList">${i.name}</span>
                        </td> -->
                        <td class="acquisitionTableName">${i.name}</td>
                        <td class="acquisitionTableClass">${i.video_class}</td>
                        <td class="acquisitionTableDuration">${i.length}</td>
                        <td class="acquisitionTableDate">${new Date( i.update ).toLocaleDateString("en-GB")}</td>
                    </tr>`
        }
            let newElem = document.createElement('tr');
            newElem.innerHTML = s
            newElem.id = `acquisitionTR${i._id}`
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
};

function pop_table(feature) {
    table_popper.innerHTML = ""
    currentFeature = feature
    console.log(currentFeature)
    let header =  `<hr class="my-3">
                    <table id="recordsTable" class="table table-striped table-bordered table-secondary">
                        <thead>
                            <tr style="cursor: pointer;">
                                <th id="_ThCheck" scope="col" class="p-0 text-center" onclick="toogleAllAcquisitionChecks(this)">
                                    <span class="material-icons checkbox" style="line-height:40px";>check_box_outline_blank</span>
                                </th>
                                <th id="ThName" scope="col" onclick="editTableSorting(this)">Name<span class="material-icons"
                                        style="font-size: 1rem;">north_east</span></th>
                                <th id="ThClass" scope="col" onclick="editTableSorting(this)">Class<span class="material-icons"
                                        style="font-size: 1rem;"></span></th>
                                <th id="ThDuration" scope="col" onclick="editTableSorting(this)">Duration<span
                                        class="material-icons" style="font-size: 1rem;"></span></th>
                                <th id="ThDate" scope="col" onclick="editTableSorting(this)">Date<span class="material-icons"
                                        style="font-size: 1rem;"></span></th>
                                <!-- <th scope="col"></th> -->
                            </tr>
                        </thead>
                        <tbody id="video_table">
                        </tbody>
                    </table>`
    let newElem = document.createElement('div')
    newElem.innerHTML = header
    table_popper.appendChild(newElem)
    // check_videos(_id)
    list_videos_fetch()
}

// const check_videos = async (_id) => {
//     let data = new FormData()
//     data.append("description", JSON.stringify({id:_id, pid: projectID}))
// }

// const load_features = async () => {
//     const response = await fetch('http://127.0.0.1:5001/list_features')
//     let features = await response.json()
//     console.log(features)
//     for(let feature of features){
//         let list = `<div class="col">
//                         <div class="card h-100" onclick="newFeatureGo('${feature._id}')">
//                             <div class="card-body">
//                                 <h3 class="card-title">${feature.name}</h3>
//                                 <p class="card-text">${feature.description}</p>
//                             </div>
//                             <div class="card-footer">
//                                 <small class="text-muted">Last updated: ${feature.update}</td>
//                             </div>
//                         </div>
//                     </div>` 
        
//         let newElem = document.createElement('div')
//         newElem.innerHTML = list
//         featuresList.appendChild(newElem)
//     }
// }


const extractBtn = document.getElementById('calculateFeaturesbtn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const CalculatingFeatureText = document.getElementById('showText');
const downloadBtn = document.getElementById('downloadBtn');

extractBtn.addEventListener('click', () => {
  extractBtn.style.display = 'none';
  progressBar.style.display = 'block';
  CalculatingFeatureText.style.display = 'block'; 

  let progress = 0;

  const interval = setInterval(() => {
    progress += 5;
    progressBar.firstElementChild.style.width = `${progress}%`;
    progressText.innerText = `${progress}%`;

    if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressBar.style.display = 'none';
          CalculatingFeatureText.style.display = 'none';
          downloadBtn.style.display = 'block';
          alert("Features Calculated! You can download the features now!");
        }, 500);
      }      
  }, 100); 
});

downloadBtn.addEventListener('click', () => {
    // TODO, download features from the backend
});

const toogleCheckBox = (elem) => {
    let checkbox = elem.querySelector('.checkbox')
    let a = ['check_box', 'check_box_outline_blank']
    if( checkbox.innerText==a[0] ) checkbox.innerText = a[1]
    else checkbox.innerText = a[0]
}