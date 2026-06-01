const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js/dist/sql-wasm.js');

const dbPath = path.join(__dirname, 'stackpilot.db');
let SQL;
let db;

const defaultOptions = [
  ['frontend.framework', 'Vue3', '前端框架', 1, 1], ['frontend.framework', 'React', '前端框架', 1, 1], ['frontend.framework', 'Angular', '前端框架', 1, 1], ['frontend.framework', '原生HTML', '前端框架', 1, 1],
  ['frontend.ui', 'Element Plus', '界面库', 1, 1], ['frontend.ui', 'Ant Design', '界面库', 1, 1], ['frontend.ui', 'Tailwind CSS', '原子样式', 1, 1],
  ['frontend.build', 'Vite', '构建工具', 1, 1], ['frontend.build', 'Webpack', '构建工具', 1, 1], ['frontend.state', 'Pinia', '状态管理', 1, 1], ['frontend.state', 'Redux', '状态管理', 1, 1],
  ['frontend.request', 'Axios', '请求库', 1, 1], ['frontend.request', 'Fetch', '请求库', 1, 1], ['frontend.extra', 'TypeScript', '强类型支持', 1, 1], ['frontend.extra', 'SVG Icons', '图标系统', 1, 1], ['frontend.extra', '国际化', '多语言能力', 1, 1],
  ['backend.language', 'Java', '后端语言', 1, 1], ['backend.language', 'Python', '后端语言', 1, 1], ['backend.language', 'Go', '后端语言', 1, 1], ['backend.language', 'Node.js', '后端语言', 1, 1], ['backend.framework', 'SpringBoot', '后端框架', 1, 1], ['backend.framework', 'Django', '后端框架', 1, 1], ['backend.framework', 'Express', '后端框架', 1, 1], ['backend.framework', 'NestJS', '后端框架', 1, 1],
  ['backend.api', 'RESTful', '接口风格', 1, 1], ['backend.api', 'GraphQL', '接口风格', 1, 1], ['backend.auth', 'JWT', '认证机制', 1, 1], ['backend.auth', 'OAuth2', '认证机制', 1, 1], ['backend.doc', 'Swagger/OpenAPI', '接口文档', 1, 1],
  ['dataLayer.database', 'MySQL', '数据库', 1, 1], ['dataLayer.database', 'PostgreSQL', '数据库', 1, 1], ['dataLayer.database', 'MongoDB', '数据库', 1, 1], ['dataLayer.cache', 'Redis', '缓存', 1, 1], ['dataLayer.search', 'Elasticsearch', '检索', 1, 1],
  ['ops.deployBase', 'Docker', '部署基础', 1, 1], ['ops.deployBase', 'Nginx', '部署基础', 1, 1], ['ops.cloud', '阿里云', '云平台', 1, 1], ['ops.cloud', '腾讯云', '云平台', 1, 1], ['ops.cloud', 'AWS', '云平台', 1, 1], ['ops.environment', 'Dev', '环境', 1, 1], ['ops.environment', 'Test', '环境', 1, 1], ['ops.environment', 'Prod', '环境', 1, 1], ['architecture.mode', '单体架构', '架构模式', 1, 1], ['architecture.mode', '前后端分离', '架构模式', 1, 1], ['architecture.mode', '微服务', '架构模式', 1, 1], ['architecture.pattern', 'MVC', '设计模式', 1, 1], ['architecture.pattern', 'MVVM', '设计模式', 1, 1]
];

const defaultConfig = { schemaVersion: '1.0.0', project: { name: '', description: '', type: '', language: '' }, frontend: { framework: null, ui: [], build: null, state: [], request: [], extra: [] }, backend: { language: null, framework: null, api: null, auth: [], doc: [] }, dataLayer: { database: null, cache: [], search: [] }, ops: { deployBase: [], cloud: [], environment: [] }, architecture: { mode: null, pattern: [] }, output: { summary: '', prompt: '' } };

function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  persist();
  return Promise.resolve(true);
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return Promise.resolve(rows);
}

async function initDb() {
  SQL = await initSqlJs({ locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file) });
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS options (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT '', enabled INTEGER DEFAULT 1, builtin INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS configs (id INTEGER PRIMARY KEY AUTOINCREMENT, data_json TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

  const optionCount = (await all('SELECT COUNT(*) AS total FROM options'))[0].total;
  if (optionCount === 0) {
    for (const it of defaultOptions) {
      db.run('INSERT INTO options(category, name, description, enabled, builtin) VALUES(?, ?, ?, ?, ?)', it);
    }
  }

  const configCount = (await all('SELECT COUNT(*) AS total FROM configs'))[0].total;
  if (configCount === 0) {
    db.run('INSERT INTO configs(data_json) VALUES(?)', [JSON.stringify(defaultConfig)]);
  }
  persist();
}

module.exports = { all, run, initDb, defaultOptions, defaultConfig };
