// src/lib/invoice/invoiceTemplate.ts
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

export function generateInvoiceHTML(data: InvoiceData, role: 'doctor' | 'hospital' | 'patient' = 'patient'): string {
  const statusClass = data.paymentStatus === 'paid' ? 'status-paid' : 
                      data.paymentStatus === 'pending' ? 'status-pending' : 'status-failed'
  
  const headerText = role === 'doctor' ? 'Doctor Invoice' : 
                     role === 'hospital' ? 'Hospital Invoice' : 'Invoice'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${data.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f0fdfa;
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
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          border-bottom: 2px solid #0D9488;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0F766E;
        }
        .logo p {
          color: #5E6C6A;
          font-size: 14px;
        }
        .title {
          text-align: right;
        }
        .title h2 {
          font-size: 24px;
          color: #0F766E;
        }
        .title .subtitle {
          font-size: 14px;
          color: #5E6C6A;
          font-weight: 400;
        }
        .status {
          display: inline-block;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }
        .status-paid { background: #D1FAE5; color: #065F46; }
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-failed { background: #FEE2E2; color: #991B1B; }
        .grid {
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
        .info-box .value-small {
          font-size: 14px;
          color: #6B7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
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
        .total-row .label { color: #6B7280; }
        .total-row .amount { font-weight: 500; color: #111827; }
        .grand-total {
          font-size: 20px;
          font-weight: 700;
          color: #0F766E;
          padding-top: 8px;
          border-top: 2px solid #0D9488;
          margin-top: 8px;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        .footer a {
          color: #0D9488;
          text-decoration: none;
        }
        .watermark {
          position: relative;
        }
        .watermark::after {
          content: '${role === 'doctor' ? 'DOCTOR COPY' : role === 'hospital' ? 'HOSPITAL COPY' : 'PATIENT COPY'}';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 60px;
          font-weight: 900;
          color: rgba(13, 148, 136, 0.05);
          pointer-events: none;
          letter-spacing: 8px;
        }
        @media (max-width: 600px) {
          .grid { grid-template-columns: 1fr; }
          .header { flex-direction: column; }
          .title { text-align: left; margin-top: 16px; }
          .invoice-container { padding: 24px; }
          body { padding: 16px; }
        }
        @media print {
          body { background: white; padding: 0; }
          .invoice-container { box-shadow: none; padding: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container watermark" id="invoice">
        <div class="header">
          <div class="logo">
            <h1>🏥 Quick Treat</h1>
            <p>Smart Healthcare Platform</p>
            ${data.hospitalName ? `<p style="font-size:12px;color:#6B7280;margin-top:4px;">${data.hospitalName}</p>` : ''}
          </div>
          <div class="title">
            <h2>${headerText}</h2>
            <div class="subtitle">#${data.invoiceNumber}</div>
            <div class="status ${statusClass}">
              ${data.paymentStatus.toUpperCase()}
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="info-box">
            <label>Patient Information</label>
            <div class="value">${data.patientName}</div>
            <div class="value-small">${data.patientPhone}</div>
            <div class="value-small">${data.patientEmail}</div>
          </div>
          <div class="info-box">
            <label>Doctor Information</label>
            <div class="value">Dr. ${data.doctorName}</div>
            <div class="value-small">${data.doctorSpeciality}</div>
          </div>
          <div class="info-box">
            <label>Appointment Details</label>
            <div class="value">${data.appointmentDate}</div>
            <div class="value-small">${data.appointmentTime}</div>
          </div>
          <div class="info-box">
            <label>Payment Details</label>
            <div class="value">Transaction ID: ${data.transactionId}</div>
            <div class="value-small">${data.paymentDate}</div>
            <div class="value-small">Method: ${data.paymentMethod}</div>
          </div>
        </div>

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

        <div class="footer">
          <p>Thank you for choosing Quick Treat!</p>
          <p style="margin-top:4px;">
            For support: support@quicktreat.com | +880 1234-567890
          </p>
          <p style="margin-top:8px;font-size:10px;">
            This is a system generated invoice. No signature required.
            ${role === 'doctor' ? ' | Doctor Copy' : role === 'hospital' ? ' | Hospital Copy' : ' | Patient Copy'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}