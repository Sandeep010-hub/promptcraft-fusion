/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const promptId = formData.get('promptId') as string

    if (!file || !promptId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: file and promptId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${promptId}/${Date.now()}.${fileExtension}`
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('prompt_outputs')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(JSON.stringify({ error: 'Failed to upload file to storage' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('prompt_outputs')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabaseAdmin
      .from('prompts')
      .update({
        output_url: urlData.publicUrl,
        output_type: file.type || 'application/octet-stream'
      })
      .eq('id', promptId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update prompt with output information' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        outputUrl: urlData.publicUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in upload-output function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

