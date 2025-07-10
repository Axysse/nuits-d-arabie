const display = document.getElementById("display");
const message = document.getElementById("message");
const start = document.getElementById("start");
const aller = document.getElementById("aller");
const merchantDiv = document.getElementById("merchantDiv");
const placeDiv = document.getElementById("placeDiv");
const showInventory = document.getElementById("showInventory");
const bttnBuy = document.querySelectorAll(".bttnBuy");
const infoDiv = document.getElementById("infoDiv");
const displayMerch = document.getElementById("displayMerch");

var modal = document.getElementById("myModal");
var modalVillageImage = document.getElementById("modalVillageImage");
var placeName = document.getElementById("villageName");
var closeButton = document.getElementsByClassName("close-button")[0];

let newgame = false;
let selectedCellId = null;
let player = null;
let currentCell = null;

let allMerch = [];
let allCells = [];
let allSellBtn = [];

async function fetchMerch() {
  try {
    const response = await fetch("./json/merch.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Données JSON brutes chargées :", data);
    if (data && data.merchandises && Array.isArray(data.merchandises)) {
      allMerch = data.merchandises;
      console.log(allMerch);
    } else {
      console.error(
        "Le format JSON n'est pas celui attendu ou 'merchandises' n'est pas un tableau."
      );
      allMerch = [];
    }
  } catch (error) {
    console.error("Erreur de chargement des marchandises :", error);
    allMerch = [];
  }
}

let allCities = [];

async function fetchCities() {
  try {
    const response = await fetch("./json/cities.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Données JSON brutes chargées :", data);
    if (data && data.cities && Array.isArray(data.cities)) {
      allCities = data.cities;
      console.log(allCities);
    } else {
      console.error(
        "Le format JSON n'est pas celui attendu ou 'cities' n'est pas un tableau."
      );
      allCities = [];
    }
  } catch (error) {
    console.error("Erreur de chargement des villes :", error);
    allCities = [];
  }
}

start.addEventListener("click", () => {
  newGame();
});

aller.addEventListener("click", () => {
  modal.style.display = "none";
  goTo(player.position, selectedCellId);
});

bttnBuy.forEach((bttn) => {
  bttn.addEventListener("click", () => {
    const item = bttn.value;
    console.log(item);
    buy(item);
  });
});

class Caravan {
  constructor(position) {
    this.position = position;
    this.sprite = "./assets/img/player.png";
    this.inventory = [];
    this.money = 500;
  }
}

class Item {
  constructor(name, quantity) {
    this.name = name;
    this.quantity = quantity;
  }
}

async function createGrid() {
  let cellIdCounter = 0;
  for (let i = 0; i <= 143; i++) {
    let newCell = document.createElement("div");
    newCell.classList.add("cell");
    newCell.id = cellIdCounter;
    display.appendChild(newCell);
    newCell.addEventListener("click", () => {
      if (newgame == true) {
        firstPlacement(newCell);
      } else {
        eventClickCell(newCell);
      }
    });
    allCells.push(newCell);
    cellIdCounter++;
  }
  console.log(allCells);
  placeCities();
}

function placeCities() {
  allCities.forEach((city) => {
    allCells.forEach((cell) => {
      if (city.position == cell.id) {
        let village = document.createElement("img");
        village.src = "./assets/img/house.png";
        village.classList.add("h-17");
        cell.appendChild(village);
        cell.setAttribute("type", "village");
        cell.dataset.villageName = city.name;
      }
    });
  });
}

function eventClickCell(cell) {
  if (cell.getAttribute("type") === "village") {
    message.innerHTML = "";
    const name = cell.dataset.villageName;
    const imageSrc = "./assets/img/village.png";
    placeName.textContent = name;
    modalVillageImage.src = imageSrc;
    modal.style.display = "flex";
    selectedCellId = cell.id;
    message.innerHTML = "Y'a foule ici!";
    merchantDiv.classList.add("hidden");
    placeDiv.classList.remove("hidden");
        allSellBtn.forEach(btn => {
        btn.classList.add("hidden")
      });
    if (player.position === cell.id) {
      placeDiv.classList.add("hidden");
      merchantDiv.classList.remove("hidden");
      allSellBtn.forEach(btn => {
        btn.classList.remove("hidden")
      });
      showMerch(cell);
    }
  } else {
    message.innerHTML = "";
    const name = "Désert";
    const imageSrc = "./assets/img/desertPlace.jpg";
    placeName.textContent = name;
    modalVillageImage.src = imageSrc;
    modal.style.display = "flex";
    selectedCellId = cell.id;
    message.innerHTML = "Il fait bon ici!";
    merchantDiv.classList.add("hidden");
    placeDiv.classList.remove("hidden");
        allSellBtn.forEach(btn => {
        btn.classList.add("hidden")
      });
  }

  closeButton.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function firstPlacement(cell) {
  if (cell.getAttribute("type") !== "village") {
    alert("Il faut commencer sur une ville");
  } else {
    player = new Caravan(cell.id);
    console.log(player);
    const playerSprite = document.createElement("img");
    playerSprite.src = "./assets/img/player.png";
    playerSprite.classList.add("absolute", "top-0", "playerImg");
    cell.appendChild(playerSprite);
    message.innerHTML = "";
    currentCell = cell.id;
  }
  newgame = false;
}

function newGame() {
  const newGameText = document.createElement("p");
  newGameText.innerText =
    "Choisissez votre ville de départ, maître caravanier.";
  message.appendChild(newGameText);
  start.classList.add("hidden");
  newgame = true;
  console.log(newgame);
}

function goTo(currentCellId, selectedCellId) {
  let startCell = document.getElementById(currentCellId);
  let endCell = document.getElementById(selectedCellId);
  console.log(endCell);
  let destinationCell = selectedCellId;

  if (newgame !== true) {
    const currentPlayerSprite = startCell.querySelector(".playerImg");
    if (currentPlayerSprite) { 
      currentPlayerSprite.remove();
    }
    const playerSprite = document.createElement("img");
    playerSprite.src = "./assets/img/player.png";
    playerSprite.classList.add("absolute", "top-0", "playerImg");
    endCell.appendChild(playerSprite);

    player.position = destinationCell;
    if (endCell.getAttribute("type") === "village") {
      const name = endCell.dataset.villageName;
      const imageSrc = "./assets/img/village.png";
      placeName.textContent = name;
      modalVillageImage.src = imageSrc;
      message.innerHTML = "Y'a foule ici!";
      merchantDiv.classList.remove("hidden"); 
      placeDiv.classList.add("hidden"); 
      allSellBtn.forEach((btn) => {
        btn.classList.remove("hidden");
      });
      showMerch(endCell); 
    } else {
      merchantDiv.classList.add("hidden");
      placeDiv.classList.remove("hidden");
      allSellBtn.forEach((btn) => {
        btn.classList.add("hidden");
      });
    }
    modal.style.display = "flex";
    selectedCellId = null;
  }
}

function buy(item) {
  let price;
  player.money = player.money - item.basePrice;
  console.log(player.money);
  const newItem = document.createElement("div");
  newItem.setAttribute("name", item.name);
  newItem.classList.add("flex", "flex-col", "items-center", "item");
  const newItemImg = document.createElement("img");
  newItemImg.src = item.image;
  newItemImg.classList.add("w-18", "mt-2");
  newItem.appendChild(newItemImg);
  const newItemBtn = document.createElement("button");
  newItemBtn.classList.add("p-1", "bg-yellow-400", "hidden", "itemBtn");
  newItemBtn.innerHTML = "vendre";
  showInventory.appendChild(newItem);
  newItem.appendChild(newItemBtn);
  allSellBtn.push(newItemBtn)
  pushInventory(item);
  newItemBtn.addEventListener("click", () => {
    sell(item);
  });
}

function pushInventory(item) {
  let itemName = item.name;
  let itemFound = false;

  player.inventory.forEach((merch) => {
    if (itemName === merch.name) {
      merch.quantity = merch.quantity + 1;
      itemFound = true;
    }
  });

  if (itemFound) {
    console.log(player.inventory);
  } else {
    let newItem = new Item(itemName, 1);
    player.inventory.push(newItem);
    console.log(player.inventory);
  }
}

function showMerch(cell) {
  displayMerch.innerHTML = "";
  allCities.forEach((city) => {
    if (cell.id == city.position) {
      city.availableMerch.forEach((availMerch) => {
        allMerch.forEach((merch) => {
          if (availMerch == merch.name) {
            const merchDiv = document.createElement("div");
            merchDiv.classList.add("flex","flex-col","items-center","justify-center");
            const merchImg = document.createElement("img");
            merchImg.src = merch.image;
            merchImg.classList.add("w-32");
            const merchName = document.createElement("p");
            merchName.innerText = merch.name;

            const merchPrice = document.createElement("p");
            let adjustedPrice = merch.basePrice;
            if (city.variationValue && city.variationValue.length > 0) {
              const variation = city.variationValue[0][merch.name];
              if (variation !== undefined) {
                adjustedPrice += variation;
              }
            }
            merchPrice.innerText = adjustedPrice + "$";

            const merchBuy = document.createElement("button");
            merchBuy.innerHTML = "Acheter";
            merchBuy.classList.add("p-2", "bg-orange-600");

            merchDiv.appendChild(merchImg);
            merchDiv.appendChild(merchName);
            merchDiv.appendChild(merchPrice);
            merchDiv.appendChild(merchBuy);
            displayMerch.appendChild(merchDiv);

            merchBuy.addEventListener("click", () => {
              buy(merch);
            });
          }
        });
      });
    }
  });
}

function sell(item) {
  player.money += item.basePrice;
  console.log(player.money);

  let itemsToSell = showInventory.querySelectorAll(`div[name="${item.name}"]`);
  let itemSold = false;

  itemsToSell.forEach((itemToSell) => {
    if (itemToSell.getAttribute("name") === item.name && !itemSold) {
      itemToSell.remove();
      itemSold = true;
    }
  });

  let itemFoundInInventory = false;
  player.inventory.forEach((merch, index) => {
    if (item.name === merch.name) {
      merch.quantity -= 1;
      if (merch.quantity <= 0) {
        player.inventory.splice(index, 1);
      }
      itemFoundInInventory = true;
      return;
    }
  });

  if (!itemFoundInInventory) {
    console.warn("Y'a pas ça:", item.name);
  }
  console.log("Inventaire:", player.inventory);
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCities();
  await fetchMerch();
  await createGrid();
});
