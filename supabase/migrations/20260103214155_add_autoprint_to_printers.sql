/*
  # Ajouter la colonne autoprint à la table printers

  1. Modifications
    - Ajout de la colonne `autoprint` (boolean) à la table `printers` avec valeur par défaut false
  
  2. Notes
    - Cette colonne permet de configurer l'impression automatique pour chaque imprimante
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'printers' AND column_name = 'autoprint'
  ) THEN
    ALTER TABLE printers ADD COLUMN autoprint boolean DEFAULT false;
  END IF;
END $$;
