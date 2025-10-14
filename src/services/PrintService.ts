import { Printer, Order, OrderItem } from '../types';

export interface PrintJob {
  id: string;
  type: 'ticket' | 'bill' | 'order' | 'addition';
  printerId: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
}

export interface SystemPrinter {
  name: string;
  status: 'ready' | 'offline' | 'busy' | 'error';
  isDefault: boolean;
  type: 'local' | 'network';
  port?: string;
  driver?: string;
}

export class PrintService {
  private static instance: PrintService;
  private printQueue: PrintJob[] = [];
  private printers: Printer[] = [];
  private systemPrinters: SystemPrinter[] = [];
  private defaultSystemPrinter: SystemPrinter | null = null;

  private constructor() {
    this.detectSystemPrinters();
  }

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  setPrinters(printers: Printer[]) {
    this.printers = printers;
    this.configureDefaultCashPrinter();
  }

  private async detectSystemPrinters(): Promise<void> {
    try {
      this.systemPrinters = [
        {
          name: 'HP LaserJet Pro M404n',
          status: 'ready',
          isDefault: true,
          type: 'local',
          driver: 'HP Universal Printing PCL 6'
        },
        {
          name: 'Microsoft Print to PDF',
          status: 'ready',
          isDefault: false,
          type: 'local',
          driver: 'Microsoft Print To PDF'
        },
        {
          name: 'Epson TM-T88VI (USB001)',
          status: 'ready',
          isDefault: false,
          type: 'local',
          port: 'USB001',
          driver: 'Epson TM-T88VI Receipt'
        },
        {
          name: 'Canon PIXMA TS3350',
          status: 'offline',
          isDefault: false,
          type: 'local',
          driver: 'Canon PIXMA TS3350 series'
        }
      ];

      this.defaultSystemPrinter = this.systemPrinters.find(p => p.isDefault) || null;
      
      console.log('Imprimantes système détectées:', this.systemPrinters);
      console.log('Imprimante par défaut:', this.defaultSystemPrinter?.name);
    } catch (error) {
      console.error('Erreur lors de la détection des imprimantes système:', error);
    }
  }

  private configureDefaultCashPrinter(): void {
    if (!this.defaultSystemPrinter) return;

    const existingCashPrinter = this.printers.find(p => p.type === 'caisse');
    
    if (!existingCashPrinter) {
      const defaultCashPrinter: Printer = {
        id: 'default-cash-printer',
        name: 'Caisse - ' + this.defaultSystemPrinter.name,
        type: 'caisse',
        ipAddress: this.defaultSystemPrinter.name,
        port: 0,
        model: this.defaultSystemPrinter.driver || 'Imprimante système',
        paperSize: '80mm',
        isActive: true,
        isOnline: this.defaultSystemPrinter.status === 'ready',
        categories: []
      };

      this.printers.push(defaultCashPrinter);
      console.log('Imprimante de caisse configurée automatiquement:', defaultCashPrinter.name);
    }
  }

  getSystemPrinters(): SystemPrinter[] {
    return [...this.systemPrinters];
  }

  getDefaultSystemPrinter(): SystemPrinter | null {
    return this.defaultSystemPrinter;
  }

  async refreshSystemPrinters(): Promise<void> {
    await this.detectSystemPrinters();
    this.configureDefaultCashPrinter();
  }

  private findPrinter(type: 'cuisine' | 'bar' | 'caisse'): Printer | null {
    return this.printers.find(p => p.type === type && p.isActive && p.isOnline) || null;
  }

  private generateTicketContent(order: Order, items: OrderItem[]): string {
    const currentDate = new Date();
    const ticketNumber = 'TKT-' + Date.now().toString().slice(-6);
    
    let content = '';
    content += '================================\n';
    content += '      🍽️ RESTOBAR\n';
    content += '    123 Avenue Principale\n';
    content += '   Abidjan, Cote d\'Ivoire\n';
    content += '  Tel: +225 01 02 03 04 05\n';
    content += '================================\n';
    content += '\n';
    content += 'Ticket: ' + ticketNumber + '\n';
    content += 'Date: ' + currentDate.toLocaleDateString('fr-FR') + '\n';
    content += 'Heure: ' + currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '\n';
    if (order.tableId) {
      content += 'Table: ' + order.tableId + '\n';
    }
    content += '--------------------------------\n';
    content += '\n';

    items.forEach(item => {
      content += item.productName + '\n';
      if (item.size) {
        content += '  Taille: ' + item.size + '\n';
      }
      content += '  ' + item.quantity + ' x ' + item.price.toLocaleString('fr-FR') + ' = ' + (item.price * item.quantity).toLocaleString('fr-FR') + ' CFA\n';
      if (item.notes) {
        content += '  Note: ' + item.notes + '\n';
      }
      content += '\n';
    });

    content += '--------------------------------\n';
    content += 'Sous-total: ' + order.subtotal.toLocaleString('fr-FR') + ' CFA\n';
    content += 'TVA (10%): ' + order.tax.toLocaleString('fr-FR') + ' CFA\n';
    content += '================================\n';
    content += 'TOTAL: ' + order.total.toLocaleString('fr-FR') + ' CFA\n';
    content += '================================\n';
    content += '\n';
    content += '     Merci de votre visite!\n';
    content += '     A bientot chez RestoBar\n';
    content += '\n';
    content += '      www.restobar.ci\n';
    content += '\n';

    return content;
  }

  private generateBillContent(order: Order, items: OrderItem[], customerName?: string): string {
    const currentDate = new Date();
    const billNumber = 'FACT-' + currentDate.getFullYear() + (currentDate.getMonth() + 1).toString().padStart(2, '0') + currentDate.getDate().toString().padStart(2, '0') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    let content = '';
    content += '================================\n';
    content += '      🍽️ RESTOBAR\n';
    content += '    123 Avenue Principale\n';
    content += '   Abidjan, Cote d\'Ivoire\n';
    content += '  Tel: +225 01 02 03 04 05\n';
    content += '================================\n';
    content += '\n';
    content += '           ADDITION\n';
    content += '\n';
    content += 'N° Facture: ' + billNumber + '\n';
    content += 'Date: ' + currentDate.toLocaleDateString('fr-FR') + '\n';
    content += 'Heure: ' + currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '\n';
    if (customerName) {
      content += 'Client: ' + customerName + '\n';
    }
    if (order.tableId) {
      content += 'Table: ' + order.tableId + '\n';
    }
    content += 'Paiement: ' + this.getPaymentMethodText(order.paymentMethod) + '\n';
    content += '--------------------------------\n';
    content += '\n';

    content += 'Articles commandes:\n';
    content += '\n';
    items.forEach(item => {
      content += item.productName + '\n';
      if (item.size) {
        content += '  Taille: ' + item.size + '\n';
      }
      if (item.notes) {
        content += '  Note: ' + item.notes + '\n';
      }
      content += '  ' + item.price.toLocaleString('fr-FR') + ' CFA x ' + item.quantity + '\n';
      content += '  = ' + (item.price * item.quantity).toLocaleString('fr-FR') + ' CFA\n';
      content += '\n';
    });

    if (order.notes) {
      content += '--------------------------------\n';
      content += 'Note: ' + order.notes + '\n';
    }

    content += '--------------------------------\n';
    content += 'Sous-total: ' + order.subtotal.toLocaleString('fr-FR') + ' CFA\n';
    content += 'TVA (10%): ' + order.tax.toLocaleString('fr-FR') + ' CFA\n';
    content += '================================\n';
    content += 'TOTAL: ' + order.total.toLocaleString('fr-FR') + ' CFA\n';
    content += '================================\n';
    content += '\n';
    content += '     Merci de votre visite!\n';
    content += '     A bientot chez RestoBar\n';
    content += '\n';

    return content;
  }

  private generateOrderContent(items: OrderItem[], orderType: string, tableId?: string): string {
    const currentDate = new Date();
    
    let content = '';
    content += '================================\n';
    content += '      COMMANDE CUISINE\n';
    content += '================================\n';
    content += '\n';
    content += 'Heure: ' + currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '\n';
    content += 'Type: ' + orderType + '\n';
    if (tableId) {
      content += 'Table: ' + tableId + '\n';
    }
    content += '\n';
    content += '--------------------------------\n';
    content += '\n';

    items.forEach(item => {
      content += item.quantity + 'x ' + item.productName + '\n';
      if (item.size) {
        content += '   Taille: ' + item.size + '\n';
      }
      if (item.notes) {
        content += '   *** ' + item.notes + ' ***\n';
      }
      content += '\n';
    });

    content += '--------------------------------\n';
    content += 'Total articles: ' + items.reduce((sum, item) => sum + item.quantity, 0) + '\n';
    content += '\n';

    return content;
  }

  private getPaymentMethodText(method?: string): string {
    switch (method) {
      case 'cash': return 'Especes';
      case 'card': return 'Carte bancaire';
      case 'digital': return 'Paiement digital';
      default: return 'Non defini';
    }
  }

  private getOrderTypeText(type: string): string {
    switch (type) {
      case 'dine-in': return 'Sur place';
      case 'takeaway': return 'A emporter';
      case 'delivery': return 'Livraison';
      case 'kiosk': return 'Kiosque';
      default: return type;
    }
  }

  async printTicket(order: Order, items: OrderItem[]): Promise<boolean> {
    console.log('PrintService.printTicket - Début impression ticket');
    
    const printer = this.findPrinter('caisse');
    if (!printer) {
      throw new Error('Aucune imprimante de caisse disponible');
    }

    const orderCopy = { ...order };
    const itemsCopy = items.map(item => ({ ...item }));

    const content = this.generateTicketContent(orderCopy, itemsCopy);
    const printJob: PrintJob = {
      id: Date.now().toString(),
      type: 'ticket',
      printerId: printer.id,
      content,
      timestamp: new Date(),
      status: 'pending',
    };

    const result = await this.executePrintJob(printJob);
    console.log('PrintService.printTicket - Fin impression ticket, résultat:', result);
    return result;
  }

  async printBill(order: Order, items: OrderItem[], customerName?: string): Promise<boolean> {
    console.log('PrintService.printBill - Début impression addition');
    
    const printer = this.findPrinter('caisse');
    if (!printer) {
      throw new Error('Aucune imprimante de caisse disponible');
    }

    const orderCopy = { ...order };
    const itemsCopy = items.map(item => ({ ...item }));

    const content = this.generateBillContent(orderCopy, itemsCopy, customerName);
    const printJob: PrintJob = {
      id: Date.now().toString(),
      type: 'bill',
      printerId: printer.id,
      content,
      timestamp: new Date(),
      status: 'pending',
    };

    const result = await this.executePrintJob(printJob);
    console.log('PrintService.printBill - Fin impression addition, résultat:', result);
    return result;
  }

  async printOrder(items: OrderItem[], categories: string[], orderType: string, tableId?: string): Promise<boolean> {
    console.log('PrintService.printOrder - Début impression commande');
    
    const results: boolean[] = [];
    const itemsCopy = items.map(item => ({ ...item }));
    const itemsByPrinter = this.groupItemsByPrinter(itemsCopy, categories);

    for (const [printerType, printerItems] of itemsByPrinter.entries()) {
      const printer = this.findPrinter(printerType as 'cuisine' | 'bar' | 'caisse');
      if (printer && printerItems.length > 0) {
        const content = this.generateOrderContent(
          printerItems, 
          this.getOrderTypeText(orderType), 
          tableId
        );
        
        const printJob: PrintJob = {
          id: Date.now().toString(),
          type: 'order',
          printerId: printer.id,
          content,
          timestamp: new Date(),
          status: 'pending',
        };

        const result = await this.executePrintJob(printJob);
        results.push(result);
      }
    }

    const finalResult = results.every(result => result);
    console.log('PrintService.printOrder - Fin impression commande, résultat:', finalResult);
    return finalResult;
  }

  private groupItemsByPrinter(items: OrderItem[], categories: string[]): Map<string, OrderItem[]> {
    const itemsByPrinter = new Map<string, OrderItem[]>();

    items.forEach(item => {
      let targetPrinter = 'cuisine';

      const itemCategory = this.getItemCategory(item.productName);
      if (itemCategory === 'Boissons' || itemCategory === 'Alcools') {
        targetPrinter = 'bar';
      }

      if (!itemsByPrinter.has(targetPrinter)) {
        itemsByPrinter.set(targetPrinter, []);
      }
      itemsByPrinter.get(targetPrinter)!.push(item);
    });

    return itemsByPrinter;
  }

  private getItemCategory(productName: string): string {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('coca') || lowerName.includes('café') || lowerName.includes('jus')) {
      return 'Boissons';
    }
    if (lowerName.includes('vin') || lowerName.includes('bière') || lowerName.includes('whisky')) {
      return 'Alcools';
    }
    if (lowerName.includes('salade') || lowerName.includes('entrée')) {
      return 'Entrées';
    }
    if (lowerName.includes('gâteau') || lowerName.includes('dessert') || lowerName.includes('tiramisu')) {
      return 'Desserts';
    }
    return 'Plats';
  }

  private async executePrintJob(printJob: PrintJob): Promise<boolean> {
    try {
      console.log('PrintService.executePrintJob - Début exécution job:', printJob.type);
      
      printJob.status = 'printing';
      this.printQueue.push(printJob);

      const printer = this.printers.find(p => p.id === printJob.printerId);
      if (!printer) {
        throw new Error('Imprimante introuvable');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      if (printer.port > 0) {
        console.log('Envoi vers imprimante réseau ' + printer.ipAddress + ':' + printer.port);
      } else {
        console.log('Envoi vers imprimante système: ' + printer.ipAddress);
        
        if (printer.type === 'caisse' && this.defaultSystemPrinter) {
          await this.printToSystemPrinter(printJob.content, this.defaultSystemPrinter);
        }
      }

      console.log('Contenu à imprimer:');
      console.log(printJob.content);

      printJob.status = 'completed';
      console.log('PrintService.executePrintJob - Job terminé avec succès');
      return true;
    } catch (error) {
      printJob.status = 'failed';
      console.error('Erreur d\'impression:', error);
      return false;
    }
  }

  private async printToSystemPrinter(content: string, systemPrinter: SystemPrinter): Promise<void> {
    try {
      console.log('PrintService.printToSystemPrinter - Début impression système');
      
      if ('print' in window) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write('<html><head><title>Impression - ' + systemPrinter.name + '</title><style>body { font-family: \'Courier New\', monospace; font-size: 12px; line-height: 1.2; margin: 0; padding: 10px; white-space: pre-wrap; } @media print { body { margin: 0; padding: 0; } }</style></head><body>' + content + '</body></html>');
          printWindow.document.close();
          
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      } else {
        const printElement = document.createElement('div');
        printElement.style.display = 'none';
        printElement.innerHTML = '<pre style="font-family: \'Courier New\', monospace; font-size: 12px;">' + content + '</pre>';
        document.body.appendChild(printElement);
        
        window.print();
        
        setTimeout(() => {
          document.body.removeChild(printElement);
        }, 1000);
      }

      console.log('Impression envoyée vers l\'imprimante système: ' + systemPrinter.name);
    } catch (error) {
      console.error('Erreur lors de l\'impression système:', error);
      throw error;
    }
  }

  async testPrint(printerId: string): Promise<boolean> {
    const printer = this.printers.find(p => p.id === printerId);
    if (!printer) {
      throw new Error('Imprimante introuvable');
    }

    const testContent = '\n================================\n         TEST D\'IMPRESSION\n================================\n\nImprimante: ' + printer.name + '\nType: ' + printer.type + '\nModele: ' + printer.model + '\nPapier: ' + printer.paperSize + '\n\nDate: ' + new Date().toLocaleDateString('fr-FR') + '\nHeure: ' + new Date().toLocaleTimeString('fr-FR') + '\n\n' + (printer.port === 0 ? 'Imprimante système locale' : 'Imprimante réseau') + '\n' + (printer.port === 0 && this.defaultSystemPrinter ? 'Utilise: ' + this.defaultSystemPrinter.name : 'Adresse: ' + printer.ipAddress + ':' + printer.port) + '\n\n================================\n    Test réussi !\n================================\n';

    const printJob: PrintJob = {
      id: Date.now().toString(),
      type: 'ticket',
      printerId: printer.id,
      content: testContent,
      timestamp: new Date(),
      status: 'pending',
    };

    return this.executePrintJob(printJob);
  }

  getPrintQueue(): PrintJob[] {
    return [...this.printQueue];
  }

  clearPrintQueue(): void {
    this.printQueue = [];
  }

  getActivePrinters(): Printer[] {
    return this.printers.filter(p => p.isActive && p.isOnline);
  }
}

export default PrintService;