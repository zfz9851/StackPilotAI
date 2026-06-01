<template>
  <div class="app-shell" :class="{ dark: isDark }" v-loading="pageLoading" element-loading-text="加载配置中...">
    <el-container class="layout-root">
      <el-aside width="240px" class="side-panel">
        <div class="brand">
          <div class="brand-icon"><i class="el-icon-s-platform"></i></div>
          <div>
            <h2>AI 研发助手</h2>
            <p>StackPilot AI</p>
          </div>
        </div>
        <el-menu
          :default-active="activeTab"
          class="side-menu"
          background-color="transparent"
          @select="activeTab = $event"
        >
          <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
        <div class="side-footer">
          <el-tag size="mini" :type="schemaErrors.length ? 'danger' : 'success'" effect="dark">
            {{ schemaErrors.length ? 'Schema 异常' : 'Schema 正常' }}
          </el-tag>
          <span class="save-hint"><i class="el-icon-success"></i> 自动保存</span>
        </div>
      </el-aside>

      <el-container class="content-wrap" direction="vertical">
        <el-header height="64px" class="top-bar">
          <div class="top-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>技术方案</el-breadcrumb-item>
              <el-breadcrumb-item>{{ activeTabMeta.label }}</el-breadcrumb-item>
            </el-breadcrumb>
            <p class="top-desc">{{ activeTabMeta.desc }}</p>
          </div>
          <div class="top-actions">
            <el-tooltip content="切换浅色 / 深色主题" placement="bottom">
              <el-switch
                v-model="isDark"
                active-text="深色"
                inactive-text="浅色"
                active-color="#409EFF"
                @change="applyTheme"
              />
            </el-tooltip>
            <el-divider direction="vertical" />
            <el-button type="primary" plain icon="el-icon-document-copy" @click="copyPrompt">复制 Prompt</el-button>
            <el-dropdown trigger="click" @command="exportByType">
              <el-button type="primary" icon="el-icon-download">导出方案</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="json" icon="el-icon-tickets">导出 JSON</el-dropdown-item>
                <el-dropdown-item command="md" icon="el-icon-notebook-2">导出 Markdown</el-dropdown-item>
                <el-dropdown-item command="txt" icon="el-icon-document">导出 TXT</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>

        <div class="summary-zone">
          <el-alert
            v-if="schemaErrors.length"
            class="schema-alert"
            title="Schema 校验未通过"
            type="error"
            :closable="false"
            show-icon
          >
            <ul class="error-list">
              <li v-for="(item, idx) in schemaErrors" :key="idx">{{ item }}</li>
            </ul>
          </el-alert>

          <el-row :gutter="16" class="summary-row">
            <el-col :xs="24" :sm="12" :md="6" v-for="stat in quickStats" :key="stat.label">
              <el-card shadow="hover" class="stat-card" :body-style="{ padding: '14px 16px' }">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value" :title="stat.value">{{ stat.value }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="scroll-body">
          <el-card shadow="never" class="panel-card">
            <div slot="header" class="card-header">
              <span><i :class="activeTabMeta.icon"></i> {{ activeTabMeta.label }}</span>
              <el-tag size="mini" effect="plain">{{ activeTabMeta.tag }}</el-tag>
            </div>

            <template v-if="activeTab === 'base'">
              <el-form :model="form.project" label-width="96px" label-position="top" class="base-form">
                <el-row :gutter="20">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="项目名称">
                      <el-input v-model="form.project.name" maxlength="60" show-word-limit prefix-icon="el-icon-edit" placeholder="例如：智栈商城" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="项目类型">
                      <el-input v-model="form.project.type" maxlength="60" prefix-icon="el-icon-collection-tag" placeholder="例如：SaaS / 电商 / 工具平台" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="开发语言">
                      <el-input v-model="form.project.language" maxlength="60" prefix-icon="el-icon-cpu" placeholder="例如：TypeScript + Python" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="项目描述">
                      <el-input
                        v-model="form.project.description"
                        type="textarea"
                        :rows="4"
                        maxlength="300"
                        show-word-limit
                        placeholder="简要描述项目目标、核心功能与目标用户"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </template>

            <template v-else-if="activeTab === 'frontend'">
              <selector title="框架" :items="enabled('frontend.framework')" v-model="form.frontend.framework" type="radio" />
              <selector title="UI 组件库" :items="enabled('frontend.ui')" v-model="form.frontend.ui" type="checkbox" />
              <selector title="构建工具" :items="enabled('frontend.build')" v-model="form.frontend.build" type="radio" />
              <selector title="状态管理" :items="enabled('frontend.state')" v-model="form.frontend.state" type="checkbox" />
              <selector title="请求库" :items="enabled('frontend.request')" v-model="form.frontend.request" type="checkbox" />
              <selector title="其他能力" :items="enabled('frontend.extra')" v-model="form.frontend.extra" type="checkbox" />
            </template>

            <template v-else-if="activeTab === 'backend'">
              <selector title="语言" :items="enabled('backend.language')" v-model="form.backend.language" type="radio" />
              <selector title="框架" :items="enabled('backend.framework')" v-model="form.backend.framework" type="radio" />
              <selector title="API 风格" :items="enabled('backend.api')" v-model="form.backend.api" type="radio" />
              <selector title="认证方案" :items="enabled('backend.auth')" v-model="form.backend.auth" type="checkbox" />
              <selector title="接口文档" :items="enabled('backend.doc')" v-model="form.backend.doc" type="checkbox" />
            </template>

            <template v-else-if="activeTab === 'data'">
              <selector title="数据库" :items="enabled('dataLayer.database')" v-model="form.dataLayer.database" type="radio" />
              <selector title="缓存" :items="enabled('dataLayer.cache')" v-model="form.dataLayer.cache" type="checkbox" />
              <selector title="检索引擎" :items="enabled('dataLayer.search')" v-model="form.dataLayer.search" type="checkbox" />
            </template>

            <template v-else-if="activeTab === 'ops'">
              <selector title="部署基础" :items="enabled('ops.deployBase')" v-model="form.ops.deployBase" type="checkbox" />
              <selector title="云平台" :items="enabled('ops.cloud')" v-model="form.ops.cloud" type="checkbox" />
              <selector title="运行环境" :items="enabled('ops.environment')" v-model="form.ops.environment" type="checkbox" />
            </template>

            <template v-else-if="activeTab === 'architecture'">
              <selector title="架构形态" :items="enabled('architecture.mode')" v-model="form.architecture.mode" type="radio" />
              <selector title="设计模式" :items="enabled('architecture.pattern')" v-model="form.architecture.pattern" type="checkbox" />
            </template>

            <template v-else-if="activeTab === 'library'">
              <div class="lib-section">
                <div class="lib-toolbar">
                  <div class="lib-filters">
                    <el-select
                      v-model="libraryCategoryFilter"
                      clearable
                      filterable
                      placeholder="筛选分类"
                      class="lib-category-filter"
                    >
                      <el-option
                        v-for="cat in categoryOptions"
                        :key="cat.value"
                        :label="cat.label"
                        :value="cat.value"
                      />
                    </el-select>
                    <el-input
                      v-model="libraryKeyword"
                      clearable
                      prefix-icon="el-icon-search"
                      placeholder="搜索名称或说明"
                      class="lib-search"
                    />
                  </div>
                  <div class="lib-actions">
                    <el-button type="primary" icon="el-icon-plus" @click="openCreate">新增选项</el-button>
                    <el-button icon="el-icon-download" @click="exportLibrary">导出</el-button>
                    <el-upload
                      class="lib-upload"
                      :auto-upload="false"
                      :show-file-list="false"
                      accept=".json"
                      action="#"
                      :on-change="onImportFile"
                    >
                      <el-button icon="el-icon-upload2">导入</el-button>
                    </el-upload>
                    <el-button icon="el-icon-refresh-left" @click="confirmResetLibrary">恢复默认</el-button>
                  </div>
                </div>
                <el-table
                  class="lib-table"
                  :data="paginatedOptions"
                  stripe
                  border
                  size="small"
                  empty-text="暂无匹配的选型项"
                >
                <el-table-column prop="category" label="分类" width="180" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ categoryLabel(scope.row.category) }}
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称" width="160" show-overflow-tooltip />
                <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
                <el-table-column label="状态" width="90" align="center">
                  <template slot-scope="scope">
                    <el-tag size="mini" :type="scope.row.enabled ? 'success' : 'info'">
                      {{ scope.row.enabled ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="210" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="toggleEnabled(scope.row)">
                      {{ scope.row.enabled ? '禁用' : '启用' }}
                    </el-button>
                    <el-button type="text" size="small" @click="editOption(scope.row)">编辑</el-button>
                    <el-popconfirm title="确定删除该选项吗？" @confirm="removeOption(scope.row)">
                      <el-button slot="reference" type="text" size="small" class="danger-text">删除</el-button>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                class="lib-pagination"
                background
                layout="total, sizes, prev, pager, next"
                :current-page.sync="libraryPage"
                :page-size.sync="libraryPageSize"
                :page-sizes="[5, 10, 20, 50]"
                :total="filteredOptions.length"
              />
              </div>
            </template>
          </el-card>

          <div class="preview-panel">
            <el-card shadow="never" class="preview-card" :body-style="{ padding: '0' }">
              <div slot="header" class="preview-header">
                <span><i class="el-icon-view"></i> 方案预览</span>
                <el-button type="text" icon="el-icon-document-copy" @click="copyPreviewTab">复制当前内容</el-button>
              </div>
              <el-tabs v-model="previewTab" type="border-card" class="preview-tabs">
                <el-tab-pane label="JSON" name="json">
                  <el-scrollbar class="preview-scroll"><pre>{{ jsonText }}</pre></el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="Markdown" name="md">
                  <el-scrollbar class="preview-scroll"><pre>{{ markdownText }}</pre></el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="文本摘要" name="txt">
                  <el-scrollbar class="preview-scroll"><pre>{{ summaryText }}</pre></el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="Prompt" name="prompt">
                  <el-scrollbar class="preview-scroll"><pre>{{ promptText }}</pre></el-scrollbar>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </div>
      </el-container>
    </el-container>

    <el-dialog
      :title="optionForm.id ? '编辑选项' : '新增选项'"
      :visible.sync="optionDialog"
      width="520px"
      custom-class="option-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="optionForm" label-width="80px" label-position="left" class="option-form">
        <el-form-item label="分类" required>
          <el-select v-model="optionForm.category" filterable placeholder="请选择分类">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="optionForm.name" maxlength="80" placeholder="显示在选型列表中的名称" />
        </el-form-item>
        <el-form-item label="说明" class="option-desc-item">
          <el-input
            v-model="optionForm.description"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
            placeholder="鼠标悬停选项时显示的说明"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="optionDialog = false">取消</el-button>
        <el-button type="primary" @click="saveOption">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { api, downloadFile } from './utils/api';
import Selector from './components/Selector.vue';

const MENU_ITEMS = [
  { index: 'base', label: '项目基础', icon: 'el-icon-edit-outline', desc: '填写项目基本信息与目标描述', tag: '基础信息' },
  { index: 'frontend', label: '前端选型', icon: 'el-icon-monitor', desc: '选择前端框架、UI 与工程化方案', tag: 'Frontend' },
  { index: 'backend', label: '后端选型', icon: 'el-icon-cpu', desc: '选择后端语言、框架与 API 规范', tag: 'Backend' },
  { index: 'data', label: '数据层', icon: 'el-icon-coin', desc: '配置数据库、缓存与检索组件', tag: 'Data' },
  { index: 'ops', label: '运维部署', icon: 'el-icon-upload', desc: '选择部署方式、云平台与运行环境', tag: 'DevOps' },
  { index: 'architecture', label: '架构设计', icon: 'el-icon-s-grid', desc: '确定系统架构形态与设计模式', tag: 'Architecture' },
  { index: 'library', label: '选型库管理', icon: 'el-icon-folder-opened', desc: '维护各分类下的可选项', tag: 'Library' }
];

const CATEGORY_OPTIONS = [
  { value: 'frontend.framework', label: '前端 · 框架' },
  { value: 'frontend.ui', label: '前端 · UI 组件库' },
  { value: 'frontend.build', label: '前端 · 构建工具' },
  { value: 'frontend.state', label: '前端 · 状态管理' },
  { value: 'frontend.request', label: '前端 · 请求库' },
  { value: 'frontend.extra', label: '前端 · 其他能力' },
  { value: 'backend.language', label: '后端 · 语言' },
  { value: 'backend.framework', label: '后端 · 框架' },
  { value: 'backend.api', label: '后端 · API 风格' },
  { value: 'backend.auth', label: '后端 · 认证方案' },
  { value: 'backend.doc', label: '后端 · 接口文档' },
  { value: 'dataLayer.database', label: '数据层 · 数据库' },
  { value: 'dataLayer.cache', label: '数据层 · 缓存' },
  { value: 'dataLayer.search', label: '数据层 · 检索引擎' },
  { value: 'ops.deployBase', label: '运维 · 部署基础' },
  { value: 'ops.cloud', label: '运维 · 云平台' },
  { value: 'ops.environment', label: '运维 · 运行环境' },
  { value: 'architecture.mode', label: '架构 · 架构形态' },
  { value: 'architecture.pattern', label: '架构 · 设计模式' }
];

function sanitizeText(input) {
  return String(input || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function clipText(text, max = 18) {
  const value = String(text || '未选择');
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default {
  name: 'App',
  components: { Selector },
  data() {
    return {
      activeTab: 'base',
      previewTab: 'json',
      isDark: false,
      pageLoading: true,
      libraryKeyword: '',
      libraryCategoryFilter: '',
      libraryPage: 1,
      libraryPageSize: 5,
      options: [],
      optionDialog: false,
      optionForm: { id: null, category: '', name: '', description: '' },
      saveTimer: null,
      form: {
        schemaVersion: '1.0.0',
        project: { name: '', description: '', type: '', language: '' },
        frontend: { framework: null, ui: [], build: null, state: [], request: [], extra: [] },
        backend: { language: null, framework: null, api: null, auth: [], doc: [] },
        dataLayer: { database: null, cache: [], search: [] },
        ops: { deployBase: [], cloud: [], environment: [] },
        architecture: { mode: null, pattern: [] },
        output: { summary: '', prompt: '' }
      }
    };
  },
  computed: {
    menuItems() {
      return MENU_ITEMS;
    },
    activeTabMeta() {
      return MENU_ITEMS.find((item) => item.index === this.activeTab) || MENU_ITEMS[0];
    },
    categoryOptions() {
      const labelMap = Object.fromEntries(CATEGORY_OPTIONS.map((item) => [item.value, item.label]));
      const values = new Set(CATEGORY_OPTIONS.map((item) => item.value));
      this.options.forEach((row) => {
        if (row.category) values.add(row.category);
      });
      return [...values].sort().map((value) => ({
        value,
        label: labelMap[value] || value
      }));
    },
    filteredOptions() {
      const keyword = this.libraryKeyword.trim().toLowerCase();
      return this.options.filter((row) => {
        if (this.libraryCategoryFilter && row.category !== this.libraryCategoryFilter) return false;
        if (!keyword) return true;
        return [row.name, row.description].some((field) => String(field || '').toLowerCase().includes(keyword));
      });
    },
    paginatedOptions() {
      const start = (this.libraryPage - 1) * this.libraryPageSize;
      return this.filteredOptions.slice(start, start + this.libraryPageSize);
    },
    quickStats() {
      const frontend = [this.form.frontend.framework, ...this.form.frontend.ui].filter(Boolean).join(' + ') || '未选择';
      const backend = [this.form.backend.language, this.form.backend.framework].filter(Boolean).join(' + ') || '未选择';
      const dataLayer = [this.form.dataLayer.database, ...this.form.dataLayer.cache].filter(Boolean).join(' + ') || '未选择';
      const architecture = this.form.architecture.mode || '未选择';
      return [
        { label: '前端方案', value: clipText(frontend, 22) },
        { label: '后端方案', value: clipText(backend, 22) },
        { label: '数据层', value: clipText(dataLayer, 22) },
        { label: '架构形态', value: clipText(architecture, 22) }
      ];
    },
    previewObject() {
      const obj = JSON.parse(JSON.stringify(this.form));
      obj.schemaVersion = '1.0.0';
      obj.project.name = sanitizeText(obj.project.name).slice(0, 60);
      obj.project.description = sanitizeText(obj.project.description).slice(0, 300);
      obj.project.type = sanitizeText(obj.project.type).slice(0, 60);
      obj.project.language = sanitizeText(obj.project.language).slice(0, 60);
      obj.output.summary = this.summaryText;
      obj.output.prompt = this.promptText;
      return obj;
    },
    schemaErrors() {
      const src = this.previewObject;
      const errors = [];
      if (src.schemaVersion !== '1.0.0') errors.push('schemaVersion 必须为 1.0.0');
      const required = ['project', 'frontend', 'backend', 'dataLayer', 'ops', 'architecture', 'output'];
      required.forEach((key) => {
        if (!src[key] || typeof src[key] !== 'object') errors.push(`${key} 缺失或类型错误`);
      });
      if (!Array.isArray(src.frontend.ui)) errors.push('frontend.ui 必须为数组');
      if (!Array.isArray(src.backend.auth)) errors.push('backend.auth 必须为数组');
      if (!Array.isArray(src.dataLayer.cache)) errors.push('dataLayer.cache 必须为数组');
      if (typeof src.project.name !== 'string') errors.push('project.name 必须为字符串');
      return errors;
    },
    summaryText() {
      const name = sanitizeText(this.form.project.name).slice(0, 60);
      return [
        `项目名称：${name || '未填写'}`,
        `前端：${[this.form.frontend.framework, ...this.form.frontend.ui, ...this.form.frontend.request].filter(Boolean).join(' + ') || '未选择'}`,
        `后端：${[this.form.backend.language, this.form.backend.framework].filter(Boolean).join(' + ') || '未选择'}`,
        `数据库：${this.form.dataLayer.database || '未选择'}`,
        `缓存：${this.form.dataLayer.cache.join(' + ') || '未选择'}`,
        `部署：${this.form.ops.deployBase.join(' + ') || '未选择'}`,
        `架构：${this.form.architecture.mode || '未选择'}`
      ].join('\n');
    },
    promptText() {
      return `请根据以下技术方案生成完整项目：\n\n项目类型：${this.form.project.type || '未指定'}\n\n前端：${[this.form.frontend.framework, ...this.form.frontend.ui, ...this.form.frontend.extra].filter(Boolean).join(' + ') || '未选择'}\n\n后端：${[this.form.backend.framework, ...this.form.backend.auth].filter(Boolean).join(' + ') || '未选择'}\n\n数据库：${this.form.dataLayer.database || '未选择'}\n\n缓存：${this.form.dataLayer.cache.join(' + ') || '未选择'}\n\n要求：\n- OpenAPI 文档\n- Docker 部署\n- 生成目录结构、数据库设计、接口设计与部署脚本`;
    },
    jsonText() {
      return JSON.stringify(this.previewObject, null, 2);
    },
    markdownText() {
      const name = sanitizeText(this.form.project.name).slice(0, 60);
      const description = sanitizeText(this.form.project.description).slice(0, 300);
      const type = sanitizeText(this.form.project.type).slice(0, 60);
      return `# ${name || '未命名项目'}\n\n## 项目概述\n${description || '暂无'}\n\n## 技术方案\n\n- 项目类型：${type || '未指定'}\n- 前端：${[this.form.frontend.framework, ...this.form.frontend.ui, ...this.form.frontend.extra].filter(Boolean).join(' + ') || '未选择'}\n- 后端：${[this.form.backend.language, this.form.backend.framework].filter(Boolean).join(' + ') || '未选择'}\n- 数据层：${[this.form.dataLayer.database, ...this.form.dataLayer.cache, ...this.form.dataLayer.search].filter(Boolean).join(' + ') || '未选择'}\n- 运维：${[...this.form.ops.deployBase, ...this.form.ops.cloud, ...this.form.ops.environment].filter(Boolean).join(' + ') || '未选择'}\n- 架构：${[this.form.architecture.mode, ...this.form.architecture.pattern].filter(Boolean).join(' + ') || '未选择'}\n`;
    },
    previewTabTextMap() {
      return {
        json: this.jsonText,
        md: this.markdownText,
        txt: this.summaryText,
        prompt: this.promptText
      };
    }
  },
  watch: {
    libraryKeyword() {
      this.libraryPage = 1;
    },
    libraryCategoryFilter() {
      this.libraryPage = 1;
    },
    filteredOptions(list) {
      const maxPage = Math.max(1, Math.ceil(list.length / this.libraryPageSize) || 1);
      if (this.libraryPage > maxPage) this.libraryPage = maxPage;
    },
    previewObject: {
      deep: true,
      handler() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => {
          this.saveConfig();
        }, 150);
      }
    }
  },
  async created() {
    this.applyTheme();
    try {
      await this.loadOptions();
      await this.loadConfig();
    } finally {
      this.pageLoading = false;
    }
  },
  methods: {
    enabled(category) {
      return this.options.filter((x) => x.category === category && x.enabled === 1);
    },
    categoryLabel(value) {
      const found = this.categoryOptions.find((item) => item.value === value);
      return found ? found.label : value;
    },
    applyTheme() {
      document.body.classList.toggle('dark', this.isDark);
    },
    async withRetry(handler, actionName) {
      try {
        return await handler();
      } catch (error) {
        this.$message.error(`${actionName}失败，正在重试`);
        try {
          return await handler();
        } catch (error2) {
          this.$message.error(`${actionName}失败，请稍后重试`);
          throw error2;
        }
      }
    },
    async loadOptions() {
      const { data } = await this.withRetry(() => api.get('/options'), '读取选型库');
      this.options = data;
    },
    async loadConfig() {
      try {
        const { data } = await api.get('/config');
        if (data && data.project) this.form = data;
      } catch (error) {
        this.$message.warning('配置读取失败，已使用默认配置');
      }
    },
    async saveConfig() {
      if (this.schemaErrors.length) return;
      await api.put('/config', this.previewObject);
    },
    async toggleEnabled(row) {
      await this.withRetry(() => api.put(`/options/${row.id}`, { enabled: row.enabled !== 1 }), '修改状态');
      await this.loadOptions();
    },
    openCreate() {
      this.optionForm = {
        id: null,
        category: this.libraryCategoryFilter || '',
        name: '',
        description: ''
      };
      this.optionDialog = true;
    },
    editOption(row) {
      this.optionForm = { ...row };
      this.optionDialog = true;
    },
    async saveOption() {
      if (!this.optionForm.category || !this.optionForm.name) {
        this.$message.error('分类和名称不能为空');
        return;
      }
      const payload = {
        ...this.optionForm,
        category: sanitizeText(this.optionForm.category).slice(0, 80),
        name: sanitizeText(this.optionForm.name).slice(0, 80),
        description: sanitizeText(this.optionForm.description).slice(0, 300)
      };
      if (this.optionForm.id) await this.withRetry(() => api.put(`/options/${this.optionForm.id}`, payload), '编辑选项');
      else await this.withRetry(() => api.post('/options', payload), '新增选项');
      this.optionDialog = false;
      await this.loadOptions();
      this.$message.success('选项已保存');
    },
    async removeOption(row) {
      await this.withRetry(() => api.delete(`/options/${row.id}`), '删除选项');
      await this.loadOptions();
      this.$message.success('选项已删除');
    },
    confirmResetLibrary() {
      this.$confirm('将恢复默认选型库，自定义选项会被覆盖，是否继续？', '恢复默认', {
        type: 'warning',
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消'
      }).then(() => this.resetLibrary()).catch(() => {});
    },
    async resetLibrary() {
      await this.withRetry(() => api.post('/options/reset'), '恢复默认选型库');
      await this.loadOptions();
      this.$message.success('已恢复默认选型库');
    },
    exportByType(type) {
      const name = this.previewObject.project.name || 'stackpilot-config';
      try {
        if (type === 'json') downloadFile(`${name}.json`, this.jsonText, 'application/json');
        if (type === 'md') downloadFile(`${name}.md`, this.markdownText, 'text/markdown');
        if (type === 'txt') downloadFile(`${name}.txt`, `${this.summaryText}\n\n${this.promptText}`, 'text/plain');
        this.$message.success('导出成功');
      } catch (error) {
        this.$message.error('导出失败，请重试');
      }
    },
    exportLibrary() {
      const payload = JSON.stringify({ options: this.options }, null, 2);
      downloadFile('stackpilot-options.json', payload, 'application/json');
      this.$message.success('选型库导出成功');
    },
    async onImportFile(file) {
      try {
        const text = await file.raw.text();
        const parsed = JSON.parse(text);
        await this.withRetry(() => api.post('/options/import', parsed), '导入选型库');
        await this.loadOptions();
        this.$message.success('选型库导入成功');
      } catch (error) {
        this.$message.error('导入失败，请检查 JSON 格式');
      }
    },
    async copyPrompt() {
      try {
        await navigator.clipboard.writeText(this.promptText);
        this.$message.success('Prompt 已复制');
      } catch (error) {
        this.$message.error('复制失败，请手动复制');
      }
    },
    async copyPreviewTab() {
      const text = this.previewTabTextMap[this.previewTab];
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.$message.success('当前预览内容已复制');
      } catch (error) {
        this.$message.error('复制失败，请手动复制');
      }
    }
  }
};
</script>

<style scoped>
.app-shell {
  height: 100vh;
  overflow: hidden;
}

.layout-root {
  height: 100vh;
  overflow: hidden;
}

.side-panel {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  width: 240px !important;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
  background: linear-gradient(180deg, #0f2744 0%, #16365c 100%);
  color: #fff;
  box-shadow: 4px 0 24px rgba(15, 39, 68, 0.12);
}

.brand {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 22px 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.18);
  color: #79bbff;
  font-size: 22px;
}

.brand h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.brand p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.side-menu {
  flex: 1;
  min-height: 0;
  width: 100%;
  border-right: none;
  overflow: hidden;
}

.side-menu >>> .el-menu {
  width: 100%;
  border-right: none;
}

.side-menu >>> .el-menu-item {
  height: 46px;
  line-height: 46px;
  margin: 4px 8px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
}

.side-menu >>> .el-menu-item i {
  color: rgba(255, 255, 255, 0.65);
}

.side-menu >>> .el-menu-item:hover,
.side-menu >>> .el-menu-item:focus {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff;
}

.side-menu >>> .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.35), rgba(64, 158, 255, 0.12)) !important;
  color: #fff;
}

.side-footer {
  flex-shrink: 0;
  padding: 12px 14px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
}

.side-footer >>> .el-tag {
  flex-shrink: 0;
}

.save-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  flex-shrink: 0;
}

.content-wrap {
  margin-left: 240px;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.summary-zone {
  flex-shrink: 0;
  padding: 12px 20px 12px;
  background: var(--bg);
}

.scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 20px 16px;
}

.top-bar {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 2px 8px rgba(21, 101, 216, 0.04);
}

.top-left {
  min-width: 0;
}

.top-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8492a6;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.schema-alert {
  margin-bottom: 12px;
}

.error-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.summary-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid var(--line);
}

.stat-label {
  font-size: 12px;
  color: #8492a6;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-card,
.preview-card {
  border-radius: 14px;
  border: 1px solid var(--line);
}

.panel-card {
  margin-bottom: 16px;
}

.card-header,
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--text);
}

.card-header i,
.preview-header i {
  margin-right: 6px;
  color: var(--primary);
}

.base-form >>> .el-form-item__label {
  font-weight: 600;
  color: var(--text);
  padding-bottom: 4px;
}

.lib-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.lib-toolbar {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  margin-bottom: 14px;
  align-items: center;
  justify-content: space-between;
}

.lib-filters {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.lib-category-filter {
  width: 180px;
  flex-shrink: 0;
}

.lib-filters >>> .el-input__inner {
  height: 32px;
  line-height: 32px;
}

.lib-filters >>> .el-input__icon {
  line-height: 32px;
}

.lib-table {
  flex: 1;
  min-height: 0;
}

.lib-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.lib-search {
  width: 220px;
  flex-shrink: 0;
}

.lib-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lib-upload {
  display: inline-block;
  line-height: 1;
  vertical-align: top;
}

.danger-text {
  color: #f56c6c !important;
}

.preview-panel {
  padding: 0;
  background: transparent;
}

.preview-tabs {
  border: none;
  box-shadow: none;
}

.preview-tabs >>> .el-tabs__content {
  padding: 0;
}

.preview-scroll {
  height: 220px;
}

.preview-scroll >>> .el-scrollbar__wrap {
  overflow-x: hidden;
}

.preview-scroll pre {
  margin: 0;
  padding: 14px 16px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.6;
  font-family: Consolas, 'Courier New', monospace;
  color: var(--text);
}

@media (max-width: 1200px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
    height: auto !important;
    padding: 14px 16px;
    gap: 12px;
  }

  .top-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .side-panel {
    width: 72px !important;
  }

  .content-wrap {
    margin-left: 72px;
  }

  .brand div:last-child,
  .side-menu >>> .el-menu-item span,
  .side-footer .save-hint {
    display: none;
  }

  .brand {
    justify-content: center;
    padding: 16px 8px;
  }

  .side-menu >>> .el-menu-item {
    margin: 4px 6px;
    padding-left: 16px !important;
  }
}
</style>
