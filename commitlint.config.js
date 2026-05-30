export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 Bug
        'docs',     // 文档更新
        'style',    // 代码格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建/工具
        'ci',       // CI/CD
        'revert',   // 回滚
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['server', 'vue', 'next', 'docker', 'db', 'shared'],
    ],
  },
};
