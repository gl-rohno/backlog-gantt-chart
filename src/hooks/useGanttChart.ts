import { useState, useRef, useMemo, useCallback } from 'react';
import { GanttTask, BacklogStatus } from '../types/backlog';
import { SortColumn, ModalState, DragState, EditState, SortState } from '../types/gantt';
import { addMonths, eachDayOfInterval } from 'date-fns';
import { filterCompletedTasks } from '../utils/ganttUtils';

interface UseGanttChartProps {
  tasks: GanttTask[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: Date;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  projectStatuses: Map<number, BacklogStatus[]>;
  columnWidths?: {
    project: number;
    task: number;
    assignee: number;
    startDate: number;
    endDate: number;
    status: number;
  };
}

export const useGanttChart = ({
  tasks,
  selectedUsers,
  selectedProjects,
  startDate,
  onTaskUpdate,
  projectStatuses,
  columnWidths = {
    project: 70,
    task: 200,
    assignee: 90,
    startDate: 80,
    endDate: 80,
    status: 90
  }
}: UseGanttChartProps) => {
  // State management
  const [modal, setModal] = useState<ModalState>({ show: false, task: null });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    scrollStart: { x: 0, y: 0 }
  });
  const [editState, setEditState] = useState<EditState>({
    editMode: false,
    editForm: {}
  });
  const [sortState, setSortState] = useState<SortState>({
    sortColumn: 'startDate',
    sortDirection: 'asc'
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal handlers
  const handleRowClick = useCallback((event: React.MouseEvent, task: GanttTask) => {
    event.stopPropagation();
    setModal({ show: true, task });
  }, []);

  const handleOutsideClick = useCallback(() => {
    setModal({ show: false, task: null });
    setEditState({ editMode: false, editForm: {} });
  }, []);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModal({ show: false, task: null });
    setEditState({ editMode: false, editForm: {} });
  }, []);

  // Edit handlers
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modal.task) {
      setEditState({
        editMode: true,
        editForm: {
          assignee: modal.task.assignee,
          startDate: modal.task.startDate,
          endDate: modal.task.endDate,
          priority: modal.task.priority,
          status: modal.task.status,
          resolution: modal.task.resolution || '',
          comment: modal.task.comment || ''
        }
      });
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modal.task && onTaskUpdate) {
      onTaskUpdate(modal.task.id, editState.editForm);
    }
    setEditState({ editMode: false, editForm: {} });
    setModal({ show: false, task: null });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditState({ editMode: false, editForm: {} });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.classList.contains('task-name') ||
       e.target.closest('.task-name') ||
       e.target.classList.contains('gantt-bar') ||
       e.target.closest('.gantt-bar') ||
       e.target.classList.contains('gantt-modal') ||
       e.target.closest('.gantt-modal') ||
       e.target.tagName === 'INPUT' ||
       e.target.tagName === 'SELECT' ||
       e.target.tagName === 'TEXTAREA' ||
       e.target.tagName === 'BUTTON')
    ) {
      return;
    }

    setDragState(prev => ({ ...prev, isDragging: true, dragStart: { x: e.clientX, y: e.clientY } }));
    
    if (containerRef.current) {
      setDragState(prev => ({
        ...prev,
        scrollStart: {
          x: containerRef.current!.scrollLeft,
          y: containerRef.current!.scrollTop
        }
      }));
      containerRef.current.style.cursor = 'grabbing';
    }

    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !containerRef.current) return;

    const deltaX = dragState.dragStart.x - e.clientX;
    const deltaY = dragState.dragStart.y - e.clientY;

    containerRef.current.scrollLeft = dragState.scrollStart.x + deltaX;
    containerRef.current.scrollTop = dragState.scrollStart.y + deltaY;

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  // Sort handler
  const handleSort = (column: SortColumn) => {
    if (sortState.sortColumn === column) {
      if (sortState.sortDirection === 'asc') {
        setSortState({ sortColumn: column, sortDirection: 'desc' });
      } else {
        setSortState({ sortColumn: column, sortDirection: 'asc' });
      }
    } else {
      setSortState({ sortColumn: column, sortDirection: 'asc' });
    }
  };

  // Computed values
  const { availableAssignees, availablePriorities } = useMemo(() => {
    const assignees = Array.from(new Set(tasks.map(task => task.assignee))).sort();
    
    const priorityMap = new Map<string, number>();
    tasks.forEach(task => {
      if (task.priorityDisplayOrder !== undefined) {
        priorityMap.set(task.priority, task.priorityDisplayOrder);
      }
    });
    const uniquePriorities = Array.from(new Set(tasks.map(task => task.priority)));
    const sortedPriorities = uniquePriorities.sort((a, b) => {
      const orderA = priorityMap.get(a) ?? 999;
      const orderB = priorityMap.get(b) ?? 999;
      return orderA - orderB;
    });
    
    return {
      availableAssignees: assignees,
      availablePriorities: sortedPriorities
    };
  }, [tasks]);

  const getAvailableStatuses = (task: GanttTask) => {
    const statuses = projectStatuses.get(task.projectId);
    if (!statuses) return [];
    
    return statuses
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(status => status.name);
  };

  const filteredTasks = useMemo(() => {
    // First apply completed task filtering
    const completedFiltered = filterCompletedTasks(tasks, startDate);
    
    // Then apply user and project filtering
    const filtered = completedFiltered.filter(task => {
      const userMatch = selectedUsers.length === 0 || selectedUsers.includes(task.assignee);
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(task.projectKey);
      
      return userMatch && projectMatch;
    });

    let sorted = [...filtered];
    
    if (sortState.sortColumn && sortState.sortDirection) {
      sorted.sort((a, b) => {
        if (sortState.sortColumn === 'startDate') {
          // 開始日専用のソートロジック
          const aDate = a.startDate;
          const bDate = b.startDate;
          
          // 両方とも未設定の場合
          if (!aDate && !bDate) return 0;
          
          // 昇順の場合
          if (sortState.sortDirection === 'asc') {
            if (!aDate) return 1;  // aが未設定なら下に
            if (!bDate) return -1; // bが未設定なら上に
            return aDate.getTime() - bDate.getTime();
          } else {
            // 降順の場合
            if (!aDate) return -1; // aが未設定なら上に
            if (!bDate) return 1;  // bが未設定なら下に
            return bDate.getTime() - aDate.getTime();
          }
        } else if (sortState.sortColumn === 'endDate') {
          // 期限日専用のソートロジック
          const aDate = a.endDate;
          const bDate = b.endDate;
          
          // 両方とも未設定の場合
          if (!aDate && !bDate) return 0;
          
          // 昇順の場合
          if (sortState.sortDirection === 'asc') {
            if (!aDate) return 1;  // aが未設定なら下に
            if (!bDate) return -1; // bが未設定なら上に
            return aDate.getTime() - bDate.getTime();
          } else {
            // 降順の場合
            if (!aDate) return -1; // aが未設定なら上に
            if (!bDate) return 1;  // bが未設定なら下に
            return bDate.getTime() - aDate.getTime();
          }
        } else {
          // その他のフィールドのソート
          let aVal: any;
          let bVal: any;
          
          switch (sortState.sortColumn) {
            case 'projectKey':
              aVal = a.projectKey;
              bVal = b.projectKey;
              break;
            case 'name':
              aVal = a.issueKey;
              bVal = b.issueKey;
              break;
            case 'assignee':
              aVal = a.assignee;
              bVal = b.assignee;
              break;
            case 'status':
              aVal = a.status;
              bVal = b.status;
              break;
            default:
              return 0;
          }
          
          const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortState.sortDirection === 'asc' ? result : -result;
        }
      });
    }

    return sorted;
  }, [tasks, selectedUsers, selectedProjects, startDate, sortState.sortColumn, sortState.sortDirection]);

  const dateRange = useMemo(() => {
    const endDate = addMonths(startDate, 3);
    return { start: startDate, end: endDate };
  }, [startDate]);

  const days = useMemo(() => {
    return eachDayOfInterval(dateRange);
  }, [dateRange]);

  const chartWidth = useMemo(() => {
    const leftColumnsWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
    const timelineWidth = days.length * 40;
    return leftColumnsWidth + timelineWidth;
  }, [columnWidths, days.length]);

  return {
    // State
    modal,
    dragState,
    editState,
    sortState,
    containerRef,
    
    // Handlers
    handleRowClick,
    handleOutsideClick,
    handleCloseModal,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleSort,
    
    // Computed values
    availableAssignees,
    availablePriorities,
    getAvailableStatuses,
    filteredTasks,
    dateRange,
    days,
    chartWidth,
    
    // Setters
    setEditState
  };
};