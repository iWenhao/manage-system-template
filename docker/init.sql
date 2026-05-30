-- Admin Pro 数据库初始化脚本
-- 创建表结构和种子数据

-- ==================== 删除已存在的表（按依赖顺序） ====================
DROP TABLE IF EXISTS sys_user_role CASCADE;
DROP TABLE IF EXISTS sys_role_menu CASCADE;
DROP TABLE IF EXISTS sys_user_post CASCADE;
DROP TABLE IF EXISTS sys_job_log CASCADE;
DROP TABLE IF EXISTS sys_job CASCADE;
DROP TABLE IF EXISTS sys_oper_log CASCADE;
DROP TABLE IF EXISTS sys_login_log CASCADE;
DROP TABLE IF EXISTS sys_notice CASCADE;
DROP TABLE IF EXISTS sys_dict_data CASCADE;
DROP TABLE IF EXISTS sys_dict_type CASCADE;
DROP TABLE IF EXISTS sys_config CASCADE;
DROP TABLE IF EXISTS sys_user CASCADE;
DROP TABLE IF EXISTS sys_post CASCADE;
DROP TABLE IF EXISTS sys_role CASCADE;
DROP TABLE IF EXISTS sys_menu CASCADE;
DROP TABLE IF EXISTS sys_dept CASCADE;
DROP TABLE IF EXISTS oauth_token CASCADE;
DROP TABLE IF EXISTS oauth_code CASCADE;
DROP TABLE IF EXISTS oauth_client CASCADE;
DROP TABLE IF EXISTS sso_provider CASCADE;
DROP TABLE IF EXISTS gen_table_column CASCADE;
DROP TABLE IF EXISTS gen_table CASCADE;

-- ==================== 部门表 ====================
CREATE TABLE sys_dept (
    id          SERIAL PRIMARY KEY,
    parent_id   INTEGER DEFAULT 0,
    name        VARCHAR(100) NOT NULL,
    sort        INTEGER DEFAULT 0,
    leader      VARCHAR(50),
    phone       VARCHAR(20),
    email       VARCHAR(100),
    status      INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 用户表 ====================
CREATE TABLE sys_user (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(200) NOT NULL,
    nickname    VARCHAR(50) NOT NULL,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    avatar      VARCHAR(500),
    sex         INTEGER DEFAULT 0,
    status      INTEGER DEFAULT 0,
    dept_id     INTEGER REFERENCES sys_dept(id),
    remark      VARCHAR(500),
    login_ip    VARCHAR(50),
    login_date  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 角色表 ====================
CREATE TABLE sys_role (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    code        VARCHAR(50) UNIQUE NOT NULL,
    sort        INTEGER DEFAULT 0,
    status      INTEGER DEFAULT 0,
    data_scope  INTEGER DEFAULT 1,
    remark      VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 菜单表 ====================
CREATE TABLE sys_menu (
    id          SERIAL PRIMARY KEY,
    parent_id   INTEGER DEFAULT 0,
    name        VARCHAR(50) NOT NULL,
    path        VARCHAR(200),
    component   VARCHAR(200),
    icon        VARCHAR(100),
    sort        INTEGER DEFAULT 0,
    type        INTEGER NOT NULL,
    permission  VARCHAR(100),
    visible     INTEGER DEFAULT 0,
    status      INTEGER DEFAULT 0,
    is_external BOOLEAN DEFAULT FALSE,
    is_cache    BOOLEAN DEFAULT FALSE,
    remark      VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 岗位表 ====================
CREATE TABLE sys_post (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(50) NOT NULL,
    sort        INTEGER DEFAULT 0,
    status      INTEGER DEFAULT 0,
    remark      VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 字典类型表 ====================
CREATE TABLE sys_dict_type (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    status      INTEGER DEFAULT 0,
    remark      VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 字典数据表 ====================
CREATE TABLE sys_dict_data (
    id            SERIAL PRIMARY KEY,
    dict_type_id  INTEGER NOT NULL REFERENCES sys_dict_type(id),
    label         VARCHAR(100) NOT NULL,
    value         VARCHAR(100) NOT NULL,
    sort          INTEGER DEFAULT 0,
    status        INTEGER DEFAULT 0,
    remark        VARCHAR(500)
);

-- ==================== 参数配置表 ====================
CREATE TABLE sys_config (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    key         VARCHAR(100) UNIQUE NOT NULL,
    value       VARCHAR(500) NOT NULL,
    type        VARCHAR(50),
    remark      VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 通知公告表 ====================
CREATE TABLE sys_notice (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    type        INTEGER NOT NULL,
    content     TEXT,
    status      INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 操作日志表 ====================
CREATE TABLE sys_oper_log (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(100),
    method          VARCHAR(200),
    request_method  VARCHAR(10),
    url             VARCHAR(500),
    ip              VARCHAR(50),
    oper_name       VARCHAR(50),
    user_id         INTEGER,
    status          INTEGER DEFAULT 0,
    error_msg       VARCHAR(2000),
    oper_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 登录日志表 ====================
CREATE TABLE sys_login_log (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50),
    ip          VARCHAR(50),
    status      INTEGER DEFAULT 0,
    msg         VARCHAR(200),
    login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 定时任务表 ====================
CREATE TABLE sys_job (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    job_group       VARCHAR(50) DEFAULT 'DEFAULT',
    invoke_target   VARCHAR(500) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    misfire_policy  INTEGER DEFAULT 1,
    concurrent      INTEGER DEFAULT 1,
    status          INTEGER DEFAULT 0,
    remark          VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 定时任务日志表 ====================
CREATE TABLE sys_job_log (
    id              SERIAL PRIMARY KEY,
    job_id          INTEGER NOT NULL REFERENCES sys_job(id),
    job_name        VARCHAR(100) NOT NULL,
    invoke_target   VARCHAR(500) NOT NULL,
    job_message     VARCHAR(500),
    status          INTEGER DEFAULT 0,
    exception_info  TEXT,
    start_time      TIMESTAMP,
    stop_time       TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 用户角色关联表 ====================
CREATE TABLE sys_user_role (
    user_id INTEGER NOT NULL REFERENCES sys_user(id),
    role_id INTEGER NOT NULL REFERENCES sys_role(id),
    PRIMARY KEY (user_id, role_id)
);

-- ==================== 角色菜单关联表 ====================
CREATE TABLE sys_role_menu (
    role_id INTEGER NOT NULL REFERENCES sys_role(id),
    menu_id INTEGER NOT NULL REFERENCES sys_menu(id),
    PRIMARY KEY (role_id, menu_id)
);

-- ==================== 用户岗位关联表 ====================
CREATE TABLE sys_user_post (
    user_id INTEGER NOT NULL REFERENCES sys_user(id),
    post_id INTEGER NOT NULL REFERENCES sys_post(id),
    PRIMARY KEY (user_id, post_id)
);

-- ==================== OAuth 客户端表 ====================
CREATE TABLE oauth_client (
    id            SERIAL PRIMARY KEY,
    client_id     VARCHAR(100) UNIQUE NOT NULL,
    client_secret VARCHAR(200) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    redirect_uri  VARCHAR(500) NOT NULL,
    scope         VARCHAR(200),
    status        INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== OAuth Token 表 ====================
CREATE TABLE oauth_token (
    id            SERIAL PRIMARY KEY,
    access_token  VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    client_id     INTEGER NOT NULL REFERENCES oauth_client(id),
    user_id       INTEGER NOT NULL REFERENCES sys_user(id),
    scope         VARCHAR(200),
    expires_at    TIMESTAMP NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== OAuth 授权码表 ====================
CREATE TABLE oauth_code (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(200) UNIQUE NOT NULL,
    client_id   INTEGER NOT NULL REFERENCES oauth_client(id),
    user_id     INTEGER NOT NULL REFERENCES sys_user(id),
    redirect_uri VARCHAR(500) NOT NULL,
    scope       VARCHAR(200),
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== SSO 提供者表 ====================
CREATE TABLE sso_provider (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    type          VARCHAR(50) NOT NULL,
    client_id     VARCHAR(200),
    client_secret VARCHAR(200),
    authorize_url VARCHAR(500),
    token_url     VARCHAR(500),
    user_info_url VARCHAR(500),
    scope         VARCHAR(200),
    status        INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 代码生成 - 表信息 ====================
CREATE TABLE gen_table (
    id              SERIAL PRIMARY KEY,
    table_name      VARCHAR(200) UNIQUE NOT NULL,
    table_comment   VARCHAR(500),
    class_name      VARCHAR(100) NOT NULL,
    tpl_category    VARCHAR(50) DEFAULT 'crud',
    package_name    VARCHAR(100),
    module_name     VARCHAR(100),
    business_name   VARCHAR(100),
    function_name   VARCHAR(200),
    function_author VARCHAR(100),
    options         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 代码生成 - 列信息 ====================
CREATE TABLE gen_table_column (
    id              SERIAL PRIMARY KEY,
    table_id        INTEGER NOT NULL REFERENCES gen_table(id),
    column_name     VARCHAR(200) NOT NULL,
    column_comment  VARCHAR(500),
    column_type     VARCHAR(100) NOT NULL,
    java_type       VARCHAR(50) NOT NULL,
    java_field      VARCHAR(100) NOT NULL,
    is_pk           BOOLEAN DEFAULT FALSE,
    is_increment    BOOLEAN DEFAULT FALSE,
    is_required     BOOLEAN DEFAULT FALSE,
    is_insert       BOOLEAN DEFAULT FALSE,
    is_edit         BOOLEAN DEFAULT FALSE,
    is_list         BOOLEAN DEFAULT FALSE,
    is_query        BOOLEAN DEFAULT FALSE,
    query_type      VARCHAR(50),
    html_type       VARCHAR(50),
    dict_type       VARCHAR(100),
    sort            INTEGER DEFAULT 0
);

-- ==================== 创建索引 ====================
CREATE INDEX idx_user_username ON sys_user(username);
CREATE INDEX idx_user_dept_id ON sys_user(dept_id);
CREATE INDEX idx_role_code ON sys_role(code);
CREATE INDEX idx_menu_parent_id ON sys_menu(parent_id);
CREATE INDEX idx_dept_parent_id ON sys_dept(parent_id);
CREATE INDEX idx_dict_type_id ON sys_dict_data(dict_type_id);
CREATE INDEX idx_config_key ON sys_config(key);
CREATE INDEX idx_oper_log_user_id ON sys_oper_log(user_id);
CREATE INDEX idx_login_log_username ON sys_login_log(username);
CREATE INDEX idx_job_log_job_id ON sys_job_log(job_id);
CREATE INDEX idx_oauth_token_access_token ON oauth_token(access_token);
CREATE INDEX idx_oauth_code_code ON oauth_code(code);
CREATE INDEX idx_gen_table_table_name ON gen_table(table_name);
CREATE INDEX idx_gen_table_column_table_id ON gen_table_column(table_id);

-- ==================== 种子数据 ====================

-- 部门数据
INSERT INTO sys_dept (id, parent_id, name, sort, leader, phone, email, status) VALUES
(1, 0, '总公司', 0, '管理员', '15888888888', 'admin@example.com', 0),
(2, 1, '技术部', 1, '张三', '15888888881', 'tech@example.com', 0),
(3, 1, '市场部', 2, '李四', '15888888882', 'market@example.com', 0),
(4, 1, '财务部', 3, '王五', '15888888883', 'finance@example.com', 0),
(5, 2, '开发组', 1, NULL, NULL, NULL, 0),
(6, 2, '测试组', 2, NULL, NULL, NULL, 0);

SELECT setval('sys_dept_id_seq', 6);

-- 用户数据 (密码: admin123 的 bcrypt hash)
INSERT INTO sys_user (id, username, password, nickname, email, phone, sex, status, dept_id, remark) VALUES
(1, 'admin', '$2a$10$VQECw7SiNIH8Mn0CFqC3IOwl3dJiJ0WQXhBYGqFWjVl6x4BdO5GuK', '超级管理员', 'admin@example.com', '15888888888', 0, 0, 1, '管理员'),
(2, 'test', '$2a$10$VQECw7SiNIH8Mn0CFqC3IOwl3dJiJ0WQXhBYGqFWjVl6x4BdO5GuK', '测试用户', 'test@example.com', '15888888889', 0, 0, 2, '测试用户');

SELECT setval('sys_user_id_seq', 2);

-- 角色数据
INSERT INTO sys_role (id, name, code, sort, status, data_scope, remark) VALUES
(1, '超级管理员', 'admin', 0, 0, 1, '超级管理员'),
(2, '普通角色', 'common', 1, 0, 2, '普通角色');

SELECT setval('sys_role_id_seq', 2);

-- 用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2);

-- 菜单数据
INSERT INTO sys_menu (id, parent_id, name, path, component, icon, sort, type, permission, visible, status, is_external, is_cache) VALUES
-- 一级菜单
(1, 0, '系统管理', '/system', NULL, 'setting', 1, 0, NULL, 0, 0, FALSE, FALSE),
(2, 0, '系统监控', '/monitor', NULL, 'monitor', 2, 0, NULL, 0, 0, FALSE, FALSE),
(3, 0, '系统工具', '/tool', NULL, 'tool', 3, 0, NULL, 0, 0, FALSE, FALSE),

-- 系统管理 - 二级菜单
(100, 1, '用户管理', 'user', 'system/user/index', 'user', 1, 1, 'system:user:list', 0, 0, FALSE, FALSE),
(101, 1, '角色管理', 'role', 'system/role/index', 'peoples', 2, 1, 'system:role:list', 0, 0, FALSE, FALSE),
(102, 1, '菜单管理', 'menu', 'system/menu/index', 'tree-table', 3, 1, 'system:menu:list', 0, 0, FALSE, FALSE),
(103, 1, '部门管理', 'dept', 'system/dept/index', 'tree', 4, 1, 'system:dept:list', 0, 0, FALSE, FALSE),
(104, 1, '岗位管理', 'post', 'system/post/index', 'post', 5, 1, 'system:post:list', 0, 0, FALSE, FALSE),
(105, 1, '字典管理', 'dict', 'system/dict/index', 'dict', 6, 1, 'system:dict:list', 0, 0, FALSE, FALSE),
(106, 1, '参数设置', 'config', 'system/config/index', 'edit', 7, 1, 'system:config:list', 0, 0, FALSE, FALSE),
(107, 1, '通知公告', 'notice', 'system/notice/index', 'message', 8, 1, 'system:notice:list', 0, 0, FALSE, FALSE),

-- 系统监控 - 二级菜单
(200, 2, '在线用户', 'online', 'monitor/online/index', 'online', 1, 1, 'monitor:online:list', 0, 0, FALSE, FALSE),
(201, 2, '服务监控', 'server', 'monitor/server/index', 'server', 2, 1, 'monitor:server:list', 0, 0, FALSE, FALSE),
(202, 2, '操作日志', 'operlog', 'monitor/operlog/index', 'form', 3, 1, 'monitor:operlog:list', 0, 0, FALSE, FALSE),
(203, 2, '登录日志', 'loginlog', 'monitor/loginlog/index', 'logininfor', 4, 1, 'monitor:loginlog:list', 0, 0, FALSE, FALSE),

-- 系统工具 - 二级菜单
(300, 3, '定时任务', 'job', 'tool/job/index', 'job', 1, 1, 'tool:job:list', 0, 0, FALSE, FALSE),
(301, 3, '代码生成', 'gen', 'tool/gen/index', 'code', 2, 1, 'tool:gen:list', 0, 0, FALSE, FALSE),

-- 用户管理 - 按钮权限
(1001, 100, '用户查询', '', '', '', 1, 2, 'system:user:query', 0, 0, FALSE, FALSE),
(1002, 100, '用户新增', '', '', '', 2, 2, 'system:user:add', 0, 0, FALSE, FALSE),
(1003, 100, '用户修改', '', '', '', 3, 2, 'system:user:edit', 0, 0, FALSE, FALSE),
(1004, 100, '用户删除', '', '', '', 4, 2, 'system:user:remove', 0, 0, FALSE, FALSE),
(1005, 100, '重置密码', '', '', '', 5, 2, 'system:user:resetPwd', 0, 0, FALSE, FALSE),

-- 角色管理 - 按钮权限
(1011, 101, '角色查询', '', '', '', 1, 2, 'system:role:query', 0, 0, FALSE, FALSE),
(1012, 101, '角色新增', '', '', '', 2, 2, 'system:role:add', 0, 0, FALSE, FALSE),
(1013, 101, '角色修改', '', '', '', 3, 2, 'system:role:edit', 0, 0, FALSE, FALSE),
(1014, 101, '角色删除', '', '', '', 4, 2, 'system:role:remove', 0, 0, FALSE, FALSE),

-- 菜单管理 - 按钮权限
(1021, 102, '菜单查询', '', '', '', 1, 2, 'system:menu:query', 0, 0, FALSE, FALSE),
(1022, 102, '菜单新增', '', '', '', 2, 2, 'system:menu:add', 0, 0, FALSE, FALSE),
(1023, 102, '菜单修改', '', '', '', 3, 2, 'system:menu:edit', 0, 0, FALSE, FALSE),
(1024, 102, '菜单删除', '', '', '', 4, 2, 'system:menu:remove', 0, 0, FALSE, FALSE),

-- 部门管理 - 按钮权限
(1031, 103, '部门查询', '', '', '', 1, 2, 'system:dept:query', 0, 0, FALSE, FALSE),
(1032, 103, '部门新增', '', '', '', 2, 2, 'system:dept:add', 0, 0, FALSE, FALSE),
(1033, 103, '部门修改', '', '', '', 3, 2, 'system:dept:edit', 0, 0, FALSE, FALSE),
(1034, 103, '部门删除', '', '', '', 4, 2, 'system:dept:remove', 0, 0, FALSE, FALSE),

-- 岗位管理 - 按钮权限
(1041, 104, '岗位查询', '', '', '', 1, 2, 'system:post:query', 0, 0, FALSE, FALSE),
(1042, 104, '岗位新增', '', '', '', 2, 2, 'system:post:add', 0, 0, FALSE, FALSE),
(1043, 104, '岗位修改', '', '', '', 3, 2, 'system:post:edit', 0, 0, FALSE, FALSE),
(1044, 104, '岗位删除', '', '', '', 4, 2, 'system:post:remove', 0, 0, FALSE, FALSE),

-- 字典管理 - 按钮权限
(1051, 105, '字典查询', '', '', '', 1, 2, 'system:dict:query', 0, 0, FALSE, FALSE),
(1052, 105, '字典新增', '', '', '', 2, 2, 'system:dict:add', 0, 0, FALSE, FALSE),
(1053, 105, '字典修改', '', '', '', 3, 2, 'system:dict:edit', 0, 0, FALSE, FALSE),
(1054, 105, '字典删除', '', '', '', 4, 2, 'system:dict:remove', 0, 0, FALSE, FALSE),

-- 参数设置 - 按钮权限
(1061, 106, '参数查询', '', '', '', 1, 2, 'system:config:query', 0, 0, FALSE, FALSE),
(1062, 106, '参数新增', '', '', '', 2, 2, 'system:config:add', 0, 0, FALSE, FALSE),
(1063, 106, '参数修改', '', '', '', 3, 2, 'system:config:edit', 0, 0, FALSE, FALSE),
(1064, 106, '参数删除', '', '', '', 4, 2, 'system:config:remove', 0, 0, FALSE, FALSE),

-- 通知公告 - 按钮权限
(1071, 107, '公告查询', '', '', '', 1, 2, 'system:notice:query', 0, 0, FALSE, FALSE),
(1072, 107, '公告新增', '', '', '', 2, 2, 'system:notice:add', 0, 0, FALSE, FALSE),
(1073, 107, '公告修改', '', '', '', 3, 2, 'system:notice:edit', 0, 0, FALSE, FALSE),
(1074, 107, '公告删除', '', '', '', 4, 2, 'system:notice:remove', 0, 0, FALSE, FALSE),

-- 操作日志 - 按钮权限
(2021, 202, '操作查询', '', '', '', 1, 2, 'monitor:operlog:query', 0, 0, FALSE, FALSE),
(2022, 202, '操作删除', '', '', '', 2, 2, 'monitor:operlog:remove', 0, 0, FALSE, FALSE),
(2023, 202, '日志导出', '', '', '', 3, 2, 'monitor:operlog:export', 0, 0, FALSE, FALSE),

-- 登录日志 - 按钮权限
(2031, 203, '登录查询', '', '', '', 1, 2, 'monitor:loginlog:query', 0, 0, FALSE, FALSE),
(2032, 203, '登录删除', '', '', '', 2, 2, 'monitor:loginlog:remove', 0, 0, FALSE, FALSE),
(2033, 203, '日志导出', '', '', '', 3, 2, 'monitor:loginlog:export', 0, 0, FALSE, FALSE),

-- 定时任务 - 按钮权限
(3001, 300, '任务查询', '', '', '', 1, 2, 'tool:job:query', 0, 0, FALSE, FALSE),
(3002, 300, '任务新增', '', '', '', 2, 2, 'tool:job:add', 0, 0, FALSE, FALSE),
(3003, 300, '任务修改', '', '', '', 3, 2, 'tool:job:edit', 0, 0, FALSE, FALSE),
(3004, 300, '任务删除', '', '', '', 4, 2, 'tool:job:remove', 0, 0, FALSE, FALSE),
(3005, 300, '任务导出', '', '', '', 5, 2, 'tool:job:export', 0, 0, FALSE, FALSE),

-- 代码生成 - 按钮权限
(3011, 301, '生成查询', '', '', '', 1, 2, 'tool:gen:query', 0, 0, FALSE, FALSE),
(3012, 301, '生成修改', '', '', '', 2, 2, 'tool:gen:edit', 0, 0, FALSE, FALSE),
(3013, 301, '生成删除', '', '', '', 3, 2, 'tool:gen:remove', 0, 0, FALSE, FALSE),
(3014, 301, '导入表', '', '', '', 4, 2, 'tool:gen:import', 0, 0, FALSE, FALSE),
(3015, 301, '预览代码', '', '', '', 5, 2, 'tool:gen:preview', 0, 0, FALSE, FALSE),
(3016, 301, '生成代码', '', '', '', 6, 2, 'tool:gen:code', 0, 0, FALSE, FALSE);

SELECT setval('sys_menu_id_seq', 3016);

-- 超级管理员拥有所有菜单权限
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, id FROM sys_menu;

-- 普通角色只有查看权限
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(2, 1), (2, 2), (2, 3),
(2, 100), (2, 101), (2, 102), (2, 103), (2, 104), (2, 105), (2, 106), (2, 107),
(2, 200), (2, 201), (2, 202), (2, 203),
(2, 300), (2, 301),
(2, 1001), (2, 1011), (2, 1021), (2, 1031), (2, 1041), (2, 1051), (2, 1061), (2, 1071),
(2, 2021), (2, 2031), (2, 3001), (2, 3011);

-- 岗位数据
INSERT INTO sys_post (id, code, name, sort, status, remark) VALUES
(1, 'ceo', '董事长', 0, 0, NULL),
(2, 'cto', '总经理', 1, 0, NULL),
(3, 'hr', '项目经理', 2, 0, NULL),
(4, 'user', '开发工程师', 3, 0, NULL),
(5, 'test', '测试工程师', 4, 0, NULL);

SELECT setval('sys_post_id_seq', 5);

-- 用户岗位关联
INSERT INTO sys_user_post (user_id, post_id) VALUES
(1, 1),
(2, 4);

-- 字典类型
INSERT INTO sys_dict_type (id, name, status, remark) VALUES
(1, '用户性别', 0, '用户性别列表'),
(2, '系统状态', 0, '系统状态列表'),
(3, '菜单类型', 0, '菜单类型列表'),
(4, '通知类型', 0, '通知类型列表'),
(5, '操作类型', 0, '操作类型列表'),
(6, '任务组名', 0, '任务组名列表'),
(7, '是否', 0, '是否列表');

SELECT setval('sys_dict_type_id_seq', 7);

-- 字典数据
INSERT INTO sys_dict_data (dict_type_id, label, value, sort, status, remark) VALUES
-- 用户性别
(1, '男', '0', 0, 0, NULL),
(1, '女', '1', 1, 0, NULL),
-- 系统状态
(2, '正常', '0', 0, 0, NULL),
(2, '停用', '1', 1, 0, NULL),
-- 菜单类型
(3, '目录', '0', 0, 0, NULL),
(3, '菜单', '1', 1, 0, NULL),
(3, '按钮', '2', 2, 0, NULL),
-- 通知类型
(4, '通知', '1', 0, 0, NULL),
(4, '公告', '2', 1, 0, NULL),
-- 操作类型
(5, '新增', '1', 0, 0, NULL),
(5, '修改', '2', 1, 0, NULL),
(5, '删除', '3', 2, 0, NULL),
(5, '查询', '4', 3, 0, NULL),
(5, '导出', '5', 4, 0, NULL),
(5, '导入', '6', 5, 0, NULL),
-- 任务组名
(6, '默认', 'DEFAULT', 0, 0, NULL),
(6, '系统', 'SYSTEM', 1, 0, NULL),
-- 是否
(7, '是', '1', 0, 0, NULL),
(7, '否', '0', 1, 0, NULL);

-- 参数配置
INSERT INTO sys_config (name, key, value, type, remark) VALUES
('主框架页-默认皮肤', 'sys.index.skinName', 'skin-blue', 'system', '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow'),
('用户管理-账号初始密码', 'sys.user.initPassword', '123456', 'system', '初始化密码 123456'),
('主框架页-侧边栏主题', 'sys.index.sideTheme', 'theme-dark', 'system', '深色主题theme-dark，浅色主题theme-light'),
('用户登录-最大重试次数', 'sys.login.maxRetry', '5', 'system', '允许的最大重试次数'),
('用户登录-验证码开关', 'sys.login.captchaEnabled', 'true', 'system', '是否开启验证码功能（true开启，false关闭）'),
('用户登录-密码最大错误次数', 'sys.login.maxError', '5', 'system', '密码最大错误次数，超过锁定账号'),
('用户登录-账号锁定时间', 'sys.login.lockTime', '10', 'system', '密码输入错误锁定时间（分钟）');

-- 通知公告
INSERT INTO sys_notice (title, type, content, status) VALUES
('欢迎使用 Admin Pro 后台管理系统', 1, '欢迎使用 Admin Pro 后台管理系统，本系统基于 Node.js + Vue 3 + Next.js 构建。', 0),
('系统更新通知', 2, '系统将于本周六凌晨 2:00-4:00 进行维护升级，届时系统将暂停服务。', 0);

-- 定时任务
INSERT INTO sys_job (name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, remark) VALUES
('清理操作日志', 'SYSTEM', 'system:operlog:clean', '0 0 2 * * ?', 1, 1, 1, '每天凌晨2点清理30天前的操作日志'),
('清理登录日志', 'SYSTEM', 'system:loginlog:clean', '0 0 3 * * ?', 1, 1, 1, '每天凌晨3点清理30天前的登录日志');

-- OAuth 客户端（示例）
INSERT INTO oauth_client (client_id, client_secret, name, redirect_uri, scope, status) VALUES
('admin-vue', 'admin-vue-secret', 'Vue Admin', 'http://localhost:5173/callback', 'read write', 0),
('admin-next', 'admin-next-secret', 'Next Admin', 'http://localhost:3000/callback', 'read write', 0);

COMMENT ON TABLE sys_dept IS '部门表';
COMMENT ON TABLE sys_user IS '用户表';
COMMENT ON TABLE sys_role IS '角色表';
COMMENT ON TABLE sys_menu IS '菜单表';
COMMENT ON TABLE sys_post IS '岗位表';
COMMENT ON TABLE sys_dict_type IS '字典类型表';
COMMENT ON TABLE sys_dict_data IS '字典数据表';
COMMENT ON TABLE sys_config IS '参数配置表';
COMMENT ON TABLE sys_notice IS '通知公告表';
COMMENT ON TABLE sys_oper_log IS '操作日志表';
COMMENT ON TABLE sys_login_log IS '登录日志表';
COMMENT ON TABLE sys_job IS '定时任务表';
COMMENT ON TABLE sys_job_log IS '定时任务日志表';
COMMENT ON TABLE oauth_client IS 'OAuth客户端表';
COMMENT ON TABLE oauth_token IS 'OAuth Token表';
COMMENT ON TABLE oauth_code IS 'OAuth授权码表';
COMMENT ON TABLE sso_provider IS 'SSO提供者表';
COMMENT ON TABLE gen_table IS '代码生成-表信息';
COMMENT ON TABLE gen_table_column IS '代码生成-列信息';
