import { writable } from 'svelte/store';

export interface AppState {
  currentDirectory: string;
  tabs: TabState[];
  activeTabId: string;
  sidebarCollapsed: boolean;
  panes: PaneState[];
  activePaneId: string;
}

export interface TabState {
  id: string;
  path: string;
  name: string;
}

export interface PaneState {
  id: string;
  type: 'horizontal' | 'vertical' | 'leaf';
  children?: PaneState[];
  tabs?: TabState[];
  activeTabId?: string;
  size?: number;
}

export const appState = writable<AppState>({
  currentDirectory: '/',
  tabs: [
    {
      id: 'default',
      path: '/',
      name: 'Home',
    },
  ],
  activeTabId: 'default',
  sidebarCollapsed: false,
  panes: [
    {
      id: 'root',
      type: 'leaf',
      tabs: [
        {
          id: 'default',
          path: '/',
          name: 'Home',
        },
      ],
      activeTabId: 'default',
    },
  ],
  activePaneId: 'root',
});

export const theme = writable<'light' | 'dark'>('light');