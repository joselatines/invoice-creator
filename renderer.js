/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('db/clients.db');

// utils
const setDateFormat = (currentDate, format) => {
	const map = {
		dd: currentDate.getDate(),
		mm: currentDate.getMonth() + 1,
		yy: currentDate.getFullYear().toString().slice(-2),
		yyyy: currentDate.getFullYear(),
	};

	return format.replace(/dd|mm|yy|yyy/gi, matched => map[matched]);
};

// classes
export class DatabaseManager {
	constructor(dbName) {
		this._db = new sqlite3.Database(dbName);
	}

	async search(valueToSearch, keyToSearch, table) {
		return new Promise((resolve, reject) => {
			const query = `SELECT * FROM ${table} WHERE ${keyToSearch} LIKE ?`;
			// Append % to valueToSearch to represent any number of characters
			const searchValue = `%${valueToSearch}%`;
			this._db.get(query, [searchValue], (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	}

	// Function to create Customers and Invoices tables
	createTables() {
		this._db.serialize(() => {
			// Create the "Customers" table
			this._db.run(
				`CREATE TABLE IF NOT EXISTS Customers (
          ci TEXT UNIQUE NOT NULL,
          full_name TEXT,
          PRIMARY KEY("ci")
        )`,
				err => {
					if (err) {
						console.error(err);
					} else {
						console.log('Customers table created successfully');
					}
				}
			);

			// Create the "Invoices" table
			this._db.run(
				`CREATE TABLE IF NOT EXISTS Invoices (
          id TEXT NOT NULL UNIQUE,
          date TEXT,
          products TEXT,
          customer_ci TEXT,
          FOREIGN KEY (customer_ci) REFERENCES Customers(ci),
          PRIMARY KEY (id)
        )`,
				err => {
					if (err) {
						console.error(err);
					} else {
						console.log('Invoices table created successfully');
					}
				}
			);
		});
	}

	createCustomer(client) {
		try {
			const query = `INSERT INTO Customers (ci, full_name) VALUES (?, ?)`;
			const ci = client.idCard;
			const fullName = client.clientName;

			const uniqueCiQuery = `SELECT COUNT(*) as count FROM Customers WHERE ci = ?`;
			this._db.get(uniqueCiQuery, [ci], (err, res) => {
				if (res.count > 0) {
					console.log(
						`Customer with ci ${ci} already exists in the database so is not created again`
					);
					return;
				}

				this._db.run(query, [ci, fullName]);

				if (err) {
					throw Error(err.message);
				}
			});
		} catch (error) {
			console.error(error);
			console.error(error.message);
		}
	}

	createInvoice(invoice) {
		try {
			const query = `INSERT INTO Invoices (id, date, customer_ci, products) VALUES (?, ?, ?, ?)`;
			const id = invoice.id;
			const date = invoice.date;
			const customerCi = invoice.customerIdCard;
			const products = invoice.products;
			var productsTextFormat = '';
			products.forEach(element => {
				productsTextFormat += `PRODUCTO: ${element.name} - UND: ${element.qty} - PRECIO: $${element.price} \n`;
			});

			productsTextFormat += `TOTAL: $${invoice.total}`;

			this._db.run(query, [
				id,
				date,
				customerCi,
				productsTextFormat,
			]);
		} catch (error) {
			console.error(error);
			console.error(error.message);
		}
	}
}

// Create an instance of DatabaseManager and call createTables() when the app is opened
const db = new DatabaseManager('database.db');
db.createTables();

class Customer {
	constructor(clientName, idCard) {
		if (!idCard || idCard.length < 3) {
			throw new Error('Cédula es requerido');
		}
		// this._id = self.crypto.randomUUID();
		this._clientName = clientName;
		this._idCard = idCard;
	}

	get clientName() {
		return this._clientName;
	}

	get idCard() {
		return this._idCard;
	}

	get id() {
		return this._id;
	}

	_capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
}

class Invoice {
	constructor(customer, products, date = null) {
		if (!customer || !products || products.length < 1) {
			throw new Error('Cliente y productos son requeridos');
		}

		if (!date) {
			const today = new Date();

			date = setDateFormat(today, 'dd/mm/yy');
		}

		this._id = self.crypto.randomUUID();
		this._customer = customer;
		this._products = products;
		this._date = date;
		this._total = 0;
		this._calculateTotal();
	}

	get id() {
		return this._id;
	}

	get customer() {
		return this._customer;
	}

	get customerFullName() {
		return this._customer.clientName;
	}

	// ci
	get customerIdCard() {
		return this._customer.idCard;
	}

	get products() {
		return this._products;
	}

	get date() {
		return this._date;
	}

	_calculateTotal() {
		this._products.forEach(product => {
			this._total += +product.price;
		});
		return this._total;
	}

	get total() {
		return this._total;
	}
}

class Product {
	constructor(name, price, qty) {
		const requiredFields = [name, price, qty];

		if (requiredFields.some(field => !field)) {
			throw new Error('Nombre, precio, y cantidad es requerido');
		}
		this._id = self.crypto.randomUUID();
		this._name = name;
		this._price = price;
		this._qty = qty;
	}

	get name() {
		return this._name;
	}

	get price() {
		return this._price;
	}

	get qty() {
		return this._qty;
	}

	get id() {
		return this._id;
	}
}

let products = [];
let invoiceDate = null;

// DOM elements
const productForm = document.getElementById('productForm');
const errorsContainer = document.getElementById('errors');
const invoiceContainer = document.getElementById('invoiceContainer');
const checkBoxSaveDB = document.getElementById('saveInDB');
const dateInput = document.getElementById('date');
const customerIdCard = document.getElementById('customerIdCard');
const customerButtonSuggestion = document.getElementById('customerSuggestion');
const createOrderButton = document.getElementById('createOrder');
const customerName = document.getElementById('customerName');

const printInvoice = async invoice => {
	try {
		const productRows = invoice.products.map(
			product => `
			<tr>
				<td>${product.qty}</td>
				<td>${product.name}</td>
				<td>$${product.price}</td>
			</tr>
		`
		);

		const productsTableHtml = `
			<table class="table">
				<thead>
					<tr>
						<th scope="col">UND</th>
						<th scope="col">PRODUCTO</th>
						<th scope="col">PRECIO</th>
					</tr>
				</thead>
				<tbody>
					${productRows.join('')}
				</tbody>
			</table>
		`;

		const invoiceHtml = `<div class="container">
		<div class="row">
			<div class="col-4">
				<img src="./logo.jpg" alt="Moto Garcia Logo" width="100" height="100">
			</div>
			<div class="col-4 text-center">
				<h2>Datos de empresa</h2>
				<h3>Repuestos Moto Garcia</h3>
				<p class="font-weight-bold">RIF: <p class="font-weight-normal">DTM3CG J-41287312-1</p></p>
				<p class="font-weight-bold">Contacto: <p class="font-weight-normal">0414-9112993</p></p>
				<p class="font-weight-bold">Ubicación: <p class="font-weight-normal">Av Sucre a 100mts del Palacio de Miraflores</p></p>
			</div>
			<div class="col-4 text-right">
				<h5>Factura</h5>
				<p>Fecha: <span id="invoiceDate">${invoice.date}</span></p>
			</div>
		</div>
		<hr>
		<div class="row">
			<div class="col-6">
				<h5>Información de cliente</h5>
				<p class="font-weight-bold">Cliente: <span class="font-weight-normal" id="customerName">${invoice.customerFullName}</span></p>
				<p class="font-weight-bold">Cédula: <span class="font-weight-normal" id="customerId">${invoice.customerIdCard}</span></p>
			</div>
		</div>
		<br>
		<div class="row">
			<div class="col-12">
			${productsTableHtml}
			</div>
		</div>
		<div class="row">
			<div class="col-6">
			</div>
			<div class="col-6">
				<table class="table">
					<tbody>
						<tr>
							<td><strong>TOTAL USD: $${invoice.total}</strong></td>
							<td><span id="totalUSD"></span></td>
						</tr>
						<tr>
							<td><strong>TOTAL BS:</strong></td>
							<td><span id="totalBS"></span></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>`;

		const printWindow = window.open('', 'Print-Window');
		printWindow.document.write(`
			<html>
				<head>
				<title>Invoice</title>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
				<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
				<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
				<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
				<style type="text/css">
					body {
						padding: 20px;
					}
				</style>
				</head>
				<body onload="window.print();window.close()">${invoiceHtml}</body>
			</html>
		`);
		printWindow.document.close();

		if (checkBoxSaveDB.checked) {
			db.createCustomer(invoice.customer); // create customer to db
			db.createInvoice(invoice); // then create the invoice
		}
	} catch (error) {
		errorsContainer.innerHTML = error.message;
		console.error(error);
	}
};

const setDate = e => {
	e.preventDefault();

	const date = e.target.value;
	const currentDate = new Date(date);

	invoiceDate = setDateFormat(currentDate, 'dd/mm/yy');
};

const createProduct = event => {
	event.preventDefault();
	const form = event.target;
	const name = form.name.value;
	const price = form.price.value;
	const qty = form.qty.value;

	try {
		const product = new Product(name, price, qty);
		products.push(product);
		renderProducts();
	} catch (error) {
		errorsContainer.innerHTML = error.message;
		console.error(error);
	}
};

const createOrder = () => {
	try {
		const customer = new Customer(customerName.value, customerIdCard.value);

		const invoice = new Invoice(customer, products, invoiceDate);
		printInvoice(invoice);
	} catch (error) {
		errorsContainer.innerHTML = error.message;
		console.error(error);
	}
};

const editProduct = e => {
	/* 	const product = products[index];
	const form = document.getElementById('productForm');
	form.name.value = product.name;
	form.price.value = product.price;
	form.qty.value = product.qty;
	products.splice(index, 1); */
	renderProducts();
};

const deleteProduct = e => {
	const productId = e.target.id;
	const index = products.findIndex(obj => obj.id === productId);

	if (index !== -1) {
		products.splice(index, 1);
	}

	renderProducts();
};

const renderProducts = () => {
	const productsContainer = document.getElementById('productsContainer');

	let currentTotal = 0;
	const calculateTotal = () => {
		products.forEach(product => {
			currentTotal += +product.price;
		});
		return currentTotal;
	};

	// <button class="btn btn-warning editProduct" id="${product.id}">Edit</button>
	const productRows = products.map(
		product => `
    <tr>
      <td>${product.qty}</td>
      <td>${product.name}</td>
      <td>$${product.price}</td>
      <td>
        
        <button class="btn btn-danger deleteProduct" id="${product.id}">Delete</button>
      </td>
    </tr>
  `
	);

	const htmlTemplate = `
	<div>
		<h2 id="totalAmount">Total USD: ${calculateTotal()}$</h2>
	</div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Description</th>
          <th scope="col">Price</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        ${productRows.join('')}
      </tbody>
    </table>
  `;

	productsContainer.innerHTML = htmlTemplate;

	const editProductButtons = document.querySelectorAll('.editProduct');
	const deleteProductButtons = document.querySelectorAll('.deleteProduct');

	// adding the event listener by looping
	editProductButtons.forEach(button => {
		button.addEventListener('click', editProduct);
	});

	// adding the event listener by looping
	deleteProductButtons.forEach(button => {
		button.addEventListener('click', deleteProduct);
	});
};

const searchCiDB = async e => {
	const searchValue = e.target.value;
	const customersTable = 'Customers';

	try {
		const customer = await db.search(searchValue, 'ci', customersTable);
		if (customer) {
			const customerText = `${customer.full_name} ${customer.ci}`;

			customerButtonSuggestion.setAttribute(
				'data-fullName',
				customer.full_name
			);
			customerButtonSuggestion.setAttribute('data-ci', customer.ci);
			customerButtonSuggestion.innerHTML = customerText;
		} else {
			customerButtonSuggestion.innerHTML = ''; // Clear the element if no customer is found
			customerButtonSuggestion.setAttribute('data-fullName', '');
			customerButtonSuggestion.setAttribute('data-ci', '');

			console.log('No customer found for search value:', searchValue);
		}
	} catch (err) {
		console.error('Error searching for customer:', err);
	}
};

const fillCustomerInputs = () => {
	const customerSuggestion = customerButtonSuggestion.innerHTML;
	console.log(customerSuggestion);
	console.log('Fire!');
	if (customerSuggestion !== '') {
		console.log('Here');
		const customerFullName =
			customerButtonSuggestion.getAttribute('data-fullName');
		const customerCi = customerButtonSuggestion.getAttribute('data-ci');
		customerName.value = customerFullName;
		customerIdCard.value = customerCi;
	}
};

customerButtonSuggestion.addEventListener('click', fillCustomerInputs);
dateInput.addEventListener('change', setDate);
productForm.addEventListener('submit', createProduct);
createOrderButton.addEventListener('click', createOrder);
customerIdCard.addEventListener('keypress', searchCiDB);
