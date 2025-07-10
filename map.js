const display = document.getElementById("display");
const message = document.getElementById("message");
const start = document.getElementById("start");
const aller = document.getElementById("aller")
const merchantDiv = document.getElementById("merchantDiv")
const placeDiv = document.getElementById("placeDiv")
const showInventory = document.getElementById("showInventory")
const bttnBuy = document.querySelectorAll(".bttnBuy")
const infoDiv = document.getElementById("infoDiv")
const displayMerch = document.getElementById("displayMerch")

var modal = document.getElementById("myModal");
var modalVillageImage = document.getElementById("modalVillageImage");
var placeName= document.getElementById("villageName");
var closeButton = document.getElementsByClassName("close-button")[0];

let newgame = false
let selectedCellId = null;
let player = null;
let currentCell = null;

 let allMerch = []

 async function fetchMerch(){
        try {
        const response = await fetch('./merch.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Données JSON brutes chargées :", data);
        if (data && data.merchandises && Array.isArray(data.merchandises)) {
            allMerch = data.merchandises;
            console.log(allMerch)
        } else {
            console.error("Le format JSON n'est pas celui attendu ou 'merchandises' n'est pas un tableau.");
            allMerch = [];
        }
    } catch (error) {
        console.error("Erreur de chargement des marchandises :", error);
        allMerch = [];
    }
}

start.addEventListener("click", () => {
  newGame();
});

aller.addEventListener("click", () => {
  modal.style.display = "none";
  goTo(player.position, selectedCellId);
})

bttnBuy.forEach(bttn => {
  bttn.addEventListener("click", () => {
    const item = bttn.value
    console.log (item)
    buy(item)
  })
});

// itemBtn.forEach(el => {
//   el.addEventListener("click", () =>
//   )
// });

const villageNames = {
  27: "Izmir",
  108: "Adana",
  72: "Karakorum",
};

class Caravan {
  constructor(position){
    this.position = position;
    this.sprite = "./assets/img/player.png"
    this.inventory = []
    this.money = 500
  }
}

class Item {
  constructor(name, quantity){
    this.name = name
    this.quantity = quantity
  }
}

function createGrid() {
  let cellIdCounter = 0;
  for (let i = 0; i <= 143; i++) {
    let newCell = document.createElement("div");
    newCell.classList.add("cell");
    newCell.id = cellIdCounter;
    display.appendChild(newCell);
    newCell.addEventListener("click", () => {
      if(newgame == true){
        firstPlacement(newCell);
      }else{
        eventClickCell(newCell);
      }
      
    });
    if (i == 27 || i == 108 || i == 72) {
      let village = document.createElement("img");
      village.src = "./assets/img/house.png";
      village.classList.add("h-17");
      newCell.appendChild(village);
      newCell.setAttribute("type", "village");
      newCell.dataset.villageName = villageNames[i];
    }
    cellIdCounter++;
  }
}

function eventClickCell(cell) {
  if (cell.getAttribute("type") === "village") {
    message.innerHTML = ""
    const name = cell.dataset.villageName;
    const imageSrc = "./assets/img/village.png";
    placeName.textContent = name;
    modalVillageImage.src = imageSrc;
    modal.style.display = "flex";
    selectedCellId = cell.id
    message.innerHTML = "Y'a foule ici!"
    merchantDiv.classList.add("hidden")
    placeDiv.classList.remove("hidden")
      if(player.position === cell.id){
        placeDiv.classList.add("hidden")
        merchantDiv.classList.remove("hidden")
        showMerch();
      }
  } else {
    message.innerHTML = ""
    const name = "Désert";
    const imageSrc = "./assets/img/desertPlace.jpg";
    placeName.textContent = name;
    modalVillageImage.src = imageSrc;
    modal.style.display = "flex";
    selectedCellId = cell.id
    message.innerHTML = "Il fait bon ici!"
    merchantDiv.classList.add("hidden")
    placeDiv.classList.remove("hidden")
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

function firstPlacement(cell){
  if (cell.getAttribute("type") !== "village") {
    alert("Il faut commencer sur une ville")
  }else{
    player = new Caravan(cell.id)
    console.log(player)
    const playerSprite = document.createElement("img")
    playerSprite.src = "./assets/img/player.png"
    playerSprite.classList.add("absolute", "top-0", "playerImg")
    cell.appendChild(playerSprite)
    message.innerHTML = ""
    currentCell = cell.id
  }
  newgame = false
}

function newGame() {
  const newGameText = document.createElement("p")
  newGameText.innerText = "Choisissez votre ville de départ, maître caravanier."
  message.appendChild(newGameText)
  start.classList.add("hidden")
  newgame = true
  console.log(newgame)
}

function goTo(currentCellId, selectedCellId){
  let startCell = document.getElementById(currentCellId)
  let endCell = document.getElementById(selectedCellId)
  console.log(endCell)
  let destinationCell = selectedCellId
  if(newgame !== true){
    const currentPlayerSprite = startCell.querySelector(".playerImg");
    currentPlayerSprite.remove()

    const playerSprite = document.createElement("img")
    playerSprite.src = "./assets/img/player.png"
    playerSprite.classList.add("absolute", "top-0", "playerImg" )
    endCell.appendChild(playerSprite)

    player.position = selectedCellId
    currentCellId = selectedCellId
    selectedCellId = null
  }
}

function buy(item){
  let price

  player.money = player.money - item.basePrice
  console.log(player.money)
  const newItem = document.createElement("div")
  newItem.setAttribute("name", item.name)
  newItem.classList.add("flex", "flex-col", "items-center", "item")
  const newItemImg = document.createElement("img")
  newItemImg.src = item.image
  newItemImg.classList.add("w-18", "mt-2")
  newItem.appendChild(newItemImg)
  const newItemBtn = document.createElement("button")
  newItemBtn.classList.add("p-1", "bg-yellow-400", "itemBtn")
  newItemBtn.innerHTML = "vendre"
  showInventory.appendChild(newItem)
  newItem.appendChild(newItemBtn)
  pushInventory(item)
  newItemBtn.addEventListener("click", () => {
    console.log(item.id)
    sell(item)
  })
}

function pushInventory(item){
  let itemName = item.name
  let itemFound = false

  player.inventory.forEach(merch => {
    if(itemName === merch.name){
      merch.quantity = merch.quantity + 1
      itemFound = true
  }
});

  if(itemFound){
    console.log(player.inventory)
  } else {
  let newItem = new Item(itemName, 1)
  player.inventory.push(newItem)
  console.log(player.inventory)
  }
}

function showMerch(){
  displayMerch.innerHTML = ''
  allMerch.forEach(merch => {
    const merchDiv = document.createElement("div")
    merchDiv.classList.add("flex", "flex-col", "items-center", "justify-center")
    const merchImg = document.createElement("img")
    merchImg.src = merch.image
    merchImg.classList.add("w-32")
    const merchName = document.createElement("p")
    merchName.innerText = merch.name
    const merchPrice = document.createElement("p")
    merchPrice.innerText = merch.basePrice + "$"
    const merchBuy = document.createElement("button")
    merchBuy.innerHTML = "Acheter"
    merchBuy.classList.add("p-2", "bg-orange-600")

    merchDiv.appendChild(merchImg)
    merchDiv.appendChild(merchName)
    merchDiv.appendChild(merchPrice)
    merchDiv.appendChild(merchBuy)
    displayMerch.appendChild(merchDiv)

    merchBuy.addEventListener("click", () => {
        buy(merch)
    })
  });
}

function sell(item){
  player.money += item.basePrice;
  console.log(player.money)
  
  let itemsToSell = showInventory.querySelectorAll(`div[name="${item.name}"]`);
  let itemSold = false; 

  itemsToSell.forEach(itemToSell => {
      if(itemToSell.getAttribute("name") === item.name && !itemSold){
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

fetchMerch();
createGrid();
