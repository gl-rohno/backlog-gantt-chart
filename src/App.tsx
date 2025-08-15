import React from 'react';
import GanttChart from './components/GanttChart';
import FilterPanel from './components/FilterPanel';
import { AppHeader } from './components/layout/AppHeader';
import { SettingsPanel } from './components/layout/SettingsPanel';
import { useApp } from './hooks/useApp';
import { filterCompletedTasks } from './utils/ganttUtils';
import './App.css';

function App() {
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
    sortedTasks,
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
    handleSortedTasksChange,
  } = useApp();

  return (
    <div className="app">
      <AppHeader
        showSettings={showSettings}
        showFilters={showFilters}
        loading={loading}
        sortedTasks={sortedTasks}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleSettings={() => setShowSettings(true)}
        onRefresh={handleRefresh}
        onBulkCopySuccess={handleBulkCopySuccess}
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
                    tasks={filterCompletedTasks(tasks, new Date(startDate))}
                    selectedUsers={selectedUsers}
                    selectedProjects={selectedProjects}
                    startDate={new Date(startDate)}
                    spaceId={apiConfig.spaceId}
                    onTaskUpdate={handleTaskUpdate}
                    projectStatuses={projectStatuses}
                    resolutions={resolutions}
                    onSortedTasksChange={handleSortedTasksChange}
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
  );
}

export default App;