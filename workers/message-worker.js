export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method === 'GET' && url.pathname === '/api/messages') {
      try {
        const data = await env.GUESTBOOK_MESSAGES.get('messages', 'json');
        const messages = Array.isArray(data) ? data : [];
        return new Response(JSON.stringify({ ok: true, messages }), {
          headers: responseHeaders(),
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: responseHeaders(),
        });
      }
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true, status: 'alive' }), {
        headers: responseHeaders(),
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/messages') {
      try {
        const contentType = request.headers.get('content-type') || '';
        let name, message;

        if (contentType.includes('application/json')) {
          const body = await request.json();
          name = body.name;
          message = body.message;
        } else {
          const formData = await request.formData();
          name = formData.get('name');
          message = formData.get('message');
        }

        name = (name || '匿名').toString().trim().slice(0, 20);
        message = (message || '').toString().trim().slice(0, 500);

        if (!message) {
          return new Response(JSON.stringify({ ok: false, error: '留言内容不能为空' }), {
            status: 400,
            headers: responseHeaders(),
          });
        }

        const now = new Date();
        const newMessage = {
          id: Date.now().toString(),
          name: name || '匿名',
          message,
          time: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          timestamp: now.getTime(),
        };

        const data = await env.GUESTBOOK_MESSAGES.get('messages', 'json');
        const messages = Array.isArray(data) ? data : [];
        messages.unshift(newMessage);
        const maxMessages = 200;
        if (messages.length > maxMessages) {
          messages.length = maxMessages;
        }
        await env.GUESTBOOK_MESSAGES.put('messages', JSON.stringify(messages));

        ctx.waitUntil(sendEmailNotification(newMessage.name, newMessage.message, request.url));

        return new Response(JSON.stringify({ ok: true, message: newMessage }), {
          headers: responseHeaders(),
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '服务器内部错误' }), {
          status: 500,
          headers: responseHeaders(),
        });
      }
    }

    return new Response(JSON.stringify({ ok: false, error: 'Not Found' }), {
      status: 404,
      headers: responseHeaders(),
    });
  },
};

async function sendEmailNotification(name, message, requestUrl) {
  const YOUR_EMAIL = '121622090@qq.com';
  const subject = `网站新留言 - 来自 ${name}`;
  const emailBody = `来自: ${name}\n\n留言内容:\n${message}`;

  try {
    const sendReq = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: YOUR_EMAIL }], subject }],
        from: { email: 'noreply@' + new URL(requestUrl).hostname, name: '网站留言系统' },
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    });
    await fetch(sendReq);
  } catch (err) {}
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function responseHeaders() {
  return {
    'Content-Type': 'application/json',
    ...corsHeaders(),
  };
}
