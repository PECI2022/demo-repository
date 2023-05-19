let tags_selected = new Set();
let existing_tags = new Set();

const projectList = document.querySelector("#public_project_list");
console.log("EK")
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("scrollBtn").style.display = "block";
  } else {
    document.getElementById("scrollBtn").style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//  function generateLink(element) {
//      const projectName = 'editor';
//      const formattedTitle = element.textContent.toLowerCase().replace(/\\s+/g, '-');
//      return `${projectName}?project=${formattedTitle}`;
//  }


//  function generateLinkAudio(element) {
//      const projectName = 'voice';
//      const formattedTitle = element.textContent.toLowerCase().replace(/\\s+/g, '-');
//      return `${projectName}?project=${formattedTitle}`;
//  }


//  const searchInput = document.querySelector('#ProjectsSearch input[type="search"]');

//  searchInput.addEventListener('input', function() {
//  const searchQuery = this.value.toLowerCase();

//  const projectCards = document.querySelectorAll('#ProjectsSearch .card');

//  projectCards.forEach(function(projectCard) {
//      const projectName = projectCard.querySelector('.card-title').textContent.toLowerCase();
//      const projectText = projectCard.querySelector('.card-text').textContent.toLowerCase();

//      if (projectName.includes(searchQuery) || projectText.includes(searchQuery)) {
//      projectCard.style.display = 'block';
//      } else {
//      projectCard.style.display = 'none';
//      }
//  });
//  });


function newProjectGo(pid) {
  // TODO, make an API request to delete the account from the backend
  localStorage.setItem("project_id", pid);
  window.location.href = "project/about/projectAbout?id=" + pid;

  const projectElem = document.getElementById(`project_${pid}`);
  if (projectElem) {
    projectElem.remove();
  }
}


function createCard(projects) {
  for (let project of projects) {
    let list = `<div class="col" id="project_${project._id}">
                      <div class="card h-100" >
                        <div class="card-body" onclick="newProjectGo('${project._id}')">
                          <h3 class="card-title">${project.name}</h3>
                          <p class="card-text">${project.subject}</p>
                        </div>
                        <div class="card-footer">
                          <small class="text-muted">Last updated: ${project.update}</td>
                        </div>
                      </div>
                    </div>`;

    let newElem = document.createElement("div");
    newElem.innerHTML = list;
    projectList.appendChild(newElem);
  }
}

console.log("WWW")
const list_projects = async () => {
  const response = await fetch("http://127.0.0.1:5001/get_public_projects");
  let projects = await response.json();

  let all_categories = new Set();
  let all_tags = new Set();
  for (let project of projects) {
    const contentArray = project.content;

    contentArray.forEach(item => {
      const videoClass = item.video_class;
      all_categories.add(videoClass)
    });

    const tagsArray = project.tags;
    tagsArray.forEach(tag => {
      all_tags.add(tag)
    });
  }

  const options = document.querySelectorAll('#category option');
  let all_options = new Set();
  options.forEach(option => {
    all_options.add(option.value)
  });


  const categorySelect = document.querySelector('#category');
  for (let category of all_categories) {
    if (!all_options.has(category)) {
      let option = document.createElement("option");
      option.value = category;
      option.text = category;
      categorySelect.add(option);
    }
  }

  const tagSelect = document.querySelector('#all-tags');
  const checkboxes = tagSelect.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    existing_tags.add(checkbox.value)
  });

  for (let tag of all_tags) {
    if (!existing_tags.has(tag)) {
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "tag";
      checkbox.value = tag;
      checkbox.id = tag;
      checkbox.classList.add("form-check-input");

      let label = document.createElement("label");
      label.htmlFor = tag;
      label.appendChild(document.createTextNode(tag));
      label.classList.add("form-check-label");

      let div = document.createElement("div");
      div.classList.add("form-check");
      div.appendChild(checkbox);
      div.appendChild(label);

      tagSelect.appendChild(div);
    }
  }

  const searchInput = document.querySelector('[community-search]');

  let filter = document.querySelector('#category').value;

  let filterProjects = "";
  if (filter != "") {
    filterProjects = projects.filter(proj => {
      return proj.content.some(item => {
        return item.video_class == filter;
      });
    });
  } else {
    filterProjects = projects
  }

  if (tags_selected.size > 0) {
    filterProjects = filterProjects.filter(proj => {
      return proj.tags.some(tag => {
        return tags_selected.has(tag);
      });
    });
  }

  projectList.innerHTML = "";
  createCard(filterProjects)

  searchInput.addEventListener('input', e => {
    inputValue = e.target.value.toLowerCase(); // assign the value inside the listener
    projectList.innerHTML = "";

    let searchProject = []
    filterProjects.forEach(proj => {
      if (inputValue == "") {
        searchProject = filterProjects;
      } else if (proj.name.toLowerCase().includes(inputValue) || proj.subject.toLowerCase().includes(inputValue)) {
        searchProject.push(proj)
      }
    })
    createCard(searchProject)
  });
}; list_projects()


function filterTags() {
  const selectedTags = document.querySelectorAll('input[name="tag"]:checked');
  tags_selected = new Set();
  selectedTags.forEach((checkbox) => {
    tags_selected.add(checkbox.value);
  });
  $('#myModal').modal('hide')
  list_projects()
}