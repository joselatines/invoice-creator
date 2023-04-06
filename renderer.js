/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// classes
class Customer {
	constructor(clientName, idCard) {
		if (!idCard || idCard.length < 3) {
			throw new Error('Cédula es requerido');
		}
		this._id = self.crypto.randomUUID();
		this._clientName = clientName;
		this._idCard = idCard;
	}

	get clientName() {
		return this._capitalizeFirstLetter(this._clientName);
	}

	get idCard() {
		return this._idCard;
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

			const setDateFormat = (currentDate, format) => {
				const map = {
					dd: currentDate.getDate(),
					mm: currentDate.getMonth() + 1,
					yy: currentDate.getFullYear().toString().slice(-2),
					yyyy: currentDate.getFullYear(),
				};

				return format.replace(/dd|mm|yy|yyy/gi, matched => map[matched]);
			};

			date = setDateFormat(today, 'dd/mm/yy');
		}

		this.id = self.crypto.randomUUID();
		this._customer = customer;
		this._products = products;
		this._date = date;
		this._total = 0;
		this._calculateTotal();
	}

	get customerFullName() {
		return this._customer.clientName;
	}

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
			this._total += product.price * product.qty;
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
const customerForm = document.getElementById('customerForm');
const productForm = document.getElementById('productForm');
const errorsContainer = document.getElementById('errors');
const invoiceContainer = document.getElementById('invoiceContainer');
const dateInput = document.getElementById('date');

const createOrderButton = document.getElementById('createOrder');

const printInvoice = invoice => {
	const productRows = invoice.products.map(
		product => `
    <tr>
      <td>${product.qty}</td>
      <td>${product.name}</td>
      <td>${product.price}</td>
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
						<td><strong>Total USD: $${invoice.total}</strong></td>
						<td><span id="totalUSD"></span></td>
					</tr>
					<tr>
						<td><strong>Total BS:</strong></td>
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
};

const setDate = e => {
	e.preventDefault();

	const date = e.target.value;
	console.log(date)
	invoiceDate = date;
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
	const customerName = document.getElementById('customerName').value;
	const customerIdCard = document.getElementById('customerIdCard').value;
	try {
		const customer = new Customer(customerName, customerIdCard);

		const invoice = new Invoice(customer, products, invoiceDate);
		printInvoice(invoice);
	} catch (error) {
		errorsContainer.innerHTML = error.message;
		console.error(error);
	}
};

const editProduct = e => {
	console.log(e.target.id);
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
			currentTotal += product.price * product.qty;
		});
		return currentTotal;
	};

	const productRows = products.map(
		product => `
    <tr>
      <td>${product.qty}</td>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>
        <button class="btn btn-warning editProduct" id="${product.id}">Edit</button>
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

dateInput.addEventListener('change', setDate);
productForm.addEventListener('submit', createProduct);
createOrderButton.addEventListener('click', createOrder);
