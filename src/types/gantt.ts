export type SortColumn = 'project' | 'task' | 'assignee' | 'startDate' | 'endDate' | 'status';
export type SortDirection = 'asc' | 'desc' | null;

export interface ModalState {
  show: boolean;
  task: any | null;
}

export interface DragState {
  isDragging: boolean;
  dragStart: { x: number; y: number };
  scrollStart: { x: number; y: number };
}

export interface EditState {
  editMode: boolean;
  editForm: Record<string, any>;
}

export interface SortState {
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
}