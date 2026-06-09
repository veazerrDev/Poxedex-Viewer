//PLUGINS IMPORTS
import { defaultModules, error } from "@pnotify/core";
import * as PNotifyMobile from "@pnotify/mobile";
import "@pnotify/core/dist/PNotify.css";
import "@pnotify/core/dist/BrightTheme.css";
import "@pnotify/mobile/dist/PNotifyMobile.css";

defaultModules.set(PNotifyMobile, {});

//CUSTOM IMPORTS
import getPokeInfo from "./getPokeInfo.js";
import debounce from "lodash.debounce";

//APP
const appInput = document.querySelector(".app-input");
const appCardSpace = document.querySelector(".app-card-space");

// Створюємо dropdown елемент
const dropdown = document.createElement("ul");
dropdown.classList.add("app-dropdown");
appInput.parentElement.appendChild(dropdown);

// Завантажуємо список всіх покемонів
let allPokemons = [];
fetch("https://pokeapi.co/api/v2/pokemon?limit=10000")
  .then((res) => res.json())
  .then((data) => {
    allPokemons = data.results.map((p) => p.name);
  });

// SHOW SUGGESTIONS LIST
function showSuggestions(value) {
  dropdown.innerHTML = "";

  if (!value) {
    dropdown.classList.remove("app-dropdown--active");
    return;
  }

  const filtered = allPokemons
    .filter((name) => name.startsWith(value.toLowerCase()))
    .slice(0, 8);

  if (filtered.length === 0) {
    dropdown.classList.remove("app-dropdown--active");
    return;
  }

  filtered.forEach((name) => {
    const li = document.createElement("li");
    li.classList.add("app-dropdown__item");
    li.textContent = capitalizeFirstLetter(name);

    li.addEventListener("click", () => {
      appInput.value = capitalizeFirstLetter(name);
      dropdown.classList.remove("app-dropdown--active");
      dropdown.innerHTML = "";
      loadPokemon(name);
    });

    dropdown.appendChild(li);
  });

  dropdown.classList.add("app-dropdown--active");
}

document.addEventListener("click", (e) => {
  if (!appInput.parentElement.contains(e.target)) {
    dropdown.classList.remove("app-dropdown--active");
  }
});

// DEBOUNCE
const debouncedLoad = debounce((pokeName) => {
  if (!pokeName) return;

  getPokeInfo(pokeName)
    .then((res) => {
      if (!res) return;

      const { id, name, abilities, stats, sprites } = res;
      const abilitiesArray = Object.values(abilities);
      const statsArray = Object.values(stats);
      const spriteArray = Object.values(sprites.other);
      const firstSprite = spriteArray[0];

      appCardSpace.innerHTML = `
        <div class="app-card">
          <div class="card-text_info">
            <h1 class="card-title">${capitalizeFirstLetter(name)}</h1>
            <h2 class="card-subtitle">Id: ${id}</h2>
            <h2 class="card-subtitle_abilities">Abilities:</h2>
            <ul class="card-list_abilities">
              ${abilitiesArray
                .map(({ ability, is_hidden }) => {
                  const abil = Object.values(ability);
                  return `<li class="card-list_abilities-item">
                    <h3 class="card-list_abilities-subtitle">Ability: ${abil[0]}</h3>
                    <h3 class="card-list_abilities-subtitle">Is hidden: ${is_hidden}</h3>
                  </li>`;
                })
                .join("")}
            </ul>
            <h2 class="card-subtitle_stats">Stats:</h2>
            <ul class="card-list_stats">
              ${statsArray
                .map(({ base_stat, stat }) => {
                  return `<li class="card-list_stats-item">
                    <h3 class="card-list_stats-subtitle">${stat.name}: ${base_stat}</h3>
                  </li>`;
                })
                .join("")}
            </ul>
          </div>
          <div class="card-image_info">
            <img
              src="${firstSprite.front_default}"
              alt="Pokemon Image!"
              class="card-image"
              width="350"
              height="400"
            />
          </div>
        </div>
      `;
    })
    .catch(() => errorFunction()); // помилка тільки після debounce
}, 1500);

//CONNECT FUNCTIONS
appInput.addEventListener("input", (evt) => {
  const value = evt.target.value.trim();
  showSuggestions(value);
  appCardSpace.innerHTML = "";
  debouncedLoad(value);
});

// LOAD POKEMON
function loadPokemon(pokeName) {
  if (!pokeName) return;
  appCardSpace.innerHTML = "";
  debouncedLoad.flush(); // одразу без затримки при кліку на підказку
  getPokeInfo(pokeName)
    .then((res) => {
      if (!res) return;

      const { id, name, abilities, stats, sprites } = res;
      const abilitiesArray = Object.values(abilities);
      const statsArray = Object.values(stats);
      const spriteArray = Object.values(sprites.other);
      const firstSprite = spriteArray[0];

      appCardSpace.innerHTML = `
        <div class="app-card">
          <div class="card-text_info">
            <h1 class="card-title">${capitalizeFirstLetter(name)}</h1>
            <h2 class="card-subtitle">Id: ${id}</h2>
            <h2 class="card-subtitle_abilities">Abilities:</h2>
            <ul class="card-list_abilities">
              ${abilitiesArray
                .map(({ ability, is_hidden }) => {
                  const abil = Object.values(ability);
                  return `<li class="card-list_abilities-item">
                    <h3 class="card-list_abilities-subtitle">Ability: ${abil[0]}</h3>
                    <h3 class="card-list_abilities-subtitle">Is hidden: ${is_hidden}</h3>
                  </li>`;
                })
                .join("")}
            </ul>
            <h2 class="card-subtitle_stats">Stats:</h2>
            <ul class="card-list_stats">
              ${statsArray
                .map(({ base_stat, stat }) => {
                  return `<li class="card-list_stats-item">
                    <h3 class="card-list_stats-subtitle">${stat.name}: ${base_stat}</h3>
                  </li>`;
                })
                .join("")}
            </ul>
          </div>
          <div class="card-image_info">
            <img
              src="${firstSprite.front_default}"
              alt="Pokemon Image!"
              class="card-image"
              width="350"
              height="400"
            />
          </div>
        </div>
      `;
    })
    .catch(() => errorFunction());
}

function errorFunction() {
  error({
    title: "Oh No!",
    text: "We didn't find such a Pokemon :(",
    delay: 2500,
  });
}

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}
