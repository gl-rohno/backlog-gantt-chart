import { useState, useRef, useMemo } from 'react';
import { addMonths, eachDayOfInterval } from 'date-fns';
import { GanttTask, BacklogStatus } from '../types/backlog';
import { SortColumn, ModalState, DragState, EditState, SortState } from '../types/gantt';

interface UseGanttChartProps {
  tasks: GanttTask[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: Date;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  projectStatuses: Map<number, BacklogStatus[]>;
}

export const useGanttChart = ({
  tasks,
  selectedUsers,
  selectedProjects,
  startDate,
  onTaskUpdate,
  projectStatuses
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
    sortColumn: null,
    sortDirection: null
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal handlers
  const handleRowClick = (event: React.MouseEvent, task: GanttTask) => {
    event.stopPropagation();
    setModal({ show: true, task });
  };

  const handleOutsideClick = () => {
    setModal({ show: false, task: null });
    setEditState({ editMode: false, editForm: {} });
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModal({ show: false, task: null });
    setEditState({ editMode: false, editForm: {} });
  };

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
      } else if (sortState.sortDirection === 'desc') {
        setSortState({ sortColumn: null, sortDirection: null });
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
    if (selectedUsers.length === 0 || selectedProjects.length === 0) {
      return [];
    }
    
    const filtered = tasks.filter(task => {
      const userMatch = selectedUsers.includes(task.assignee);
      const projectMatch = selectedProjects.includes(task.projectKey);
      
      const isCompleted = task.status === '完了';
      const isEndBeforeStart = task.endDate && task.endDate < startDate;
      
      if (isCompleted && isEndBeforeStart) {
        return false;
      }
      
      if (isCompleted && !task.endDate) {
        return false;
      }
      
      return userMatch && projectMatch;
    });

    let sorted = [...filtered];
    
    if (sortState.sortColumn && sortState.sortDirection) {
      sorted.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        
        switch (sortState.sortColumn) {
          case 'project':
            aVal = a.projectKey;
            bVal = b.projectKey;
            break;
          case 'task':
            aVal = a.issueKey;
            bVal = b.issueKey;
            break;
          case 'assignee':
            aVal = a.assignee;
            bVal = b.assignee;
            break;
          case 'startDate':
            aVal = a.startDate?.getTime() || 0;
            bVal = b.startDate?.getTime() || 0;
            break;
          case 'endDate':
            aVal = a.endDate?.getTime() || 0;
            bVal = b.endDate?.getTime() || 0;
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortState.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortState.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      sorted.sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return a.startDate.getTime() - b.startDate.getTime();
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

  const chartWidth = 610 + (days.length * 40);

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