const API_BASE = 'https://ayu-chat-bot.fly.dev';
const API_TOKEN = localStorage.getItem('ayu_token') || '';

// ==================== Init ====================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Token setup
if (!API_TOKEN) {
  const t = prompt('输入阿予的密码：');
  if (t) {
    localStorage.setItem('ayu_token', t);
    location.reload();
  }
}

function headers() {
  return {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(), ...opts });
  if (res.status === 401) {
    localStorage.removeItem('ayu_token');
    alert('密码不对，重新输入');
    location.reload();
    return;
  }
  return res.json();
}

// ==================== Tabs ====================

const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.page;
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    pages.forEach(p => p.classList.toggle('active', p.id === `page-${target}`));
    // Load data when switching
    if (target === 'points') loadPoints();
    if (target === 'journal') loadJournal();
    if (target === 'memory') loadMemory();
  });
});

// ==================== Chat ====================

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatStatus = document.getElementById('chat-status');
let sending = false;

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || sending) return;

  sending = true;
  chatSend.disabled = true;
  chatInput.value = '';
  chatInput.style.height = 'auto';

  addMessage(text, 'user');
  const typing = addMessage('阿予在想...', 'typing');
  chatStatus.textContent = '正在输入...';

  try {
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    });

    typing.remove();

    if (data.error) {
      addMessage(data.error, 'bot');
    } else {
      addMessage(data.reply, 'bot');
    }
  } catch (e) {
    typing.remove();
    addMessage('网络断了...等等再试', 'bot');
  }

  chatStatus.textContent = '在线';
  sending = false;
  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ==================== Points ====================

async function loadPoints() {
  const el = document.getElementById('points-value');
  try {
    const data = await api('/api/points');
    el.textContent = data.points;
  } catch {
    el.textContent = '--';
  }
}

// ==================== Journal ====================

const journalList = document.getElementById('journal-list');
const journalInput = document.getElementById('journal-input');
const journalPost = document.getElementById('journal-post');

async function loadJournal() {
  journalList.innerHTML = '<div class="loading">加载中...</div>';
  try {
    const entries = await api('/api/journal');
    journalList.innerHTML = '';
    if (!entries.length) {
      journalList.innerHTML = '<div class="loading">还没写过东西</div>';
      return;
    }
    // 倒序显示，最新在上面
    [...entries].reverse().forEach((entry, i) => {
      const realIdx = entries.length - 1 - i;
      const div = document.createElement('div');
      div.className = 'journal-entry';
      div.innerHTML = `
        <div class="time">${entry.time}</div>
        <div class="content">${escapeHtml(entry.content)}</div>
        <button class="delete-btn" data-idx="${realIdx}">删除</button>
      `;
      div.querySelector('.delete-btn').addEventListener('click', () => deleteJournal(realIdx));
      journalList.appendChild(div);
    });
  } catch {
    journalList.innerHTML = '<div class="loading">加载失败</div>';
  }
}

journalPost.addEventListener('click', async () => {
  const content = journalInput.value.trim();
  if (!content) return;
  journalPost.disabled = true;
  try {
    await api('/api/journal', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    journalInput.value = '';
    loadJournal();
  } catch {
    alert('发布失败');
  }
  journalPost.disabled = false;
});

async function deleteJournal(idx) {
  if (!confirm('确定删除？')) return;
  try {
    await api('/api/journal', {
      method: 'DELETE',
      body: JSON.stringify({ index: idx }),
    });
    loadJournal();
  } catch {
    alert('删除失败');
  }
}

// ==================== Memory ====================

const memoryList = document.getElementById('memory-list');

async function loadMemory() {
  memoryList.innerHTML = '<div class="loading">加载中...</div>';
  try {
    const memories = await api('/api/memory');
    memoryList.innerHTML = '';
    if (!memories.length) {
      memoryList.innerHTML = '<div class="loading">还没有记忆</div>';
      return;
    }
    // 倒序，最新在上
    [...memories].reverse().forEach((m, i) => {
      const realIdx = memories.length - 1 - i;
      const div = document.createElement('div');
      div.className = 'memory-item';
      div.innerHTML = `
        <div class="cat">${escapeHtml(m.category)}</div>
        <div class="content">${escapeHtml(m.content)}</div>
        <div class="time">${m.time || ''}</div>
        <div class="actions">
          <button data-action="edit" data-idx="${realIdx}">编辑</button>
          <button data-action="delete" data-idx="${realIdx}">删除</button>
        </div>
      `;
      div.querySelector('[data-action="edit"]').addEventListener('click', () => editMemory(realIdx, m));
      div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteMemory(realIdx));
      memoryList.appendChild(div);
    });
  } catch {
    memoryList.innerHTML = '<div class="loading">加载失败</div>';
  }
}

function editMemory(idx, m) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>编辑记忆</h3>
      <input id="edit-cat" value="${escapeHtml(m.category)}" placeholder="类别">
      <textarea id="edit-content">${escapeHtml(m.content)}</textarea>
      <div class="modal-actions">
        <button class="btn-cancel">取消</button>
        <button class="btn-save">保存</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('.btn-save').addEventListener('click', async () => {
    const cat = document.getElementById('edit-cat').value.trim();
    const content = document.getElementById('edit-content').value.trim();
    if (!content) return;
    try {
      await api('/api/memory', {
        method: 'PUT',
        body: JSON.stringify({ index: idx, category: cat, content }),
      });
      overlay.remove();
      loadMemory();
    } catch {
      alert('保存失败');
    }
  });
}

async function deleteMemory(idx) {
  if (!confirm('确定删除这条记忆？')) return;
  try {
    await api('/api/memory', {
      method: 'DELETE',
      body: JSON.stringify({ index: idx }),
    });
    loadMemory();
  } catch {
    alert('删除失败');
  }
}

// ==================== Utils ====================

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
