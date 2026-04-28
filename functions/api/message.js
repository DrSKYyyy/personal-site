// Cloudflare Pages Functions — 匿名留言处理
// 部署到 Cloudflare Pages 后自动生效，无需额外配置

export async function onRequest(context) {
  const request = context.request;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name') || '匿名';
    const email = formData.get('email') || '';
    const message = formData.get('message') || '';
    const subject = formData.get('_subject') || '来自网站的新留言';

    if (!message.trim()) {
      return new Response(JSON.stringify({ ok: false, error: '留言内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // ↓ 把下面的邮箱换成你的真实邮箱
    const YOUR_EMAIL = '121622090@qq.com';

    const emailBody = `来自: ${name}${email ? ' (' + email + ')' : ''}\n\n留言内容:\n${message}`;

    const sendReq = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: YOUR_EMAIL }], subject: subject }],
        from: { email: 'noreply@' + request.headers.get('host'), name: '网站留言系统' },
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    });

    const resp = await fetch(sendReq);
    if (resp.ok) {
      return new Response(JSON.stringify({ ok: true, success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    return new Response(JSON.stringify({ ok: false, error: '邮件发送失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: '服务器内部错误' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
