# Démarrage rapide - Imprimantes réseau

## Configuration en 3 étapes

### Étape 1: Démarrer le serveur d'impression

**Windows:**
Double-cliquez sur `start-print-server.bat`

**Mac/Linux:**
```bash
./start-print-server.sh
```

Une fenêtre s'ouvrira avec le message:
```
========================================
   SERVEUR D'IMPRESSION RESTOBAR
========================================
Serveur démarré sur http://localhost:3001
```

**⚠️ IMPORTANT: Laissez cette fenêtre ouverte!**

### Étape 2: Configurer vos imprimantes

1. Ouvrez RestoBar dans votre navigateur
2. Allez dans **Paramètres → Imprimantes**
3. Cliquez sur **"Ajouter une imprimante"**

**Pour l'imprimante de cuisine:**
- Nom: `Imprimante Cuisine`
- Type: `Cuisine`
- Connexion: `Imprimante réseau` ✓
- Adresse IP: `192.168.1.100` (remplacez par votre IP)
- Port: `9100`

**Pour l'imprimante de bar:**
- Nom: `Imprimante Bar`
- Type: `Bar`
- Connexion: `Imprimante réseau` ✓
- Adresse IP: `192.168.1.101` (remplacez par votre IP)
- Port: `9100`

**Pour l'imprimante de caisse:**
- Nom: `Imprimante Caisse`
- Type: `Caisse`
- Connexion: `Imprimante système` ✓

### Étape 3: Tester

Cliquez sur le bouton **"Test d'impression"** pour chaque imprimante.

**Si le test réussit:** ✓ L'imprimante devrait imprimer un ticket de test

**Si le test échoue:**
- Vérifiez que le serveur d'impression est démarré (Étape 1)
- Vérifiez l'adresse IP de l'imprimante
- Vérifiez que l'imprimante est allumée et connectée au réseau

## Trouver l'adresse IP de votre imprimante

### Méthode 1: Sur l'imprimante
- La plupart des imprimantes affichent leur IP sur un écran LCD
- Consultez le manuel de votre imprimante

### Méthode 2: Via votre routeur
1. Connectez-vous à votre routeur (généralement http://192.168.1.1)
2. Cherchez la liste des appareils connectés
3. Trouvez l'imprimante dans la liste

### Méthode 3: Imprimer la configuration
- De nombreuses imprimantes ont un bouton pour imprimer leur configuration réseau
- L'IP sera indiquée sur le ticket imprimé

## Problèmes courants

### "Serveur d'impression non accessible"
→ Le serveur n'est pas démarré. Retournez à l'Étape 1.

### "Timeout de connexion"
→ L'adresse IP est incorrecte ou l'imprimante est éteinte.
→ Vérifiez avec: `ping 192.168.1.100`

### "Connection refused"
→ Le port est incorrect. Essayez 9100, 9101, ou 9102.

### L'imprimante ne sort rien
→ Vérifiez que:
- Le serveur d'impression affiche "Impression envoyée avec succès"
- L'imprimante a du papier
- L'imprimante n'est pas en erreur (voyant rouge)

## Utilisation quotidienne

**Chaque jour:**
1. Démarrez le serveur d'impression (double-clic sur `start-print-server.bat`)
2. Ouvrez RestoBar
3. Les imprimantes fonctionneront automatiquement

**À la fermeture:**
- Vous pouvez fermer la fenêtre du serveur d'impression
- Les imprimantes système continueront de fonctionner

## Besoin d'aide?

Consultez le guide complet: `INSTALLATION_IMPRIMANTES.md`
