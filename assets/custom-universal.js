var randomMax = 0;

// On page load
$(document).ready(function(){

  // Fetch json database
  $.ajax({
    method: 'GET',
    url:'assets/database.json',
    success:function(response){
      // Set correct randomMax value (number of entries in db)
      randomMax = response.length;
    }
  })
})

// Picks a random integer between 0 and randomMax
// Sets 'Random KBD' button href to a keyboard with this ID
function randomer(){
  randomEntry = Math.round(Math.random() * randomMax);
  document.getElementsByClassName("random")[0].href=`keyboard.html#${randomEntry}`;
  document.getElementsByClassName("random")[1].href=`keyboard.html#${randomEntry}`;
}

// Theme setting function
function setTheme(themeName) {
  localStorage.setItem('theme', themeName);
  document.documentElement.className = themeName;
}


// Immediately invoked function to set the theme on initial load
(function () {
  if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-dark');
  } else if (localStorage.getItem('theme') === 'theme-light') {
    setTheme('theme-light');
  } else {
    setTheme('theme-classic');
  }    
})();