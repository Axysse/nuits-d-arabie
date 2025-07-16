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
let pop = document.getElementById("pop");
let favoriteMerch = document.getElementById("favoriteMerch");
const showPlayerMoney = document.getElementById("showPlayerMoney");

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
let allBiomes = [
  { id: 1, name: "prairie", color: "biome_prairie" },
  { id: 2, name: "foret", color: "biome_foret" },
  { id: 3, name: "ocean", color: "biome_ocean" },
  { id: 4, name: "montagne", color: "biome_montagne" },
  { id: 6, name: "desert", color: "biome_desert" },
  { id: 7, name: "marais", color: "biome_marais" },
];

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

class Town {
  constructor(name, position) {
    this.name = name;
    this.position = position;
    availbaleMerchandises = [];
  }
}

async function createGrid() {
  let cellIdCounter = 0;
  let column = 0;
  let line = 0;
  let chosenBiome
  for (let i = 0; i <= 143; i++) {
    if( i >= 0 && i <= 6 || i >= 16 && i <= 23 || i >= 32 && i<= 39 || i >= 48 && i<= 53 || i >= 64 && i<= 68 || i >= 80 && i<= 85 || i >= 96 && i<= 102 || i >= 112 && i<= 120 || i >= 128 && i<= 135 ){
      chosenBiome = allBiomes[2]
    }else if(i >= 10 && i <= 16 ||i >= 28 && i <= 31 || i >= 45 && i <= 46  ){
      chosenBiome = allBiomes[3]
    }else if( i >= 123 && i <= 125 || i >= 140 && i <= 142 ){
      chosenBiome = allBiomes[1]
    }else if(i >= 54 && i <= 57 || i >= 69 && i <= 73|| i >= 86 && i <= 88|| i >= 103 && i <= 104){
      chosenBiome = allBiomes[0]
    }else if(i == 89||i >= 105 && i <= 107 ||i >= 121 && i <= 122 || i >= 136 && i <= 139){
      chosenBiome = allBiomes[5]
    } else {
      chosenBiome = allBiomes[4]
    }
    let newCell = document.createElement("div");
    newCell.classList.add("cell", chosenBiome.color);
    newCell.setAttribute("type", chosenBiome.name);
    newCell.id = cellIdCounter;
    newCell.setAttribute("x", column);
    newCell.setAttribute("y", line);
    allMerch.forEach((merch) => {
      if (newCell.getAttribute("type") == merch.biome) {
        newCell.setAttribute("produce", merch.name);
      }
    });
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
    column++;
    if (column == 16) {
      column = 0;
      line++;
    }
  }
  console.log(allCells);
  placeCities();
}

function randomBiome(allBiomes) {
  let biomeIndex = Math.floor(Math.random() * allBiomes.length);
  return allBiomes[biomeIndex];
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

function getAdjacentCells(cellId) {
  let casesAdjacentes = [];
  let x = null;
  let y = null;
  let validMerch = [];

  allCells.forEach((cell) => {
    if (cellId == cell.id) {
      x = parseInt(cell.getAttribute("x"), 10);
      y = parseInt(cell.getAttribute("y"), 10);
    }
  });

  if (y == 0) {
    let up = null;
    casesAdjacentes.push(up);
  } else {
    let up = { x: x, y: y - 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x && cell.getAttribute("y") == y - 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (y == 0 || x == 15) {
    let up_right = null;
    casesAdjacentes.push(up_right);
  } else {
    let up_right = { x: x + 1, y: y - 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x + 1 && cell.getAttribute("y") == y - 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (y == 0 || x == 0) {
    let up_left = null;
    casesAdjacentes.push(up_left);
  } else {
    let up_left = { x: x - 1, y: y - 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x - 1 && cell.getAttribute("y") == y - 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (x == 15) {
    let right = null;
    casesAdjacentes.push(right);
  } else {
    let right = { x: x + 1, y: y };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x + 1 && cell.getAttribute("y") == y) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (x == 0) {
    let left = null;
    casesAdjacentes.push(left);
  } else {
    let left = { x: x - 1, y: y };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x - 1 && cell.getAttribute("y") == y) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (y == 8) {
    let bottom = null;
    casesAdjacentes.push(bottom);
  } else {
    let bottom = { x: x, y: y + 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x && cell.getAttribute("y") == y + 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (x == 15 || y == 8) {
    let bottom_right = null;
    casesAdjacentes.push(bottom_right);
  } else {
    let bottom_right = { x: x + 1, y: y + 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x + 1 && cell.getAttribute("y") == y + 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }

  if (x == 0 || y == 8) {
    let bottom_left = null;
    casesAdjacentes.push(bottom_left);
  } else {
    let bottom_left = { x: x - 1, y: y + 1 };
    allCells.forEach((cell) => {
      if (cell.getAttribute("x") == x - 1 && cell.getAttribute("y") == y + 1) {
        casesAdjacentes.push(cell.id);
      }
    });
  }
  console.log("case cliquée : " + x, y);
  console.log("cases autour : ", casesAdjacentes);

  casesAdjacentes.forEach((element) => {
    if (element === null) return;
    allCells.forEach((cell) => {
      if (element == cell.id) {
        allMerch.forEach((merch) => {
          if (cell.getAttribute("type") == merch.biome) {
            if (!validMerch.includes(merch.name)) {
              validMerch.push(merch.name);
            }
          }
        });
      }
    });
  });

  // return casesAdjacentes;
  console.log(validMerch);
  return validMerch;
}

function eventClickCell(cell) {
  if (cell.getAttribute("type") === "village") {
    message.innerHTML = "";
    pop.textContent = "";
    favoriteMerch.textContent = "";
    allCities.forEach((city) => {
      if (city.position == cell.id) {
        const population = city.population;
        pop.textContent = population;
        const favoriteMerchandise = city.favoriteMerch;
        favoriteMerch.textContent = favoriteMerchandise;
      }
    });
    const name = cell.dataset.villageName;
    const imageSrc = "./assets/img/village.png";
    placeName.textContent = name;
    modalVillageImage.src = imageSrc;
    modal.style.display = "flex";
    selectedCellId = cell.id;
    message.innerHTML = "Y'a foule ici!";
    merchantDiv.classList.add("hidden");
    placeDiv.classList.remove("hidden");
    allSellBtn.forEach((btn) => {
      btn.classList.add("hidden");
    });
    if (player.position === cell.id) {
      placeDiv.classList.add("hidden");
      merchantDiv.classList.remove("hidden");
      allSellBtn.forEach((btn) => {
        btn.classList.remove("hidden");
      });
      getAdjacentCells(cell.id);
      showMerch(selectedCellId);
    }
  } else {
    message.innerHTML = "";
    const name = cell.getAttribute("type");
    if (name == "desert") {
      const imageSrc = "./assets/img/desert.png";
      modalVillageImage.src = imageSrc;
      modalVillageImage.classList.add("w-72");
    } else if (name == "ocean") {
      const imageSrc = "./assets/img/ocean.png";
      modalVillageImage.src = imageSrc;
      modalVillageImage.classList.add("w-72");
    } else if (name == "montagne") {
      const imageSrc = "./assets/img/montagne.png";
      modalVillageImage.src = imageSrc;
      modalVillageImage.classList.add("w-72");
    } else if (name == "prairie") {
      const imageSrc = "./assets/img/prairie.png";
      modalVillageImage.src = imageSrc;
      modalVillageImage.classList.add("w-72");
    } else if (name == "foret") {
      const imageSrc = "./assets/img/foret.png";
      modalVillageImage.src = imageSrc;
      modalVillageImage.classList.add("w-72");
    }
    placeName.textContent = name;

    modal.style.display = "flex";
    selectedCellId = cell.id;
    message.innerHTML = "Il fait bon ici!";
    merchantDiv.classList.add("hidden");
    placeDiv.classList.remove("hidden");
    allSellBtn.forEach((btn) => {
      btn.classList.add("hidden");
    });
    getAdjacentCells(cell.id);
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
    showPlayerMoney.innerText = player.money;
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

function buy(item, adjustedPrice) {
  let price;
  player.money = player.money - adjustedPrice;
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
  allSellBtn.push(newItemBtn);
  pushInventory(item);
  showPlayerMoney.innerText = player.money.toFixed(2);
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
  const currentCity = allCities.find((city) => city.position == cell.id);
  if (currentCity) {
    const validMerchNames = getAdjacentCells(cell.id);
    validMerchNames.forEach((merchName) => {
      const merch = allMerch.find((m) => m.name === merchName);
      if (merch) {
        const merchDiv = document.createElement("div");
        merchDiv.classList.add(
          "flex",
          "flex-col",
          "items-center",
          "justify-center"
        );
        const merchImg = document.createElement("img");
        merchImg.src = merch.image;
        merchImg.classList.add("w-32");
        const merchNameElement = document.createElement("p");
        merchNameElement.innerText = merch.name;

        const merchPrice = document.createElement("p");
        let adjustedPrice = merch.basePrice;

        if (
          currentCity.variationValue &&
          currentCity.variationValue.length > 0
        ) {
          const variation = currentCity.variationValue[0][merch.name];
          if (variation !== undefined) {
            adjustedPrice += variation + (5 * currentCity.population) / 100;
          }
        }
        merchPrice.innerText = adjustedPrice.toFixed(2) + "$";

        const merchBuy = document.createElement("button");
        merchBuy.innerHTML = "Acheter";
        merchBuy.classList.add("p-2", "bg-orange-600");

        merchDiv.appendChild(merchImg);
        merchDiv.appendChild(merchNameElement);
        merchDiv.appendChild(merchPrice);
        merchDiv.appendChild(merchBuy);
        displayMerch.appendChild(merchDiv);

        merchBuy.addEventListener("click", () => {
          buy(merch, adjustedPrice);
        });
      }
    });
  }
}

function sell(item) {
  let adjustedPrice = item.basePrice;
  allCities.forEach((city) => {
    if (city.position == player.position) {
      if (city.variationValue && city.variationValue.length > 0) {
        const variation = city.variationValue[0][item.name];
        if (variation !== undefined) {
          adjustedPrice += variation + (2 * city.population) / 100;
        }
      }
    }
  });
  player.money += adjustedPrice;
  showPlayerMoney.innerText = player.money.toFixed(2);
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
  let chosenBiome = await randomBiome(allBiomes);
  console.log(chosenBiome);
});
