

var mysql = require('mysql');
var inquirer = require('inquirer');

var updatedName;
var updatedQuantity;
var productList = []

var firstQuestion = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Quit']

var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'famazon'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
});

function productsForSale(AddToInventoryQueue) {
    connection.query('SELECT * FROM products', function(err, res) {
        productList = []
        for (var index in res) {
            productList.push(res[index].product_name)
        }
        console.log(res)
        if (AddToInventoryQueue) {
            AddToInventoryQueue()
        } else {
            restartMenu()
        }
    })
}

function viewLowInventory() {
    connection.query('SELECT * FROM products', function(err, res) {
        for (var index in res) {
            if (res[index].stock_quantity <= 10) {
                console.log(`
                __________________________________________________
                ProductID:  ${res[index].id}
                Product Name:   ${res[index].product_name}
                Dept Name:  ${res[index].dept_name}
                Price:  ${res[index].price}
                Quantity:   ${res[index].stock_quantity}
                __________________________________________________
                `)
            }
        }
        restartMenu()
    })
}

function AddToInventory(res) {
    connection.query('UPDATE products SET ? WHERE ?', 
    [
        {stock_quantity: res.quantity},
        {product_name: res.name}
    ],
    function(err, response) {
        if (err) throw err;
        console.log(response.affectedRows + " products updated!\n");
        restartMenu()
    })
}

function AddToInventoryQueue() {
    inquirer.prompt([
        {
            type: 'list',
            message: "Which product's inventory would you like to add to?",
            choices: productList,
            name: 'name'
        },
        {
            type: 'input',
            message: "How much will the new inventory be?",
            name: 'quantity'
        }
    ]).then(function(res) {
        AddToInventory(res)
    })
}

function addNewProduct(res) {
    console.log("Inserting a new product!\n");
    connection.query('INSERT INTO products SET ?',
        {
            product_name: res.name,
            dept_name: res.dept_name,
            price: res.price,
            stock_quantity: res.quantity,
            product_sales: sales
        },
        function(err, response) {
            console.log(response.affectedRows + ' product inserted!\n');
            restartMenu()
        }
    );
}

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            choices: firstQuestion,
            name: 'task'
        }
    ]).then(function(res) {
    
        if (res.task == firstQuestion[0]) {
            productsForSale()
        } else if (res.task == firstQuestion[1]) {
            viewLowInventory()
        } else if (res.task == firstQuestion[2]) {
            
            productsForSale(AddToInventoryQueue)
            
        } else if (res.task == firstQuestion[3]) {
            inquirer.prompt([
                {
                    type: 'input',
                    message: "What's the name of the new product?",
                    name: 'name'
                },
                {
                    type: 'input',
                    message: "What's the name of the department the product belongs to?",
                    name: 'dept_name'
                },
                {
                    type: 'input',
                    message: "What's the price of the new product?",
                    name: 'price'
                },
                {
                    type: 'input',
                    message: "What will the quantity of the new product?",
                    name: 'quantity'
                },
            ]).then(function(res) {
                var sales = Math.floor(Math.random() * 1000)
                addNewProduct(res, sales);
            })
        } else if (res.task == firstQuestion[4]) {
            connection.end();
        }
    })
}

function restartMenu() {
    inquirer.prompt([
        {
            type: 'confirm',
            message: "Would like to continue?",
            default: true,
            name: 'continue'
        }
    ]).then(function(res) {
        if (res.continue) {
            mainMenu()
        } else if (!res.continue) {
            connection.end();
        }
    })
}

mainMenu()