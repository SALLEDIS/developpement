# Configuration des Méthodes de Paiement

## Vue d'ensemble

Le système de configuration des paiements permet de gérer toutes les méthodes de paiement acceptées dans votre établissement. Cette configuration centralisée assure une cohérence dans tout le point de vente.

## Accès à la configuration

1. Connectez-vous à l'application RestoBar
2. Allez dans **Paramètres** (icône ⚙️)
3. Cliquez sur **Paiements** dans le menu latéral

## Méthodes de paiement disponibles

### 1. Espèces (Cash)
- **Par défaut** : Activé
- **Frais** : Aucun
- **Description** : Paiement en argent liquide
- **Reçu obligatoire** : Non
- **Usage** : Paiement direct en caisse

### 2. Carte bancaire
- **Par défaut** : Activé
- **Frais** : 2% (configurable)
- **Description** : Paiement par Visa, Mastercard
- **Reçu obligatoire** : Oui
- **Usage** : Terminal de paiement électronique

### 3. Mobile Money
- **Par défaut** : Activé
- **Frais** : 1% (configurable)
- **Description** : Orange Money, MTN Mobile Money, Wave
- **Reçu obligatoire** : Oui
- **Usage** : Paiement mobile très populaire en Afrique

### 4. Chèque
- **Par défaut** : Désactivé
- **Frais** : Aucun
- **Description** : Paiement par chèque bancaire
- **Reçu obligatoire** : Oui
- **Usage** : Clients avec compte bancaire

### 5. Crédit (Ardoise)
- **Par défaut** : Désactivé
- **Frais** : Aucun
- **Description** : Paiement à crédit pour clients fidèles
- **Reçu obligatoire** : Oui
- **Usage** : Clients de confiance

## Paramètres configurables

### Pour chaque méthode de paiement

#### Activation/Désactivation
- Utilisez le bouton toggle pour activer ou désactiver une méthode
- Les méthodes désactivées n'apparaissent pas dans le point de vente

#### Nom
- Personnalisez le nom affiché
- Exemple : "Mobile Money" → "Orange/MTN Money"

#### Description
- Ajoutez des détails sur la méthode
- Visible pour les caissiers

#### Type de frais
- **Montant fixe** : Frais constant en CFA (ex: 500 CFA)
- **Pourcentage** : Frais calculés sur le total (ex: 2%)

#### Montant des frais
- Définissez le montant ou le pourcentage
- Les frais s'ajoutent au total de la commande
- Affichés séparément sur le ticket

#### Reçu obligatoire
- Si activé, une confirmation supplémentaire est demandée
- Utile pour les paiements nécessitant une preuve

## Cas d'usage

### Configuration pour un bar
```
✅ Espèces (activé, 0%)
✅ Mobile Money (activé, 1%)
❌ Carte bancaire (désactivé)
❌ Chèque (désactivé)
❌ Crédit (désactivé)
```

### Configuration pour un restaurant
```
✅ Espèces (activé, 0%)
✅ Carte bancaire (activé, 2%)
✅ Mobile Money (activé, 1%)
❌ Chèque (désactivé)
✅ Crédit (activé, clients VIP seulement)
```

### Configuration complète
```
✅ Espèces (activé, 0%)
✅ Carte bancaire (activé, 2.5%)
✅ Mobile Money (activé, 1%)
✅ Chèque (activé, 0%)
✅ Crédit (activé, 0%, reçu obligatoire)
```

## Gestion des frais

### Frais en pourcentage
- Calculés sur le montant total
- Exemple : Commande de 10,000 CFA + 2% = 10,200 CFA

### Frais fixes
- Ajoutés au montant total
- Exemple : Commande de 10,000 CFA + 500 CFA = 10,500 CFA

### Affichage des frais
Les frais sont affichés séparément sur :
- L'écran de paiement
- Le ticket de caisse
- Les rapports financiers

## Intégration avec le point de vente

### Au moment du paiement
1. Le caissier sélectionne la méthode de paiement
2. Les frais (si applicable) sont ajoutés automatiquement
3. Le montant total incluant les frais est affiché
4. Si reçu obligatoire : demande de confirmation
5. La transaction est enregistrée avec la méthode utilisée

### Dans les rapports
- Ventes ventilées par méthode de paiement
- Calcul automatique des frais
- Total net après déduction des frais

## Sécurité et traçabilité

### Traçabilité
- Chaque transaction enregistre la méthode utilisée
- Historique complet des paiements
- Rapports détaillés par méthode

### Permissions
- Seuls les administrateurs peuvent modifier la configuration
- Les caissiers ne peuvent que voir les méthodes actives
- Les serveurs n'ont pas accès aux paiements

## Bonnes pratiques

### Activation des méthodes
1. N'activez que les méthodes que vous acceptez réellement
2. Formez le personnel sur chaque méthode activée
3. Testez les nouvelles méthodes avant activation

### Configuration des frais
1. Vérifiez les frais réels de vos prestataires
2. Mettez à jour régulièrement les pourcentages
3. Informez les clients des frais applicables

### Reçu obligatoire
1. Activez pour les paiements électroniques
2. Utile pour la comptabilité
3. Preuve en cas de litige

## Réinitialisation

### Retour aux paramètres par défaut
- Cliquez sur "Réinitialiser" en haut à droite
- Confirme avant de réinitialiser
- Restaure la configuration d'origine

### Ce qui est réinitialisé
- Noms des méthodes
- Descriptions
- Frais
- État d'activation
- Paramètres de reçu

## Support technique

### Problèmes courants

#### Une méthode n'apparaît pas dans le POS
- Vérifiez qu'elle est activée (toggle vert)
- Rechargez l'application
- Vérifiez les permissions utilisateur

#### Les frais ne sont pas calculés
- Vérifiez que le montant des frais est bien défini
- Vérifiez le type de frais (fixe ou pourcentage)
- Testez avec une petite transaction

#### Impossible de modifier une méthode
- Vérifiez vos permissions (admin requis)
- Réessayez après quelques secondes
- Contactez le support si le problème persiste

## Évolutions futures

### Fonctionnalités à venir
- Intégration directe avec les API Mobile Money
- Support des paiements en ligne
- Paiement fractionné (plusieurs méthodes)
- QR Code pour paiements mobiles
- Pourboires sur paiements électroniques

## Recommandations

### Pour débuter
1. Gardez les méthodes par défaut (Espèces + Mobile Money)
2. Ajoutez progressivement d'autres méthodes
3. Surveillez l'utilisation dans les rapports

### Pour optimiser
1. Analysez les méthodes les plus utilisées
2. Ajustez les frais selon vos coûts réels
3. Formez régulièrement votre équipe
4. Demandez les retours des clients

### Pour la comptabilité
1. Rapprochement quotidien par méthode
2. Vérification des frais prélevés
3. Suivi des crédits accordés
4. Export régulier des données
