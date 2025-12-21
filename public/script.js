const sideMenu = document.querySelector('#sideMenu');
const navbar = document.querySelector("nav");
const navLinks = document.querySelector("nav ul");

function openMenu() {
    sideMenu.style.transform = 'translateX(-16rem)';
}

function closeMenu() {
    sideMenu.style.transform = 'translateX(16rem)';
}


window.addEventListener("scroll", () => {
    if(scrollY > 50) {
        navbar.classList.add("bg-white", "bg-opacity-50", "backdrop-blur-lg", "shadow-sm");
        navLinks.classList.remove("bg-white", "shadow-sm", "bg-opacity-50");
    }else{
        navbar.classList.remove("bg-white", "bg-opacity-50", "backdrop-blur-lg", "shadow-sm");
        navLinks.classList.add("bg-white", "shadow-sm", "bg-opacity-50");
    }
});


// Typing Animation
const container = document.querySelector('.textTyped');

const skills = ["Web developer", "Web designer", "Graphic Designer", "Freelancer", "Instructor"];
let index = 0;

let characterIndex = 0;

updataeText();

function updataeText() {
  container.innerHTML = `
  <h4> I am ${skills[index].slice(0, 1) === "I" ? "an" : "a"} ${skills[index].slice(0, characterIndex)}</h4>
  `;
  characterIndex++;
  if(characterIndex > skills[index].length) {
    characterIndex = 0;
    index++;
    if(index === skills.length) {
      index = 0;
    }
  }

  setTimeout(updataeText, 500);
}




//FOR DARK-MODE TOGGLE ICON
const inputEl = document.querySelector(".input");
const mainEl = document.getElementById("main");
const darkMode = document.getElementById("dark-mode");

inputEl.checked = JSON.parse(localStorage.getItem("darkMode"));
inputEl.addEventListener("click", () => {
  updateMain();
  updateLocalStorage();
});

function updateMain() {
  if(inputEl.checked) {
    mainEl.style.background = "#000";
    mainEl.style.color = "#fff";
  }else{
    mainEl.style.background = "#fff";
    mainEl.style.color = "#203040";
  }
}

function updateLocalStorage() {
  localStorage.setItem("darkMode",
    JSON.stringify(inputEl.checked)
  );
}