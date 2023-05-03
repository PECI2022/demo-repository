const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectID = urlParams.get('id');

window.addEventListener('load', () => {
  const queryString2 = window.location.search;
  const urlParams2 = new URLSearchParams(queryString2);
  const projectID2 = urlParams2.get('id');
  load_info(projectID2);

  let data = new FormData();
    data.append(
      "description",
      JSON.stringify({
        pid: project_id,
        tags: tags
      }),
    );

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
      tagsListed.innerHTML += "#" + tag + "<br>";
    }
  });
});


const load_info = async () => {
  console.log("EOEOEO");
  let data = new FormData();
  let projectTitle = document.querySelector("#project_title");
  let projectDescription = document.querySelector("#projectDescription");
  data.append('description', JSON.stringify({pid: projectID}));
  let response = await fetch('http://127.0.0.1:5001/load_info', {
    method: "POST",
    body: data
  });
  let info = await response.json();
  console.log(info);
  projectTitle.innerHTML = info["name"];
  projectDescription.innerHTML = info["description"];
};


// function updateTags() {
//   let tags = JSON.parse(localStorage.getItem("tags"));
//   console.log(tags);
//   var tagInput = document.getElementById("newTagInput");
//   var tagsListed = document.getElementById("tags");
//   var tag = tagInput.value;
  
//   // check if the tag already exists in the list
//   if (tags.indexOf(tag) === -1 && tag) {
//     // add the new tag to the list and update localStorage
//     tags.push(tag);
//     localStorage.setItem("tags", JSON.stringify(tags));
    
//     // update the tags list on the page
//     tagsListed.innerHTML += "#" + tag + "<br>";
//     tagInput.value = "";

//     // send the updated tags to the server
//     let data = new FormData();
//     data.append(
//       "description",
//       JSON.stringify({
//         pid: project_id,
//         tags: tags
//       }),
//     );

//     fetch('http://127.0.0.1:5001/update_tags', {
//       method: 'POST',
//       body: data
//     })
//     .then(response => {
//       if (response.ok) {
//         console.log('Tags updated successfully!');
//         // fetch updated tags from server and update localStorage and tagsListed
//         fetch('http://127.0.0.1:5001/load_info', {
//           method: 'POST',
//           body: data
//         })
//         .then(response => response.json())
//         .then(data => {
//           localStorage.setItem("tags", JSON.stringify(data.tags));
//           tagsListed.innerHTML = "";
//           for (let tag of data.tags) {
//             tagsListed.innerHTML += "#" + tag + "<br>";
//           }
//         })

//       } else {
//         console.error('Error updating tags:', response.status);
//       }
//     })

//     console.table(tags);

//   }
// }




var project_id = localStorage.getItem("project_id");
console.log(project_id);

// get project id
const delete_project = async () => {
  let data = new FormData();
  // send project id
  data.append('description', JSON.stringify({pid: project_id}));   
  let response = await fetch('http://127.0.0.1:5001/delete_project/' + projectID, {
    method: "POST",
    body: data
  });
  let a = await response.json();

  alert("Project Deleted! You will be redirected to MyProjects page!");
  window.location.href = '../../MyProjects';
};
