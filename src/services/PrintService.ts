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
    console.log('PrintService - Initialisation du service...');
    this.detectSystemPrinters().then(() => {
      console.log('PrintService - Initialisation terminée');
    });
  }

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  setPrinters(printers: Printer[]) {
    console.log('PrintService.setPrinters - Mise à jour des imprimantes:', printers.length);
    printers.forEach(p => {
      console.log(`  - ${p.name} (${p.type}) - Port: ${p.port} - Active: ${p.isActive}`);
    });
    this.printers = printers;
    this.configureDefaultCashPrinter();
  }

  private async detectSystemPrinters(): Promise<void> {
    try {
      console.log('PrintService - Détection des imprimantes système...');

      this.systemPrinters = [
        {
          name: 'Imprimante système',
          status: 'ready',
          isDefault: true,
          type: 'local',
          driver: 'Navigateur'
        }
      ];

      this.defaultSystemPrinter = this.systemPrinters.find(p => p.isDefault) || null;

      if (this.defaultSystemPrinter) {
        console.log('✓ Imprimante système disponible:', this.defaultSystemPrinter.name);
        console.log('  Status:', this.defaultSystemPrinter.status);
        console.log('  Type:', this.defaultSystemPrinter.type);
      } else {
        console.warn('✗ Aucune imprimante système par défaut trouvée');
      }
    } catch (error) {
      console.error('✗ Erreur lors de la détection des imprimantes système:', error);
      this.systemPrinters = [];
      this.defaultSystemPrinter = null;
    }
  }

  private configureDefaultCashPrinter(): void {
    const existingCashPrinter = this.printers.find(p => p.type === 'caisse');

    if (!existingCashPrinter && this.defaultSystemPrinter) {
      const defaultCashPrinter: Printer = {
        id: 'default-cash-printer',
        name: 'Imprimante de caisse',
        type: 'caisse',
        ipAddress: '',
        port: 0,
        model: 'Imprimante système',
        paperSize: '80mm',
        isActive: true,
        isOnline: true,
        categories: []
      };

      this.printers.push(defaultCashPrinter);
      console.log('Imprimante de caisse configurée automatiquement');
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
    // Pour l'imprimante de caisse, essayer d'abord avec le filtre complet
    let printer = this.printers.find(p => p.type === type && p.isActive && p.isOnline);

    // Si aucune imprimante de caisse n'est trouvée, chercher n'importe quelle imprimante active de caisse
    if (!printer && type === 'caisse') {
      printer = this.printers.find(p => p.type === type && p.isActive) || null;

      // Si toujours aucune, configurer une imprimante par défaut
      if (!printer) {
        this.configureDefaultCashPrinter();
        printer = this.printers.find(p => p.type === type && p.isActive) || null;
      }
    }

    return printer;
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

  async printTicket(order: Order, items: OrderItem[]): Promise<void> {
    console.log('PrintService.printTicket - Début impression ticket');

    const printer = this.findPrinter('caisse');
    if (!printer) {
      console.error('Aucune imprimante de caisse disponible');
      console.log('Imprimantes configurées:', this.printers);
      throw new Error('Aucune imprimante de caisse disponible. Veuillez configurer une imprimante dans les paramètres.');
    }

    console.log('Imprimante de caisse trouvée:', printer.name);

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

    await this.executePrintJob(printJob);
    console.log('PrintService.printTicket - Impression ticket terminée avec succès');
  }

  async printBill(order: Order, items: OrderItem[], customerName?: string): Promise<void> {
    console.log('PrintService.printBill - Début impression addition');

    const printer = this.findPrinter('caisse');
    if (!printer) {
      console.error('Aucune imprimante de caisse disponible');
      console.log('Imprimantes configurées:', this.printers);
      throw new Error('Aucune imprimante de caisse disponible. Veuillez configurer une imprimante dans les paramètres.');
    }

    console.log('Imprimante de caisse trouvée:', printer.name);

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

    await this.executePrintJob(printJob);
    console.log('PrintService.printBill - Impression addition terminée avec succès');
  }

  async printOrder(items: OrderItem[], categories: string[], orderType: string, tableId?: string): Promise<void> {
    console.log('PrintService.printOrder - Début impression commande');

    const itemsCopy = items.map(item => ({ ...item }));
    const itemsByPrinter = this.groupItemsByPrinter(itemsCopy, categories);

    const errors: string[] = [];

    for (const [printerType, printerItems] of itemsByPrinter.entries()) {
      const printer = this.findPrinter(printerType as 'cuisine' | 'bar' | 'caisse');
      if (printer && printerItems.length > 0) {
        try {
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

          await this.executePrintJob(printJob);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
          errors.push(`${printerType}: ${errorMsg}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Erreurs d'impression:\n${errors.join('\n')}`);
    }

    console.log('PrintService.printOrder - Impression commande terminée avec succès');
  }

  async printOrderByPrinter(items: OrderItem[], printerType: string, orderType: string, tableId?: string): Promise<void> {
    console.log('PrintService.printOrderByPrinter - Début impression pour imprimante:', printerType);

    const printer = this.findPrinter(printerType as 'cuisine' | 'bar' | 'caisse');
    if (!printer) {
      console.warn(`Imprimante ${printerType} non trouvée ou inactive`);
      return;
    }

    try {
      const itemsCopy = items.map(item => ({ ...item }));
      const content = this.generateOrderContent(
        itemsCopy,
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

      await this.executePrintJob(printJob);
      console.log(`PrintService.printOrderByPrinter - Impression terminée pour ${printerType}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`Erreur d'impression pour ${printerType}:`, errorMsg);
      throw new Error(`Erreur d'impression pour ${printerType}: ${errorMsg}`);
    }
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

  private async executePrintJob(printJob: PrintJob): Promise<void> {
    console.log('\n=== PrintService.executePrintJob ===');
    console.log('Type de job:', printJob.type);
    console.log('Printer ID:', printJob.printerId);

    printJob.status = 'printing';
    this.printQueue.push(printJob);

    const printer = this.printers.find(p => p.id === printJob.printerId);
    if (!printer) {
      printJob.status = 'failed';
      console.error('✗ Imprimante introuvable avec ID:', printJob.printerId);
      console.log('Imprimantes disponibles:', this.printers.map(p => ({ id: p.id, name: p.name })));
      throw new Error('Imprimante introuvable');
    }

    console.log('✓ Imprimante trouvée:', printer.name);
    console.log('  Type:', printer.type);
    console.log('  Port:', printer.port);

    if (!this.defaultSystemPrinter) {
      console.log('defaultSystemPrinter est null, détection en cours...');
      await this.detectSystemPrinters();
    }

    try {
      if (printer.port > 0) {
        console.log('→ Mode: Imprimante réseau');
        console.log('  Adresse:', printer.ipAddress + ':' + printer.port);
        await this.printToNetworkPrinter(printJob.content, printer.ipAddress, printer.port);
      } else {
        console.log('→ Mode: Imprimante système');

        if (this.defaultSystemPrinter) {
          console.log('  Imprimante système:', this.defaultSystemPrinter.name);
          await this.printToSystemPrinter(printJob.content, this.defaultSystemPrinter);
        } else {
          console.error('✗ defaultSystemPrinter est null!');
          throw new Error('Imprimante système non disponible');
        }
      }

      printJob.status = 'completed';
      console.log('✓ Job terminé avec succès\n');
    } catch (error) {
      printJob.status = 'failed';
      console.error('✗ Erreur d\'impression:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(errorMessage);
    }
  }

  private async printToNetworkPrinter(content: string, ipAddress: string, port: number): Promise<void> {
    const PRINT_SERVER_URL = 'http://localhost:3001/print';

    try {
      console.log(`Envoi au serveur d'impression local pour ${ipAddress}:${port}`);

      const response = await fetch(PRINT_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          port,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.details ||
          `Erreur serveur: ${response.status}`
        );
      }

      const result = await response.json();
      console.log('Impression réseau réussie:', result);
    } catch (error) {
      console.error('Erreur d\'impression réseau:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Serveur d\'impression non accessible. ' +
          'Assurez-vous que le serveur d\'impression est démarré (cd print-server && npm start)'
        );
      }

      throw error;
    }
  }

  private async printToSystemPrinter(content: string, systemPrinter: SystemPrinter): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('PrintService.printToSystemPrinter - Début impression système');
        console.log('Imprimante:', systemPrinter.name);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          document.body.removeChild(iframe);
          reject(new Error('Impossible d\'accéder au document d\'impression'));
          return;
        }

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Impression - ${systemPrinter.name}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 13px;
                font-weight: 700;
                line-height: 1.4;
                background: white;
                color: #000000;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 80mm;
                max-width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
              .content {
                white-space: pre-wrap;
                word-wrap: break-word;
                color: #000000;
                font-weight: 700;
                width: 100%;
                text-align: left;
              }
              @media print {
                body {
                  padding: 5mm;
                  margin: 0;
                  font-weight: 700;
                  color: #000000;
                  width: 80mm;
                  max-width: 80mm;
                }
                .content {
                  font-weight: 700;
                  color: #000000;
                }
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="content">${content}</div>
          </body>
          </html>
        `;

        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        setTimeout(() => {
          try {
            const iframeWindow = iframe.contentWindow;
            if (!iframeWindow) {
              document.body.removeChild(iframe);
              reject(new Error('Fenêtre d\'impression non disponible'));
              return;
            }

            console.log('Ouverture de la fenêtre d\'impression...');
            iframeWindow.focus();
            iframeWindow.print();

            setTimeout(() => {
              try {
                document.body.removeChild(iframe);
              } catch (e) {
                console.warn('Impossible de supprimer l\'iframe:', e);
              }
            }, 1000);

            console.log('Impression envoyée vers l\'imprimante système: ' + systemPrinter.name);
            resolve();
          } catch (error) {
            try {
              document.body.removeChild(iframe);
            } catch (e) {
              console.warn('Impossible de supprimer l\'iframe:', e);
            }
            reject(error);
          }
        }, 300);

      } catch (error) {
        console.error('Erreur lors de l\'impression système:', error);
        reject(error);
      }
    });
  }

  async testPrint(printerId: string): Promise<void> {
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

    await this.executePrintJob(printJob);
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