import { useRef } from 'react';
import GanttChart, { GanttChartRef } from './components/GanttChart';
import FilterPanel from './components/FilterPanel';
import { AppHeader } from './components/layout/AppHeader';
import { SettingsPanel } from './components/layout/SettingsPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useApp } from './hooks/useApp';
import { filterCompletedTasks } from './utils/ganttUtils';
import './App.css';

function App() {
  const ganttChartRef = useRef<GanttChartRef>(null);
  const {
    // State
    tasks,
    selectedUsers,
    selectedProjects,
    startDate,
    loading,
    error,
    showSettings,
    apiConfig,
    projectStatuses,
    resolutions,
    showFilters,
    notification,
    availableUsers,
    availableProjects,
    
    // Actions
    setSelectedUsers,
    setSelectedProjects,
    setStartDate,
    setShowSettings,
    setApiConfig,
    setShowFilters,
    handleConfigSubmit,
    handleRefresh,
    handleTaskUpdate,
    handleBulkCopySuccess,
  } = useApp();


  return (
    <ErrorBoundary>
      <div className="app">
      <AppHeader
        showSettings={showSettings}
        showFilters={showFilters}
        loading={loading}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleSettings={() => setShowSettings(true)}
        onRefresh={handleRefresh}
      />

      <main className="app-main">
        {showSettings ? (
          <SettingsPanel
            apiConfig={apiConfig}
            loading={loading}
            error={error}
            onConfigChange={setApiConfig}
            onSubmit={handleConfigSubmit}
          />
        ) : (
          <>
            <div className="app-content">
              <aside className={`app-sidebar ${showFilters ? 'visible' : 'hidden'}`}>
                <FilterPanel
                  users={availableUsers}
                  projects={availableProjects}
                  selectedUsers={selectedUsers}
                  selectedProjects={selectedProjects}
                  startDate={startDate}
                  onUserChange={setSelectedUsers}
                  onProjectChange={setSelectedProjects}
                  onStartDateChange={setStartDate}
                  onClose={() => setShowFilters(false)}
                />
              </aside>
              <div className="app-body">
                {error ? (
                  <div className="error">
                    <p>エラーが発生しました: {error}</p>
                    <button onClick={handleRefresh} className="retry-btn">再試行</button>
                  </div>
                ) : (
                  <GanttChart
                    ref={ganttChartRef}
                    tasks={filterCompletedTasks(tasks, new Date(startDate))}
                    selectedUsers={selectedUsers}
                    selectedProjects={selectedProjects}
                    startDate={new Date(startDate)}
                    spaceId={apiConfig.spaceId}
                    onTaskUpdate={handleTaskUpdate}
                    onBulkCopySuccess={handleBulkCopySuccess}
                    projectStatuses={projectStatuses}
                    resolutions={resolutions}
                  />
                )}
              </div>
            </div>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <div className="spinning">データを読み込み中...</div>
                </div>
              </div>
            )}
            {notification && (
              <div className="copy-notification">
                {notification}
              </div>
            )}
          </>
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;