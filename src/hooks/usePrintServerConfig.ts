import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PrintServerConfig {
  id: string;
  enabled: boolean;
  server_url: string;
  auto_print: boolean;
  created_at: string;
  updated_at: string;
}

export function usePrintServerConfig() {
  const [config, setConfig] = useState<PrintServerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('print_server_config')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching print server config:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkServerStatus = async (url: string) => {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      setIsServerOnline(response.ok);
    } catch (error) {
      setIsServerOnline(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    const subscription = supabase
      .channel('print_server_config_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_server_config',
        },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (config?.enabled && config?.server_url) {
      checkServerStatus(config.server_url);
      const interval = setInterval(() => {
        checkServerStatus(config.server_url);
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setIsServerOnline(false);
    }
  }, [config?.enabled, config?.server_url]);

  const updateConfig = async (updates: Partial<PrintServerConfig>) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('print_server_config')
        .update(updates)
        .eq('id', config.id);

      if (error) throw error;
      await fetchConfig();
    } catch (error) {
      console.error('Error updating print server config:', error);
      throw error;
    }
  };

  return {
    config,
    loading,
    isServerOnline,
    updateConfig,
    refetch: fetchConfig,
  };
}
