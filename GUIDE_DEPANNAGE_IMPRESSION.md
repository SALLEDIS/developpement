# Guide de dépannage - Impression

## CORRECTION APPLIQUÉE

L'impression a été corrigée avec:
1. Ajout de l'impression automatique du ticket lors de l'encaissement
2. Logs détaillés dans la console pour diagnostiquer les problèmes
3. Meilleurs messages d'erreur
4. Configuration automatique de l'imprimante de caisse

## Comment tester maintenant

### 1. Configurer l'imprimante de caisse

1. Allez dans **Paramètres → Imprimantes**
2. Cliquez sur **"Configurer automatiquement"**
3. Une imprimante de caisse sera créée automatiquement
4. Testez-la avec le bouton **"Tester"**

### 2. Tester l'encaissement (impression ticket)

1. Ouvrez la console (F12)
2. Allez dans **POS**
3. Sélectionnez une table
4. Ajoutez des articles
5. Cliquez sur **"Encaisser"**
6. Regardez les logs dans la console:

```
=== printTicket ===
Commande: CMD-123456
✓ Imprimante de caisse trouvée: Imprimante Caisse
=== PrintService.executePrintJob ===
✓ Imprimante trouvée: Imprimante Caisse
→ Mode: Imprimante système
Ouverture de la fenêtre d'impression...
✓ Job terminé avec succès
```

### 3. Tester l'envoi cuisine/bar

1. Allez dans **Paramètres → Imprimantes**
2. Ajoutez une imprimante de type **Cuisine** et/ou **Bar**
3. Retournez au **POS**
4. Ajoutez des articles
5. Cliquez sur **"Envoyer"**
6. Regardez les logs:

```
Envoi vers les imprimantes: ['cuisine', 'bar']
=== printOrderByPrinter ===
Type d'imprimante demandée: cuisine
✓ Imprimante trouvée: Imprimante Cuisine
✓ Impression terminée pour cuisine
```

## Le test d'impression échoue

### 1. Ouvrir la console du navigateur
Appuyez sur **F12** pour ouvrir les outils de développement, puis cliquez sur l'onglet **Console**.

### 2. Vérifier les logs

Quand vous testez une imprimante, vous devriez voir ces messages:

```
=== TEST D'IMPRESSION ===
Imprimante: [nom]
Type: [caisse/cuisine/bar]
Port: [0 pour système, 9100 pour réseau]

PrintService - Détection des imprimantes système...
✓ Imprimante système disponible: Imprimante système

=== PrintService.executePrintJob ===
Type de job: ticket
✓ Imprimante trouvée: [nom]
→ Mode: Imprimante système
  Imprimante système: Imprimante système

Ouverture de la fenêtre d'impression...
Impression envoyée vers l'imprimante système: Imprimante système
✓ Job terminé avec succès
```

### 3. Problèmes courants

#### Message: "Imprimante introuvable"
**Cause:** L'imprimante n'est pas correctement sauvegardée dans la base de données.

**Solution:**
1. Allez dans Paramètres → Imprimantes
2. Supprimez l'imprimante
3. Recréez-la avec le bouton "Configurer automatiquement"

#### Message: "Imprimante système non disponible"
**Cause:** Le PrintService n'a pas pu détecter d'imprimante système.

**Solution:**
1. Rechargez la page (F5)
2. Vérifiez dans la console que vous voyez: `✓ Imprimante système disponible: Imprimante système`
3. Si non, copiez les logs de la console et contactez le support

#### Message: "Serveur d'impression non accessible"
**Cause:** Pour les imprimantes réseau uniquement - le serveur local n'est pas démarré.

**Solution:**
```bash
# Windows: double-cliquez sur
start-print-server.bat

# Mac/Linux:
./start-print-server.sh
```

#### La fenêtre d'impression ne s'ouvre pas
**Cause:** Le navigateur bloque les pop-ups ou l'impression.

**Solution:**
1. Vérifiez que les pop-ups sont autorisés pour ce site
2. Vérifiez que vous n'avez pas bloqué l'impression
3. Essayez avec un autre navigateur (Chrome recommandé)

#### La fenêtre d'impression s'ouvre mais l'imprimante n'imprime rien
**Cause:** Problème avec l'imprimante physique.

**Solution:**
1. Vérifiez que l'imprimante est allumée
2. Vérifiez qu'il y a du papier
3. Vérifiez que l'imprimante n'a pas d'erreur (voyant rouge)
4. Essayez d'imprimer une page de test depuis Windows
5. Vérifiez que l'imprimante est bien sélectionnée dans le dialogue

## Imprimantes réseau

### Test de connexion

Pour une imprimante réseau, vérifiez d'abord si elle est accessible:

```bash
# Windows/Mac/Linux
ping 192.168.1.100

# Si ça répond, testez le port:
telnet 192.168.1.100 9100
```

Si `telnet` se connecte, l'imprimante est accessible.

### Vérifier le serveur d'impression

Le serveur doit afficher:
```
========================================
   SERVEUR D'IMPRESSION RESTOBAR
========================================
Serveur démarré sur http://localhost:3001

En attente de requêtes...
```

Quand vous testez une imprimante réseau, vous devriez voir:
```
Nouvelle demande d'impression:
- Imprimante: 192.168.1.100:9100
- Contenu: ...

Connexion à l'imprimante 192.168.1.100:9100...
Connecté à l'imprimante
Données envoyées
Connexion fermée
```

## Logs détaillés

Pour obtenir des logs complets pour le support:

1. Ouvrez la console (F12)
2. Cliquez sur "Clear console" (icône interdiction)
3. Testez l'imprimante
4. Cliquez droit sur les logs → "Save as..." → Envoyez le fichier au support

## Toujours pas résolu?

Fournissez ces informations au support:
- Type d'imprimante (système/réseau)
- Navigateur utilisé (Chrome, Firefox, etc.)
- Système d'exploitation (Windows 10/11, Mac, Linux)
- Logs de la console (F12)
- Pour réseau: logs du serveur d'impression
- Captures d'écran de l'erreur
