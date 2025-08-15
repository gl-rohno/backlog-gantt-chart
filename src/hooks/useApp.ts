import { useState, useEffect, useMemo } from 'react';
import { BacklogApiService } from '../services/backlogApi';
import { GanttTask, BacklogApiConfig, BacklogStatus, BacklogUser } from '../types/backlog';
import { filterCompletedTasks } from '../utils/ganttUtils';
import { handleApiError, logError } from '../utils/errorHandling';

export const useApp = () => {
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
  const [notification, setNotification] = useState<string | null>(null);
  const [sortedTasks, setSortedTasks] = useState<GanttTask[]>([]);

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
      const appError = handleApiError(err);
      logError(appError);
      setError(appError.message);
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
    const backlogUpdates: Record<string, unknown> = {};
    
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
      const appError = handleApiError(error);
      logError(appError);
      setError(`タスクの更新に失敗しました: ${appError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCopySuccess = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSortedTasksChange = (tasks: GanttTask[]) => {
    setSortedTasks(tasks);
  };

  const { availableUsers, availableProjects } = useMemo(() => {
    const filteredTasks = filterCompletedTasks(tasks, new Date(startDate));
    const availableUsers = Array.from(new Set(filteredTasks.map(task => task.assignee))).sort();
    
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

  return {
    // State
    tasks,
    selectedUsers,
    selectedProjects,
    startDate,
    loading,
    error,
    showSettings,
    apiConfig,
    backlogService,
    projectStatuses,
    allBacklogUsers,
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
  };
};