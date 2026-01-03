import express from 'express';
import cors from 'cors';
import net from 'net';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function textToESCPOS(text) {
  const ESC = '\x1B';
  const GS = '\x1D';

  let commands = [];

  commands.push(ESC + '@');
  commands.push(ESC + 'a' + String.fromCharCode(0));
  commands.push(ESC + '!' + String.fromCharCode(0));

  const lines = text.split('\n');

  for (const line of lines) {
    if (line.includes('====')) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(line + '\n');
      commands.push(ESC + 'E' + String.fromCharCode(0));
    } else if (line.includes('TOTAL') || line.includes('COMMANDE')) {
      commands.push(ESC + 'E' + String.fromCharCode(1));
      commands.push(GS + '!' + String.fromCharCode(0x11));
      commands.push(line + '\n');
      commands.push(GS + '!' + String.fromCharCode(0));
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/print', async (req, res) => {
  const { ipAddress, port, content } = req.body;

  if (!ipAddress || !port || !content) {
    return res.status(400).json({
      error: 'Paramètres manquants (ipAddress, port, content requis)'
    });
  }

  console.log(`\nNouvelle demande d'impression:`);
  console.log(`- Imprimante: ${ipAddress}:${port}`);
  console.log(`- Contenu: ${content.substring(0, 50)}...`);

  try {
    const escposData = textToESCPOS(content);
    await sendToPrinter(ipAddress, port, escposData);

    res.json({
      success: true,
      message: 'Impression envoyée avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur d\'impression:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi à l\'imprimante',
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
