// ============================================================================
// Tasks Service - Task Management
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockTasks } from './mock-data';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksResponse,
  TaskQueryParams,
  ApiResponse,
} from '../types';

class TasksService {
  private mockTasksData: Task[] = [...mockTasks];

  /**
   * Get all tasks with optional filters
   */
  async getTasks(params?: TaskQueryParams): Promise<TasksResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      
      let filteredTasks = [...this.mockTasksData];

      // Apply filters
      if (params?.completed !== undefined) {
        filteredTasks = filteredTasks.filter(t => t.completed === params.completed);
      }

      if (params?.source) {
        filteredTasks = filteredTasks.filter(t => t.source === params.source);
      }

      if (params?.startDate) {
        filteredTasks = filteredTasks.filter(
          t => new Date(t.dueDate) >= new Date(params.startDate!)
        );
      }

      if (params?.endDate) {
        filteredTasks = filteredTasks.filter(
          t => new Date(t.dueDate) <= new Date(params.endDate!)
        );
      }

      // Sort by due date
      filteredTasks.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      return {
        tasks: filteredTasks,
        total: filteredTasks.length,
      };
    }

    const response = await apiClient.get<TasksResponse>(
      API_ENDPOINTS.TASKS.BASE,
      params
    );

    return response.data;
  }

  /**
   * Get tasks due today
   */
  async getTasksToday(): Promise<Task[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.mockTasksData.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    }

    const response = await apiClient.get<Task[]>(API_ENDPOINTS.TASKS.TODAY);
    return response.data;
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(): Promise<Task[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return this.mockTasksData.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() >= today.getTime();
      }).sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    }

    const response = await apiClient.get<Task[]>(API_ENDPOINTS.TASKS.UPCOMING);
    return response.data;
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const task = this.mockTasksData.find(t => t.id === id);
      if (!task) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404,
        };
      }
      
      return task;
    }

    const response = await apiClient.get<Task>(API_ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
  }

  /**
   * Create new task
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      
      const newTask: Task = {
        id: `task-${Date.now()}`,
        userId: 'user-1',
        title: data.title,
        description: data.description,
        class: data.class,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        completed: false,
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockTasksData.push(newTask);
      return newTask;
    }

    const response = await apiClient.post<Task>(
      API_ENDPOINTS.TASKS.BASE,
      data
    );

    return response.data;
  }

  /**
   * Update task
   */
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      const taskIndex = this.mockTasksData.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404,
        };
      }

      this.mockTasksData[taskIndex] = {
        ...this.mockTasksData[taskIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return this.mockTasksData[taskIndex];
    }

    const response = await apiClient.put<Task>(
      API_ENDPOINTS.TASKS.BY_ID(id),
      data
    );

    return response.data;
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      const taskIndex = this.mockTasksData.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404,
        };
      }

      this.mockTasksData.splice(taskIndex, 1);
      return;
    }

    await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id));
  }

  /**
   * Mark task as complete
   */
  async completeTask(id: string): Promise<Task> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const taskIndex = this.mockTasksData.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404,
        };
      }

      // Only manual tasks can be completed
      if (this.mockTasksData[taskIndex].source !== 'manual') {
        throw {
          success: false,
          error: 'FORBIDDEN',
          message: 'Google Classroom tasks cannot be marked complete in the app',
          statusCode: 403,
        };
      }

      this.mockTasksData[taskIndex] = {
        ...this.mockTasksData[taskIndex],
        completed: true,
        updatedAt: new Date().toISOString(),
      };

      return this.mockTasksData[taskIndex];
    }

    const response = await apiClient.post<Task>(
      API_ENDPOINTS.TASKS.COMPLETE(id)
    );

    return response.data;
  }

  /**
   * Mark task as incomplete
   */
  async uncompleteTask(id: string): Promise<Task> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const taskIndex = this.mockTasksData.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Task not found',
          statusCode: 404,
        };
      }

      // Only manual tasks can be uncompleted
      if (this.mockTasksData[taskIndex].source !== 'manual') {
        throw {
          success: false,
          error: 'FORBIDDEN',
          message: 'Google Classroom tasks cannot be modified in the app',
          statusCode: 403,
        };
      }

      this.mockTasksData[taskIndex] = {
        ...this.mockTasksData[taskIndex],
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      return this.mockTasksData[taskIndex];
    }

    const response = await apiClient.post<Task>(
      API_ENDPOINTS.TASKS.UNCOMPLETE(id)
    );

    return response.data;
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const tasksService = new TasksService();
