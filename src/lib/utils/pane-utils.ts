import type { PaneState, TabState } from '$lib/stores';

export function findPaneById(panes: PaneState[], id: string): PaneState | null {
  for (const pane of panes) {
    if (pane.id === id) {
      return pane;
    }
    if (pane.children) {
      const found = findPaneById(pane.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentPane(panes: PaneState[], childId: string): PaneState | null {
  for (const pane of panes) {
    if (pane.children) {
      if (pane.children.some(child => child.id === childId)) {
        return pane;
      }
      const found = findParentPane(pane.children, childId);
      if (found) return found;
    }
  }
  return null;
}

export function splitPane(panes: PaneState[], paneId: string, direction: 'horizontal' | 'vertical'): PaneState[] {
  const newPanes = JSON.parse(JSON.stringify(panes)); // Deep clone
  const pane = findPaneById(newPanes, paneId);
  
  if (!pane || pane.type !== 'leaf') {
    return panes;
  }
  
  // Create new pane with same content
  const newPane: PaneState = {
    id: `pane-${Date.now()}`,
    type: 'leaf',
    tabs: pane.tabs ? [...pane.tabs] : [],
    activeTabId: pane.activeTabId,
    size: 1,
  };
  
  // Convert current pane to container
  pane.type = direction;
  pane.children = [
    {
      id: `${pane.id}-0`,
      type: 'leaf',
      tabs: pane.tabs,
      activeTabId: pane.activeTabId,
      size: 1,
    },
    newPane
  ];
  
  // Clean up old leaf properties
  delete pane.tabs;
  delete pane.activeTabId;
  
  return newPanes;
}

export function closePane(panes: PaneState[], paneId: string): { panes: PaneState[], newActivePaneId?: string } {
  const newPanes = JSON.parse(JSON.stringify(panes)); // Deep clone
  const parent = findParentPane(newPanes, paneId);
  
  if (!parent || !parent.children) {
    // Root pane cannot be closed if it's the only one
    if (newPanes.length === 1) {
      return { panes };
    }
    return { panes: newPanes.filter((p: PaneState) => p.id !== paneId) };
  }
  
  // Remove the pane from its parent
  parent.children = parent.children.filter(child => child.id !== paneId);
  
  // If parent has only one child left, replace parent with that child
  if (parent.children.length === 1) {
    const remainingChild = parent.children[0];
    parent.type = remainingChild.type;
    parent.children = remainingChild.children;
    parent.tabs = remainingChild.tabs;
    parent.activeTabId = remainingChild.activeTabId;
    parent.size = remainingChild.size;
  }
  
  // Find the first leaf pane for new active pane
  const newActivePaneId = findFirstLeafPane(newPanes)?.id;
  
  return { panes: newPanes, newActivePaneId };
}

export function findFirstLeafPane(panes: PaneState[]): PaneState | null {
  for (const pane of panes) {
    if (pane.type === 'leaf') {
      return pane;
    }
    if (pane.children) {
      const found = findFirstLeafPane(pane.children);
      if (found) return found;
    }
  }
  return null;
}

export function addTabToPane(panes: PaneState[], paneId: string, path: string): PaneState[] {
  const newPanes = JSON.parse(JSON.stringify(panes)); // Deep clone
  const pane = findPaneById(newPanes, paneId);
  
  if (!pane || pane.type !== 'leaf') {
    return panes;
  }
  
  const newTab: TabState = {
    id: `tab-${Date.now()}`,
    path: path,
    name: path.split('/').pop() || path,
  };
  
  if (!pane.tabs) {
    pane.tabs = [];
  }
  
  pane.tabs.push(newTab);
  pane.activeTabId = newTab.id;
  
  return newPanes;
}

export function closeTabInPane(panes: PaneState[], paneId: string, tabId: string): PaneState[] {
  const newPanes = JSON.parse(JSON.stringify(panes)); // Deep clone
  const pane = findPaneById(newPanes, paneId);
  
  if (!pane || pane.type !== 'leaf' || !pane.tabs) {
    return panes;
  }
  
  // Don't close the last tab
  if (pane.tabs.length <= 1) {
    return panes;
  }
  
  const tabIndex = pane.tabs.findIndex(tab => tab.id === tabId);
  if (tabIndex === -1) {
    return panes;
  }
  
  pane.tabs.splice(tabIndex, 1);
  
  // If closed tab was active, activate another tab
  if (pane.activeTabId === tabId) {
    const newActiveIndex = Math.min(tabIndex, pane.tabs.length - 1);
    pane.activeTabId = pane.tabs[newActiveIndex].id;
  }
  
  return newPanes;
}

export function changeActiveTabInPane(panes: PaneState[], paneId: string, tabId: string): PaneState[] {
  const newPanes = JSON.parse(JSON.stringify(panes)); // Deep clone
  const pane = findPaneById(newPanes, paneId);
  
  if (!pane || pane.type !== 'leaf' || !pane.tabs) {
    return panes;
  }
  
  const tab = pane.tabs.find(t => t.id === tabId);
  if (tab) {
    pane.activeTabId = tabId;
  }
  
  return newPanes;
}