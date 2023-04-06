# Invoice APP

This simple app allows the user to create an invoice by filling in a form with customer and product information. The invoice is then generated and displayed on the page.

## Classes

The app contains three classes:

## Customer

Represents a customer and contains the following properties:

clientName: the name of the customer
idCard: the ID card number of the customer

## Invoice

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
