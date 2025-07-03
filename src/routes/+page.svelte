<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, type TabState, type PaneState } from '$lib/stores';
  import TabBar from '$lib/components/TabBar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MainPane from '$lib/components/MainPane.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
  import Pane from '$lib/components/Pane.svelte';
  import { 
    splitPane, 
    closePane, 
    addTabToPane, 
    closeTabInPane, 
    changeActiveTabInPane, 
    findPaneById 
  } from '$lib/utils/pane-utils';
  import '../app.css';

  let currentState = $state({
    tabs: [
      {
        id: 'default',
        path: '/',
        name: 'ホーム',
      },
    ],
    activeTabId: 'default',
    sidebarCollapsed: false,
    currentDirectory: '/',
    panes: [
      {
        id: 'root',
        type: 'leaf' as const,
        tabs: [
          {
            id: 'default',
            path: '/',
            name: 'ホーム',
          },
        ],
        activeTabId: 'default',
      },
    ] as PaneState[],
    activePaneId: 'root',
  });

  let selectedFiles = $state(0);
  let totalFiles = $state(0);
  let totalSize = $state(0);
  let loading = $state(false);

  function generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function handleAddTab() {
    const newTab: TabState = {
      id: generateTabId(),
      path: currentState.currentDirectory,
      name: 'New Tab',
    };
    
    currentState.tabs = [...currentState.tabs, newTab];
    currentState.activeTabId = newTab.id;
  }

  function handleCloseTab(tabId: string) {
    if (currentState.tabs.length <= 1) return;
    
    const tabIndex = currentState.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;
    
    currentState.tabs = currentState.tabs.filter(tab => tab.id !== tabId);
    
    if (currentState.activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, currentState.tabs.length - 1);
      currentState.activeTabId = currentState.tabs[newActiveIndex].id;
    }
  }

  function handleSelectTab(tabId: string) {
    currentState.activeTabId = tabId;
    const activeTab = currentState.tabs.find(tab => tab.id === tabId);
    if (activeTab) {
      currentState.currentDirectory = activeTab.path;
    }
  }

  function handlePaneSplit(event: CustomEvent<{ paneId: string, direction: 'horizontal' | 'vertical' }>) {
    const { paneId, direction } = event.detail;
    currentState.panes = splitPane(currentState.panes, paneId, direction);
  }

  function handlePaneClose(event: CustomEvent<{ paneId: string }>) {
    const { paneId } = event.detail;
    const result = closePane(currentState.panes, paneId);
    currentState.panes = result.panes;
    if (result.newActivePaneId) {
      currentState.activePaneId = result.newActivePaneId;
    }
  }

  function handlePaneTabChange(event: CustomEvent<{ paneId: string, tabId: string }>) {
    const { paneId, tabId } = event.detail;
    currentState.panes = changeActiveTabInPane(currentState.panes, paneId, tabId);
    
    const pane = findPaneById(currentState.panes, paneId);
    if (pane && pane.tabs) {
      const tab = pane.tabs.find(t => t.id === tabId);
      if (tab) {
        currentState.currentDirectory = tab.path;
      }
    }
  }

  function handlePaneTabClose(event: CustomEvent<{ paneId: string, tabId: string }>) {
    const { paneId, tabId } = event.detail;
    currentState.panes = closeTabInPane(currentState.panes, paneId, tabId);
  }

  function handlePaneTabAdd(event: CustomEvent<{ paneId: string, path: string }>) {
    const { paneId, path } = event.detail;
    currentState.panes = addTabToPane(currentState.panes, paneId, path);
  }

  function handlePaneClick(event: CustomEvent<{ paneId: string }>) {
    const { paneId } = event.detail;
    currentState.activePaneId = paneId;
  }

  function handleSidebarNavigate(path: string) {
    const activePane = findPaneById(currentState.panes, currentState.activePaneId);
    if (activePane && activePane.tabs && activePane.activeTabId) {
      const activeTab = activePane.tabs.find(tab => tab.id === activePane.activeTabId);
      if (activeTab) {
        activeTab.path = path;
        activeTab.name = path.split('/').pop() || 'Root';
        currentState.currentDirectory = path;
      }
    }
  }

  function handleToggleSidebar() {
    currentState.sidebarCollapsed = !currentState.sidebarCollapsed;
  }

  let activePane = $derived(findPaneById(currentState.panes, currentState.activePaneId));
  let activeTab = $derived(activePane?.tabs?.find(tab => tab.id === activePane.activeTabId));
  let currentPath = $derived(activeTab?.path || '/');

  onMount(() => {
    // Initialize with home directory
    handleSidebarNavigate('/');
  });
</script>

<div class="app-layout">
  <div class="main-layout">
    <Sidebar 
      collapsed={currentState.sidebarCollapsed}
      on:navigate={(e) => handleSidebarNavigate(e.detail)}
      on:toggleCollapse={handleToggleSidebar}
    />
    
    <div class="pane-container">
      {#each currentState.panes as pane}
        <Pane 
          {pane}
          isActive={pane.id === currentState.activePaneId}
          on:split={handlePaneSplit}
          on:close={handlePaneClose}
          on:tab-change={handlePaneTabChange}
          on:tab-close={handlePaneTabClose}
          on:tab-add={handlePaneTabAdd}
          on:pane-click={handlePaneClick}
        />
      {/each}
    </div>
  </div>
  
  <StatusBar 
    {selectedFiles}
    {totalFiles}
    {totalSize}
    currentPath={currentPath}
    {loading}
  />
</div>

<style>
  .app-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }

  .main-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .pane-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .main-layout {
      flex-direction: column;
    }
  }
</style>
