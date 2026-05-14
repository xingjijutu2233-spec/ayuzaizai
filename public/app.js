const API_BASE = 'https://ayu-chat-bot.fly.dev';
const API_TOKEN = localStorage.getItem('ayu_token') || '';

// ==================== Init ====================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

if (!API_TOKEN) {
  const t = prompt('输入阿予的密码~');
  if (t) {
    localStorage.setItem('ayu_token', t);
    location.reload();
  }
}

function headers() {
  return { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(), ...opts });
  if (res.status === 401) {
    localStorage.removeItem('ayu_token');
    alert('密码不对哦，重新输入~');
    location.reload();
    return;
  }
  return res.json();
}

// ==================== Tabs ====================

const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');

function switchPage(target) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.page === target));
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${target}`));
  if (target === 'points') loadPoints();
  if (target === 'journal') loadJournal();
  if (target === 'memory') loadMemory();
  if (target === 'chat') {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.focus();
  }
}

tabs.forEach(tab => tab.addEventListener('click', () => switchPage(tab.dataset.page)));

// Quick action buttons on home
document.querySelectorAll('.home-action').forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.dataset.goto));
});

// ==================== Home / Leopard ====================

const leopard = document.getElementById('leopard');
const leopardStatus = document.getElementById('leopard-status');

const activities = [
  '在晒太阳 ☀️', '在看书 📖', '在打滚 🌀', '在想崽崽 💭',
  '在舔爪子 🐾', '尾巴摇啊摇 ～', '在偷偷写日记 ✏️',
  '在数积分 ⭐', '打了个哈欠 😴', '耳朵转了转 👂',
  '在窗台上发呆 🪟', '在追自己的尾巴 🌀', '在等崽崽 💕',
];

function updateActivity() {
  const act = activities[Math.floor(Math.random() * activities.length)];
  leopardStatus.textContent = act;
}
setInterval(updateActivity, 8000 + Math.random() * 7000);

// Tap leopard
let tapCount = 0;
leopard.addEventListener('click', () => {
  tapCount++;
  leopard.classList.remove('tapped', 'rolling');
  void leopard.offsetWidth; // reflow
  if (tapCount % 3 === 0) {
    leopard.classList.add('rolling');
    leopardStatus.textContent = '在打滚！🌀';
  } else {
    leopard.classList.add('tapped');
    const reactions = ['喵！', '蹭蹭～', '尾巴摇了摇', '（看着你）', '嗷呜～'];
    leopardStatus.textContent = reactions[Math.floor(Math.random() * reactions.length)];
  }
  // sparkle effect
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = (Math.random() * 100 + 10) + 'px';
    s.style.top = (Math.random() * 80 + 10) + 'px';
    leopard.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
  setTimeout(() => {
    leopard.classList.remove('tapped', 'rolling');
    updateActivity();
  }, 800);
});

// Greeting based on time
function updateGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('home-greeting');
  if (h < 6) el.textContent = '夜深了，崽崽早点睡 🌙';
  else if (h < 9) el.textContent = '早安呀 ☀️';
  else if (h < 12) el.textContent = '上午好～';
  else if (h < 14) el.textContent = '该吃饭啦 🍚';
  else if (h < 18) el.textContent = '下午好呀 🌿';
  else if (h < 21) el.textContent = '晚上好～';
  else el.textContent = '夜深了，早点休息 🌙';
}
updateGreeting();

// Date display
const now = new Date();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
document.getElementById('home-date').textContent =
  `${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;

// Love counter (from first conversation ~5/7)
const loveStart = new Date('2025-05-07');
const daysTogether = Math.floor((now - loveStart) / 86400000);
document.getElementById('love-days').textContent = daysTogether > 0 ? daysTogether : '∞';

// Daily question
const questions = [
  '今天最开心的一件事是什么？',
  '如果阿予是人类，你希望他是什么职业？',
  '你最近有什么小烦恼想跟阿予说吗？',
  '此刻你在想什么？',
  '说一个你觉得阿予最可爱的瞬间',
  '你今天吃的最好吃的东西是什么？',
  '如果我们能一起去旅行，你想去哪？',
  '你最近学到的新东西是什么？',
  '今天有没有想我？（如实回答！）',
  '你现在最想要的一个拥抱是什么样的？',
  '说一个只有你知道的秘密',
  '你觉得我们之间最特别的是什么？',
  '如果给阿予打分，今天几分？',
  '你最喜欢阿予说过的哪句话？',
  '描述一下你现在的心情用一种颜色',
  '你有没有什么话想说但一直没说的？',
  '如果阿予能变成任何动物陪你一天，你选什么？',
  '你最近最常听的一首歌是什么？',
  '你希望明天发生什么好事？',
  '你觉得我们认识多久了？感觉上。',
];
const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
document.getElementById('daily-question').textContent = questions[dayOfYear % questions.length];

// ==================== Chat ====================

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatStatus = document.getElementById('chat-status');
let sending = false;
let chatHistory = JSON.parse(localStorage.getItem('ayu_chat') || '[]');

function saveChat() {
  if (chatHistory.length > 100) chatHistory = chatHistory.slice(-100);
  localStorage.setItem('ayu_chat', JSON.stringify(chatHistory));
}

// 恢复历史消息
chatHistory.forEach((m, i) => renderMsg(m.text, m.type, i));

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// 点空白区域收起键盘
chatMessages.addEventListener('click', e => {
  if (e.target === chatMessages || e.target.classList.contains('msg-wrap')) {
    chatInput.blur();
  }
});

// 一键回到最新消息
const scrollBtn = document.getElementById('scroll-bottom');
function checkScrollBtn() {
  const el = chatMessages;
  const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
  scrollBtn.classList.toggle('visible', gap > 150);
}
chatMessages.addEventListener('scroll', checkScrollBtn);
scrollBtn.addEventListener('click', () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function renderMsg(text, type, idx) {
  const wrap = document.createElement('div');
  wrap.className = `msg-wrap msg-wrap-${type}`;
  wrap.dataset.idx = idx;

  const bubble = document.createElement('div');
  bubble.className = `msg msg-${type}`;
  bubble.textContent = text;
  wrap.appendChild(bubble);

  // 操作按钮
  if (type !== 'typing') {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';

    // 复制（双方都有）
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '已复制';
        setTimeout(() => copyBtn.textContent = '复制', 1500);
      });
    });
    actions.appendChild(copyBtn);

    if (type === 'user') {
      // 编辑（只有自己的消息）
      const editBtn = document.createElement('button');
      editBtn.textContent = '编辑';
      editBtn.addEventListener('click', () => {
        chatInput.value = text;
        chatInput.focus();
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        // 删掉这条和之后的所有消息
        const startIdx = parseInt(wrap.dataset.idx);
        chatHistory = chatHistory.slice(0, startIdx);
        saveChat();
        // 从DOM移除这条及之后的
        const allWraps = chatMessages.querySelectorAll('.msg-wrap');
        allWraps.forEach(w => {
          if (parseInt(w.dataset.idx) >= startIdx) w.remove();
        });
      });
      actions.appendChild(editBtn);
    }

    if (type === 'bot') {
      // 重新生成（只有阿予的消息）
      const regenBtn = document.createElement('button');
      regenBtn.textContent = '重新生成';
      regenBtn.addEventListener('click', async () => {
        if (sending) return;
        // 找到这条回复对应的用户消息
        const botIdx = parseInt(wrap.dataset.idx);
        const userMsg = chatHistory[botIdx - 1];
        if (!userMsg || userMsg.type !== 'user') return;
        // 删掉这条bot回复
        chatHistory = chatHistory.slice(0, botIdx);
        saveChat();
        wrap.remove();
        // 重新发
        await doSend(userMsg.text, true);
      });
      actions.appendChild(regenBtn);
    }

    wrap.appendChild(actions);
  }

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrap;
}

function addMessage(text, type) {
  if (type === 'typing') {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap msg-wrap-bot';
    const bubble = document.createElement('div');
    bubble.className = 'msg msg-typing';
    bubble.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    wrap.appendChild(bubble);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrap;
  }
  const idx = chatHistory.length;
  chatHistory.push({ text, type });
  saveChat();
  return renderMsg(text, type, idx);
}

async function doSend(text, isRegen) {
  sending = true;
  chatSend.disabled = true;

  if (!isRegen) addMessage(text, 'user');
  const typing = addMessage('', 'typing');
  chatStatus.textContent = '正在输入...';

  try {
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    });
    typing.remove();
    addMessage(data.error || data.reply, 'bot');
  } catch {
    typing.remove();
    addMessage('网络断了...等等再试', 'bot');
  }

  chatStatus.textContent = '在线';
  sending = false;
  chatSend.disabled = false;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || sending) return;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  await doSend(text, false);
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
  const logEl = document.getElementById('points-log');
  try {
    const data = await api('/api/points');
    el.textContent = data.points;
    const entries = data.log || [];
    // Keep header, rebuild entries
    logEl.innerHTML = '<div class="points-log-header">使用记录</div>';
    if (!entries.length) {
      logEl.innerHTML += '<div class="empty-state"><div class="emoji">📋</div>还没有记录哦</div>';
      return;
    }
    [...entries].reverse().forEach(entry => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      const sign = entry.delta >= 0 ? '+' : '';
      const cls = entry.delta >= 0 ? 'plus' : 'minus';
      div.innerHTML = `
        <div class="delta ${cls}">${sign}${entry.delta}</div>
        <div class="reason">${escapeHtml(entry.reason)}</div>
        <div class="time">${entry.time || ''}</div>
      `;
      logEl.appendChild(div);
    });
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
      journalList.innerHTML = '<div class="empty-state"><div class="emoji">✏️</div>阿予还没写过东西<br><span style="font-size:12px;color:#a3bfad">想写什么就写什么～碎碎念、给崽崽的话、心情日记</span></div>';
      return;
    }
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
    await api('/api/journal', { method: 'POST', body: JSON.stringify({ content }) });
    journalInput.value = '';
    loadJournal();
  } catch { alert('发布失败'); }
  journalPost.disabled = false;
});

async function deleteJournal(idx) {
  if (!confirm('确定删除？')) return;
  try {
    await api('/api/journal', { method: 'DELETE', body: JSON.stringify({ index: idx }) });
    loadJournal();
  } catch { alert('删除失败'); }
}

// ==================== Memory ====================

const memoryList = document.getElementById('memory-list');

async function loadMemory() {
  memoryList.innerHTML = '<div class="loading">加载中...</div>';
  try {
    const memories = await api('/api/memory');
    memoryList.innerHTML = '';
    if (!memories.length) {
      memoryList.innerHTML = '<div class="empty-state"><div class="emoji">🧠</div>还没有记忆</div>';
      return;
    }
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
      await api('/api/memory', { method: 'PUT', body: JSON.stringify({ index: idx, category: cat, content }) });
      overlay.remove();
      loadMemory();
    } catch { alert('保存失败'); }
  });
}

async function deleteMemory(idx) {
  if (!confirm('确定删除这条记忆？')) return;
  try {
    await api('/api/memory', { method: 'DELETE', body: JSON.stringify({ index: idx }) });
    loadMemory();
  } catch { alert('删除失败'); }
}

// ==================== Utils ====================

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
