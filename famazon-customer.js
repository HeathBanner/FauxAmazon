
var mysql = require('mysql');
var inquirer = require('inquirer');

var products = []
var requestedProduct = []

function ProductRequest(product, price, quantity, index) {
    this.product = product
    this.price = price
    this.quantity = quantity
    this.index = index
}

var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'famazon'
});

function displayItems() {
    console.log("Selecting all items...\n");
    connection.query("SELECT * FROM products", function(err, res) { 
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            products.push(res[i].product_name)
        }
        inquirer.prompt([
            {
                type: 'list',
                message: "What item would you like to purchase?",
                choices: products,
                name: 'item'
            },
            {
                type: 'input',
                message: "How many would you like to purchase?",
                name: 'quantity'
            }
        ]).then(function(res) {
            productQuery(res)
        })
    })
}

function updateProductQuantity(newQuantity, updatedSale) {
    console.log("Updating product quantity...");
    
    connection.query("UPDATE products SET stock_quantity = ?, product_sales = ? WHERE product_name = ?",
    [newQuantity,
    updatedSale,
    requestedProduct.product],
    
    
    function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " products updated!\n");
        connection.end();
    })
};

function productQuery(res) {
    console.log("Checking for availability...\n");
    connection.query("SELECT * FROM products", function(err, data) {
        if (err) throw err;
        for (var index in data) {
            if (data[index].product_name == res.item) {
                requestedProduct = new ProductRequest(
                    data[index].product_name,
                    data[index].price,
                    data[index].stock_quantity,
                    data[index].product_sales,
                    [index]
                )
            }
        }
        if (requestedProduct.quantity > res.quantity) {
            var updatedSale = res.quantity * requestedProduct.price
            console.log('Your total: $' + res.quantity * requestedProduct.price);
            
            var newQuantity = parseInt(requestedProduct.quantity) - parseInt(res.quantity);            
            updateProductQuantity(newQuantity, updatedSale)
        } else if (requestedProduct.quantity <= res.quantity) {
            console.log('We do not have the amount you require in stock. Sorry!');
            connection.end();
        }
    })
}

displayItems();