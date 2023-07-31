# Invoice APP

The Invoice Creator app streamlines the process of generating invoices by providing a user-friendly form to input customer and product information. Once filled, the app generates and displays the invoice on the page. Additionally, users have the option to save the invoices on a database managed by SQLite3 for convenient retrieval and management.

I developed this app during my time at a motorcycle parts store, where we faced challenges due to the lack of a proper invoice management system. Relying on an Excel file proved inefficient and hindered our ability to maintain accurate customer records, affecting our business operations.

## App overview
![App screenshot](/assets/screenshot1.JPG)
![App screenshot 2](/assets/screenshot2.JPG)
![App overview](/assets/overview.gif)

## 🚀 Features 🚀
- CRUD (Create, Read, Update, Delete) functionality for products.
- Create PDF files for generated invoices.
- Save invoices on a database using SQLite3. 

## Classes

The app comprises three main classes:

### Customer

Represents a customer and contains the following properties:

clientName: the name of the customer
idCard: the ID card number of the customer

### Invoice

Represents an invoice and contains the following properties:

customer: the customer associated with the invoice (an instance of the Customer class)
products: an array of products associated with the invoice (instances of the Product class)
date: the date the invoice was created
total: the total amount of the invoice
Product
Represents a product and contains the following properties:

name: the name of the product
price: the price of the product
qty: the quantity of the product

## 🤖 Technologies 🤖
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) 

