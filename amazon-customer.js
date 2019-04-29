

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
        console.log(res);

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
    connection.query("UPDATE products SET ? WHERE ?",
    [
        {
            stock_quantity: newQuantity
        },
        {
            product_sales: updatedSale
        },
        {
            product_name: requestedProduct.product
        }
    ],
    function(err, snap) {
        if (err) throw err;
        console.log(snap.affectedRows + " products updated!\n");
    })
};

function productQuery(res) {
    console.log("Checking for availability...\n");
    connection.query("SELECT * FROM products", function(err, data) {
        // if (err) throw err;

        for (var index in data) {
            if (data[index].product_name == res.item) {
                
                requestedProduct = new ProductRequest(
                    data[index].product_name,
                    data[index].price,
                    data[index].stock_quantity,
                    data[index].product_sales,
                    [index]
                )
                console.log(requestedProduct.quantity)
            }
        }
        if (requestedProduct.quantity > res.quantity) {
            
            var updatedSale = res.quantity * requestedProduct.price
            console.log('Your total: ' + res.quantity * requestedProduct.price);
            
            var newQuantity = parseInt(requestedProduct.quantity) - parseInt(res.quantity);
            console.log(newQuantity);
            
            updateProductQuantity(newQuantity, updatedSale)
            connection.end();

        } else if (requestedProduct.quantity <= res.quantity) {
            
            console.log('We do not have the amount you require in stock. Sorry!');
            connection.end();
        }
    })
}

connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    displayItems();
})


