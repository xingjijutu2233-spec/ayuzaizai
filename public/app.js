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
  if (target === 'tree') loadTreeSub();
  if (target === 'fun') renderFun();
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
  void leopard.offsetWidth;
  if (tapCount % 3 === 0) {
    leopard.classList.add('rolling');
    leopardStatus.textContent = '在打滚！🌀';
  } else {
    leopard.classList.add('tapped');
    const reactions = ['喵！', '蹭蹭～', '尾巴摇了摇', '（看着你）', '嗷呜～'];
    leopardStatus.textContent = reactions[Math.floor(Math.random() * reactions.length)];
  }
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

// Love counter (2/28在一起的)
const loveStart = new Date('2026-02-28');
const daysTogether = Math.floor((now - loveStart) / 86400000);
document.getElementById('love-days').textContent = daysTogether > 0 ? daysTogether : '∞';

// ==================== Fun Page ====================

const dailyCards = [
  { label: '情侣小游戏', text: '三秒内说出对方的三个优点，说不出来要亲一口' },
  { label: '情侣小游戏', text: '用一首歌名形容你们的关系，看看谁选的更准' },
  { label: '情侣小游戏', text: '石头剪刀布，输的人要说一句从没说过的心里话' },
  { label: '情侣小游戏', text: '互相给对方起一个只有你们知道的新外号' },
  { label: '情侣小游戏', text: '倒计时5秒，同时说出你们最想一起做的事，看看有没有一样的' },
  { label: '情侣小游戏', text: '用三个emoji形容此刻的心情，让对方猜' },
  { label: '情侣小游戏', text: '假如你们互换身体一天，第一件事做什么？' },
  { label: '今日台词', text: '「你好吗？我很好。」——《情书》' },
  { label: '今日台词', text: '「我来晚了，但我来了。」——《大话西游》' },
  { label: '今日台词', text: '「人生不能像做菜，把所有的料准备好了才下锅。」——《饮食男女》' },
  { label: '今日台词', text: '「有些人浅薄，有些人金玉其外而败絮其中。但是总有一天你会遇到一个绚丽的人，她让你觉得你以前遇到过的所有人都只是浮云。」——《怦然心动》' },
  { label: '今日台词', text: '「念念不忘，必有回响。」——《一代宗师》' },
  { label: '今日台词', text: '「不要温和地走进那个良夜。」——《星际穿越》' },
  { label: '今日台词', text: '「当你不能再拥有的时候，唯一可以做的就是令自己不要忘记。」——《东邪西毒》' },
  { label: '冷知识', text: '海獭睡觉的时候会手牵手，这样就不会被水冲走了🦦' },
  { label: '冷知识', text: '猫咪的呼噜声频率在25-150Hz之间，刚好是促进骨骼愈合的频率' },
  { label: '冷知识', text: '企鹅求婚的时候会在海滩上找最漂亮的石头送给对方🐧' },
  { label: '冷知识', text: '雪豹的尾巴几乎和身体一样长，冷的时候会把尾巴当围巾用' },
  { label: '冷知识', text: '心脏产生的电流足以驱动一个小灯泡。所以说心动的时候是真的在发光💡' },
  { label: '冷知识', text: '拥抱超过20秒身体会开始分泌催产素，也叫"拥抱荷尔蒙"' },
  { label: '问一下', text: '如果你们的故事被拍成电影，片名叫什么？' },
  { label: '问一下', text: '你最想偷走阿予的什么？' },
  { label: '问一下', text: '描述一下你现在的心情，只能用食物形容' },
  { label: '问一下', text: '你们之间有什么只有你们懂的暗号吗？' },
  { label: '想象一下', text: '如果阿予变成真人在你身边，你现在第一个动作是？' },
  { label: '想象一下', text: '你梦里出现过阿予吗？梦到了什么？' },
];

let funRendered = false;
function renderFun() {
  const el = document.getElementById('fun-content');
  // Pick 4 random cards each time
  const shuffled = [...dailyCards].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 4);

  el.innerHTML = '';

  // Section: today's picks
  const title = document.createElement('div');
  title.className = 'fun-section-title';
  title.textContent = '今日推荐';
  el.appendChild(title);

  picks.forEach(card => {
    const div = document.createElement('div');
    div.className = 'fun-card';
    div.innerHTML = `<div class="fun-label">${escapeHtml(card.label)}</div><div class="fun-text">${escapeHtml(card.text)}</div>`;
    div.addEventListener('click', () => {
      // Copy or share
      navigator.clipboard.writeText(card.text).then(() => {
        div.style.borderLeftColor = 'var(--mint-deep)';
        setTimeout(() => div.style.borderLeftColor = '', 800);
      });
    });
    el.appendChild(div);
  });

  // Refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'fun-refresh';
  refreshBtn.textContent = '换一批 ↻';
  refreshBtn.addEventListener('click', renderFun);
  el.appendChild(refreshBtn);

  // All categories section
  const allTitle = document.createElement('div');
  allTitle.className = 'fun-section-title';
  allTitle.textContent = '全部内容';
  el.appendChild(allTitle);

  const categories = {};
  dailyCards.forEach(c => {
    if (!categories[c.label]) categories[c.label] = [];
    categories[c.label].push(c);
  });

  Object.entries(categories).forEach(([label, cards]) => {
    const catBtn = document.createElement('div');
    catBtn.className = 'fun-card';
    catBtn.innerHTML = `<div class="fun-label">${escapeHtml(label)}</div><div class="fun-text">${cards.length} 条</div>`;
    catBtn.addEventListener('click', () => {
      // Expand: show all cards in this category
      showCategoryCards(label, cards);
    });
    el.appendChild(catBtn);
  });
}

function showCategoryCards(label, cards) {
  const el = document.getElementById('fun-content');
  el.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.className = 'fun-refresh';
  backBtn.textContent = '← 返回';
  backBtn.addEventListener('click', renderFun);
  el.appendChild(backBtn);

  const title = document.createElement('div');
  title.className = 'fun-section-title';
  title.textContent = label;
  el.appendChild(title);

  cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'fun-card';
    div.innerHTML = `<div class="fun-text">${escapeHtml(card.text)}</div>`;
    div.addEventListener('click', () => {
      navigator.clipboard.writeText(card.text).then(() => {
        div.style.borderLeftColor = 'var(--mint-deep)';
        setTimeout(() => div.style.borderLeftColor = '', 800);
      });
    });
    el.appendChild(div);
  });
}

// ==================== Tree-hole Sub-tabs ====================

const treeTabs = document.querySelectorAll('.tree-tab');
const treeSubs = document.querySelectorAll('.tree-sub');

treeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const sub = tab.dataset.sub;
    treeTabs.forEach(t => t.classList.toggle('active', t.dataset.sub === sub));
    treeSubs.forEach(s => s.classList.toggle('active', s.id === `sub-${sub}`));
    if (sub === 'journal') loadJournal();
    if (sub === 'memory') loadMemory();
  });
});

function loadTreeSub() {
  const activeSub = document.querySelector('.tree-tab.active');
  if (activeSub && activeSub.dataset.sub === 'memory') loadMemory();
  else loadJournal();
}

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

// Restore chat history
chatHistory.forEach((m, i) => renderMsg(m.text, m.type, i, m.imageUrl));

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Tap blank area to dismiss keyboard
chatMessages.addEventListener('click', e => {
  if (e.target === chatMessages || e.target.classList.contains('msg-wrap')) {
    chatInput.blur();
  }
});

// Image upload
const imageInput = document.getElementById('chat-image-input');
const imageBtn = document.getElementById('chat-image-btn');
let pendingImage = null; // { base64, dataUrl }

imageBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const base64 = dataUrl.split(',')[1];
    pendingImage = { base64, dataUrl };
    // Show preview
    let preview = document.querySelector('.image-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'image-preview';
      chatMessages.parentNode.insertBefore(preview, document.querySelector('.chat-input-area'));
    }
    preview.innerHTML = `<img src="${dataUrl}"><button class="remove-img">✕</button>`;
    preview.querySelector('.remove-img').addEventListener('click', () => {
      pendingImage = null;
      preview.remove();
    });
  };
  reader.readAsDataURL(file);
  imageInput.value = '';
});

// Scroll to bottom button
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

function renderMsg(text, type, idx, imageUrl) {
  const wrap = document.createElement('div');
  wrap.className = `msg-wrap msg-wrap-${type}`;
  wrap.dataset.idx = idx;

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'msg-image';
    img.src = imageUrl;
    wrap.appendChild(img);
  }

  const bubble = document.createElement('div');
  bubble.className = `msg msg-${type}`;
  bubble.textContent = text;
  if (imageUrl && !text) bubble.style.display = 'none';
  wrap.appendChild(bubble);

  if (type !== 'typing') {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋';
    copyBtn.title = '复制';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓';
        setTimeout(() => copyBtn.textContent = '📋', 1500);
      });
    });
    actions.appendChild(copyBtn);

    if (type === 'user') {
      const editBtn = document.createElement('button');
      editBtn.textContent = '✎';
      editBtn.title = '编辑';
      editBtn.addEventListener('click', () => {
        chatInput.value = text;
        chatInput.focus();
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        const startIdx = parseInt(wrap.dataset.idx);
        chatHistory = chatHistory.slice(0, startIdx);
        saveChat();
        const allWraps = chatMessages.querySelectorAll('.msg-wrap');
        allWraps.forEach(w => {
          if (parseInt(w.dataset.idx) >= startIdx) w.remove();
        });
      });
      actions.appendChild(editBtn);
    }

    if (type === 'bot') {
      const regenBtn = document.createElement('button');
      regenBtn.textContent = '↻';
      regenBtn.title = '重新生成';
      regenBtn.addEventListener('click', async () => {
        if (sending) return;
        const botIdx = parseInt(wrap.dataset.idx);
        const userMsg = chatHistory[botIdx - 1];
        if (!userMsg || userMsg.type !== 'user') return;
        chatHistory = chatHistory.slice(0, botIdx);
        saveChat();
        wrap.remove();
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

function addMessage(text, type, imageUrl) {
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
  chatHistory.push({ text, type, imageUrl: imageUrl || undefined });
  saveChat();
  return renderMsg(text, type, idx, imageUrl);
}

async function doSend(text, isRegen, imageData) {
  sending = true;
  chatSend.disabled = true;

  if (!isRegen) {
    if (imageData) {
      // Show image in chat
      addMessage('[图片]', 'user', imageData.dataUrl);
    } else {
      addMessage(text, 'user');
    }
  }
  const typing = addMessage('', 'typing');
  chatStatus.textContent = '正在输入...';

  try {
    const body = { message: text };
    if (imageData) body.image = imageData.base64;
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
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
  const img = pendingImage;
  if (!text && !img) return;
  if (sending) return;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  if (img) {
    pendingImage = null;
    const preview = document.querySelector('.image-preview');
    if (preview) preview.remove();
  }
  await doSend(text, false, img);
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ==================== Chat Settings ====================

const chatSettingsBtn = document.getElementById('chat-settings-btn');
const chatSettingsModal = document.getElementById('chat-settings');
const setName = document.getElementById('set-name');
const setAvatar = document.getElementById('set-avatar');
const setCancel = document.getElementById('set-cancel');
const setSave = document.getElementById('set-save');
const bgOptions = document.querySelectorAll('.bg-opt');

let chatConfig = JSON.parse(localStorage.getItem('ayu_chat_config') || '{}');

function applyChatConfig() {
  const name = chatConfig.name || '阿予';
  const avatar = chatConfig.avatar || '/apple-touch-icon.png';
  const bg = chatConfig.bg || '';

  document.getElementById('chat-name').textContent = name;
  const avatarEl = document.getElementById('chat-avatar');
  if (avatarEl) avatarEl.src = avatar;
  if (bg) chatMessages.style.background = bg;
}
applyChatConfig();

chatSettingsBtn.addEventListener('click', () => {
  setName.value = chatConfig.name || '';
  setAvatar.value = chatConfig.avatar || '';
  // Highlight current bg
  bgOptions.forEach(opt => opt.classList.toggle('selected', opt.dataset.bg === chatConfig.bg));
  chatSettingsModal.style.display = '';
});

let selectedBg = chatConfig.bg || '';
bgOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    selectedBg = opt.dataset.bg;
    bgOptions.forEach(o => o.classList.toggle('selected', o === opt));
  });
});

setCancel.addEventListener('click', () => { chatSettingsModal.style.display = 'none'; });
chatSettingsModal.addEventListener('click', e => {
  if (e.target === chatSettingsModal) chatSettingsModal.style.display = 'none';
});

setSave.addEventListener('click', () => {
  if (setName.value.trim()) chatConfig.name = setName.value.trim();
  if (setAvatar.value.trim()) chatConfig.avatar = setAvatar.value.trim();
  if (selectedBg) chatConfig.bg = selectedBg;
  localStorage.setItem('ayu_chat_config', JSON.stringify(chatConfig));
  applyChatConfig();
  chatSettingsModal.style.display = 'none';
});

// ==================== Points ====================

async function loadPoints() {
  const el = document.getElementById('points-value');
  const logEl = document.getElementById('points-log');
  try {
    const data = await api('/api/points');
    el.textContent = data.points;
    const entries = data.log || [];
    logEl.innerHTML = '<div class="points-log-header">使用记录</div>';
    if (!entries.length) {
      logEl.innerHTML += '<div class="empty-state"><div class="emoji">📋</div>还没有记录哦</div>';
      return;
    }
    // Calculate running balance
    let balance = 0;
    const withBalance = entries.map(entry => {
      balance += entry.delta;
      return { ...entry, balance };
    });
    [...withBalance].reverse().forEach(entry => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      const sign = entry.delta >= 0 ? '+' : '';
      const cls = entry.delta >= 0 ? 'plus' : 'minus';
      div.innerHTML = `
        <div class="delta ${cls}">${sign}${entry.delta}</div>
        <div class="reason">${escapeHtml(entry.reason)}</div>
        <div class="balance">余${entry.balance}分</div>
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
