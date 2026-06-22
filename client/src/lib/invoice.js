import { compactAddress, formatDate } from './format.js';

const money = (paise = 0) =>
  `INR ${(Number(paise || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const clean = (value, fallback = '-') => String(value || fallback);

const invoiceRows = (order) => [
  ['Subtotal', money(order.subtotalPaise)],
  ['GST', money(order.gstPaise)],
  ['Delivery', Number(order.deliveryPaise || 0) ? money(order.deliveryPaise) : 'Free'],
  ['Grand Total', money(order.totalAmountPaise)]
];

export const downloadInvoicePdf = async (order) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 42;
  let y = 44;

  const addText = (text, x, nextY, options = {}) => {
    doc.text(String(text), x, nextY, options);
    return nextY;
  };

  const addLabelValue = (label, value, x, nextY, width = 220) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(82, 62, 45);
    doc.text(label, x, nextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(32, 26, 20);
    const lines = doc.splitTextToSize(clean(value), width);
    doc.text(lines, x, nextY + 16);
    return nextY + 22 + lines.length * 12;
  };

  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  addText('KING MOPS', margin, y);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  addText('Sri Tirumala Products, Hyderabad, India', margin, y + 20);
  addText('crowdbuzz.company@gmail.com | +91 93924 78344', margin, y + 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  addText('INVOICE', pageWidth - margin, y + 12, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Invoice No: ${clean(order.id)}`, pageWidth - margin, y + 30, { align: 'right' });
  addText(`Date: ${formatDate(order.createdAt)}`, pageWidth - margin, y + 46, { align: 'right' });

  y = 128;
  doc.setDrawColor(237, 217, 198);
  doc.setFillColor(255, 250, 244);
  doc.roundedRect(margin, y - 18, pageWidth - margin * 2, 118, 8, 8, 'FD');
  y = addLabelValue('Bill To', order.customerName, margin + 18, y, 215);
  y = addLabelValue('Mobile', order.phone, margin + 18, y, 215);
  y = 128;
  y = addLabelValue('Delivery Address', compactAddress(order.address), pageWidth / 2, y, 230);
  y = addLabelValue('Payment', `${clean(order.paymentStatus)} via ${clean(order.paymentMethod)}`, pageWidth / 2, y, 230);

  y = 282;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(32, 26, 20);
  doc.text('Products Ordered', margin, y);

  y += 20;
  const columns = [
    { label: 'Item', x: margin + 12, width: 250 },
    { label: 'Qty', x: margin + 330, width: 36 },
    { label: 'Rate', x: margin + 390, width: 72 },
    { label: 'Amount', x: pageWidth - margin - 8, width: 90, align: 'right' }
  ];
  doc.setFillColor(35, 29, 23);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  columns.forEach((column) => doc.text(column.label, column.x, y + 20, { align: column.align || 'left' }));
  y += 44;

  doc.setTextColor(32, 26, 20);
  doc.setFont('helvetica', 'normal');
  (order.items || []).forEach((item, index) => {
    const rowHeight = 38;
    if (y + rowHeight > 720) {
      doc.addPage();
      y = 52;
    }
    if (index % 2 === 0) {
      doc.setFillColor(255, 250, 244);
      doc.rect(margin, y - 14, pageWidth - margin * 2, rowHeight, 'F');
    }
    const nameLines = doc.splitTextToSize(clean(item.name), columns[0].width);
    doc.text(nameLines, columns[0].x, y);
    doc.text(String(item.quantity || 1), columns[1].x, y);
    doc.text(money(item.pricePaise), columns[2].x, y);
    doc.text(money(Number(item.pricePaise || 0) * Number(item.quantity || 1)), columns[3].x, y, {
      align: 'right'
    });
    y += Math.max(rowHeight, nameLines.length * 14 + 12);
  });

  y += 18;
  const totalsX = pageWidth - margin - 210;
  doc.setDrawColor(237, 217, 198);
  doc.line(totalsX, y - 10, pageWidth - margin, y - 10);
  invoiceRows(order).forEach(([label, value], index) => {
    doc.setFont('helvetica', index === 3 ? 'bold' : 'normal');
    doc.setFontSize(index === 3 ? 13 : 11);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += index === 2 ? 24 : 18;
  });

  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Payment Reference', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Razorpay Payment ID: ${clean(order.razorpayPaymentId)}`, margin, y + 16);
  doc.text(`Razorpay Order ID: ${clean(order.razorpayOrderId)}`, margin, y + 32);

  doc.setDrawColor(237, 217, 198);
  doc.line(margin, 760, pageWidth - margin, 760);
  doc.setFontSize(9);
  doc.setTextColor(101, 88, 78);
  doc.text(
    'This computer-generated invoice is issued for the paid order. All sales are subject to King Mops Terms and Conditions.',
    margin,
    778
  );
  doc.text('Thank you for shopping with King Mops.', pageWidth - margin, 778, { align: 'right' });

  doc.save(`King-Mops-Invoice-${order.id}.pdf`);
};
