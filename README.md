# Invoice APP

This app allows the user to create an invoice by filling in a form with customer and product information. The invoice is then generated and displayed on the page and you can select if you want to save the invoice on a database managed by SQLite3.

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

## Explanation

I created this app for my previous job where I worked at a store. At that time, we didn't have a proper system for managing invoices, and we relied on using an Excel file to create invoices. However, as you can imagine, this approach had limitations as we weren't able to efficiently store and manage customer invoice information. This often resulted in challenges and problems in maintaining accurate records of customer invoices, which impacted our business operations.
