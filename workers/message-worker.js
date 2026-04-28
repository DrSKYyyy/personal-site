// Cloudflare Worker — 匿名留言处理
// 部署方式（任选其一）：
//   方式 A：登录 Cloudflare Dashboard → Workers & Pages → 创建 Worker → 粘贴此代码 → 部署
//   方式 B：在项目目录下运行 npm install wrangler --save-dev，然后 wrangler deploy
//
// MailChannels 免费发送要求：
//   域名（如 xxs.beauty）必须通过 Cloudflare 代理（DNS 橙云标志）
//   无需额外配置，MailChannels 自动信任 Cloudflare 网络流量

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: '仅支持 POST 请求' }), {
        status: 405,
        headers: responseHeaders(),
      });
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
          headers: responseHeaders(),
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
          from: { email: 'noreply@' + (new URL(request.url).hostname), name: '网站留言系统' },
          content: [{ type: 'text/plain', value: emailBody }],
        }),
      });

      const resp = await fetch(sendReq);
      if (resp.ok) {
        return new Response(JSON.stringify({ ok: true, success: true }), {
          headers: responseHeaders(),
        });
      }

      const errorText = await resp.text();
      return new Response(JSON.stringify({ ok: false, error: '邮件发送失败', detail: errorText }), {
        status: 500,
        headers: responseHeaders(),
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: '服务器内部错误: ' + err.message }), {
        status: 500,
        headers: responseHeaders(),
      });
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function responseHeaders() {
  return {
    'Content-Type': 'application/json',
    ...corsHeaders(),
  };
}
