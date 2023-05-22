const projectList = document.querySelector("#project_list");
let category = "Gestures";
let tags = [];
var project_id = localStorage.getItem("project_id");

function newProjectGo(pid) {
  // TODO, make an API request to delete the account from the backend
  localStorage.setItem("project_id", pid);
  window.location.href = "project/about/projectAbout?id=" + pid;

  const projectElem = document.getElementById(`project_${pid}`);
  if (projectElem) {
    projectElem.remove();
  }
}

document.getElementById("folder-button").addEventListener("click", function () {
  document.getElementById("folder-upload").click();
});

document.getElementById("folder-upload").addEventListener("change", function () {
  var folderName = this.value.split("\\").pop();
  document.getElementById("folder-name").innerHTML = folderName;
});

let folderInput = document.getElementById("folder-upload");
let folderNameSpan = document.getElementById("folder-name");
folderInput.setAttribute("webkitdirectory", ""); // Only accept video inputs
folderInput.setAttribute("directory", "");

folderInput.addEventListener("change", async () => {

  // get folder name
  let folderName = folderInput.files[0].webkitRelativePath.split("/")[0];

  // console.log("FOLDERRR")
  folderNameSpan.innerHTML = "<b>Folder Name: </b>" + folderName;

  // get all files from folder
  let files = folderInput.files;

  let blobs = [];
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    id = file.name.split(".")[0]
    blobs.push({ blob: file, name: file.name, id: id })
  }
  storeFolder(blobs)
})

const storeFolder = async (blobs) => {

  let d = new FormData();
  console.log(category);
  addTag();
  d.append(
    "description",
    JSON.stringify({
      name: "test",
      subject: "test",
      category: "category",
      tags: "tags"
    }),
  );
  let r = await fetch("http://127.0.0.1:5001/new_project", {
    method: "POST",
    body: d,
  });
  let p = await r.json();
  let projectID = p['result']
  
  for (let blob of blobs) {
    let data = new FormData();
    data.append('file', blob.blob);

    data.append('description', JSON.stringify({ name: blob.name, pid: projectID, vid: blob.id, type:"project" }))

    $('#acquisitionVideoPreviewModal').modal('hide')
    console.log(data)
    

    let response = await fetch('http://127.0.0.1:5001/upload_folder', {
      method: "POST",
      body: data
    });
  }
  let data = new FormData()
  data.append('description', JSON.stringify({ pid: projectID }))
  let response = await fetch('http://127.0.0.1:5001/update', {
    method: "POST",
    body: data
  })
}

const create_project = async () => {
  let data = new FormData();
  console.log(category);
  addTag();
  console.log("tags: " + tags);
  var radioButtons = document.getElementsByName("privacy_option");
  var p;
  for(var i = 0; i < radioButtons.length; i++){
    if(radioButtons[i].checked){
      p = radioButtons[i].value
    }
  }
  data.append(
    "description",
    JSON.stringify({
      name: document.querySelector("#name").value,
      subject: document.querySelector("#description").value,
      category: category,
      tags: tags,
      privacy: p
    }),
  );
  let response = await fetch("http://127.0.0.1:5001/new_project", {
    method: "POST",
    body: data,
  });
  let a = await response.json();
  alert("Project Created! You will be redirected to the project page!");
  newProjectGo(a["result"]);
};

const load_project = async (pid) => {
  newProjectGo(pid);
  console.log("HERE");
};

function get_category(val) {
  category = val;
}
const delete_project = async (project_id) => {
  // Show the modal
  $('#deleteConfirmationModal').modal('show');

  // Add an event listener to the delete button inside the modal
  document.getElementById('deleteConfirmationButton').addEventListener('click', async () => {
    let data = new FormData();
    // send project id
    data.append('description', JSON.stringify({pid: project_id}));   
    let response = await fetch('http://127.0.0.1:5001/delete_project/' + project_id, {
      method: "POST",
      body: data
    });
    let a = await response.json();

    alert("Project Deleted! You will be redirected to MyProjects page!");
    window.location.href = '/myProjects';
  });
};
window.onload = function () {
    category = "Gestures";
    addTag();
    load_content();
};

const load_content = async () => {
    const response = await fetch("http://127.0.0.1:5001/list_projects");
    let projects = await response.json();
    console.log(projects);
    for (let project of projects) {
      let list = `<div class="col" id="project_${project._id}">
                    <div class="card h-100" >
                      <div class="card-body" onclick="newProjectGo('${project._id}')">
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-text">${project.subject}</p>
                      </div>
                      <div class="card-footer">
                        <small class="text-muted">Last updated: ${
                          project.update
                        }</td>
                        <button type="button" onclick="delete_project('${project._id}')" class="btn btn-danger btn-sm float-end d-flex align-items-center">
                        <span class="material-symbols-outlined">
                          delete
                        </span>
                        </button>
                      </div>
                    </div>
                  </div>`;
                  
      let newElem = document.createElement("div");
      newElem.innerHTML = list;
      projectList.appendChild(newElem);
    }
  };


  function addTag() {
    var tagInput = document.getElementById("newTagInput");
    var tagsListed = document.getElementById("tags");
  
    var tag = tagInput.value;
    if (tag !== "") {
      tags.push(tag);
      localStorage.setItem("tags", JSON.stringify(tags));
      var tagElement = document.createElement("span");
      tagElement.innerHTML = "#" + tag + " ";
      var deleteButton = document.createElement("button");
      deleteButton.innerHTML = "x";
      deleteButton.style.marginLeft = "5px";
      deleteButton.style.fontSize = "12px";
      deleteButton.style.color = "red";
      deleteButton.addEventListener("click", function() {
        var index = tags.indexOf(tag);
        if (index !== -1) {
          tags.splice(index, 1);
          localStorage.setItem("tags", JSON.stringify(tags));
          tagsListed.removeChild(tagElement);
        }
      });
      tagElement.appendChild(deleteButton);
      tagElement.style.display = "inline-block";
      tagElement.style.marginRight = "5px";
  
      tagsListed.appendChild(tagElement);
      tagInput.value = "";
    }
  
  }