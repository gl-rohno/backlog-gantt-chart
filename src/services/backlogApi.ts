import axios, { AxiosInstance } from 'axios';
import { 
  BacklogProject, 
  BacklogIssue, 
  BacklogUser, 
  BacklogStatus,
  BacklogApiConfig,
  GanttTask 
} from '../types/backlog';

export class BacklogApiService {
  private api: AxiosInstance;

  constructor(config: BacklogApiConfig) {
    this.api = axios.create({
      baseURL: `https://${config.spaceId}.backlog.com/api/v2`,
      params: {
        apiKey: config.apiKey
      }
    });
  }

  async getProjects(): Promise<BacklogProject[]> {
    try {
      const response = await this.api.get('/projects');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getIssues(): Promise<BacklogIssue[]> {
    try {
      const allIssues: BacklogIssue[] = [];
      let offset = 0;
      const limit = 100;

      // 最大1000件まで取得
      while (offset < 1000) {
        const params: any = {
          count: limit,
          offset: offset,
          sort: 'created',
          order: 'desc'
        };

        const response = await this.api.get('/issues', { params });
        const issues: BacklogIssue[] = response.data;
        
        if (issues.length === 0) break; // データがなくなったら終了
        
        allIssues.push(...issues);
        offset += limit;
      }
      
      return allIssues;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<BacklogUser[]> {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProjectStatuses(projectId: number): Promise<BacklogStatus[]> {
    try {
      const response = await this.api.get(`/projects/${projectId}/statuses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getResolutions(): Promise<{id: number, name: string}[]> {
    try {
      const response = await this.api.get('/resolutions');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateIssue(issueId: number, updates: {
    assigneeId?: number;
    statusId?: number;
    priorityId?: number;
    resolutionId?: number;
    startDate?: string | null;
    dueDate?: string | null;
    comment?: string;
  }): Promise<BacklogIssue> {
    try {
      const params: any = {};
      
      if (updates.assigneeId !== undefined) {
        params.assigneeId = updates.assigneeId;
      }
      if (updates.statusId !== undefined) {
        params.statusId = updates.statusId;
      }
      if (updates.priorityId !== undefined) {
        params.priorityId = updates.priorityId;
      }
      if (updates.resolutionId !== undefined) {
        params.resolutionId = updates.resolutionId;
      }
      if (updates.startDate !== undefined) {
        params.startDate = updates.startDate;
      }
      if (updates.dueDate !== undefined) {
        params.dueDate = updates.dueDate;
      }
      if (updates.comment) {
        params.comment = updates.comment;
      }

      const response = await this.api.patch(`/issues/${issueId}`, params);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  transformIssuestoGanttTasks(issues: BacklogIssue[], projects: BacklogProject[]): GanttTask[] {
    const projectMap = new Map(projects.map(p => [p.id, p]));
    
    return issues
      .filter(issue => issue.assignee) // 担当者が設定されているタスクのみ
      .map(issue => {
        const project = projectMap.get(issue.projectId);
        // 日付が設定されている場合のみDate objectを作成、未設定の場合はnullを設定
        const startDate = issue.startDate ? new Date(issue.startDate) : null;
        const endDate = issue.dueDate ? new Date(issue.dueDate) : null;
        
        let progress = 0;
        if (issue.status.name === '完了' || issue.status.name === 'Closed') {
          progress = 100;
        } else if (issue.status.name === '処理中' || issue.status.name === 'In Progress') {
          progress = 50;
        }

        return {
          id: issue.id.toString(),
          name: issue.summary,
          projectName: project?.name || 'Unknown Project',
          projectKey: project?.projectKey || 'UNKNOWN',
          projectId: issue.projectId,
          assignee: issue.assignee!.name,
          startDate,
          endDate,
          progress,
          status: issue.status.name,
          priority: issue.priority.name,
          resolution: issue.resolution?.name || '',
          issueKey: issue.issueKey,
          statusDisplayOrder: issue.status.displayOrder,
          priorityDisplayOrder: issue.priority.id // 優先度はidで順序付け
        };
      });
  }
}