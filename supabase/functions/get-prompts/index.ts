/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse search terms from the request body
    const { search, category } = await req.json();

    let query = supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`original_prompt.ilike.%${search}%,generated_prompt.ilike.%${search}%,target_model.ilike.%${search}%`);
    }
    if (category && category !== 'All') {
      query = query.eq('target_model', category);
    }

    const { data: prompts, error: fetchError } = await query;

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      throw new Error(fetchError.message);
    }

    // --- THIS IS THE FIX ---
    // Transform the database data into the rich format the frontend expects
    const transformedPrompts = prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.original_prompt, // Use original_prompt as title
      content: prompt.generated_prompt,
      category: prompt.target_model,
      tags: [prompt.target_model], // Create a default tag
      usage_count: 1, // Default usage count
      starred: false, // Default starred status
      created_at: new Date(prompt.created_at).toLocaleDateString(), // Format date
    }));
    // --------------------

    return new Response(JSON.stringify({
        prompts: transformedPrompts,
        total: transformedPrompts.length,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-prompts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

