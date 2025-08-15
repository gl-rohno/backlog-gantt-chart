/**
 * アプリケーション全体で使用される定数
 */

// タイミング関連
export const TIMING = {
  COPY_FEEDBACK_DURATION: 2000,
  NOTIFICATION_DISPLAY_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
} as const;

// UI関連
export const UI = {
  ICON_SIZE: 14,
  CHART_DAY_WIDTH: 40,
  HEADER_HEIGHT: 80,
  SIDEBAR_WIDTH: 300,
  SIDEBAR_WIDTH_MOBILE: 250,
} as const;

// メッセージ
export const MESSAGES = {
  COPY_SUCCESS: '課題キーと件名をクリップボードにコピーしました',
  COPY_FAILED: 'クリップボードへのコピーに失敗しました',
  BULK_COPY_SUCCESS: 'つの課題をクリップボードにコピーしました',
  DATA_FETCH_ERROR: 'データの取得に失敗しました',
  API_CONFIG_REQUIRED: 'SpaceIDとAPIキーを設定してください',
  TASK_UPDATE_FAILED: 'タスクの更新に失敗しました',
  BACKLOG_SERVICE_UNAVAILABLE: 'Backlog APIサービスが利用できません',
  NO_TASKS_TO_DISPLAY: '表示するタスクがありません',
  ERROR_OCCURRED: 'エラーが発生しました',
} as const;

// ボタンテキスト
export const BUTTON_LABELS = {
  COPY_TASK: 'をコピー',
  SHOW_DETAILS: '詳細を表示',
  REFRESH: '更新',
  SETTINGS: '設定',
  FILTERS: 'フィルタ',
  LOAD_DATA: 'データを取得',
  LOADING_DATA: 'データ取得中...',
  RETRY: '再試行',
  SAVE: '保存',
  CANCEL: 'キャンセル',
  EDIT: '編集',
  CLOSE: '閉じる',
  BULK_COPY: '一括コピー',
} as const;

// ステータス関連
export const STATUS = {
  COMPLETED: ['完了', 'Closed'],
  IN_PROGRESS: ['処理中', 'In Progress'],
  OPEN: ['未対応', 'Open'],
} as const;

// 色定義
export const COLORS = {
  STATUS: {
    COMPLETED: '#38a169',
    IN_PROGRESS: '#3182ce',
    OPEN: '#718096',
    DEFAULT: '#718096',
    OVERDUE: '#e53e3e',
  },
  NOTIFICATION: {
    SUCCESS: '#48bb78',
    ERROR: '#e53e3e',
    WARNING: '#ed8936',
    INFO: '#3182ce',
  },
} as const;

// フォームフィールド
export const FORM_FIELDS = {
  SPACE_ID: 'spaceId',
  API_KEY: 'apiKey',
} as const;

// CSS クラス名
export const CSS_CLASSES = {
  SPINNING: 'spinning',
  COPY_BUTTON: 'copy-button',
  MODAL_BUTTON: 'modal-button',
  TASK_ACTIONS: 'task-actions',
  COPY_NOTIFICATION: 'copy-notification',
} as const;