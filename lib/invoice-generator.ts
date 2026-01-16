import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './types';

export const generateInvoice = (order: Order, profile: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(22);
    doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });

    doc.setFontSize(16);
    doc.text('Matoshree', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Fashion Street, Mumbai, MH - 400001', 20, 28);
    doc.text('GSTIN: 27ABCDE1234F1Z5', 20, 33);
    doc.text('Phone: +91 98765 43210', 20, 38);

    // Bill To
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 55);

    const addr = order.address || {};
    const name = addr.name || profile.business_name || profile.full_name || 'Valued Customer';
    const phone = addr.phone || profile.phone || 'N/A';
    const addressLine = addr.address_line ? `${addr.address_line}, ${addr.city}` : (profile.shop_address || 'Address N/A');
    const location = addr.state ? `${addr.state} - ${addr.pincode}` : '';

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(name, 20, 62);
    if (profile.gst_number) doc.text(`GSTIN: ${profile.gst_number}`, 20, 67);
    doc.text(`Phone: ${phone}`, 20, 72);
    doc.text(addressLine, 20, 77);
    if (location) doc.text(location, 20, 82);

    // Invoice Details
    doc.text(`Invoice No: ${order.invoice_number || order.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 62, { align: 'right' });
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, pageWidth - 20, 67, { align: 'right' });
    if (order.po_number) doc.text(`PO Number: ${order.po_number}`, pageWidth - 20, 72, { align: 'right' });

    // Table
    const tableRows = order.items?.map((item: any) => [
        item.product?.name || 'Product',
        item.size,
        item.quantity,
        (item.price || 0).toFixed(2),
        (item.quantity * (item.price || 0)).toFixed(2)
    ]);

    (doc as any).autoTable({
        startY: 90,
        head: [['Item', 'Size', 'Qty', 'Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [63, 63, 70] },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text('Subtotal:', pageWidth - 60, finalY);
    doc.text(`₹${order.total_amount.toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });

    doc.text('Tax (18% GST):', pageWidth - 60, finalY + 7);
    const tax = order.total_amount * 0.18; // Assuming inclusive or exclusive logic, illustrative
    doc.text(`₹${tax.toFixed(2)}`, pageWidth - 20, finalY + 7, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', pageWidth - 60, finalY + 16);
    doc.text(`₹${(order.total_amount + tax).toFixed(2)}`, pageWidth - 20, finalY + 16, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });

    doc.save(`Invoice_${order.id.slice(0, 8)}.pdf`);
};
