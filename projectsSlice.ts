// src/store/projectsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  tasks: Task[];
  attachments: string[]; // URLs or file paths
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: 'todo' | 'doing' | 'done';
  dueDate: string;
  assignedTo: string;
}

interface ProjectsState {
  projects: Project[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  tasks: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      // Also remove associated tasks
      state.tasks = state.tasks.filter(t => t.projectId !== action.payload);
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; newStatus: Task['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
});

export const { 
  setProjects, 
  addProject, 
  updateProject, 
  deleteProject,
  addTask,
  updateTask,
  moveTask,
  setLoading,
  setError
} = projectsSlice.actions;

export default projectsSlice.reducer;