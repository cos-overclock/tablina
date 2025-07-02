<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, type TabState } from '$lib/stores';
  import TabBar from '$lib/components/TabBar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MainPane from '$lib/components/MainPane.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
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

  function handleSidebarNavigate(path: string) {
    const activeTab = currentState.tabs.find(tab => tab.id === currentState.activeTabId);
    if (activeTab) {
      activeTab.path = path;
      activeTab.name = path.split('/').pop() || 'Root';
      currentState.currentDirectory = path;
    }
  }

  function handleToggleSidebar() {
    currentState.sidebarCollapsed = !currentState.sidebarCollapsed;
  }

  let activeTab = $derived(currentState.tabs.find(tab => tab.id === currentState.activeTabId));
  let currentPath = $derived(activeTab?.path || '/');

  onMount(() => {
    // Initialize with home directory
    handleSidebarNavigate('/');
  });
</script>

<div class="app-layout">
  <TabBar 
    tabs={currentState.tabs}
    activeTabId={currentState.activeTabId}
    on:addTab={handleAddTab}
    on:closeTab={(e) => handleCloseTab(e.detail)}
    on:selectTab={(e) => handleSelectTab(e.detail)}
  />
  
  <div class="main-layout">
    <Sidebar 
      collapsed={currentState.sidebarCollapsed}
      on:navigate={(e) => handleSidebarNavigate(e.detail)}
      on:toggleCollapse={handleToggleSidebar}
    />
    
    <MainPane 
      currentPath={currentPath}
      bind:loading
    />
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

  @media (max-width: 768px) {
    .main-layout {
      flex-direction: column;
    }
  }
</style>
