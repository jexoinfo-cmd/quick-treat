export interface InvoiceData {
  invoiceNumber: string
  appointmentId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  doctorSpeciality: string
  hospitalName?: string
  hospitalAddress?: string
  appointmentDate: string
  appointmentTime: string
  consultationFee: number
  platformFee: number
  totalAmount: number
  paymentMethod: string
  paymentDate: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  transactionId: string
}

export function generateInvoiceHTML(data: InvoiceData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${data.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fff;
          padding: 40px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          padding: 48px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          border-bottom: 2px solid #0D9488;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .logo-section h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0F766E;
          margin: 0;
        }
        .logo-section p {
          color: #5E6C6A;
          font-size: 14px;
          margin-top: 4px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h2 {
          font-size: 24px;
          color: #0F766E;
          margin: 0;
        }
        .invoice-title .status {
          display: inline-block;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }
        .status-paid {
          background: #D1FAE5;
          color: #065F46;
        }
        .status-pending {
          background: #FEF3C7;
          color: #92400E;
        }
        .status-failed {
          background: #FEE2E2;
          color: #991B1B;
        }
        .invoice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin: 24px 0;
        }
        .info-box {
          background: #F9FAFB;
          padding: 16px;
          border-radius: 8px;
        }
        .info-box label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }
        .info-box .value {
          font-size: 16px;
          font-weight: 500;
          color: #111827;
        }
        .table-container {
          margin: 24px 0;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #F9FAFB;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          color: #6B7280;
          font-weight: 600;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #E5E7EB;
        }
        .total-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #E5E7EB;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          gap: 32px;
          padding: 8px 0;
        }
        .total-row .label {
          color: #6B7280;
        }
        .total-row .amount {
          font-weight: 500;
          color: #111827;
        }
        .grand-total {
          font-size: 20px;
          font-weight: 700;
          color: #0F766E;
          padding-top: 8px;
          border-top: 2px solid #0D9488;
          margin-top: 8px;
        }
        .qr-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding: 24px;
          background: #F9FAFB;
          border-radius: 12px;
        }
        .qr-code {
          text-align: center;
        }
        .qr-code img {
          width: 120px;
          height: 120px;
        }
        .barcode {
          text-align: center;
        }
        .barcode img {
          width: 200px;
          height: 60px;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 0; }
          .invoice-container { box-shadow: none; padding: 24px; }
          .no-print { display: none !important; }
        }
        @media (max-width: 600px) {
          .invoice-grid { grid-template-columns: 1fr; }
          .invoice-header { flex-direction: column; }
          .invoice-title { text-align: left; margin-top: 16px; }
          .qr-section { flex-direction: column; gap: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container" id="invoice">
        <!-- Header -->
        <div class="invoice-header">
          <div class="logo-section">
            <h1>🏥 Quick Treat</h1>
            <p>Smart Healthcare Platform</p>
            <p style="font-size:12px;color:#6B7280;margin-top:4px;">
              ${data.hospitalName || 'Quick Treat Healthcare'}
            </p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="status status-${data.paymentStatus}">
              ${data.paymentStatus.toUpperCase()}
            </div>
            <p style="font-size:12px;color:#6B7280;margin-top:4px;">
              #${data.invoiceNumber}
            </p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="invoice-grid">
          <div class="info-box">
            <label>Patient Information</label>
            <div class="value">${data.patientName}</div>
            <div style="font-size:14px;color:#6B7280;">${data.patientPhone}</div>
            <div style="font-size:14px;color:#6B7280;">${data.patientEmail}</div>
          </div>
          <div class="info-box">
            <label>Doctor Information</label>
            <div class="value">Dr. ${data.doctorName}</div>
            <div style="font-size:14px;color:#6B7280;">${data.doctorSpeciality}</div>
          </div>
          <div class="info-box">
            <label>Appointment Details</label>
            <div class="value">${data.appointmentDate}</div>
            <div style="font-size:14px;color:#6B7280;">${data.appointmentTime}</div>
          </div>
          <div class="info-box">
            <label>Payment Details</label>
            <div class="value">Transaction ID: ${data.transactionId}</div>
            <div style="font-size:14px;color:#6B7280;">${data.paymentDate}</div>
            <div style="font-size:14px;color:#6B7280;">Method: ${data.paymentMethod}</div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consultation Fee - Dr. ${data.doctorName}</td>
                <td>৳${data.consultationFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Platform Service Fee (${((data.platformFee / data.consultationFee) * 100).toFixed(0)}%)</td>
                <td>৳${data.platformFee.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div class="total-section">
          <div class="total-row">
            <span class="label">Subtotal</span>
            <span class="amount">৳${data.consultationFee.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="label">Platform Fee</span>
            <span class="amount">৳${data.platformFee.toFixed(2)}</span>
          </div>
          <div class="grand-total">
            Total: ৳${data.totalAmount.toFixed(2)}
          </div>
        </div>

        <!-- QR & Barcode -->
        <div class="qr-section">
          <div class="qr-code">
            <div id="qr-container"></div>
            <p style="font-size:12px;color:#6B7280;margin-top:8px;">Scan to view booking</p>
          </div>
          <div class="barcode">
            <div id="barcode-container"></div>
            <p style="font-size:12px;color:#6B7280;margin-top:8px;">Invoice #${data.invoiceNumber}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for choosing Quick Treat!</p>
          <p style="margin-top:4px;">
            For support: support@quicktreat.com | +880 1234-567890
          </p>
          <p style="margin-top:8px;font-size:10px;">
            This is a system generated invoice. No signature required.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}