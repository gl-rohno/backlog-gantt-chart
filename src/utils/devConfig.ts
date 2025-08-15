/**
 * 開発環境用の設定
 */

// 環境変数やlocalStorageから設定を読み取り
const getDevConfig = () => {
  if (process.env.NODE_ENV !== 'development') {
    return {
      enablePerformanceLogging: false,
      enableDetailedLogging: false,
      performanceThreshold: 100,
    };
  }

  // localStorageから設定を読み取り（開発者が動的に変更可能）
  const localConfig = {
    enablePerformanceLogging: localStorage.getItem('dev.enablePerformanceLogging') === 'true',
    enableDetailedLogging: localStorage.getItem('dev.enableDetailedLogging') === 'true',
    performanceThreshold: parseInt(localStorage.getItem('dev.performanceThreshold') || '100'),
  };

  return localConfig;
};

export const DEV_CONFIG = getDevConfig();

// 開発者向けのヘルパー関数をwindowオブジェクトに追加
if (process.env.NODE_ENV === 'development') {
  (window as any).devConfig = {
    enablePerformanceLogging: (enabled: boolean) => {
      localStorage.setItem('dev.enablePerformanceLogging', enabled.toString());
      console.log(`Performance logging ${enabled ? 'enabled' : 'disabled'}. Reload to apply.`);
    },
    enableDetailedLogging: (enabled: boolean) => {
      localStorage.setItem('dev.enableDetailedLogging', enabled.toString());
      console.log(`Detailed logging ${enabled ? 'enabled' : 'disabled'}. Reload to apply.`);
    },
    setPerformanceThreshold: (threshold: number) => {
      localStorage.setItem('dev.performanceThreshold', threshold.toString());
      console.log(`Performance threshold set to ${threshold}ms. Reload to apply.`);
    },
    showCurrentConfig: () => {
      console.log('Current dev config:', getDevConfig());
    },
    help: () => {
      console.log(`
Development Configuration:
- devConfig.enablePerformanceLogging(true/false) - Enable/disable performance logging
- devConfig.enableDetailedLogging(true/false) - Enable/disable detailed logging  
- devConfig.setPerformanceThreshold(ms) - Set performance warning threshold
- devConfig.showCurrentConfig() - Show current configuration
- devConfig.help() - Show this help

Current config:
`, getDevConfig());
    }
  };

  // 初回ロード時にヘルプを表示
  console.log('🛠️ Development mode detected. Type devConfig.help() for development options.');
}