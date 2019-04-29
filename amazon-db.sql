DROP DATABASE IF EXISTS famazon;

CREATE DATABASE famazon;

USE famazon;

CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30) NOT NULL,
    dept_name VARCHAR(30) NOT NULL,
    price INTEGER(10) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    product_sales INTEGER(11) NOT NULL,
    PRIMARY KEY (id)
)

INSERT INTO products (product_name, dept_name, price, stock_quantity, product_sales)
VALUE ('Sekiro', 'Electronics', 60, 50, 250);

INSERT INTO products (product_name, dept_name, price, stock_quantity, product_sales)
VALUE ('Persona5', 'Electronics', 60, 50, 450);

INSERT INTO products (product_name, dept_name, price, stock_quantity, product_sales)
VALUE ('WorldofWarcraft', 'Electronics', 60, 50, 1000);

CREATE TABLE departments (
    dept_id INTEGER NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    over_head_costs INTEGER(11) NOT NULL,
    PRIMARY KEY (dept_id)
);

INSERT INTO departments (dept_name, over_head_costs)
VALUE ('Electronics', 500);

INSERT INTO departments (dept_name, over_head_costs)
VALUE ('Tools', 1000);
