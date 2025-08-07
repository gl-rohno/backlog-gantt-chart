import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Settings, RefreshCw, Filter, ChevronLeft } from 'lucide-react';
import GanttChart from './components/GanttChart';
import FilterPanel from './components/FilterPanel';
import { BacklogApiService } from './services/backlogApi';
import { GanttTask, BacklogApiConfig, BacklogStatus, BacklogUser } from './types/backlog';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [apiConfig, setApiConfig] = useState<BacklogApiConfig>({
    spaceId: '',
    apiKey: ''
  });
  const [backlogService, setBacklogService] = useState<BacklogApiService | null>(null);
  const [projectStatuses, setProjectStatuses] = useState<Map<number, BacklogStatus[]>>(new Map());
  const [allBacklogUsers, setAllBacklogUsers] = useState<BacklogUser[]>([]);
  const [resolutions, setResolutions] = useState<{id: number, name: string}[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    if (!apiConfig.spaceId || !apiConfig.apiKey) {
      setError('SpaceIDとAPIキーを設定してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const backlogService = new BacklogApiService(apiConfig);
      setBacklogService(backlogService);
      
      const backlogProjects = await backlogService.getProjects();
      
      const [backlogUsers, backlogResolutions] = await Promise.all([
        backlogService.getAllUsers(),
        backlogService.getResolutions()
      ]);
      setAllBacklogUsers(backlogUsers);
      setResolutions(backlogResolutions);

      const projectStatusesMap = new Map<number, BacklogStatus[]>();
      await Promise.all(
        backlogProjects.map(async (project) => {
          try {
            const statuses = await backlogService.getProjectStatuses(project.id);
            projectStatusesMap.set(project.id, statuses);
          } catch (error) {
            // Ignore individual project status failures
          }
        })
      );
      setProjectStatuses(projectStatusesMap);
      
      const allIssues = await backlogService.getIssues();
      const ganttTasks = backlogService.transformIssuestoGanttTasks(allIssues, backlogProjects);
      
      const uniqueUsers = Array.from(new Set(ganttTasks.map(task => task.assignee))).sort();
      const uniqueProjects = Array.from(new Set(ganttTasks.map(task => task.projectKey))).sort();

      setTasks(ganttTasks);
      setSelectedUsers(uniqueUsers);
      setSelectedProjects(uniqueProjects);
      setShowSettings(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleRefresh = () => {
    fetchData();
  };

  const convertUpdatesToBacklogFormat = (taskId: string, updates: Partial<GanttTask>) => {
    const backlogUpdates: any = {};
    
    if (updates.assignee) {
      const user = allBacklogUsers.find(u => u.name === updates.assignee);
      if (user) backlogUpdates.assigneeId = user.id;
    }
    
    if (updates.status) {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask) {
        const statuses = projectStatuses.get(currentTask.projectId);
        if (statuses) {
          const status = statuses.find(s => s.name === updates.status);
          if (status) backlogUpdates.statusId = status.id;
        }
      }
    }
    
    if (updates.priority) {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask?.priorityDisplayOrder) {
        const priorityMapping: { [key: string]: number } = {};
        tasks.forEach(task => {
          if (task.priorityDisplayOrder) {
            priorityMapping[task.priority] = task.priorityDisplayOrder;
          }
        });
        if (priorityMapping[updates.priority]) {
          backlogUpdates.priorityId = priorityMapping[updates.priority];
        }
      }
    }
    
    if (updates.resolution) {
      const resolution = resolutions.find(r => r.name === updates.resolution);
      if (resolution) backlogUpdates.resolutionId = resolution.id;
    }
    
    if (updates.startDate !== undefined) {
      backlogUpdates.startDate = updates.startDate ? updates.startDate.toISOString().split('T')[0] : null;
    }
    
    if (updates.endDate !== undefined) {
      backlogUpdates.dueDate = updates.endDate ? updates.endDate.toISOString().split('T')[0] : null;
    }
    
    if (updates.comment) {
      backlogUpdates.comment = updates.comment;
    }
    
    return backlogUpdates;
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    if (!backlogService) {
      setError('Backlog APIサービスが利用できません');
      return;
    }

    try {
      setLoading(true);
      
      const backlogUpdates = convertUpdatesToBacklogFormat(taskId, updates);
      await backlogService.updateIssue(parseInt(taskId), backlogUpdates);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
    } catch (error) {
      setError('タスクの更新に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filterCompletedTasks = (tasks: GanttTask[], startDate: string) => {
    return tasks.filter(task => {
      const isCompleted = task.status === '完了';
      const isEndBeforeStart = task.endDate && task.endDate < new Date(startDate);
      
      if (isCompleted && isEndBeforeStart) return false;
      if (isCompleted && !task.endDate) return false;
      
      return true;
    });
  };

  const { availableUsers, availableProjects } = useMemo(() => {
    const filteredTasks = filterCompletedTasks(tasks, startDate);
    const availableUsers = Array.from(new Set(filteredTasks.map(task => task.assignee))).sort();
    
    // プロジェクトキーと名前の組み合わせを取得
    const projectMap = new Map();
    filteredTasks.forEach(task => {
      if (!projectMap.has(task.projectKey)) {
        projectMap.set(task.projectKey, {
          key: task.projectKey,
          name: task.projectName
        });
      }
    });
    
    const availableProjects = Array.from(projectMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    return { availableUsers, availableProjects };
  }, [tasks, startDate]);

  useEffect(() => {
    const validUsers = selectedUsers.filter(user => availableUsers.includes(user));
    if (validUsers.length !== selectedUsers.length) {
      setSelectedUsers(availableUsers);
    }
    setSelectedProjects(prev => prev.filter(project => availableProjects.some(p => p.key === project)));
  }, [availableUsers, availableProjects, selectedUsers]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="header-title">
            <Calendar size={24} />
            <h1>WorkspaceTimeline</h1>
          </div>
        </div>
        <div className="header-bottom">
          <div className="header-left">
            {!showSettings && (
              <button 
                className={`header-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                title={showFilters ? 'フィルタを閉じる' : 'フィルタを開く'}
              >
                {showFilters ? <ChevronLeft size={18} /> : <Filter size={18} />}
                フィルタ
              </button>
            )}
          </div>
          <div className="header-right">
            {!showSettings && (
              <>
                <button 
                  className="header-btn"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                  更新
                </button>
                <button 
                  className="header-btn"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings size={18} />
                  設定
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {showSettings ? (
          <>
            <div className="settings-panel">
              <h2>API設定</h2>
              <form onSubmit={handleConfigSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="spaceId">Space ID</label>
                  <input
                    type="text"
                    id="spaceId"
                    value={apiConfig.spaceId}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, spaceId: e.target.value }))}
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
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
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
                    tasks={tasks}
                    selectedUsers={selectedUsers}
                    selectedProjects={selectedProjects}
                    startDate={new Date(startDate)}
                    onTaskUpdate={handleTaskUpdate}
                    projectStatuses={projectStatuses}
                    resolutions={resolutions}
                  />
                )}
              </div>
            </div>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <RefreshCw size={48} className="spinning" />
                  <p>データを読み込み中...</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;