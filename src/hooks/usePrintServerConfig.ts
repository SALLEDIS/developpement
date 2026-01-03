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
    console.log('=== UPDATE CONFIG ===');
    console.log('Current config:', config);
    console.log('Updates:', updates);

    try {
      if (!config) {
        console.log('Config is null, fetching from DB...');
        const { data, error } = await supabase
          .from('print_server_config')
          .select('*')
          .maybeSingle();

        console.log('Fetch result:', { data, error });

        if (error) {
          console.error('Error fetching config:', error);
          throw error;
        }

        if (!data) {
          console.log('No config found, inserting...');
          const newConfig = {
            enabled: false,
            server_url: 'http://localhost:3001',
            auto_print: true,
            ...updates
          };
          console.log('New config to insert:', newConfig);

          const { error: insertError } = await supabase
            .from('print_server_config')
            .insert(newConfig);

          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }
          console.log('Config inserted successfully');
        } else {
          console.log('Config found, updating with ID:', data.id);
          const { error: updateError } = await supabase
            .from('print_server_config')
            .update(updates)
            .eq('id', data.id);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
          console.log('Config updated successfully');
        }
      } else {
        console.log('Using cached config, updating with ID:', config.id);
        const { error } = await supabase
          .from('print_server_config')
          .update(updates)
          .eq('id', config.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Config updated successfully');
      }

      console.log('Refreshing config...');
      await fetchConfig();
      console.log('Config refreshed');
    } catch (error) {
      console.error('=== ERROR IN UPDATE CONFIG ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
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
