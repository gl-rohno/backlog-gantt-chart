import React from 'react';
import { RefreshCw } from 'lucide-react';
import { BacklogApiConfig } from '../../types/backlog';

interface SettingsPanelProps {
  apiConfig: BacklogApiConfig;
  loading: boolean;
  error: string | null;
  onConfigChange: (config: BacklogApiConfig) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiConfig,
  loading,
  error,
  onConfigChange,
  onSubmit,
}) => {
  const handleInputChange = (field: keyof BacklogApiConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onConfigChange({
      ...apiConfig,
      [field]: e.target.value,
    });
  };

  return (
    <>
      <div className="settings-panel">
        <h2>API設定</h2>
        <form onSubmit={onSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="spaceId">Space ID</label>
            <input
              type="text"
              id="spaceId"
              value={apiConfig.spaceId}
              onChange={handleInputChange('spaceId')}
              placeholder="your-space"
              required
            />
            <small>https://your-space.backlog.com の「your-space」部分</small>
          </div>
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiConfig.apiKey}
              onChange={handleInputChange('apiKey')}
              placeholder="APIキーを入力"
              required
            />
            <small>BacklogのAPI設定から取得したAPIキー</small>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="load-btn" disabled={loading}>
            {loading ? 'データ取得中...' : 'データを取得'}
          </button>
        </form>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <RefreshCw size={48} className="spinning" />
            <p>データを取得中...</p>
          </div>
        </div>
      )}
    </>
  );
};