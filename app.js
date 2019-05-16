const mysql = require("mysql");
const inquirer = require("inquirer");
require('dotenv').config();

const introPrompt = [
  {
    type: "list",
    message: "Welcome to Trey's Hardware\nWhat would you like to do?",
    choices: ["View items for sale", "Quit"],
    name: "introChoice"
  }
]

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log('\033[2J');
  start();
});

function start() {
  inquirer.prompt(introPrompt).then(response => {
    switch (response.introChoice) {
      case "View items for sale": showInventory(); break;
      case "Quit": connection.end();
    }
  })
}

function backToMenu() {
  console.log('\033[2J');
  start();
}

function showInventory() {
  console.log('\033[2J');
  let longestProductName = 0;
  let longestDepartmentName = 0;
  let startingSpace = "";
  let priceSpace = "";
  const prompt = [
    {
      type: "list",
      message: "What would you like to purchase?",
      choices: [],
      name: "purchased"
    }
  ]
  connection.query("SELECT * FROM inventory", (err, res) => {
    if (err) throw err
    res.forEach(item => {
      if (item.product_name.length > longestProductName) longestProductName = item.product_name.length
      if (item.department_name.length > longestDepartmentName) longestDepartmentName = item.department_name.length
    })
    res.forEach(item => {
      if (item.id < 10) startingSpace = " ";
      else startingSpace = "";
      if (item.price < 10) priceSpace = " ";
      else priceSpace = "";
      const itemListing = `${startingSpace}${item.id} - ${item.product_name.padEnd(longestProductName)} | ${item.department_name.padEnd(longestDepartmentName)} | $${priceSpace}${item.price}`;
      prompt[0].choices.push(itemListing);
    });
    prompt[0].choices.push("Go Back");
    inquirer.prompt(prompt).then(product => {
      if (product.purchased === "Go Back") backToMenu();
      else {
        const itemNumber = product.purchased.slice(0, 2).trim();
        const id = parseInt(itemNumber);
        console.log('\033[2J');
        purchased(id);
      }
    })
  })
}

function purchased(id) {  
  connection.query("SELECT * FROM inventory WHERE id = ?", id, (err, res) => {
    if (err) throw err
    if (res[0].stock_quantity <= 0) {
      soldOut();
    } else {
      const prompt = [
        {
          type: "input",
          message: `You have selected ${res[0].product_name} from the ${res[0].department_name} department. They cost $${res[0].price}. 
            I have ${res[0].stock_quantity} available. How Many would you like?`,
          name: "quantity"
        }
      ]
      inquirer.prompt(prompt).then(purchase => {
        const quantityPurchased = parseInt(purchase.quantity);
        if (quantityPurchased === 0) {
          console.log("No purchase made.");
          backToMenu();
        } else if (quantityPurchased <= res[0].stock_quantity) {
          connection.query("UPDATE inventory SET stock_quantity = ? WHERE id = ?", [res[0].stock_quantity - quantityPurchased, 
          res[0].id], (err, response) => {
            if (err) throw err
            console.log('\033[2J');
            console.log(`Thank you for your purchase of ${quantityPurchased} ${res[0].product_name} for $${res[0].price * quantityPurchased}\n`);
            start();
            });
        } else {
          console.log('\033[2J');
          console.log("I am sorry, but I do not have that many.");
          purchased(id);
        }
      });
    }
  })
}

function soldOut() {
  const prompt = [
    {
      type: "input",
      message: "I am sorry, but we are sold out of that item\nPress enter to return to the store inventory",
      name: "empty"
    }
  ]
  inquirer.prompt(prompt).then(input => showInventory());
}