// Use Inquirer

var inquirer = require("inquirer");
// require sql
var mysql = require("mysql");
// var Db = require('mysql-activerecord');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

var userCost = 0;
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    // repeat until user complete all purchases to do
    listProducts();
});


// A query which selects all data from table products
function listProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer
            .prompt([{
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].id + ":" + res[i].product_name + ":" + res[i].price);

                        }
                        return choiceArray;
                    },
                    message: "What product would you like to Buy?"
                },
                {
                    name: "userqty",
                    message: "How many Products: (1-9999)",
                    validate: function (value) {
                        if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= 9999) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) { //promise
                var chosenItem = answer.choice.split(":");
                var chosenId = chosenItem[0];
                //    get stock level for that product
                connection.query("SELECT * FROM products WHERE ?", {
                    id: chosenItem[0]

                }, function (err, res) {
                    console.log("Chosen Product information: ");
                    console.log("Product Name: " + res[0].product_name);
                    console.log("Product Cost: " + res[0].cost);
                    console.log("Quantity required:  " + answer.userqty)
                    console.log("Quantity in Stock: " + res[0].stock);
                    // console.log(res);
                    userCost = parseInt(res[0].price) * answer.userqty;
                    console.log("Total Cost for " + answer.userqty + " item(s): " + userCost);
                    var newstock = res[0].stock - answer.userqty;
                    // console.log(newstock);
                    //checkstock
                    if (res[0].stock >= answer.userqty) {

                        // console.log("Enough stock!");
                        //calculate costs 
                        //update stock
                        connection.query("UPDATE products SET stock = ? WHERE id = ?", [newstock, chosenId],
                            function (err, res) {}); //end set connection.query

                    } //end if
                    else {
                        console.log("Item is currently out of stock");
                    }
                    repeatShop();

                }) //end of connection.query 
            }).catch(err => {
                console.log(err);
            }); // end .then

    }); //end query select * from products



}; //end listProducts()

function repeatShop() {
    inquirer
        .prompt([{
            name: "choice",
            message: "Would you like to purchase more products?",
            validate: function (value) {
                if (value === "Y" || value === "y" || value === "N" || value === "n") {
                    return true;
                }
                return false;
            }
        }])
        .then(function (answer) { //promise
            console.log(answer.choice);
            if (answer.choice === "Y" || answer.choice === "y") {
                listProducts();
            } // end if
            else {
                connection.end();
            }

        }).catch(err => {
            console.log(err);
        }); // end .then

}