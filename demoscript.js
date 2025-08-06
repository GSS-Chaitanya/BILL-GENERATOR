let billItems = [];

function toggleCategory(categoryId) {
  // Get the products div and the clicked category div
  const productsElement = document.getElementById(categoryId);
  const categoryElement = document.querySelector(`.category[onclick="toggleCategory('${categoryId}')"]`);

  if (productsElement && categoryElement) {
    // Close all other categories
    document.querySelectorAll('.category').forEach(cat => {
      if (cat !== categoryElement) {
        cat.classList.remove('open');
        const otherProductsId = cat.getAttribute('onclick').match(/'([^']+)'/)[1];
        const otherProducts = document.getElementById(otherProductsId);
        if (otherProducts) otherProducts.classList.add('hidden');
      }
    });

    // Toggle the clicked category
    const isHidden = productsElement.classList.toggle('hidden');
    categoryElement.classList.toggle('open', !isHidden);
  } else {
    console.error(`Element with ID ${categoryId} or category element not found`);
  }
}

function updateQuantity(inputId, change) {
  const input = document.getElementById(inputId);
  if (input) {
    let value = parseInt(input.value) + change;
    if (value < 1) value = 1;
    input.value = value;
  }
}

function addToBill(productName, price, qtyId) {
  const qtyInput = document.getElementById(qtyId);
  const quantity = parseInt(qtyInput.value);
  const total = price * quantity;

  const existingItem = billItems.find(item => item.name === productName);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total += total;
  } else {
    billItems.push({ name: productName, quantity, price, total });
  }

  updateBillTable();
  showNotification(`Added ${productName} to bill`, 'success');
}

function updateBillTable() {
  const billTableBody = document.getElementById('billTableBody');
  const emptyBillMessage = document.getElementById('emptyBillMessage');
  const grandTotalElement = document.getElementById('grandTotal');

  billTableBody.innerHTML = '';
  if (billItems.length === 0) {
    emptyBillMessage.style.display = 'block';
    grandTotalElement.textContent = 'Grand Total: ₹0';
    return;
  }

  emptyBillMessage.style.display = 'none';
  let grandTotal = 0;

  billItems.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.total}</td>
      <td><button class="remove-btn" onclick="removeFromBill(${index})"><i class="fas fa-trash"></i></button></td>
    `;
    billTableBody.appendChild(row);
    grandTotal += item.total;
  });

  grandTotalElement.textContent = `Grand Total: ₹${grandTotal}`;
}

function removeFromBill(index) {
  const itemName = billItems[index].name;
  billItems.splice(index, 1);
  updateBillTable();
  showNotification(`Removed ${itemName} from bill`, 'error');
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.text('Srinivasa Hardwares - Bill', 10, 10);
  doc.autoTable({
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: billItems.map(item => [item.name, item.quantity, `₹${item.price}`, `₹${item.total}`]),
    startY: 20
  });
  
  const grandTotal = billItems.reduce((sum, item) => sum + item.total, 0);
  doc.text(`Grand Total: ₹${grandTotal}`, 10, doc.lastAutoTable.finalY + 10);
  doc.save('bill.pdf');
  showNotification('PDF generated successfully', 'success');
}

function generateExcel() {
  const ws_data = [
    ['Product', 'Qty', 'Price', 'Total'],
    ...billItems.map(item => [item.name, item.quantity, item.price, item.total])
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bill');
  XLSX.writeFile(wb, 'bill.xlsx');
  showNotification('Excel generated successfully', 'success');
}

function clearBill() {
  billItems = [];
  updateBillTable();
  showNotification('Bill cleared', 'info');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToCategories(section) {
  let selector;
  switch (section) {
    case 'hardware':
      selector = '#hardware';
      break;
    case 'electrical':
      selector = '#electrical';
      break;
    case 'plumbing':
      selector = '#plumbing';
      break;
    default:
      selector = '.categories';
  }
  document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
}

function scrollToBill() {
  document.querySelector('.bill-section').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${message}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker Registered'))
    .catch(err => console.log('Service Worker Failed', err));
}
