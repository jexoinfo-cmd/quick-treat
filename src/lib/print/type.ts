// src/lib/print/types.ts
export interface InvoicePrintData {
  invoiceNumber: string
  patientName: string
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  totalAmount: number
  consultationFee: number
  platformFee: number
  paymentMethod: string
  paymentDate: string
}

export interface PrinterStatus {
  connected: boolean
  deviceInfo?: string
}

export interface PrintOptions {
  copies?: number
  paperSize?: '80mm' | '58mm'
  characterSet?: 'pc437' | 'pc850' | 'pc858'
}