// ============================================
// POS Printer Service - WebUSB ব্যবহার করে
// ============================================

/**
 * ইনভয়েস প্রিন্ট করার জন্য ডেটা টাইপ
 */
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

// ============================================
// USB টাইপ ডিক্লেয়ারেশন (TypeScript এর জন্য)
// ============================================

declare global {
  interface USBDevice {
    usbVersionMajor: number
    usbVersionMinor: number
    usbVersionSubminor: number
    deviceClass: number
    deviceSubclass: number
    deviceProtocol: number
    vendorId: number
    productId: number
    deviceVersionMajor: number
    deviceVersionMinor: number
    deviceVersionSubminor: number
    manufacturerName?: string
    productName?: string
    serialNumber?: string
    configuration?: USBConfiguration
    configurations: USBConfiguration[]
    opened: boolean
    
    open(): Promise<void>
    close(): Promise<void>
    selectConfiguration(configurationValue: number): Promise<void>
    claimInterface(interfaceNumber: number): Promise<void>
    releaseInterface(interfaceNumber: number): Promise<void>
    selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>
    controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>
    controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>
    clearHalt(direction: 'in' | 'out', endpointNumber: number): Promise<void>
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
    isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<USBIsochronousInTransferResult>
    isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: number[]): Promise<USBIsochronousOutTransferResult>
    reset(): Promise<void>
  }

  interface USBConfiguration {
    configurationValue: number
    configurationName?: string
    interfaces: USBInterface[]
  }

  interface USBInterface {
    interfaceNumber: number
    alternates: USBAlternateInterface[]
  }

  interface USBAlternateInterface {
    alternateSetting: number
    interfaceClass: number
    interfaceSubclass: number
    interfaceProtocol: number
    interfaceName?: string
    endpoints: USBEndpoint[]
  }

  interface USBEndpoint {
    endpointNumber: number
    direction: 'in' | 'out'
    type: 'bulk' | 'interrupt' | 'isochronous'
    packetSize: number
  }

  interface USBControlTransferParameters {
    requestType: 'standard' | 'class' | 'vendor'
    recipient: 'device' | 'interface' | 'endpoint' | 'other'
    request: number
    value: number
    index: number
  }

  interface USBInTransferResult {
    data?: DataView
    status: 'ok' | 'stall' | 'babble'
  }

  interface USBOutTransferResult {
    bytesWritten: number
    status: 'ok' | 'stall'
  }

  interface USBIsochronousInTransferResult {
    data?: DataView
    packets: USBIsochronousInTransferPacket[]
  }

  interface USBIsochronousOutTransferResult {
    packets: USBIsochronousOutTransferPacket[]
  }

  interface USBIsochronousInTransferPacket {
    status: 'ok' | 'stall' | 'babble'
    data?: DataView
  }

  interface USBIsochronousOutTransferPacket {
    status: 'ok' | 'stall'
    bytesWritten: number
  }

  interface USBRequestOptions {
    filters: USBDeviceFilter[]
  }

  interface USBDeviceFilter {
    vendorId?: number
    productId?: number
    classCode?: number
    subclassCode?: number
    protocolCode?: number
    serialNumber?: string
  }

  interface USB {
    requestDevice(options: USBRequestOptions): Promise<USBDevice>
    getDevices(): Promise<USBDevice[]>
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }

  interface Navigator {
    usb: USB
  }
}

// ============================================
// POS প্রিন্টার সার্ভিস ক্লাস
// ============================================

export class POSPrinterService {
  private device: USBDevice | null = null
  private isConnected: boolean = false
  private interfaceNumber: number = 0

  constructor() {
    this.device = null
    this.isConnected = false
    this.interfaceNumber = 0
  }

  /**
   * POS প্রিন্টারের সাথে কানেক্ট করুন
   */
  async connect(): Promise<boolean> {
    try {
      if (!('usb' in navigator)) {
        console.warn('❌ WebUSB is not supported in this browser')
        return false
      }

      const usb = navigator.usb
      
      const device = await usb.requestDevice({
        filters: [
          { vendorId: 0x0416 }, // Winbond
          { vendorId: 0x0b05 }, // ASUSTek
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0a5c }, // Broadcom
          { vendorId: 0x067b }, // Prolific
          { vendorId: 0x1a86 }, // QinHeng
        ]
      })

      if (!device) {
        throw new Error('No printer device selected by user')
      }

      await device.open()
      console.log('✅ Device opened')

      if (device.configuration === null) {
        const config = device.configurations[0]
        if (config) {
          await device.selectConfiguration(config.configurationValue)
          console.log(`✅ Configuration ${config.configurationValue} selected`)
        }
      }

      const config = device.configuration
      if (config && config.interfaces.length > 0) {
        this.interfaceNumber = config.interfaces[0].interfaceNumber
        await device.claimInterface(this.interfaceNumber)
        console.log(`✅ Interface ${this.interfaceNumber} claimed`)
      }

      this.device = device
      this.isConnected = true
      
      console.log('✅ POS Printer connected successfully')
      return true
      
    } catch (error) {
      console.error('❌ Failed to connect to POS printer:', error)
      this.isConnected = false
      this.device = null
      return false
    }
  }

  /**
   * প্রিন্টার কানেক্টেড কিনা চেক করুন
   */
  isPrinterConnected(): boolean {
    return this.isConnected && this.device !== null
  }

  /**
   * ইনভয়েস প্রিন্ট করুন
   */
  async printInvoice(invoiceData: InvoicePrintData): Promise<boolean> {
    if (!this.isPrinterConnected()) {
      console.log('🔄 Printer not connected, trying to connect...')
      const connected = await this.connect()
      if (!connected) {
        throw new Error('No printer connected. Please connect the printer first.')
      }
    }

    if (!this.device) {
      throw new Error('Printer device not available')
    }

    try {
      const commands = this.buildEscPosCommands(invoiceData)

      for (let i = 0; i < commands.length; i++) {
        await this.sendCommand(commands[i])
        await this.delay(50)
      }

      console.log('✅ Invoice printed successfully')
      return true
      
    } catch (error) {
      console.error('❌ Print error:', error)
      throw new Error('Failed to print invoice: ' + (error as Error).message)
    }
  }

  /**
   * ESC/POS কমান্ড তৈরি করুন
   */
  private buildEscPosCommands(data: InvoicePrintData): Uint8Array[] {
    const commands: Uint8Array[] = []

    commands.push(this.init())
    commands.push(this.setAlignment('center'))
    commands.push(this.setBold(true))
    commands.push(this.setTextSize(2, 2))
    commands.push(this.text('QUICK TREAT'))
    commands.push(this.setTextSize(1, 1))
    commands.push(this.setBold(false))
    commands.push(this.text('='.repeat(32)))
    commands.push(this.setBold(true))
    commands.push(this.text(`INVOICE #${data.invoiceNumber}`))
    commands.push(this.setBold(false))
    commands.push(this.text('='.repeat(32)))

    commands.push(this.setAlignment('left'))
    commands.push(this.text(`Patient: ${data.patientName}`))
    commands.push(this.text(`Doctor: ${data.doctorName}`))
    commands.push(this.text(`Date: ${data.appointmentDate}`))
    commands.push(this.text(`Time: ${data.appointmentTime}`))
    commands.push(this.text(`Payment: ${data.paymentMethod}`))
    commands.push(this.text(`Paid: ${data.paymentDate}`))

    commands.push(this.text('-'.repeat(32)))

    commands.push(this.setAlignment('right'))
    commands.push(this.text(`Consultation: ৳${data.consultationFee.toFixed(2)}`))
    commands.push(this.text(`Platform Fee: ৳${data.platformFee.toFixed(2)}`))
    commands.push(this.setBold(true))
    commands.push(this.text(`Total: ৳${data.totalAmount.toFixed(2)}`))
    commands.push(this.setBold(false))

    commands.push(this.setAlignment('center'))
    commands.push(this.text('-'.repeat(32)))
    commands.push(this.text('Thank you for choosing Quick Treat!'))
    commands.push(this.text('support@quicktreat.com'))
    commands.push(this.text('+880 1234-567890'))

    commands.push(this.feed(3))
    commands.push(this.cut())

    return commands
  }

  /**
   * প্রিন্টারে কমান্ড পাঠান
   * BufferSource টাইপের সাথে সামঞ্জস্যপূর্ণ করতে Uint8Array কে ArrayBuffer এ কনভার্ট করা হয়েছে
   */
  private async sendCommand(data: Uint8Array): Promise<void> {
    if (!this.device) {
      throw new Error('Device not connected')
    }

    try {
      // 🔥 গুরুত্বপূর্ণ ফিক্স: Uint8Array কে ArrayBuffer এ কনভার্ট করুন
      // BufferSource টাইপের সাথে মিলানোর জন্য
      const buffer = data.buffer as ArrayBuffer
      
      const result = await this.device.transferOut(1, buffer)
      
      if (result.status !== 'ok') {
        throw new Error(`Transfer failed with status: ${result.status}`)
      }
      
    } catch (error) {
      console.error('❌ Send command error:', error)
      throw error
    }
  }

  /**
   * প্রিন্টার ডিসকানেক্ট করুন
   */
  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        if (this.isConnected) {
          await this.device.releaseInterface(this.interfaceNumber)
        }
        
        await this.device.close()
        this.device = null
        this.isConnected = false
        
        console.log('✅ POS Printer disconnected')
      } catch (error) {
        console.error('❌ Disconnect error:', error)
      }
    }
  }

  /**
   * ডিলে ফাংশন (মিলিসেকেন্ড)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ============================================
  // ESC/POS কম্যান্ড হেল্পার
  // ============================================

  private init(): Uint8Array {
    return new Uint8Array([0x1B, 0x40])
  }

  private setAlignment(align: 'left' | 'center' | 'right'): Uint8Array {
    const alignMap = {
      left: 0x00,
      center: 0x01,
      right: 0x02
    }
    return new Uint8Array([0x1B, 0x61, alignMap[align]])
  }

  private setBold(on: boolean): Uint8Array {
    return new Uint8Array([0x1B, 0x45, on ? 0x01 : 0x00])
  }

  private setTextSize(width: number, height: number): Uint8Array {
    const w = Math.min(Math.max(width, 1), 8)
    const h = Math.min(Math.max(height, 1), 8)
    const size = ((w - 1) << 4) | (h - 1)
    return new Uint8Array([0x1D, 0x21, size])
  }

  private text(str: string): Uint8Array {
    const encoder = new TextEncoder()
    return encoder.encode(str + '\n')
  }

  private feed(lines: number): Uint8Array {
    const n = Math.min(Math.max(lines, 1), 255)
    return new Uint8Array([0x1B, 0x64, n])
  }

  private cut(): Uint8Array {
    return new Uint8Array([0x1D, 0x56, 0x00])
  }
}

// ============================================
// ইউটিলিটি ফাংশন
// ============================================

/**
 * WebUSB সাপোর্টেড কিনা চেক করুন
 */
export function isWebUSBSupported(): boolean {
  return 'usb' in navigator
}

/**
 * প্রিন্টার স্ট্যাটাস চেক করুন
 */
export async function checkPrinterStatus(): Promise<{
  supported: boolean
  connected: boolean
  deviceInfo?: string
}> {
  const supported = isWebUSBSupported()
  
  if (!supported) {
    return { supported: false, connected: false }
  }

  try {
    const printer = new POSPrinterService()
    const connected = await printer.connect()
    
    let deviceInfo: string | undefined
    if (connected && printer['device']) {
      const dev = printer['device'] as USBDevice
      deviceInfo = `Vendor: ${dev.vendorId || 'Unknown'}, Product: ${dev.productId || 'Unknown'}`
    }
    
    if (connected) {
      await printer.disconnect()
    }
    
    return { supported: true, connected, deviceInfo }
  } catch {
    return { supported: true, connected: false }
  }
}

export default POSPrinterService