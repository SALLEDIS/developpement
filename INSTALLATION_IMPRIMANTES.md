# Installation et configuration des imprimantes

## Vue d'ensemble

RestoBar supporte deux types d'imprimantes:
- **Imprimante système** (locale) - Pour la caisse
- **Imprimantes réseau** (ESC/POS) - Pour la cuisine et le bar

## 1. Imprimante de caisse (Imprimante système)

### Configuration simple
1. Connectez votre imprimante thermique à l'ordinateur via USB
2. Installez les pilotes de l'imprimante si nécessaire
3. Dans RestoBar, allez dans **Paramètres → Imprimantes**
4. Cliquez sur **"Ajouter une imprimante"**
5. Configurez:
   - Nom: "Imprimante Caisse"
   - Type: **Caisse**
   - Connexion: **Imprimante système** (coché)
6. Cliquez sur **"Ajouter"**
7. Testez avec le bouton **"Test d'impression"**

L'impression s'ouvrira dans une fenêtre de dialogue du navigateur. Sélectionnez votre imprimante thermique et imprimez.

## 2. Imprimantes réseau (Cuisine/Bar)

Les imprimantes réseau nécessitent un serveur local pour fonctionner.

### Prérequis
- Node.js installé sur l'ordinateur
- Imprimantes réseau ESC/POS configurées avec des adresses IP fixes
- Toutes les imprimantes sur le même réseau que l'ordinateur

### Installation du serveur d'impression

#### Étape 1: Installer les dépendances
```bash
cd print-server
npm install
```

#### Étape 2: Démarrer le serveur
```bash
npm start
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

En attente de requêtes...
```

**Important:** Laissez ce terminal ouvert. Le serveur doit rester actif pour que les impressions réseau fonctionnent.

#### Étape 3: Configurer vos imprimantes réseau

1. Trouvez l'adresse IP de chaque imprimante:
   - Généralement affichée sur l'écran de l'imprimante
   - Ou consultez votre routeur pour voir les appareils connectés
   - Exemple: `192.168.1.100`

2. Dans RestoBar, allez dans **Paramètres → Imprimantes**

3. Pour l'imprimante de cuisine:
   - Cliquez sur **"Ajouter une imprimante"**
   - Nom: "Imprimante Cuisine"
   - Type: **Cuisine**
   - Connexion: **Imprimante réseau** (coché)
   - Adresse IP: `192.168.1.100` (votre adresse IP)
   - Port: `9100` (port par défaut ESC/POS)
   - Cliquez sur **"Ajouter"**

4. Pour l'imprimante de bar:
   - Répétez le processus avec Type: **Bar**
   - Utilisez l'adresse IP de l'imprimante du bar

5. Testez chaque imprimante avec **"Test d'impression"**

## 3. Vérification

### Vérifier que le serveur d'impression fonctionne
Ouvrez un navigateur et allez sur: `http://localhost:3001/health`

Vous devriez voir:
```json
{
  "status": "ok",
  "timestamp": "2024-01-03T..."
}
```

### Tester la connexion à une imprimante
Depuis un terminal:
```bash
telnet 192.168.1.100 9100
```

Si la connexion réussit, l'imprimante est accessible.

## 4. Résolution de problèmes

### L'imprimante système n'imprime rien
- Vérifiez que l'imprimante est allumée et connectée
- Vérifiez qu'elle est définie comme imprimante par défaut dans Windows/Mac
- Vérifiez qu'il y a du papier
- Essayez d'imprimer une page de test depuis Windows/Mac

### Le serveur d'impression ne démarre pas
```bash
# Port déjà utilisé? Trouvez le processus:
# Windows:
netstat -ano | findstr :3001

# Mac/Linux:
lsof -i :3001

# Tuez le processus et redémarrez
```

### L'imprimante réseau ne reçoit rien
1. **Vérifiez que le serveur d'impression est démarré**
   - Le terminal doit afficher "En attente de requêtes..."

2. **Vérifiez l'adresse IP**
   ```bash
   ping 192.168.1.100
   ```
   Si pas de réponse, l'imprimante n'est pas accessible.

3. **Vérifiez le port**
   ```bash
   telnet 192.168.1.100 9100
   ```

4. **Vérifiez le pare-feu**
   - Windows: Autorisez Node.js dans le pare-feu Windows
   - Mac: Préférences Système → Sécurité → Pare-feu

5. **Vérifiez les logs du serveur**
   - Le terminal du serveur affiche toutes les tentatives d'impression
   - Recherchez les messages d'erreur

### "Serveur d'impression non accessible"
Ce message signifie que le serveur local (port 3001) n'est pas démarré.

**Solution:**
```bash
cd print-server
npm start
```

### Timeout de connexion
- L'imprimante n'est pas sur le même réseau
- L'adresse IP est incorrecte
- L'imprimante est éteinte
- Le port est incorrect (essayez 9100, 9101, ou 9102)

## 5. Configuration avancée

### Démarrage automatique du serveur (Windows)

Créez un fichier `start-print-server.bat`:
```batch
@echo off
cd /d "%~dp0print-server"
start "RestoBar Print Server" cmd /k npm start
```

Double-cliquez pour démarrer le serveur.

### Démarrage automatique (Mac/Linux)

Créez un fichier `start-print-server.sh`:
```bash
#!/bin/bash
cd "$(dirname "$0")/print-server"
npm start
```

Rendez-le exécutable:
```bash
chmod +x start-print-server.sh
./start-print-server.sh
```

## 6. Attribution des imprimantes aux catégories

Une fois les imprimantes configurées, vous pouvez assigner chaque catégorie de produits à une imprimante:

1. Allez dans **Paramètres → Produits et catégories**
2. Pour chaque catégorie:
   - **Plats** → Imprimante Cuisine
   - **Boissons** → Imprimante Bar
   - **Cocktails** → Imprimante Bar
   - **Desserts** → Imprimante Cuisine

3. Les commandes seront automatiquement routées vers les bonnes imprimantes

## Support

Pour toute question sur la configuration des imprimantes, consultez:
- Les logs du serveur d'impression (terminal)
- Les logs du navigateur (F12 → Console)
- Le fichier `print-server/README.md`
