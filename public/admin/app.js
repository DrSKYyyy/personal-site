// Admin SPA
(function() {
  var adminConfig = { password: '', siteUrl: '' };
  try {
    var configEl = document.getElementById('admin-config');
    if (configEl && configEl.textContent) adminConfig = JSON.parse(configEl.textContent);
  } catch(e) {}

  var APP = {
    password: adminConfig.password || '',
    siteUrl: adminConfig.siteUrl || '',
    state: 'login',
    token: '',
    repoOwner: '',
    repoName: '',
    files: [],
    currentFile: null,
    currentTab: 'blog',
  };

  var root = document.getElementById('admin-content');

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    var stored = sessionStorage.getItem('admin_session');
    if (stored) {
      try {
        var s = JSON.parse(stored);
        APP.token = s.token;
        APP.repoOwner = s.owner;
        APP.repoName = s.repo;
        APP.state = 'dashboard';
      } catch(e) { sessionStorage.removeItem('admin_session'); }
    }
    if (APP.state === 'login') renderLogin();
    else if (APP.state === 'dashboard') renderDashboard();
    else if (APP.state === 'editor') renderEditor();
  }

  function renderLogin() {
    root.innerHTML =
      '<div class="login-wrapper">' +
        '<div class="admin-card login-card">' +
          '<h2>后台管理</h2>' +
          '<p class="login-subtitle">输入管理员密码和 GitHub Token 登录</p>' +
          '<div id="login-error" class="hidden"></div>' +
          '<div class="admin-form-group"><label>管理员密码</label>' +
            '<input type="password" id="login-password" class="admin-input" placeholder="输入密码" /></div>' +
          '<div class="admin-form-group"><label>GitHub Token</label>' +
            '<input type="text" id="login-token" class="admin-input" placeholder="ghp_..." />' +
            '<p class="admin-hint">需要 repo 权限。去生成</p></div>' +
          '<div class="admin-form-group"><label>GitHub 用户名</label>' +
            '<input type="text" id="login-owner" class="admin-input" placeholder="如 DrSKYyyy" /></div>' +
          '<div class="admin-form-group"><label>仓库名</label>' +
            '<input type="text" id="login-repo" class="admin-input" placeholder="如 personal-site" /></div>' +
          '<button id="login-btn" class="admin-btn primary full">登录</button>' +
        '</div></div>';
    document.getElementById('login-btn').addEventListener('click', handleLogin);
  }

  function handleLogin() {
    var pw = document.getElementById('login-password').value;
    var token = document.getElementById('login-token').value;
    var owner = document.getElementById('login-owner').value;
    var repo = document.getElementById('login-repo').value;
    var errEl = document.getElementById('login-error');
    if (!pw || !token || !owner || !repo) {
      errEl.className = 'admin-error'; errEl.textContent = '请填写所有字段';
      return;
    }
    if (pw !== APP.password) {
      errEl.className = 'admin-error'; errEl.textContent = '密码错误';
      return;
    }
    APP.token = token; APP.repoOwner = owner; APP.repoName = repo;
    sessionStorage.setItem('admin_session', JSON.stringify({ token: token, owner: owner, repo: repo, time: Date.now() }));
    APP.state = 'dashboard';
    render();
  }

  window.logout = function() {
    sessionStorage.removeItem('admin_session');
    APP.token = ''; APP.state = 'login'; render();
  };

  async function githubApi(path, method, body) {
    var url = 'https://api.github.com/repos/' + APP.repoOwner + '/' + APP.repoName + '/' + path;
    var opts = { method: method || 'GET', headers: { 'Authorization': 'Bearer ' + APP.token, 'Accept': 'application/vnd.github.v3+json' } };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    var res = await fetch(url, opts);
    var data = await res.json();
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  function renderDashboard() {
    root.innerHTML =
      '<div class="admin-header">' +
        '<h1>内容管理</h1>' +
        '<div class="admin-user-info">' +
          '<span class="repo-name">' + esc(APP.repoOwner) + '/' + esc(APP.repoName) + '</span>' +
          '<button class="admin-btn secondary sm" onclick="logout()">退出</button></div></div>' +
      '<div class="admin-tabs">' +
        '<button class="admin-tab active" data-tab="blog">文章</button>' +
        '<button class="admin-tab" data-tab="projects">项目</button>' +
        '<button class="admin-tab" data-tab="upload">上传</button>' +
        '<button class="admin-tab pull-right" data-tab="new">新建</button></div>' +
      '<div id="dashboard-content"><div class="admin-loading"><div class="spinner"></div><span>正在加载...</span></div></div>';

    document.querySelectorAll('.admin-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(function(b) { b.className = 'admin-tab'; });
        btn.classList.add('active');
        APP.currentTab = btn.dataset.tab;
        loadTabContent();
      });
    });
    APP.currentTab = 'blog';
    loadTabContent();
  }

  async function loadTabContent() {
    var content = document.getElementById('dashboard-content');
    if (!content) return;
    if (APP.currentTab === 'upload') { renderUploadTab(content); return; }
    if (APP.currentTab === 'new') { renderNewTab(content); return; }
    var label = APP.currentTab === 'blog' ? '文章' : '项目';
    content.innerHTML = '<div class="admin-loading"><div class="spinner"></div><span>正在加载 ' + label + '...</span></div>';
    try {
      var path = APP.currentTab === 'blog' ? 'src/content/blog' : 'src/content/projects';
      APP.files = [];
      try {
        var data = await githubApi('contents/' + path);
        if (Array.isArray(data)) APP.files = data.filter(function(f) { return f.name.endsWith('.md'); });
      } catch(e) { APP.files = []; }
      renderFileCards(content);
      var editTarget = sessionStorage.getItem('admin_edit_target');
      if (editTarget) {
        sessionStorage.removeItem('admin_edit_target');
        setTimeout(function() {
          var targetEl = document.querySelector('.admin-file-card[data-path="' + esc(editTarget) + '"]');
          if (targetEl) {
            targetEl.style.borderColor = 'var(--color-primary)';
            targetEl.style.boxShadow = '0 0 0 3px rgba(93,173,226,0.2)';
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var editBtn = targetEl.querySelector('.edit-btn');
            if (editBtn) editBtn.click();
          }
        }, 500);
      }
    } catch(e) {
      content.innerHTML = '<div class="admin-error">加载失败: ' + esc(e.message) + '</div>';
    }
  }

  function renderFileCards(container) {
    if (APP.files.length === 0) {
      container.innerHTML = '<div class="admin-card" style="text-align:center;color:var(--color-text-secondary);padding:2.5rem;"><p style="font-size:2rem;margin-bottom:0.5rem;">~</p><p>暂无内容，点击新建开始创作</p></div>';
      return;
    }
    var html = '<div class="admin-card-grid">';
    APP.files.forEach(function(f) {
      html +=
        '<div class="admin-file-card" data-path="' + esc(f.path) + '" data-sha="' + esc(f.sha) + '">' +
          '<div class="card-icon">~</div>' +
          '<div class="card-title">' + esc(f.name.replace(/\.md$/i, '')) + '</div>' +
          '<div class="card-meta">' + (f.sha ? f.sha.substring(0, 7) : '-') + '</div>' +
          '<div class="card-actions">' +
            '<button class="edit-btn">编辑</button>' +
            '<button class="del">删除</button></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var item = e.target.closest('.admin-file-card');
        if (!item) return;
        startEdit(item.dataset.path, item.dataset.sha);
      });
    });
    container.querySelectorAll('.del').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var item = e.target.closest('.admin-file-card');
        if (!item) return;
        deleteFile(item.dataset.path, item.dataset.sha);
      });
    });

    APP.files.forEach(function(f) {
      (async function() {
        try {
          var data = await githubApi('contents/' + f.path);
          if (!data.content) return;
          var content = decodeURIComponent(escape(atob(data.content)));
          var mt = content.match(/^---\n([\s\S]*?)\n---/);
          if (mt) {
            var t = mt[1].match(/title:\s*["']?(.+?)["']?$/m);
            if (t && t[1]) {
              var card = container.querySelector('.admin-file-card[data-path="' + esc(f.path) + '"]');
              if (card) {
                var titleEl = card.querySelector('.card-title');
                if (titleEl) titleEl.textContent = t[1];
              }
            }
          }
        } catch(e) {}
      })();
    });
  }

  function renderUploadTab(container) {
    container.innerHTML =
      '<div class="admin-card">' +
        '<h2>上传 Markdown 文件</h2>' +
        '<div class="upload-dropzone" id="dropzone">' +
          '<div class="dz-icon">~</div>' +
          '<div class="dz-title">将 .md 文件拖拽到此处</div>' +
          '<div class="dz-hint">或点击选择文件</div></div>' +
        '<input type="file" id="file-input" accept=".md" style="display:none" />' +
        '<div id="upload-status" class="hidden mt-1"></div>' +
        '<div id="upload-preview" class="hidden mt-1"></div></div>';
    setupDropzone();
  }

  function setupDropzone() {
    var dz = document.getElementById('dropzone');
    var fi = document.getElementById('file-input');
    if (!dz || !fi) return;
    dz.addEventListener('click', function() { fi.click(); });
    dz.addEventListener('dragover', function(e) { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', function() { dz.classList.remove('dragover'); });
    dz.addEventListener('drop', function(e) { e.preventDefault(); dz.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) handleUploadFile(e.dataTransfer.files[0]); });
    fi.addEventListener('change', function() { if (fi.files.length > 0) handleUploadFile(fi.files[0]); });
  }

  function handleUploadFile(file) {
    if (!file.name.endsWith('.md')) { showUploadStatus('请上传 .md 格式的文件', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function(e) { showUploadPreview(file.name, e.target.result); };
    reader.readAsText(file);
  }

  function showUploadPreview(fn, content) {
    var preview = document.getElementById('upload-preview');
    var status = document.getElementById('upload-status');
    status.className = 'hidden';
    preview.className = 'mt-1';
    preview.innerHTML =
      '<div class="admin-card"><p style="margin-bottom:0.5rem;"><strong>文件名：</strong>' + esc(fn) + ' - ' + content.length + ' 字符</p>' +
      '<div style="display:flex;gap:0.5rem;">' +
        '<button class="admin-btn primary sm" id="upload-save-btn">保存</button>' +
        '<button class="admin-btn secondary sm" id="upload-cancel-btn">取消</button></div>' +
      '<p style="margin-top:0.5rem;font-size:0.78rem;color:var(--color-text-secondary);">保存到 src/content/blog/' + esc(fn) + '</p></div>';
    document.getElementById('upload-save-btn').addEventListener('click', function() { saveUploadedFile('src/content/blog/' + fn, content); });
    document.getElementById('upload-cancel-btn').addEventListener('click', function() { preview.className = 'hidden'; document.getElementById('file-input').value = ''; });
  }

  function showUploadStatus(msg, type) {
    var status = document.getElementById('upload-status');
    status.className = '';
    status.className = type === 'error' ? 'admin-error' : (type === 'success' ? 'admin-success' : '');
    status.textContent = msg;
  }

  async function saveUploadedFile(path, content) {
    var btn = document.getElementById('upload-save-btn');
    btn.disabled = true; btn.textContent = '保存中...';
    showUploadStatus('正在保存...', '');
    try {
      var base64 = btoa(unescape(encodeURIComponent(content)));
      var body = { message: '上传: ' + path.split('/').pop(), content: base64, branch: 'main' };
      try { var existing = await githubApi('contents/' + path); if (existing.sha) body.sha = existing.sha; } catch(e) {}
      await githubApi('contents/' + path, 'PUT', body);
      showUploadStatus('已保存到 GitHub！', 'success');
      btn.textContent = '已保存';
    } catch(e) {
      showUploadStatus('保存失败: ' + esc(e.message), 'error');
      btn.disabled = false; btn.textContent = '保存';
    }
  }

  function renderNewTab(container) {
    var today = new Date();
    var dateStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    container.innerHTML =
      '<div class="admin-card">' +
        '<h2>新建文章</h2>' +
        '<div class="editor-meta-bar">' +
          '<div class="em-group" style="flex:1;"><span class="em-label">标题:</span><input type="text" id="new-title" placeholder="文章标题" /></div></div>' +
        '<div class="editor-meta-bar">' +
          '<div class="em-group" style="flex:1;"><span class="em-label">标签:</span><input type="text" id="new-tags" placeholder="标签，逗号分隔" /></div>' +
          '<div class="em-group"><span class="em-label">可见性:</span>' +
            '<select id="new-visibility"><option value="公开">公开</option><option value="私密">私密</option><option value="草稿">草稿</option></select></div></div>' +
        '<div class="editor-filename-bar">' +
          '<span class="ef-label">文件名:</span>' +
          '<input type="text" id="new-filename" value="' + dateStr + '-new-post" />' +
          '<span class="ef-suffix">.md</span></div>' +
        '<div class="editor-wrapper">' +
          '<div class="editor-toolbar" id="toolbar-new">' +
            '<button class="tb-btn" data-cmd="bold">B</button>' +
            '<button class="tb-btn" data-cmd="italic">I</button>' +
            '<button class="tb-btn" data-cmd="strike">S</button>' +
            '<div class="tb-sep"></div>' +
            '<button class="tb-btn" data-cmd="h1">H1</button>' +
            '<button class="tb-btn" data-cmd="h2">H2</button>' +
            '<button class="tb-btn" data-cmd="h3">H3</button>' +
            '<div class="tb-sep"></div>' +
            '<button class="tb-btn" data-cmd="link">链接</button>' +
            '<button class="tb-btn" data-cmd="code">代码</button>' +
            '<button class="tb-btn" data-cmd="ul">列表</button>' +
            '<button class="tb-btn" data-cmd="ol">有序</button>' +
            '<button class="tb-btn" data-cmd="quote">引用</button>' +
            '<button class="tb-btn" data-cmd="hr">分割</button></div>' +
          '<div class="editor-body">' +
            '<div class="edit-pane"><textarea id="new-content" placeholder="开始写文章..."></textarea></div>' +
            '<div class="preview-pane" id="preview-new"><p style="color:var(--color-text-secondary);">实时预览...</p></div></div></div>' +
        '<div class="editor-footer">' +
          '<button class="admin-btn primary" id="new-save-btn">保存</button>' +
          '<span id="new-status" class="hidden" style="font-size:0.82rem;"></span></div></div>';
    setupToolbar('toolbar-new', 'new-content', 'preview-new');
    document.getElementById('new-save-btn').addEventListener('click', saveNewPost);
    document.getElementById('new-content').addEventListener('input', function() { updatePreview('new-content', 'preview-new'); });
  }

  function setupToolbar(toolbarId, contentId, previewId) {
    document.getElementById(toolbarId).querySelectorAll('.tb-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var ta = document.getElementById(contentId);
        if (!ta) return;
        var start = ta.selectionStart, end = ta.selectionEnd;
        var text = ta.value, sel = text.substring(start, end);
        var before = text.substring(0, start), after = text.substring(end);
        var cmd = btn.dataset.cmd;
        var map = { bold: '**' + (sel||'文字') + '**', italic: '*' + (sel||'文字') + '*', strike: '~~' + (sel||'文字') + '~~',
          h1: '\n# ' + (sel||'标题'), h2: '\n## ' + (sel||'标题'), h3: '\n### ' + (sel||'标题'),
          link: '[' + (sel||'链接') + '](url)', code: '`' + (sel||'代码') + '`',
          ul: '\n- ' + (sel||'列表项'), ol: '\n1. ' + (sel||'列表项'),
          quote: '\n> ' + (sel||'引用'), hr: '\n---\n' };
        var insert = map[cmd] || '';
        ta.value = before + insert + after;
        ta.focus();
        updatePreview(contentId, previewId);
      });
    });
  }

  function updatePreview(contentId, previewId) {
    var md = document.getElementById(contentId).value;
    document.getElementById(previewId).innerHTML = simpleMarkdown(md);
  }

  function simpleMarkdown(md) {
    if (!md) return '<p style="color:var(--color-text-secondary);">实时预览...</p>';
    var html = esc(md);
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, function(m) {
      return '<ul>' + m.replace(/^(\d+\.|\-)\s/gm, '') + '</ul>';
    });
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/\n---\n/g, '<hr />');
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    return html;
  }

  function getFrontmatter(title, tags, visibility) {
    var ts = tags ? '[' + tags.split(',').map(function(t) { return '"' + t.trim() + '"'; }).filter(Boolean).join(', ') + ']' : '';
    return '---\ntitle: "' + (title || '无标题') + '"\ndate: "' + new Date().toISOString().split('T')[0] + '"\ndescription: ""\n' + (ts ? 'tags: ' + ts + '\n' : '') + 'visibility: "' + visibility + '"\n---\n\n';
  }

  async function saveNewPost() {
    var title = document.getElementById('new-title').value;
    var tags = document.getElementById('new-tags').value;
    var visibility = document.getElementById('new-visibility').value;
    var content = document.getElementById('new-content').value;
    var filename = document.getElementById('new-filename').value;
    var body = getFrontmatter(title, tags, visibility) + content;
    var path = 'src/content/blog/' + filename.replace(/\.md$/i, '') + '.md';
    var btn = document.getElementById('new-save-btn');
    var status = document.getElementById('new-status');
    btn.disabled = true; btn.textContent = '保存中...';
    status.className = ''; status.textContent = '正在保存...';
    try {
      var b64 = btoa(unescape(encodeURIComponent(body)));
      await githubApi('contents/' + path, 'PUT', { message: '新建: ' + title, content: b64, branch: 'main' });
      status.className = 'admin-success'; status.textContent = '文章已发布！';
      btn.textContent = '已保存';
    } catch(e) { status.className = 'admin-error'; status.textContent = '' + esc(e.message); btn.disabled = false; btn.textContent = '保存'; }
  }

  function startEdit(path, sha) {
    APP.state = 'editor'; APP.currentFile = { path: path, sha: sha }; render();
  }

  function renderEditor() {
    root.innerHTML =
      '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">' +
        '<button class="admin-btn secondary sm" onclick="window.goBack()">返回列表</button>' +
        '<span style="font-size:1.05rem;font-weight:600;">' + (APP.currentFile ? '' + esc(APP.currentFile.path) : '新建') + '</span></div>' +
      '<div class="admin-card">' +
        '<div id="editor-loading" class="admin-loading"><div class="spinner"></div><span>加载中...</span></div>' +
        '<div id="editor-form" class="hidden">' +
          '<div class="editor-meta-bar"><div class="em-group" style="flex:1;"><span class="em-label">标题:</span><input type="text" id="editor-title" placeholder="文章标题" /></div></div>' +
          '<div class="editor-meta-bar">' +
            '<div class="em-group" style="flex:1;"><span class="em-label">标签:</span><input type="text" id="editor-tags" placeholder="标签，逗号分隔" /></div>' +
            '<div class="em-group"><span class="em-label">可见性:</span>' +
              '<select id="editor-visibility"><option value="公开">公开</option><option value="私密">私密</option><option value="草稿">草稿</option></select></div></div>' +
          '<div class="editor-wrapper">' +
            '<div class="editor-toolbar" id="toolbar-edit">' +
              '<button class="tb-btn" data-cmd="bold">B</button><button class="tb-btn" data-cmd="italic">I</button>' +
              '<button class="tb-btn" data-cmd="strike">S</button><div class="tb-sep"></div>' +
              '<button class="tb-btn" data-cmd="h1">H1</button><button class="tb-btn" data-cmd="h2">H2</button>' +
              '<button class="tb-btn" data-cmd="h3">H3</button><div class="tb-sep"></div>' +
              '<button class="tb-btn" data-cmd="link">链接</button><button class="tb-btn" data-cmd="code">代码</button>' +
              '<button class="tb-btn" data-cmd="ul">列表</button><button class="tb-btn" data-cmd="ol">有序</button>' +
              '<button class="tb-btn" data-cmd="quote">引用</button><button class="tb-btn" data-cmd="hr">分割</button></div>' +
            '<div class="editor-body">' +
              '<div class="edit-pane"><textarea id="editor-content" placeholder="编辑内容..."></textarea></div>' +
              '<div class="preview-pane" id="preview-edit"><p style="color:var(--color-text-secondary);">实时预览...</p></div></div></div>' +
          '<div class="editor-footer">' +
            '<button class="admin-btn primary" id="editor-save-btn">保存</button>' +
            '<span id="editor-status" class="hidden" style="font-size:0.82rem;"></span></div></div></div>';
    window.goBack = function() { APP.state = 'dashboard'; render(); };
    setupToolbar('toolbar-edit', 'editor-content', 'preview-edit');
    document.getElementById('editor-save-btn').addEventListener('click', saveEditedFile);
    document.getElementById('editor-content').addEventListener('input', function() { updatePreview('editor-content', 'preview-edit'); });
    if (APP.currentFile) loadFileContent(APP.currentFile.path);
  }

  async function loadFileContent(path) {
    try {
      var data = await githubApi('contents/' + path);
      var content = '';
      if (data.content) content = decodeURIComponent(escape(atob(data.content)));
      APP.currentFile.sha = data.sha;
      var title = '', tags = [], visibility = '公开', body = content;
      var match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        var fm = match[1]; body = match[2].trim();
        var t = fm.match(/title:\s*["']?(.+?)["']?$/m);
        if (t) title = t[1];
        var tg = fm.match(/tags:\s*\[([^\]]*)\]/);
        if (tg) tags = tg[1].split(',').map(function(s) { return s.trim().replace(/["']/g,''); });
        var v = fm.match(/visibility:\s*(.+)$/m);
        if (v) visibility = v[1].trim();
      }
      document.getElementById('editor-loading').className = 'hidden';
      document.getElementById('editor-form').className = '';
      document.getElementById('editor-title').value = title;
      document.getElementById('editor-tags').value = tags.join(', ');
      document.getElementById('editor-visibility').value = visibility;
      document.getElementById('editor-content').value = body;
      updatePreview('editor-content', 'preview-edit');
    } catch(e) {
      document.getElementById('editor-loading').innerHTML = '<div class="admin-error">加载失败: ' + esc(e.message) + '</div>';
    }
  }

  async function saveEditedFile() {
    var title = document.getElementById('editor-title').value;
    var tags = document.getElementById('editor-tags').value;
    var visibility = document.getElementById('editor-visibility').value;
    var content = document.getElementById('editor-content').value;
    var btn = document.getElementById('editor-save-btn');
    var status = document.getElementById('editor-status');
    btn.disabled = true; btn.textContent = '保存中...';
    status.className = ''; status.textContent = '正在保存...';
    try {
      var body = getFrontmatter(title, tags, visibility) + content;
      var b64 = btoa(unescape(encodeURIComponent(body)));
      await githubApi('contents/' + APP.currentFile.path, 'PUT', { message: '更新: ' + title, content: b64, sha: APP.currentFile.sha, branch: 'main' });
      status.className = 'admin-success'; status.textContent = '已保存！';
      btn.textContent = '已保存';
    } catch(e) { status.className = 'admin-error'; status.textContent = '' + esc(e.message); btn.disabled = false; btn.textContent = '保存'; }
  }

  async function deleteFile(path, sha) {
    if (!confirm('确定要删除 ' + path + ' 吗？')) return;
    try {
      await githubApi('contents/' + path, 'DELETE', { message: '删除: ' + path.split('/').pop(), sha: sha, branch: 'main' });
      APP.files = APP.files.filter(function(f) { return f.path !== path; });
      var content = document.getElementById('dashboard-content');
      if (content) loadTabContent();
    } catch(e) { alert('删除失败: ' + e.message); }
  }

  window.APP = APP;
  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
