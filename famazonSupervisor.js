var mysql = require('mysql');
var inquirer = require('inquirer');
const {table} = require('table');

var startMenuOptions = ['View Product Sales by Department', 'Create New Department', 'Exit']
var salesQuery = '' 
var salesIndex = []
var salesObj = []
var totalProfit = []
var data = [
    ['Dept ID', 'Dept Name', 'Over Head Costs', 'Product Sales', 'Total Profit'],
];

function NewSalesObj(dept, sales) {
    this.dept = dept
    this.sales = sales
}

var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'famazon'
});

function totalProfitCalc() {
    connection.query('SELECT dept_id, over_head_costs FROM departments', function(err, res) {
        for (var i = 0; i < res.length; i++) {
            
            salesObj[i].totalProfit = salesObj[i].sales - res[i].over_head_costs
            salesObj[i].dept_id = res[i].dept_id
            salesObj[i].over_head = res[i].over_head_costs
            data[i + 1] = [salesObj[i].dept_id, salesObj[i].dept, salesObj[i].over_head, salesObj[i].sales, salesObj[i].totalProfit]
        }
        output = table(data);
        console.log(output);
        startMenu()
    })
}

function queryBuilder() {
    connection.query('SELECT dept_name FROM departments', function(err, res) {
        console.log(res)
        for (var i = 0; i < res.length; i++) {
            if (i + 1 == res.length) {
                salesQuery += 'SELECT SUM(product_sales) AS TotalSales FROM products WHERE dept_name="' + res[i].dept_name + '"';
                salesIndex.push(res[i].dept_name);
            } else {
                salesQuery += 'SELECT SUM(product_sales) AS TotalSales FROM products WHERE dept_name="' + res[i].dept_name + '" UNION ';
                salesIndex.push(res[i].dept_name);
            }   
        }
        console.log('TESTTTTT' + salesQuery)
        productSales()
    })
}

function productSales() {
    connection.query(salesQuery, function(err, response) {
        for (var i = 0; i < response.length; i++) {
            salesObj[i] = new NewSalesObj(salesIndex[i], response[i].TotalSales)
        }
        totalProfitCalc()
        console.log(salesObj)
    })
}

function newDepartment(res) {
    connection.query('INSERT INTO departments SET ?',
    {
        dept_name: res.name,
        over_head_costs: res.costs
    }, function(err, response) {
        if (err) throw err;
        console.log('New Department Created!')
        startMenu()
    })
}

function startMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: "Menu Options",
            choices: startMenuOptions,
            name: 'options'
        }
    ]).then(function(res) {
        if (res.options == startMenuOptions[0]) {
            queryBuilder()
        } else if (res.options == startMenuOptions[1]) {
            inquirer.prompt([
                {
                    type: 'input',
                    message: "What's the name of the new department?",
                    name: 'name'
                },
                {
                    type: 'input',
                    message: "What're the over head costs?",
                    name: 'costs'
                }
            ]).then(function(res) {
                newDepartment(res)
            })
        } else if (res.options == startMenuOptions[2]) {
            connection.end()
        } 
    })
}

startMenu()