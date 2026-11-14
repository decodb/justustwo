// supabase/functions/submit-response/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

const NOTIFY_EMAIL = 'mkwanazibuti082@gmail.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Finds the server-side key whether the project uses the legacy or the new key names
function getSecretKey(): string | undefined {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    return keys['default'] ?? (Object.values(keys)[0] as string | undefined);
  } catch {
    return undefined;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  try {
    const { answer } = await req.json().catch(() => ({}));
    if (answer !== 'yes' && answer !== 'no') return json({ error: 'invalid answer' }, 400);

    const secretKey = getSecretKey();
    if (!secretKey) {
      console.error('no secret key found in function env');
      return json({ error: 'server key missing' }, 500);
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, secretKey);

    // 1. Save her answer
    const { error: dbError } = await supabase.from('proposal_responses').insert({ answer });
    if (dbError) {
      console.error('insert failed', dbError);
      // "detail" is only here to help you debug. Remove it once everything works.
      return json({ error: 'could not save', detail: dbError.message }, 500);
    }

    // 2. Email you
    const yes = answer === 'yes';
    const when = new Date().toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Proposal Site <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL],
        subject: yes ? '💗 She said YES!' : 'Her response: no',
        html: `<div style="font-family:monospace;font-size:16px">
          <h2>${yes ? '💗 She said YES!' : 'Her response: no'}</h2>
          <p>Answer: <b>${yes ? 'yes, I agree to be your girlfriend' : 'no, I can’t be your girlfriend'}</b></p>
          <p>Received: ${when}</p>
        </div>`,
      }),
    });

    // The answer is already saved, so don't show her an error if only the email failed
    if (!res.ok) console.error('email failed', res.status, await res.text());
    return json({ ok: true, emailed: res.ok });
  } catch (e) {
    console.error('unexpected error', e);
    return json({ error: 'unexpected error', detail: String(e) }, 500);
  }
});