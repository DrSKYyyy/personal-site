const ADMIN_PASSWORD = 'SHTskycool200417';

function kvKey(scope) {
  return 'messages:' + (scope || 'home');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method === 'GET' && url.pathname === '/api/messages') {
      try {
        const scope = url.searchParams.get('scope') || 'home';
        const key = kvKey(scope);
        const data = await env.GUESTBOOK_MESSAGES.get(key, 'json');
        const messages = Array.isArray(data) ? data : [];
        return new Response(JSON.stringify({ ok: true, scope, messages }), {
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
        let name, message, scope, syncToHome;

        if (contentType.includes('application/json')) {
          const body = await request.json();
          name = body.name;
          message = body.message;
          scope = body.scope || 'home';
          syncToHome = body.syncToHome;
        } else {
          const formData = await request.formData();
          name = formData.get('name');
          message = formData.get('message');
          scope = formData.get('scope') || 'home';
          syncToHome = formData.get('syncToHome');
        }

        name = (name || '匿名').toString().trim().slice(0, 20);
        message = (message || '').toString().trim().slice(0, 500);
        scope = scope.toString().trim();

        if (!message) {
          return new Response(JSON.stringify({ ok: false, error: '留言内容不能为空' }), {
            status: 400,
            headers: responseHeaders(),
          });
        }

        const now = new Date();
        const baseMessage = {
          id: Date.now().toString(),
          name: name || '匿名',
          message,
          time: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          timestamp: now.getTime(),
        };

        const maxMessages = 200;
        const targetKey = kvKey(scope);

        // Save to scope
        const existing = await env.GUESTBOOK_MESSAGES.get(targetKey, 'json');
        const scopedMessages = Array.isArray(existing) ? existing : [];
        scopedMessages.unshift({ ...baseMessage, scope });
        if (scopedMessages.length > maxMessages) scopedMessages.length = maxMessages;
        await env.GUESTBOOK_MESSAGES.put(targetKey, JSON.stringify(scopedMessages));

        // If syncing to home from an article
        const shouldSync = syncToHome === true || syncToHome === 'true';
        if (shouldSync && scope.startsWith('article:')) {
          const homeKey = kvKey('home');
          const homeData = await env.GUESTBOOK_MESSAGES.get(homeKey, 'json');
          const homeMessages = Array.isArray(homeData) ? homeData : [];
          homeMessages.unshift({ ...baseMessage, scope: 'home', source: scope });
          if (homeMessages.length > maxMessages) homeMessages.length = maxMessages;
          await env.GUESTBOOK_MESSAGES.put(homeKey, JSON.stringify(homeMessages));
        }

        ctx.waitUntil(sendEmailNotification(baseMessage.name, baseMessage.message, request.url));

        return new Response(JSON.stringify({ ok: true, message: { ...baseMessage, scope } }), {
          headers: responseHeaders(),
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '服务器内部错误' }), {
          status: 500,
          headers: responseHeaders(),
        });
      }
    }

    if (request.method === 'DELETE' && url.pathname === '/api/messages') {
      try {
        const token = url.searchParams.get('token') || '';
        if (token !== ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ ok: false, error: '未授权' }), {
            status: 403,
            headers: responseHeaders(),
          });
        }

        const id = url.searchParams.get('id');
        const scope = url.searchParams.get('scope') || 'home';
        if (!id) {
          return new Response(JSON.stringify({ ok: false, error: '缺少 id 参数' }), {
            status: 400,
            headers: responseHeaders(),
          });
        }

        const key = kvKey(scope);
        const data = await env.GUESTBOOK_MESSAGES.get(key, 'json');
        const messages = Array.isArray(data) ? data : [];
        const filtered = messages.filter(function (m) { return m.id !== id; });

        if (filtered.length === messages.length) {
          return new Response(JSON.stringify({ ok: false, error: '未找到该留言' }), {
            status: 404,
            headers: responseHeaders(),
          });
        }

        await env.GUESTBOOK_MESSAGES.put(key, JSON.stringify(filtered));

        return new Response(JSON.stringify({ ok: true, deleted: id }), {
          headers: responseHeaders(),
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '删除失败' }), {
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
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
