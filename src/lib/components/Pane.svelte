<script lang="ts">
  import { appState, type PaneState, type TabState } from '$lib/stores';
  import TabBar from './TabBar.svelte';
  import MainPane from './MainPane.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let pane: PaneState;
  export let isActive: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  function splitPaneHorizontal() {
    dispatch('split', { paneId: pane.id, direction: 'horizontal' });
  }
  
  function splitPaneVertical() {
    dispatch('split', { paneId: pane.id, direction: 'vertical' });
  }
  
  function closePane() {
    dispatch('close', { paneId: pane.id });
  }
  
  function onTabChange(event: CustomEvent<{ tabId: string }>) {
    dispatch('tab-change', { paneId: pane.id, tabId: event.detail.tabId });
  }
  
  function onTabClose(event: CustomEvent<{ tabId: string }>) {
    dispatch('tab-close', { paneId: pane.id, tabId: event.detail.tabId });
  }
  
  function onTabAdd(event: CustomEvent<{ path: string }>) {
    dispatch('tab-add', { paneId: pane.id, path: event.detail.path });
  }
  
  function onPaneClick() {
    dispatch('pane-click', { paneId: pane.id });
  }
</script>

{#if pane.type === 'leaf'}
  <div class="pane-container" class:active={isActive} on:click={onPaneClick} on:keydown={onPaneClick} role="button" tabindex="0">
    <div class="pane-header">
      <div class="pane-controls">
        <button 
          class="pane-button" 
          title="水平分割"
          on:click|stopPropagation={splitPaneHorizontal}
        >
          ⊞
        </button>
        <button 
          class="pane-button" 
          title="垂直分割"
          on:click|stopPropagation={splitPaneVertical}
        >
          ⊟
        </button>
        <button 
          class="pane-button close-button" 
          title="ペインを閉じる"
          on:click|stopPropagation={closePane}
        >
          ✕
        </button>
      </div>
    </div>
    
    {#if pane.tabs && pane.tabs.length > 0}
      <TabBar 
        tabs={pane.tabs}
        activeTabId={pane.activeTabId || pane.tabs[0].id}
        on:tab-change={onTabChange}
        on:tab-close={onTabClose}
        on:tab-add={onTabAdd}
      />
      
      {#if pane.activeTabId}
        {@const activeTab = pane.tabs.find(t => t.id === pane.activeTabId)}
        {#if activeTab}
          <MainPane currentPath={activeTab.path} />
        {/if}
      {/if}
    {:else}
      <div class="empty-pane">
        <p>ペインが空です</p>
      </div>
    {/if}
  </div>
{:else}
  <div class="pane-split" class:horizontal={pane.type === 'horizontal'} class:vertical={pane.type === 'vertical'}>
    {#if pane.children}
      {#each pane.children as childPane}
        <div class="pane-child" style="flex: {childPane.size || 1};">
          <svelte:self 
            pane={childPane} 
            isActive={isActive}
            on:split
            on:close
            on:tab-change
            on:tab-close
            on:tab-add
            on:pane-click
          />
        </div>
        
        {#if childPane !== pane.children[pane.children.length - 1]}
          <div class="pane-separator" class:horizontal={pane.type === 'horizontal'} class:vertical={pane.type === 'vertical'}>
            <div class="separator-handle"></div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
{/if}

<style>
  .pane-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #e0e0e0;
    background: #fff;
    transition: border-color 0.2s;
  }
  
  .pane-container.active {
    border-color: #0066cc;
    box-shadow: 0 0 0 1px #0066cc;
  }
  
  .pane-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 4px 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    min-height: 32px;
  }
  
  .pane-controls {
    display: flex;
    gap: 4px;
  }
  
  .pane-button {
    padding: 4px 8px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
    border-radius: 3px;
    font-size: 12px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .pane-button:hover {
    background: #f0f0f0;
    border-color: #999;
  }
  
  .pane-button.close-button {
    color: #dc3545;
  }
  
  .pane-button.close-button:hover {
    background: #dc3545;
    color: white;
  }
  
  .pane-split {
    display: flex;
    height: 100%;
    width: 100%;
  }
  
  .pane-split.horizontal {
    flex-direction: row;
  }
  
  .pane-split.vertical {
    flex-direction: column;
  }
  
  .pane-child {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  
  .pane-separator {
    background: #e0e0e0;
    cursor: col-resize;
    user-select: none;
    position: relative;
    flex-shrink: 0;
  }
  
  .pane-separator.horizontal {
    width: 4px;
    cursor: col-resize;
  }
  
  .pane-separator.vertical {
    height: 4px;
    cursor: row-resize;
  }
  
  .pane-separator:hover {
    background: #ccc;
  }
  
  .separator-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }
  
  .empty-pane {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-style: italic;
  }
</style>