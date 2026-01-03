import express from 'express';
import cors from 'cors';
import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function textToESCPOS(text) {
  const ESC = '\x1B';
  const GS = '\x1D';

  let commands = [];

  commands.push(ESC + '@');
  commands.push(ESC + 'a' + String.fromCharCode(1));

  const lines = text.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      commands.push('\n');
      continue;
    }

    if (line.includes('====') || line.includes('---')) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(line + '\n');
      commands.push(ESC + 'E' + String.fromCharCode(0));
    } else if (line.includes('RESTOBAR') || line.includes('TICKET') || line.includes('ADDITION')) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(GS + '!' + String.fromCharCode(0x11));
      commands.push(ESC + 'a' + String.fromCharCode(1));
      commands.push(line + '\n');
      commands.push(GS + '!' + String.fromCharCode(0));
      commands.push(ESC + 'E' + String.fromCharCode(0));
      commands.push(ESC + 'a' + String.fromCharCode(0));
    } else if (line.includes('TOTAL') || line.includes('COMMANDE')) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(GS + '!' + String.fromCharCode(0x01));
      commands.push(line + '\n');
      commands.push(GS + '!' + String.fromCharCode(0));
      commands.push(ESC + 'E' + String.fromCharCode(0));
    } else if (line.match(/^\d+x /)) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(line + '\n');
      commands.push(ESC + 'E' + String.fromCharCode(0));
    } else {
      commands.push(line + '\n');
    }
  }

  commands.push('\n\n\n');
  commands.push(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(3));

  return Buffer.from(commands.join(''), 'utf8');
}

function sendToPrinter(ipAddress, port, data) {
  return new Promise((resolve, reject) => {
    console.log(`Connexion à l'imprimante ${ipAddress}:${port}...`);

    const client = new net.Socket();
    client.setTimeout(5000);

    client.connect(port, ipAddress, () => {
      console.log('Connecté à l\'imprimante');
      client.write(data, () => {
        console.log('Données envoyées');
        client.end();
      });
    });

    client.on('close', () => {
      console.log('Connexion fermée');
      resolve({ success: true });
    });

    client.on('timeout', () => {
      console.error('Timeout de connexion');
      client.destroy();
      reject(new Error('Timeout de connexion à l\'imprimante'));
    });

    client.on('error', (err) => {
      console.error('Erreur:', err.message);
      reject(err);
    });
  });
}

async function printToSystemPrinter(printerName, content) {
  const platform = os.platform();
  console.log(`Impression sur imprimante système: ${printerName} (${platform})`);

  try {
    if (platform === 'win32') {
      const tempFile = `print_${Date.now()}.txt`;
      const fs = await import('fs');
      await fs.promises.writeFile(tempFile, content, 'utf8');

      const printerArg = printerName ? `/D:"${printerName}"` : '';
      await execAsync(`notepad /p ${printerArg} ${tempFile}`);

      setTimeout(() => {
        fs.promises.unlink(tempFile).catch(() => {});
      }, 5000);

      return { success: true };
    } else if (platform === 'darwin') {
      const printerArg = printerName ? `-P "${printerName}"` : '';
      await execAsync(`echo "${content.replace(/"/g, '\\"')}" | lpr ${printerArg}`);
      return { success: true };
    } else {
      const printerArg = printerName ? `-P "${printerName}"` : '';
      await execAsync(`echo "${content.replace(/"/g, '\\"')}" | lpr ${printerArg}`);
      return { success: true };
    }
  } catch (error) {
    console.error('Erreur impression système:', error);
    throw new Error(`Erreur impression système: ${error.message}`);
  }
}

async function listSystemPrinters() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      const { stdout } = await execAsync('wmic printer get name');
      const printers = stdout
        .split('\n')
        .slice(1)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      return printers;
    } else if (platform === 'darwin') {
      const { stdout } = await execAsync('lpstat -p | awk \'{print $2}\'');
      return stdout.split('\n').filter(line => line.length > 0);
    } else {
      const { stdout } = await execAsync('lpstat -p | awk \'{print $2}\'');
      return stdout.split('\n').filter(line => line.length > 0);
    }
  } catch (error) {
    console.error('Erreur listage imprimantes:', error);
    return [];
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: os.platform()
  });
});

app.get('/printers', async (req, res) => {
  try {
    const printers = await listSystemPrinters();
    res.json({
      success: true,
      printers,
      count: printers.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors du listage des imprimantes',
      details: error.message
    });
  }
});

app.post('/print', async (req, res) => {
  const { ipAddress, port, content, printerName, mode } = req.body;

  if (!content) {
    return res.status(400).json({
      error: 'Contenu manquant'
    });
  }

  console.log(`\n=== Nouvelle demande d'impression ===`);
  console.log(`Mode: ${mode || 'network'}`);
  console.log(`Contenu (${content.length} caractères): ${content.substring(0, 50)}...`);

  try {
    if (mode === 'system') {
      console.log(`Imprimante système: ${printerName || 'défaut'}`);
      await printToSystemPrinter(printerName, content);
    } else {
      if (!ipAddress || !port) {
        return res.status(400).json({
          error: 'Paramètres manquants (ipAddress, port requis pour mode network)'
        });
      }
      console.log(`Imprimante réseau: ${ipAddress}:${port}`);
      const escposData = textToESCPOS(content);
      await sendToPrinter(ipAddress, port, escposData);
    }

    console.log('✓ Impression réussie\n');
    res.json({
      success: true,
      message: 'Impression envoyée avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('✗ Erreur d\'impression:', error.message);
    res.status(500).json({
      error: 'Erreur lors de l\'impression',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('   SERVEUR D\'IMPRESSION RESTOBAR');
  console.log('========================================');
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('\nEndpoints disponibles:');
  console.log(`  GET  /health - Vérifier l'état du serveur`);
  console.log(`  POST /print  - Envoyer une impression`);
  console.log('\nEn attente de requêtes...\n');
});
