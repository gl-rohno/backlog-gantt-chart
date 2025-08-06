export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang: string;
  mailAddress: string;
}

export interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  chartEnabled: boolean;
  subtaskingEnabled: boolean;
  projectLeaderCanEditProjectLeader: boolean;
  textFormattingRule: string;
  archived: boolean;
}

export interface BacklogIssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogStatus {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogPriority {
  id: number;
  name: string;
}

export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: BacklogIssueType;
  summary: string;
  description: string;
  resolution: null | {
    id: number;
    name: string;
  };
  priority: BacklogPriority;
  status: BacklogStatus;
  assignee: BacklogUser | null;
  category: any[];
  versions: any[];
  milestone: any[];
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  parentIssueId: number | null;
  createdUser: BacklogUser;
  created: string;
  updatedUser: BacklogUser;
  updated: string;
}

export interface BacklogApiConfig {
  spaceId: string;
  apiKey: string;
}

export interface GanttTask {
  id: string;
  name: string;
  projectName: string;
  projectKey: string;
  projectId: number;
  assignee: string;
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
  status: string;
  priority: string;
  resolution?: string;
  issueKey: string;
  comment?: string;
  statusDisplayOrder?: number;
  priorityDisplayOrder?: number;
}