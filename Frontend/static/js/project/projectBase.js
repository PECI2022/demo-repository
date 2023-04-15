console.log("ProjectBase")

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
