# Serveur d'impression RestoBar

Ce serveur local permet d'envoyer des données aux imprimantes réseau (ESC/POS) depuis le navigateur.

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

- `GET /health` - Vérifier l'état du serveur
- `POST /print` - Envoyer une impression

### Exemple de requête

```json
POST http://localhost:3001/print
{
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

1. L'application web envoie une requête HTTP au serveur local (localhost:3001)
2. Le serveur convertit le texte en commandes ESC/POS
3. Le serveur envoie les commandes à l'imprimante réseau via TCP/IP
4. L'imprimante reçoit les données et imprime le ticket

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
