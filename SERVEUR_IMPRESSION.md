# Serveur d'Impression - Guide Complet

## Qu'est-ce que c'est?

Un serveur d'impression local qui **contourne complètement le navigateur** et imprime directement sur vos imprimantes.

### Avantages

**Sans serveur (avant):**
- Fenêtre de dialogue à chaque impression
- Clic manuel requis
- Pas idéal pour un restaurant

**Avec serveur (maintenant):**
- Impression directe et automatique
- Aucune intervention manuelle
- Support imprimantes thermiques réseau ESC/POS
- Support imprimantes système (USB/Réseau)
- Fallback automatique si serveur hors ligne

## Comment ça marche?

```
Application Web → Serveur Local (Node.js) → Imprimante
                                          ↓
                                    (Sans dialogue)
```

Le serveur tourne sur votre ordinateur (localhost:3001) et gère toutes les impressions.

## Installation

### 1. Installer les dépendances

```bash
cd print-server
npm install
```

### 2. Démarrer le serveur

**Windows:**
```bash
# Double-cliquez sur:
start-print-server.bat
```

**Mac/Linux:**
```bash
chmod +x start-print-server.sh
./start-print-server.sh
```

Vous devriez voir:
```
========================================
   SERVEUR D'IMPRESSION RESTOBAR
========================================
Serveur démarré sur http://localhost:3001

Endpoints disponibles:
  GET  /health - Vérifier l'état du serveur
  POST /print  - Envoyer une impression
  GET  /printers - Lister les imprimantes système

En attente de requêtes...
```

## Configuration dans l'application

### 1. Vérifier le statut

1. Ouvrez l'application web
2. Allez dans **Paramètres → Imprimantes**
3. En haut, vous verrez:

**Serveur actif:**
```
✓ Serveur d'impression actif
  Impression directe sans dialogue du navigateur
```

**Serveur hors ligne:**
```
⚠ Serveur d'impression hors ligne
  Fallback: utilisation du dialogue d'impression du navigateur
  Pour activer: double-cliquez sur start-print-server.bat
```

### 2. Configurer les imprimantes

#### Imprimante Système (USB/Réseau partagé)

1. Créez une imprimante
2. Choisissez le type (Caisse, Cuisine, Bar)
3. **Port: 0** (important!)
4. Le nom peut être celui de votre imprimante Windows

**Le serveur imprimera directement sur l'imprimante par défaut du système.**

#### Imprimante Thermique Réseau (ESC/POS)

1. Créez une imprimante
2. Choisissez le type
3. **Adresse IP:** (ex: 192.168.1.100)
4. **Port: 9100** (port standard ESC/POS)

**Le serveur enverra les commandes ESC/POS directement sur le réseau.**

## Test

### Test 1: Vérifier que le serveur tourne

```bash
curl http://localhost:3001/health
```

Résultat attendu:
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T...",
  "platform": "win32"
}
```

### Test 2: Lister les imprimantes système

```bash
curl http://localhost:3001/printers
```

Résultat:
```json
{
  "success": true,
  "printers": [
    "Microsoft Print to PDF",
    "HP LaserJet Pro",
    "Canon TS3300"
  ],
  "count": 3
}
```

### Test 3: Impression test depuis l'application

1. Paramètres → Imprimantes
2. Cliquez sur "Tester" pour une imprimante
3. **Regardez la console du serveur:**

```
=== Nouvelle demande d'impression ===
Mode: system
Contenu (234 caractères): ================================...
Impression sur imprimante système: undefined (win32)
✓ Impression réussie
```

4. **Regardez la console du navigateur (F12):**

```
=== PrintService.executePrintJob ===
→ Mode: Imprimante système
Tentative de connexion au serveur d'impression...
✓ Serveur d'impression disponible - utilisation du serveur
Envoi au serveur d'impression pour imprimante système
✓ Impression système via serveur réussie
✓ Job terminé avec succès
```

### Test 4: Encaissement avec impression automatique

1. POS → Sélectionnez une table
2. Ajoutez des articles
3. Cliquez "Encaisser"

**Console du serveur:**
```
=== Nouvelle demande d'impression ===
Mode: system
Contenu (567 caractères): ================================
      🍽️ RESTOBAR
...
✓ Impression réussie
```

**Console du navigateur:**
```
=== printTicket ===
✓ Imprimante de caisse trouvée
✓ Serveur d'impression disponible - utilisation du serveur
✓ Impression système via serveur réussie
✓ Impression ticket terminée avec succès
```

## API du Serveur

### GET /health

Vérifier l'état du serveur.

**Réponse:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T22:30:00.000Z",
  "platform": "win32"
}
```

### GET /printers

Lister les imprimantes système disponibles.

**Réponse:**
```json
{
  "success": true,
  "printers": ["HP LaserJet", "Canon"],
  "count": 2
}
```

### POST /print

Envoyer une impression.

**Body (Imprimante système):**
```json
{
  "mode": "system",
  "printerName": "HP LaserJet",
  "content": "Texte à imprimer..."
}
```

**Body (Imprimante réseau ESC/POS):**
```json
{
  "mode": "network",
  "ipAddress": "192.168.1.100",
  "port": 9100,
  "content": "Texte à imprimer..."
}
```

**Réponse succès:**
```json
{
  "success": true,
  "message": "Impression envoyée avec succès",
  "timestamp": "2026-01-03T22:30:00.000Z"
}
```

**Réponse erreur:**
```json
{
  "error": "Erreur lors de l'impression",
  "details": "Connection refused"
}
```

## Fonctionnalités du Serveur

### 1. Mode Système

Imprime sur les imprimantes installées Windows/Mac/Linux.

**Windows:**
- Utilise `notepad /p` pour imprimer

**Mac/Linux:**
- Utilise `lpr` pour imprimer

### 2. Mode Réseau ESC/POS

Envoie des commandes ESC/POS directement à l'imprimante thermique.

**Commandes ESC/POS supportées:**
- Centrage automatique des titres
- Gras pour les montants importants
- Séparateurs visuels
- Coupe automatique du papier

**Exemple de formatage:**
```
================================
      🍽️ RESTOBAR          (Centré, gras, grande taille)
================================

Ticket: TKT-123456
Date: 03/01/2026

2x Pizza Margherita  ......  18 000 CFA    (Gras)
1x Coca Cola  .............   2 000 CFA

--------------------------------
TOTAL: 20 000 CFA               (Très gras, grande taille)
================================

(Coupe automatique)
```

## Démarrage Automatique

### Windows - Démarrage avec le système

1. **Créez un raccourci de `start-print-server.bat`**
2. Appuyez sur `Win + R`
3. Tapez `shell:startup` et Entrée
4. Collez le raccourci dans ce dossier

Le serveur démarrera automatiquement au démarrage de Windows.

### Mac - LaunchAgent

Créez `/Users/VOTRE_NOM/Library/LaunchAgents/com.restobar.printserver.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.restobar.printserver</string>
    <key>ProgramArguments</key>
    <array>
        <string>/chemin/vers/start-print-server.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

Puis:
```bash
launchctl load ~/Library/LaunchAgents/com.restobar.printserver.plist
```

### Linux - systemd

Créez `/etc/systemd/system/restobar-print.service`:

```ini
[Unit]
Description=Restobar Print Server
After=network.target

[Service]
Type=simple
User=VOTRE_USER
WorkingDirectory=/chemin/vers/print-server
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Puis:
```bash
sudo systemctl enable restobar-print.service
sudo systemctl start restobar-print.service
```

## Résolution de Problèmes

### Le serveur ne démarre pas

**Erreur: "Port 3001 already in use"**

Un autre processus utilise le port 3001.

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID XXXX /F

# Mac/Linux
lsof -i :3001
kill -9 XXXX
```

**Erreur: "node: command not found"**

Node.js n'est pas installé.

**Solution:**
1. Installez Node.js depuis https://nodejs.org
2. Redémarrez le terminal
3. Vérifiez: `node --version`

### Le serveur tourne mais l'impression ne fonctionne pas

**Vérification 1: Le serveur est-il accessible?**

```bash
curl http://localhost:3001/health
```

Si ça échoue, le serveur n'est pas démarré correctement.

**Vérification 2: L'imprimante système existe-t-elle?**

```bash
curl http://localhost:3001/printers
```

Vérifiez que votre imprimante apparaît dans la liste.

**Vérification 3: Logs du serveur**

Regardez la console où le serveur tourne. Vous devriez voir:
```
=== Nouvelle demande d'impression ===
Mode: system
```

Si vous ne voyez rien, la requête n'arrive pas au serveur.

### L'impression réseau ESC/POS ne fonctionne pas

**Test de connexion:**

```bash
# Windows
telnet 192.168.1.100 9100

# Mac/Linux
nc -zv 192.168.1.100 9100
```

Si la connexion échoue:
1. Vérifiez l'adresse IP de l'imprimante
2. Vérifiez que l'imprimante est sur le même réseau
3. Vérifiez que le port 9100 est ouvert
4. Ping l'imprimante: `ping 192.168.1.100`

**Logs du serveur:**
```
Connexion à l'imprimante 192.168.1.100:9100...
Connecté à l'imprimante
Données envoyées
Connexion fermée
✓ Impression réussie
```

### Fallback vers window.print()

Si le serveur n'est pas disponible, l'application utilise automatiquement `window.print()`.

**Console du navigateur:**
```
Tentative de connexion au serveur d'impression...
✗ Serveur d'impression non disponible - fallback sur window.print()
PrintService.printViaWindowPrint - Utilisation de window.print()
```

C'est normal et permet de continuer à travailler même si le serveur n'est pas démarré.

## Avantages en Production

### 1. Impression Silencieuse

Aucun dialogue, aucun clic requis. L'impression se fait automatiquement en arrière-plan.

### 2. Support Multi-Imprimantes

Envoyez simultanément:
- Ticket de caisse → Imprimante caisse
- Commande cuisine → Imprimante cuisine
- Commande bar → Imprimante bar

Tout automatiquement sans intervention.

### 3. Fiabilité

- Détection automatique des imprimantes
- Reconnexion automatique en cas d'erreur
- Fallback sur window.print() si serveur hors ligne
- Logs détaillés pour le dépannage

### 4. Compatibilité

- Windows 7/8/10/11
- macOS
- Linux (Ubuntu, Debian, etc.)
- Imprimantes USB
- Imprimantes réseau partagées
- Imprimantes thermiques ESC/POS (Ethernet)

## Conclusion

Le serveur d'impression transforme votre application en solution professionnelle pour restaurant:

✓ Impression automatique et silencieuse
✓ Support de tous types d'imprimantes
✓ Fiable avec fallback intégré
✓ Facile à installer et configurer
✓ Logs détaillés pour le support

**Pour démarrer:**
1. `cd print-server && npm install`
2. Double-cliquez sur `start-print-server.bat` (Windows)
3. Vérifiez le statut dans Paramètres → Imprimantes
4. Testez l'impression

C'est tout ! Le système est maintenant complètement professionnel.
