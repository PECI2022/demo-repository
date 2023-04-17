// console.log("ProjectBase")
document.querySelector('#divProjectContent').style.height = (window.innerHeight-50) + 'px';
window.addEventListener('resize', function(event) {
    document.querySelector('#divProjectContent').style.height = (window.innerHeight-50) + 'px';
}, false);

// window.addEventListener('load', () => {
//   const queryString2 = window.location.search
//   const urlParams2 = new URLSearchParams(queryString2)
//   const projectID2 = urlParams2.get('id')
//   load_info(projectID2)
// })

// const load_info = async () => {
//   console.log("EOEOEO")
//   let data = new FormData()
//   let projectTitle = document.querySelector("#project_title")
//   let projectDescription = document.querySelector("#projectDescription")
//   data.append('description', JSON.stringify({pid: projectID}))
//   let response = await fetch('http://127.0.0.1:5001/load_info', {
//     method: "POST",
//     body: data
//   })
//   let info = await response.json()
//   console.log(info)
//   projectTitle.innerHTML = info["name"]
//   projectDescription.innerHTML = info["description"]
// }

// Get the current URL path
var path = window.location.pathname;

// Get all the links in the navigation menu
var links = document.querySelectorAll('#nav2 a');

// Loop through the links
for (var i = 0; i < links.length; i++) {
  var link = links[i];

  // If the link is the current page, add the active class
  if (path === link.pathname) {
    link.classList.add('active');
  }

}
