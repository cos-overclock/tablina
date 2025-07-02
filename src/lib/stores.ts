import { writable } from 'svelte/store';

export interface AppState {
  currentDirectory: string;
  tabs: TabState[];
  activeTabId: string;
  sidebarCollapsed: boolean;
}

export interface TabState {
  id: string;
  path: string;
  name: string;
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
});

export const theme = writable<'light' | 'dark'>('light');