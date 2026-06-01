<template>
  <div class="selector-block">
    <div class="selector-head">
      <span class="selector-title">{{ title }}</span>
      <el-tag v-if="type === 'checkbox' && selectedCount" size="mini" type="primary" effect="plain">
        已选 {{ selectedCount }}
      </el-tag>
    </div>

    <el-empty v-if="!items.length" description="暂无可用选项，请前往选型库管理添加" :image-size="72" />

    <el-radio-group
      v-else-if="type === 'radio'"
      class="option-group"
      :value="value"
      @input="$emit('input', $event)"
    >
      <el-tooltip
        v-for="it in items"
        :key="it.id"
        :content="it.description || it.name"
        :disabled="!it.description"
        placement="top"
        :open-delay="400"
      >
        <el-radio-button :label="it.name">{{ it.name }}</el-radio-button>
      </el-tooltip>
    </el-radio-group>

    <el-checkbox-group
      v-else
      class="option-group"
      :value="value"
      @input="$emit('input', $event)"
    >
      <el-tooltip
        v-for="it in items"
        :key="it.id"
        :content="it.description || it.name"
        :disabled="!it.description"
        placement="top"
        :open-delay="400"
      >
        <el-checkbox-button :label="it.name">{{ it.name }}</el-checkbox-button>
      </el-tooltip>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  name: 'Selector',
  props: {
    title: String,
    items: { type: Array, default: () => [] },
    value: [String, Array, null],
    type: { type: String, default: 'radio' }
  },
  computed: {
    selectedCount() {
      return Array.isArray(this.value) ? this.value.length : 0;
    }
  }
};
</script>

<style scoped>
.selector-block {
  padding: 4px 0 16px;
}

.selector-block + .selector-block {
  border-top: 1px dashed var(--line);
  padding-top: 16px;
}

.selector-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.selector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-group >>> .el-radio-button,
.option-group >>> .el-checkbox-button {
  margin: 0 !important;
}

.option-group >>> .el-radio-button__inner,
.option-group >>> .el-checkbox-button__inner {
  border-left: 1px solid #dcdfe6;
  border-radius: 6px !important;
  box-shadow: none !important;
  padding: 10px 16px;
}

.option-group >>> .el-radio-button:first-child .el-radio-button__inner,
.option-group >>> .el-checkbox-button:first-child .el-checkbox-button__inner {
  border-left: 1px solid #dcdfe6;
}
</style>
