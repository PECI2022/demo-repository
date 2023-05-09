window.addEventListener('load', () => {
  const queryString2 = window.location.search
  const urlParams2 = new URLSearchParams(queryString2)
  const projectID2 = urlParams2.get('id')
  load_info(projectID2)

  let data = new FormData();
  data.append(
    "description",
    JSON.stringify({
      pid: project_id,
      tags: tags
    }),
  );

   console.log(tags)

  fetch('http://127.0.0.1:5001/load_info', {
    method: 'POST',
    body: data
  })
  .then(response => response.json())
  .then(data => {
    localStorage.setItem("tags", JSON.stringify(data.tags));
    const tagsListed = document.getElementById("tags");
    tagsListed.innerHTML = "";
    for (let tag of data.tags) {
      var tagElement = document.createElement("span");
      tagElement.innerHTML = "#" + tag + " ";
      var deleteButton = document.createElement("button");
      deleteButton.innerHTML = "x";
      deleteButton.style.marginLeft = "5px";
      deleteButton.style.fontSize = "10px";
      deleteButton.style.color = "red";
      deleteButton.addEventListener("click", function() {
        var index = data.tags.indexOf(tag);
        if (index !== -1) {
          data.tags.splice(index, 1);
          localStorage.setItem("tags", JSON.stringify(data.tags));
          tagsListed.removeChild(tagElement);
          updateTags();
        }
      });
      tagElement.appendChild(deleteButton);
      tagElement.style.display = "inline-block";
      tagElement.style.marginRight = "5px";
      tagsListed.appendChild(tagElement);
    }
  });

});

const load_info = async () => {
console.log("EOEOEO")
let data = new FormData()
let projectTitle = document.querySelector("#project_title")
let projectDescription = document.querySelector("#projectDescription")
data.append('description', JSON.stringify({pid: projectID}))
let response = await fetch('http://127.0.0.1:5001/load_info', {
  method: "POST",
  body: data
})
let info = await response.json()
console.log(info)
projectTitle.innerHTML = info["name"]
projectDescription.innerHTML = info["description"]
}

function addTag(event) {
event.preventDefault();
var tagInput = document.getElementById("newTagInput");
var tags = document.getElementById("tags");
var tag = tagInput.value;
if (tag) {
  tags.innerHTML += "#" + tag + "<br>";
  tagInput.value = "";
}
}

var project_id = localStorage.getItem("project_id");
console.log(project_id);
// get project id
const delete_project = async () => {
let data = new FormData()
// send project id
data.append('description', JSON.stringify({pid: project_id}))   
let response = await fetch('http://127.0.0.1:5001/delete_project/' + projectID, {
    method: "POST",
    body: data
})
let a = await response.json()

alert("Project Deleted! You will be redirected to MyProjects page!");
window.location.href = '../../myProjects'
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
    blobs.push({blob: file, name: file.name, id: id})
  }
  storeFolder(blobs)
})

const storeFolder = async (blobs) => {
for (let blob of blobs) {
    let data = new FormData();
    data.append('file',blob.blob);

    data.append('description', JSON.stringify({ name: blob.name, pid: projectID, vid: blob.id}))

    $('#acquisitionVideoPreviewModal').modal('hide')

    let response = await fetch('http://127.0.0.1:5001/upload_folder', {
        method: "POST",
        body: data
    });
}
let data = new FormData()
data.append('description', JSON.stringify({pid: projectID}))
let response = await fetch('http://127.0.0.1:5001/update', {
  method: "POST",
  body: data
})
}

const export_project = async () => {
let data = new FormData()
data.append('description', JSON.stringify({pid: projectID}))

let response = await fetch('http://127.0.0.1:5001/export_project', {
        method: "POST",
        body: data
    });
}