import React from 'react';
import { GanttTask, BacklogStatus } from '../types/backlog';
import { useGanttChart } from '../hooks/useGanttChart';
import { TaskModal } from './TaskModal';
import { GanttHeader } from './GanttHeader';
import { TaskBar } from './TaskBar';
import { formatDate, getStatusColor } from '../utils/ganttUtils';

interface GanttChartProps {
  tasks: GanttTask[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: Date;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  projectStatuses: Map<number, BacklogStatus[]>;
  resolutions: {id: number, name: string}[];
}


const GanttChart: React.FC<GanttChartProps> = ({ tasks, selectedUsers, selectedProjects, startDate, onTaskUpdate, projectStatuses, resolutions }) => {
  const {
    modal,
    editState,
    sortState,
    containerRef,
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
    availableAssignees,
    availablePriorities,
    getAvailableStatuses,
    filteredTasks,
    dateRange,
    days,
    chartWidth,
    setEditState
  } = useGanttChart({
    tasks,
    selectedUsers,
    selectedProjects,
    startDate,
    onTaskUpdate,
    projectStatuses
  });



  if (filteredTasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>表示するタスクがありません</p>
      </div>
    );
  }


  return (
    <div 
      ref={containerRef}
      className="gantt-chart" 
      onClick={handleOutsideClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: modal.show || editState.editMode ? 'default' : 'grab' }}
    >
      <GanttHeader
        chartWidth={chartWidth}
        days={days}
        sortColumn={sortState.sortColumn}
        sortDirection={sortState.sortDirection}
        onSort={handleSort}
      />
      
      <div className="gantt-body" style={{ minWidth: `${chartWidth}px` }}>
        {filteredTasks.map((task) => (
          <div 
            key={task.id} 
            className="gantt-row" 
            style={{ minWidth: `${chartWidth}px` }}
          >
            <div className="gantt-row-left">
              <div className="row-cell">
                <span className="project-badge">{task.projectKey}</span>
              </div>
              <div 
                className="row-cell task-name" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleRowClick(e, task)}
              >
                <span className="issue-key">[{task.issueKey}]</span>
                <span className="task-summary">{task.name}</span>
              </div>
              <div className="row-cell">{task.assignee}</div>
              <div className="row-cell date-cell">{formatDate(task.startDate)}</div>
              <div className="row-cell date-cell">{formatDate(task.endDate)}</div>
              <div className="row-cell">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status || 'No Status'}
                </span>
              </div>
            </div>
            <div className="gantt-row-right">
              <div className="gantt-timeline-row">
                <TaskBar
                  task={task}
                  days={days}
                  dateRange={dateRange}
                  startDate={startDate}
                  onTaskClick={handleRowClick}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <TaskModal
        task={modal.task}
        show={modal.show}
        editMode={editState.editMode}
        editForm={editState.editForm}
        availableAssignees={availableAssignees}
        availablePriorities={availablePriorities}
        getAvailableStatuses={getAvailableStatuses}
        resolutions={resolutions}
        onClose={handleCloseModal}
        onEdit={handleEditClick}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onFormChange={(updates) => setEditState(prev => ({ ...prev, editForm: { ...prev.editForm, ...updates } }))}
      />
    </div>
  );
};

export default GanttChart;