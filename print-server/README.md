# Serveur d'Impression RestoBar

Serveur local Node.js qui contourne le navigateur pour une impression directe et automatique.

## Fonctionnalités

- **Impression système:** USB, réseau partagé (Windows/Mac/Linux)
- **Impression réseau:** Imprimantes thermiques ESC/POS
- **Formatage ESC/POS:** Gras, centrage, coupe automatique
- **API REST:** Simple et efficace
- **Détection automatique:** Liste les imprimantes système disponibles
- **Sans dialogue:** Impression directe sans interaction utilisateur

## Installation

```bash
cd print-server
npm install
```

## Démarrage

```bash
npm start
```

Le serveur démarre sur le port 3001.

## Utilisation

Le serveur reçoit les requêtes HTTP du navigateur et les transmet aux imprimantes réseau via TCP/IP.

### Endpoints

#### GET /health

Vérifier l'état du serveur.

```bash
curl http://localhost:3001/health
```

Réponse:
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T22:30:00.000Z",
  "platform": "win32"
}
```

#### GET /printers

Lister les imprimantes système disponibles.

```bash
curl http://localhost:3001/printers
```

Réponse:
```json
{
  "success": true,
  "printers": ["HP LaserJet", "Canon TS3300"],
  "count": 2
}
```

#### POST /print

Envoyer une impression.

**Imprimante système:**
```json
POST http://localhost:3001/print
{
  "mode": "system",
  "printerName": "HP LaserJet",
  "content": "Texte à imprimer"
}
```

**Imprimante réseau ESC/POS:**
```json
POST http://localhost:3001/print
{
  "mode": "network",
  "ipAddress": "192.168.1.100",
  "port": 9100,
  "content": "Texte à imprimer"
}
```

## Configuration des imprimantes

1. Assurez-vous que vos imprimantes réseau sont allumées et connectées au même réseau
2. Notez l'adresse IP de chaque imprimante (généralement visible sur l'écran de l'imprimante ou via votre routeur)
3. Le port par défaut pour les imprimantes ESC/POS est 9100

## Fonctionnement

### Mode Système (USB/Réseau partagé)

1. L'application web envoie une requête HTTP au serveur local
2. Le serveur utilise les commandes système (`lpr`, `notepad /p`)
3. L'impression se fait directement sur l'imprimante système
4. Aucun dialogue n'apparaît

### Mode Réseau (ESC/POS)

1. L'application web envoie une requête HTTP au serveur local
2. Le serveur convertit le texte en commandes ESC/POS
3. Le serveur envoie les commandes à l'imprimante réseau via TCP/IP
4. L'imprimante reçoit les données et imprime le ticket

### Fallback

Si le serveur n'est pas disponible, l'application utilise automatiquement `window.print()` du navigateur.

## Résolution de problèmes

### Le serveur ne démarre pas
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Réinstallez les dépendances: `npm install`

### L'imprimante ne reçoit rien
- Vérifiez que l'imprimante est allumée
- Vérifiez l'adresse IP (ping 192.168.1.100)
- Vérifiez que le pare-feu autorise les connexions sortantes sur le port 9100
- Testez avec telnet: `telnet 192.168.1.100 9100`

### Timeout de connexion
- L'imprimante n'est pas accessible sur le réseau
- Vérifiez l'adresse IP et le port
- Assurez-vous que l'imprimante et l'ordinateur sont sur le même réseau
