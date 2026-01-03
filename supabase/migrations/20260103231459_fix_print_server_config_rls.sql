/*
  # Correction des politiques RLS pour print_server_config

  1. Modifications
    - Permet à tous les utilisateurs authentifiés de modifier la configuration du serveur d'impression
    - Supprime la restriction admin-only car il s'agit d'un paramètre technique global

  2. Raison
    - La configuration du serveur d'impression est un paramètre technique partagé
    - Tous les utilisateurs doivent pouvoir l'activer/désactiver selon leur environnement
*/

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent modifier la config serveur im" ON print_server_config;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent créer la config serveur impr" ON print_server_config;

-- Nouvelle politique UPDATE pour tous les utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent modifier config serveur impression"
  ON print_server_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Nouvelle politique INSERT pour tous les utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent créer config serveur impression"
  ON print_server_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);