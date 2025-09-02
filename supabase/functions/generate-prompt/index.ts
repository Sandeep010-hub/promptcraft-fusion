/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, targetModel } = await req.json();

    if (!prompt || !targetModel) {
      return new Response(JSON.stringify({ error: 'Missing prompt or targetModel' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- IMPROVED META-PROMPT ---
    // This gives the AI much stricter instructions on the output format.
    let metaPrompt = '';
    if (targetModel === 'All') {
      metaPrompt = `You are an expert prompt engineer. A user wants to refine this prompt: "${prompt}". 
      Your task is to generate three improved versions, one for each major AI model.
      Return ONLY the refined prompts, without any conversational text, explanations, or markdown formatting.
      Structure your response as a clean block of text, with each prompt clearly labeled. For example:
      For Gemini: [Your refined prompt for Gemini here]
      For ChatGPT: [Your refined prompt for ChatGPT here]
      For Claude: [Your refined prompt for Claude here]`;
    } else {
      metaPrompt = `You are an expert prompt engineer. A user wants to refine this prompt: "${prompt}". 
      Your task is to generate one single, highly effective version of this prompt specifically for the ${targetModel} language model.
      Return ONLY the refined prompt text. Do not include any extra words, explanations, or markdown formatting like asterisks or hashtags.`;
    }
    // ----------------------------

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: metaPrompt }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawPrompt = geminiData.candidates[0]?.content?.parts[0]?.text || 'Failed to generate prompt';

    // --- FINAL CLEANUP STEP ---
    // This removes any lingering markdown, just in case.
    const cleanedPrompt = rawPrompt.replace(/[`\*#]/g, '').trim();
    // ------------------------

    return new Response(
      JSON.stringify({ generatedPrompt: cleanedPrompt }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

