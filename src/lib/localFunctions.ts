import { supabase } from '@/integrations/supabase/client';

const LOCAL_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

export async function invokeFunctionLocally(functionName: string, body: any) {
  if (!LOCAL_FUNCTIONS_URL) {
    // Use regular Supabase client if no local URL is configured
    return supabase.functions.invoke(functionName, { body });
  }

  try {
    const url = `${LOCAL_FUNCTIONS_URL}/${functionName}`;
    
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    console.log(`Calling local function: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Function error:', errorText);
      return { 
        data: null, 
        error: new Error(`Function invocation failed: ${response.status} - ${errorText}`) 
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Function invocation error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
