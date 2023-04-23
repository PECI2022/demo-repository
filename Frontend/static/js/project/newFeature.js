const featuresList = document.querySelector("#features_list")
let category = "Feature"
var project_id = localStorage.getItem("project_id");



function newFeatureGo(pid) {
    // TODO, make an API request to delete the account from the backend
    // console.log(pid)
    localStorage.setItem("project_id", pid);
    window.location.href = "/project/features/features?id=" + pid;
    // console.log(pid)
}



const createFeature = async () => {
    const data = new FormData();
    data.append('description', JSON.stringify({
      name: document.querySelector("#name").value,
      category: document.querySelector('input[name="option"]:checked').value,
      project_id: localStorage.getItem("project_id")
    }));
    
    let response = await fetch('http://127.0.0.1:5001/new_feature', {
        method: "POST",
        body: data
    })
    let a = await response.json()
    alert("Feature Created! You will be redirected to the Features page!");
    newFeatureGo(a['result'])

}

const load_feature = async (pid) =>{
    newFeatureGo(pid)
    console.log("HERE")
}

function get_category(val){
    category = val
}

window.onload = function(){
    category = "Feature"
    load_features()
}

const load_features = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_features', )
    let features = await response.json()
    console.log(features)
    for(let feature of features){
        let list = `<div class="col">
                        <div class="card h-100" onclick="newFeatureGo('${feature._id}')">
                            <div class="card-body">
                                <h3 class="card-title">${feature.name}</h3>
                                <p class="card-text">${feature.description}</p>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">Last updated: ${feature.update}</td>
                            </div>
                        </div>
                    </div>` 
        
        let newElem = document.createElement('div')
        newElem.innerHTML = list
        featuresList.appendChild(newElem)
    }
}


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
      progressBar.style.display = 'none';
      CalculatingFeatureText.style.display = 'none';
      downloadBtn.style.display = 'block';
    }
  }, 500);
});

downloadBtn.addEventListener('click', () => {
    // TODO, download features from the backend
});
  