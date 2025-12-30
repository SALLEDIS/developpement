# Guide de sécurité RestoBar

## Vue d'ensemble

Les paramètres de sécurité permettent de protéger votre système de point de vente contre les accès non autorisés et les utilisations abusives. Ce guide détaille toutes les options de sécurité disponibles.

## Accès aux paramètres

1. Connectez-vous en tant qu'administrateur
2. Allez dans **Paramètres** → **Sécurité**
3. Configurez les options selon vos besoins
4. Cliquez sur **Enregistrer** après chaque modification

## Sections de configuration

### 1. Sessions et connexions

#### Durée de session (30-1440 minutes)
- **Défaut** : 480 minutes (8 heures)
- **Description** : Temps après lequel un utilisateur inactif est automatiquement déconnecté
- **Recommandation** : 480 minutes pour usage restaurant, 240 minutes pour bar
- **Usage** : Protège contre l'utilisation non autorisée en cas d'oubli

#### Verrouillage automatique (1-60 minutes)
- **Défaut** : 15 minutes
- **Description** : Verrouille l'écran après inactivité, nécessite le PIN pour déverrouiller
- **Recommandation** : 10-15 minutes
- **Usage** : Protection rapide sans déconnexion complète

#### Tentatives maximales de connexion (3-10)
- **Défaut** : 5 tentatives
- **Description** : Nombre d'échecs autorisés avant blocage du compte
- **Recommandation** : 5 tentatives
- **Usage** : Protège contre les attaques par force brute

#### Durée de blocage (5-120 minutes)
- **Défaut** : 30 minutes
- **Description** : Temps de blocage après échec des tentatives
- **Recommandation** : 30-60 minutes
- **Usage** : Dissuade les tentatives répétées

#### Sessions multiples
- **Défaut** : Désactivé
- **Description** : Autorise un même utilisateur à se connecter simultanément sur plusieurs appareils
- **Recommandation** : Désactiver pour renforcer la sécurité
- **Usage** : Contrôle strict de l'accès par utilisateur

### 2. Politique de mots de passe

#### Longueur minimale (4-20 caractères)
- **Défaut** : 6 caractères
- **Description** : Nombre minimum de caractères requis
- **Recommandation** : Minimum 8 caractères pour les administrateurs
- **Usage** : Garantit une complexité de base

#### Majuscules obligatoires
- **Défaut** : Désactivé
- **Description** : Exige au moins une lettre majuscule
- **Recommandation** : Activer pour comptes administrateurs
- **Usage** : Augmente la complexité du mot de passe

#### Minuscules obligatoires
- **Défaut** : Activé
- **Description** : Exige au moins une lettre minuscule
- **Recommandation** : Toujours activé
- **Usage** : Base de la complexité

#### Chiffres obligatoires
- **Défaut** : Activé
- **Description** : Exige au moins un chiffre (0-9)
- **Recommandation** : Toujours activé
- **Usage** : Renforce significativement la sécurité

#### Caractères spéciaux obligatoires
- **Défaut** : Désactivé
- **Description** : Exige au moins un caractère spécial (!@#$%^&*)
- **Recommandation** : Activer pour administrateurs
- **Usage** : Sécurité maximale

#### Expiration du mot de passe (0-365 jours)
- **Défaut** : 90 jours
- **Description** : Fréquence de renouvellement obligatoire (0 = jamais)
- **Recommandation** : 90 jours pour admins, 0 pour serveurs
- **Usage** : Limite l'exposition en cas de compromission

### 3. Sécurité avancée

#### Authentification à deux facteurs (2FA)
- **Défaut** : Désactivé
- **Description** : Code de vérification requis en plus du mot de passe
- **Recommandation** : Activer pour tous les administrateurs
- **Usage** : Protection maximale des comptes privilégiés
- **Note** : Nécessite une application d'authentification (Google Authenticator, Authy)

#### Code PIN pour actions sensibles
- **Défaut** : Activé
- **Description** : Demande le PIN pour suppression, annulation, modification de prix
- **Recommandation** : Toujours activé
- **Usage** : Évite les erreurs et fraudes
- **Actions concernées** :
  - Suppression de produits
  - Annulation de commandes
  - Modification de prix
  - Remises importantes
  - Suppression d'utilisateurs

#### Filtrage IP (Whitelist)
- **Défaut** : Désactivé
- **Description** : Limite l'accès à des adresses IP spécifiques
- **Recommandation** : Activer si IP fixe disponible
- **Usage** : Restreint l'accès géographiquement
- **Configuration** : Ajoutez vos IP autorisées dans les paramètres avancés

### 4. Audit et journalisation

#### Journalisation des actions
- **Défaut** : Activé
- **Description** : Enregistre toutes les actions importantes dans le système
- **Recommandation** : Toujours activé
- **Usage** : Traçabilité complète, investigation en cas d'incident

**Actions journalisées** :
- Connexions et déconnexions
- Modifications de produits et prix
- Annulations de commandes
- Modifications d'utilisateurs
- Changements de paramètres
- Ouverture et fermeture de caisse
- Remises et ajustements

#### Rétention des logs (7-365 jours)
- **Défaut** : 90 jours
- **Description** : Durée de conservation des journaux
- **Recommandation** : Minimum 90 jours (légal), 180 jours idéal
- **Usage** : Conformité légale, investigation différée

### 5. Sauvegardes

#### Sauvegardes automatiques
- **Défaut** : Activé
- **Description** : Sauvegarde régulière de toutes les données
- **Recommandation** : Toujours activé
- **Usage** : Protection contre perte de données

#### Fréquence de sauvegarde
- **Options** : Quotidienne, Hebdomadaire, Mensuelle
- **Défaut** : Quotidienne
- **Recommandation** : Quotidienne (automatique à 4h du matin)
- **Usage** : Récupération en cas de problème

**Données sauvegardées** :
- Tous les produits et catégories
- Toutes les commandes
- Tous les utilisateurs
- Toutes les tables
- Tous les rapports
- Tous les paramètres

### 6. Notifications

#### Alertes de sécurité
- **Défaut** : Activé
- **Description** : Notifie les événements de sécurité importants
- **Recommandation** : Activé pour administrateurs
- **Usage** : Réaction rapide aux incidents

**Événements notifiés** :
- Tentatives de connexion échouées multiples
- Blocage de compte
- Modifications de paramètres de sécurité
- Connexions depuis nouvelles IP
- Modifications d'utilisateurs administrateurs
- Échec de sauvegardes

## Configurations recommandées

### Configuration minimale (Petite structure)
```
✅ Session : 480 minutes
✅ Verrouillage : 15 minutes
✅ Tentatives : 5
✅ Blocage : 30 minutes
✅ Mot de passe : 6 caractères minimum
✅ Chiffres obligatoires
✅ PIN pour actions sensibles
✅ Audit activé (90 jours)
✅ Sauvegarde quotidienne
✅ Alertes activées
```

### Configuration intermédiaire (Structure moyenne)
```
✅ Session : 360 minutes
✅ Verrouillage : 10 minutes
✅ Tentatives : 5
✅ Blocage : 30 minutes
✅ Mot de passe : 8 caractères minimum
✅ Majuscules + minuscules + chiffres
✅ Expiration : 90 jours (admins)
✅ PIN pour actions sensibles
✅ Sessions multiples : Non
✅ Audit activé (180 jours)
✅ Sauvegarde quotidienne
✅ Alertes activées
```

### Configuration maximale (Grande structure / Haute sécurité)
```
✅ Session : 240 minutes
✅ Verrouillage : 5 minutes
✅ Tentatives : 3
✅ Blocage : 60 minutes
✅ Mot de passe : 10 caractères minimum
✅ Majuscules + minuscules + chiffres + spéciaux
✅ Expiration : 60 jours
✅ 2FA activé (admins)
✅ PIN pour actions sensibles
✅ Sessions multiples : Non
✅ Filtrage IP activé
✅ Audit activé (365 jours)
✅ Sauvegarde quotidienne
✅ Alertes activées
```

## Bonnes pratiques

### Gestion des mots de passe
1. Ne jamais partager les mots de passe
2. Utiliser des mots de passe différents par utilisateur
3. Changer immédiatement après départ d'un employé
4. Noter les mots de passe dans un endroit sécurisé
5. Former les employés aux bonnes pratiques

### Gestion des sessions
1. Toujours se déconnecter en fin de service
2. Utiliser le verrouillage rapide lors de pauses courtes
3. Ne pas laisser l'application ouverte sans surveillance
4. Vérifier régulièrement les connexions actives

### Audit et surveillance
1. Consulter les logs régulièrement
2. Investiguer toute activité suspecte
3. Conserver les logs importants hors ligne
4. Vérifier les tentatives de connexion échouées
5. Surveiller les actions sensibles

### Sauvegardes
1. Tester régulièrement la restauration
2. Conserver plusieurs copies
3. Stocker une copie hors site
4. Vérifier l'intégrité des sauvegardes
5. Documenter la procédure de restauration

### Formation du personnel
1. Former tous les utilisateurs à la sécurité
2. Expliquer l'importance des règles
3. Simuler des incidents pour tester les réactions
4. Mettre à jour la formation régulièrement
5. Documenter les procédures

## Incidents et réponses

### Compte bloqué
**Symptôme** : Impossible de se connecter après plusieurs tentatives
**Solution** :
1. Attendre la durée de blocage (défaut : 30 min)
2. Ou demander à un administrateur de réinitialiser
3. Vérifier que le mot de passe est correct
4. Contacter le support si le problème persiste

### Mot de passe oublié
**Symptôme** : Utilisateur ne se souvient plus du mot de passe
**Solution** :
1. L'administrateur doit réinitialiser le mot de passe
2. Aller dans Paramètres → Utilisateurs
3. Sélectionner l'utilisateur concerné
4. Cliquer sur "Réinitialiser le mot de passe"
5. Communiquer le nouveau mot de passe de manière sécurisée

### Session expirée
**Symptôme** : Déconnexion automatique pendant utilisation
**Solution** :
1. Se reconnecter avec identifiants
2. Si récurrent, augmenter la durée de session
3. Vérifier l'activité réelle de l'utilisateur

### Activité suspecte détectée
**Symptôme** : Alerte de tentatives de connexion multiples
**Actions** :
1. Vérifier les logs d'audit
2. Identifier l'utilisateur concerné
3. Vérifier s'il s'agit d'erreurs légitimes
4. Bloquer le compte si nécessaire
5. Changer le mot de passe
6. Informer l'utilisateur

### Perte de données
**Symptôme** : Données manquantes ou corrompues
**Actions** :
1. Ne pas paniquer
2. Identifier la dernière sauvegarde valide
3. Contacter le support technique
4. Préparer la restauration
5. Tester sur un environnement de test d'abord
6. Restaurer les données
7. Vérifier l'intégrité après restauration

## Conformité et légalité

### RGPD (Protection des données)
- Conservation limitée des logs personnels
- Droit d'accès aux données personnelles
- Droit à l'oubli après départ
- Sécurisation des données personnelles
- Notification en cas de violation

### Réglementation comptable
- Conservation des transactions 10 ans
- Traçabilité des modifications
- Impossibilité de supprimer l'historique
- Audit trail complet
- Sauvegardes régulières

### Droits du travail
- Surveillance proportionnée
- Information des employés
- Protection des données personnelles
- Respect de la vie privée

## Maintenance

### Tâches quotidiennes
- ✅ Vérifier les alertes de sécurité
- ✅ Confirmer la sauvegarde automatique
- ✅ Surveiller les connexions actives

### Tâches hebdomadaires
- ✅ Consulter les logs d'audit
- ✅ Vérifier les tentatives de connexion échouées
- ✅ Réviser les comptes utilisateurs actifs

### Tâches mensuelles
- ✅ Tester la restauration d'une sauvegarde
- ✅ Réviser les paramètres de sécurité
- ✅ Former le personnel sur nouveautés
- ✅ Mettre à jour la documentation

### Tâches trimestrielles
- ✅ Audit de sécurité complet
- ✅ Révision des droits d'accès
- ✅ Nettoyage des logs anciens
- ✅ Évaluation des risques

### Tâches annuelles
- ✅ Révision complète de la politique de sécurité
- ✅ Formation approfondie du personnel
- ✅ Test de reprise après sinistre
- ✅ Audit externe (si nécessaire)

## Support technique

### Problèmes courants

#### Impossible d'accéder aux paramètres de sécurité
- Vérifier que vous êtes connecté en tant qu'administrateur
- Seuls les administrateurs ont accès à ces paramètres

#### Les changements ne sont pas appliqués
- Cliquer sur "Enregistrer" après chaque modification
- Rafraîchir l'application
- Vérifier la connexion internet

#### Les utilisateurs se plaignent de déconnexions fréquentes
- Augmenter la durée de session
- Vérifier si le verrouillage auto n'est pas trop court
- Sensibiliser sur l'importance de rester actif

#### Les sauvegardes échouent
- Vérifier l'espace de stockage disponible
- Vérifier la connexion internet
- Contacter le support Supabase

### Contact support
- Email : support@restobar.com
- Téléphone : +225 XX XX XX XX
- WhatsApp : +225 XX XX XX XX
- Heures : Lun-Ven 8h-18h, Sam 8h-12h

## Ressources additionnelles

### Documentation connexe
- [Guide utilisateur](./README.md)
- [Configuration des paiements](./CONFIGURATION_PAIEMENTS.md)
- [Guide serveur](./GUIDE_SERVEUR.md)

### Liens utiles
- CNIL (Protection des données)
- ANSSI (Sécurité informatique)
- ISO 27001 (Standard de sécurité)

### Formation en ligne
- Cybersécurité pour les TPE/PME
- Protection des données personnelles
- Gestion des incidents de sécurité

## Historique des versions

### Version 1.0 (2024)
- Paramètres de session et connexion
- Politique de mots de passe
- Sécurité avancée (2FA, PIN)
- Audit et journalisation
- Sauvegardes automatiques
- Notifications de sécurité

### Prochaines évolutions
- Détection des anomalies par IA
- Authentification biométrique
- Chiffrement de bout en bout
- Conformité PCI-DSS pour paiements
- Audit automatique des vulnérabilités
