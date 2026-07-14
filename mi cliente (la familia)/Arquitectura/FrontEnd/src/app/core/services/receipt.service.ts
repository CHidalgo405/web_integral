import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

// jsPDF se carga con import dinámico para no engordar el bundle inicial;
// solo se descarga cuando el usuario pide su primer recibo.

@Injectable({ providedIn: 'root' })
export class ReceiptService {

  async downloadReceipt(order: Order): Promise<void> {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const right = pageWidth - margin;
    let y = 22;

    const money = (n: number) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

    // ---- Encabezado ----
    doc.setFillColor(27, 61, 50);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('La Familia', margin, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Tiendita Maday · Recibo de compra', margin, 22);
    doc.setFontSize(9);
    doc.text(`Pedido: ${order.id}`, right, 15, { align: 'right' });
    doc.text(
      new Date(order.createdAt).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }),
      right, 22, { align: 'right' },
    );

    y = 46;
    doc.setTextColor(40, 40, 40);

    // ---- Cliente y entrega ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Datos de entrega', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const addr = order.shippingAddress;
    const addressLines = [
      addr.fullName,
      `${addr.street} ${addr.exteriorNumber}${addr.interiorNumber ? ', Int. ' + addr.interiorNumber : ''}`,
      [addr.neighborhood, addr.city, addr.state].filter(Boolean).join(', '),
      addr.zipCode ? `CP ${addr.zipCode}` : '',
      addr.phone ? `Tel: ${addr.phone}` : '',
    ].filter((line) => line && line.trim() !== '');
    addressLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 5;
    });

    // Método de pago / envío a la derecha
    let yRight = 52;
    doc.setFont('helvetica', 'bold');
    doc.text('Pago:', 120, yRight);
    doc.setFont('helvetica', 'normal');
    doc.text(this.paymentLabel(order), 140, yRight);
    yRight += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Envío:', 120, yRight);
    doc.setFont('helvetica', 'normal');
    doc.text(this.shippingLabel(order), 140, yRight);
    yRight += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', 120, yRight);
    doc.setFont('helvetica', 'normal');
    doc.text(this.statusLabel(order), 140, yRight);
    if (order.trackingNumber) {
      yRight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Guía:', 120, yRight);
      doc.setFont('helvetica', 'normal');
      doc.text(order.trackingNumber, 140, yRight);
    }

    y = Math.max(y, yRight) + 8;

    // ---- Tabla de productos ----
    doc.setFillColor(245, 245, 240);
    doc.rect(margin, y, right - margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Producto', margin + 2, y + 5.5);
    doc.text('Cant.', 128, y + 5.5, { align: 'right' });
    doc.text('Precio', 152, y + 5.5, { align: 'right' });
    doc.text('Importe', right - 2, y + 5.5, { align: 'right' });
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    for (const item of order.items) {
      // Salto de página si se acaba el espacio
      if (y > 260) {
        doc.addPage();
        y = 24;
      }
      const name = item.product.name.length > 48 ? item.product.name.slice(0, 45) + '...' : item.product.name;
      doc.text(name, margin + 2, y);
      doc.text(String(item.quantity), 128, y, { align: 'right' });
      doc.text(money(item.product.price), 152, y, { align: 'right' });
      doc.text(money(item.product.price * item.quantity), right - 2, y, { align: 'right' });
      y += 6;
    }

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, right, y);
    y += 8;

    // ---- Totales ----
    const totalRow = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 12 : 9.5);
      doc.text(label, 130, y);
      doc.text(value, right - 2, y, { align: 'right' });
      y += bold ? 8 : 6;
    };

    totalRow('Subtotal', money(order.subtotal));
    if (order.discount > 0) totalRow('Descuento', '-' + money(order.discount));
    totalRow('Envío', order.shippingCost === 0 ? 'Gratis' : money(order.shippingCost));
    totalRow('Total', money(order.total), true);

    // ---- Pie ----
    y += 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Gracias por tu compra. Este recibo es un comprobante de tu pedido en La Familia.', margin, y);

    doc.save(`recibo-${order.id.slice(0, 8)}.pdf`);
  }

  private paymentLabel(order: Order): string {
    const labels: Record<string, string> = {
      card: 'Tarjeta',
      cash: 'Efectivo',
      transfer: 'Transferencia',
      paypal: 'PayPal',
    };
    return labels[order.paymentMethod] ?? order.paymentMethod;
  }

  private shippingLabel(order: Order): string {
    const labels: Record<string, string> = {
      standard: 'Estándar (3-5 días)',
      express: 'Exprés (1-2 días)',
      pickup: 'Recoger en tienda',
    };
    return labels[order.shippingMethod] ?? order.shippingMethod;
  }

  private statusLabel(order: Order): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      shipped: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[order.status] ?? order.status;
  }
}
