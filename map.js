const display = document.getElementById("display");
const message = document.getElementById("message");
const start = document.getElementById("start");
const aller = document.getElementById("aller")
const merchantDiv = document.getElementById("merchantDiv")
const placeDiv = document.getElementById("placeDiv")
const showInventory = document.getElementById("showInventory")
const bttnBuy = document.querySelectorAll(".bttnBuy")
const infoDiv = document.getElementById("infoDiv")

var modal = document.getElementById("myModal");
var modalVillageImage = document.getElementById("modalVillageImage");
var placeName= document.getElementById("villageName");
var closeButton = document.getElementsByClassName("close-button")[0];

let newgame = false
let selectedCellId = null;
let player = null;
let currentCell = null;


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
  startCell = document.getElementById(currentCellId)
  endCell = document.getElementById(selectedCellId)
  console.log(endCell)
  destinationCell = selectedCellId
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
    if(item.includes("coffee")){
     price = 50
  }
  if(item.includes("spice")){
     price = 75
  }
  player.money = player.money - price
  console.log(player.money)
  const newItem = document.createElement("div")
  const newItemImg = document.createElement("img")
  newItemImg.src = item
  newItemImg.classList.add("w-24", "mt-2")
  newItem.appendChild(newItemImg)
  showInventory.appendChild(newItem)
  pushInventory(item)
  
}

function pushInventory(item){
  let itemName
  let itemFound = false
  if(item.includes("coffee")){
     itemName = "coffee"
  }
  if(item.includes("spice")){
     itemName = "spice"
  }

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

createGrid();
