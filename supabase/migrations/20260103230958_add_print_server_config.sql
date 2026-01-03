/*
  # Configuration du serveur d'impression

  1. Nouvelle table
    - `print_server_config`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - Active/désactive le serveur d'impression
      - `server_url` (text) - URL du serveur d'impression
      - `auto_print` (boolean) - Impression automatique sans confirmation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Politique SELECT pour tous les utilisateurs authentifiés
    - Politique UPDATE uniquement pour les administrateurs

  3. Données initiales
    - Configuration par défaut avec serveur local
*/

-- Créer la table de configuration du serveur d'impression
CREATE TABLE IF NOT EXISTS print_server_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT false NOT NULL,
  server_url text DEFAULT 'http://localhost:3001' NOT NULL,
  auto_print boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE print_server_config ENABLE ROW LEVEL SECURITY;

-- Politique pour lire la configuration (tous les utilisateurs authentifiés)
CREATE POLICY "Tous les utilisateurs peuvent lire la config serveur impression"
  ON print_server_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour modifier la configuration (administrateurs uniquement)
CREATE POLICY "Seuls les administrateurs peuvent modifier la config serveur impression"
  ON print_server_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Politique pour insérer la configuration (administrateurs uniquement)
CREATE POLICY "Seuls les administrateurs peuvent créer la config serveur impression"
  ON print_server_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insérer la configuration par défaut
INSERT INTO print_server_config (enabled, server_url, auto_print)
VALUES (false, 'http://localhost:3001', true)
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_print_server_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_print_server_config_updated_at_trigger ON print_server_config;
CREATE TRIGGER update_print_server_config_updated_at_trigger
  BEFORE UPDATE ON print_server_config
  FOR EACH ROW
  EXECUTE FUNCTION update_print_server_config_updated_at();