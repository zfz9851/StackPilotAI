const express = require('express');
const cors = require('cors');
const { all, run, initDb, defaultConfig, defaultOptions } = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function sanitizeText(value, maxLength) {
  if (value === null || value === undefined) return '';
  const clean = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return clean.slice(0, maxLength);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter((x) => !!x) : [];
}

function validateAndNormalizeConfig(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  return {
    schemaVersion: '1.0.0',
    project: {
      name: sanitizeText(data?.project?.name, 60),
      description: sanitizeText(data?.project?.description, 300),
      type: sanitizeText(data?.project?.type, 60),
      language: sanitizeText(data?.project?.language, 60)
    },
    frontend: {
      framework: data?.frontend?.framework || null,
      ui: normalizeArray(data?.frontend?.ui),
      build: data?.frontend?.build || null,
      state: normalizeArray(data?.frontend?.state),
      request: normalizeArray(data?.frontend?.request),
      extra: normalizeArray(data?.frontend?.extra)
    },
    backend: {
      language: data?.backend?.language || null,
      framework: data?.backend?.framework || null,
      api: data?.backend?.api || null,
      auth: normalizeArray(data?.backend?.auth),
      doc: normalizeArray(data?.backend?.doc)
    },
    dataLayer: {
      database: data?.dataLayer?.database || null,
      cache: normalizeArray(data?.dataLayer?.cache),
      search: normalizeArray(data?.dataLayer?.search)
    },
    ops: {
      deployBase: normalizeArray(data?.ops?.deployBase),
      cloud: normalizeArray(data?.ops?.cloud),
      environment: normalizeArray(data?.ops?.environment)
    },
    architecture: {
      mode: data?.architecture?.mode || null,
      pattern: normalizeArray(data?.architecture?.pattern)
    },
    output: {
      summary: sanitizeText(data?.output?.summary, 5000),
      prompt: sanitizeText(data?.output?.prompt, 5000)
    }
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.get('/api/options', async (req, res) => {
  const rows = await all('SELECT * FROM options ORDER BY category, id');
  res.json(rows);
});

app.post('/api/options', async (req, res) => {
  const { category, name, description } = req.body;
  if (!category || !name) return res.status(400).json({ message: '分类与名称不能为空' });
  await run('INSERT INTO options(category, name, description, enabled, builtin) VALUES(?, ?, ?, 1, 0)', [category, name, description || '']);
  const id = (await all('SELECT last_insert_rowid() AS id'))[0].id;
  const rows = await all('SELECT * FROM options WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.put('/api/options/:id', async (req, res) => {
  const id = Number(req.params.id);
  const oldRows = await all('SELECT * FROM options WHERE id = ?', [id]);
  if (!oldRows.length) return res.status(404).json({ message: '选项不存在' });
  const old = oldRows[0];
  const name = req.body.name ?? old.name;
  const description = req.body.description ?? old.description;
  const enabled = req.body.enabled === undefined ? old.enabled : req.body.enabled ? 1 : 0;
  await run('UPDATE options SET name = ?, description = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, description, enabled, id]);
  const rows = await all('SELECT * FROM options WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.delete('/api/options/:id', async (req, res) => {
  const id = Number(req.params.id);
  const rows = await all('SELECT * FROM options WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ message: '选项不存在' });
  const row = rows[0];
  if (row.builtin) {
    await run('UPDATE options SET enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return res.json({ message: '内置项已禁用' });
  }
  await run('DELETE FROM options WHERE id = ?', [id]);
  res.json({ message: '删除成功' });
});

app.post('/api/options/reset', async (req, res) => {
  await run('DELETE FROM options');
  for (const it of defaultOptions) {
    await run('INSERT INTO options(category, name, description, enabled, builtin) VALUES(?, ?, ?, ?, ?)', it);
  }
  res.json({ message: '已恢复默认选型库' });
});

app.post('/api/options/import', async (req, res) => {
  const list = Array.isArray(req.body?.options) ? req.body.options : null;
  if (!list) return res.status(400).json({ message: '导入数据格式错误' });
  await run('DELETE FROM options');
  for (const raw of list) {
    const category = sanitizeText(raw.category, 80);
    const name = sanitizeText(raw.name, 80);
    if (!category || !name) continue;
    const description = sanitizeText(raw.description, 300);
    const enabled = raw.enabled ? 1 : 0;
    const builtin = raw.builtin ? 1 : 0;
    await run('INSERT INTO options(category, name, description, enabled, builtin) VALUES(?, ?, ?, ?, ?)', [category, name, description, enabled, builtin]);
  }
  res.json({ message: '选型库导入成功' });
});

app.get('/api/config', async (req, res) => {
  const rows = await all('SELECT * FROM configs ORDER BY id DESC LIMIT 1');
  if (!rows.length) return res.json(defaultConfig);
  try {
    res.json(JSON.parse(rows[0].data_json));
  } catch (error) {
    await run('INSERT INTO configs(data_json) VALUES(?)', [JSON.stringify(defaultConfig)]);
    res.status(500).json({ message: '配置损坏，已回退默认配置', data: defaultConfig });
  }
});

app.put('/api/config', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ message: '配置格式错误' });
  const data = validateAndNormalizeConfig(payload);
  await run('INSERT INTO configs(data_json) VALUES(?)', [JSON.stringify(data)]);
  res.json({ message: '保存成功' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || '服务异常' });
});

initDb().then(() => {
  app.listen(port, () => console.log(`StackPilot API 已启动: http://127.0.0.1:${port}`));
}).catch((error) => {
  console.error('数据库初始化失败:', error);
  process.exit(1);
});
