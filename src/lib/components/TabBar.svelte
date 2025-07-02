<script lang="ts">
  import { appState, type TabState } from '$lib/stores';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    addTab: void;
    closeTab: string;
    selectTab: string;
  }>();

  export let tabs: TabState[] = [];
  export let activeTabId: string = '';

  function handleAddTab() {
    dispatch('addTab');
  }

  function handleCloseTab(tabId: string, event: Event) {
    event.stopPropagation();
    dispatch('closeTab', tabId);
  }

  function handleSelectTab(tabId: string) {
    dispatch('selectTab', tabId);
  }
</script>

<div class="tab-bar">
  <div class="tabs-container">
    {#each tabs as tab (tab.id)}
      <button
        class="tab"
        class:active={tab.id === activeTabId}
        onclick={() => handleSelectTab(tab.id)}
        role="tab"
        tabindex="0"
      >
        <span class="tab-icon">📁</span>
        <span class="tab-name">{tab.name}</span>
        {#if tabs.length > 1}
          <span
            class="tab-close"
            onclick={(e) => handleCloseTab(tab.id, e)}
            onkeydown={(e) => e.key === 'Enter' && handleCloseTab(tab.id, e)}
            role="button"
            tabindex="0"
            aria-label="Close tab"
          >
            ✕
          </span>
        {/if}
      </button>
    {/each}
    <button class="add-tab-btn" onclick={handleAddTab} aria-label="Add new tab">
      +
    </button>
  </div>
</div>

<style>
  .tab-bar {
    display: flex;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    height: 40px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tab-bar::-webkit-scrollbar {
    display: none;
  }

  .tabs-container {
    display: flex;
    align-items: center;
    min-width: 100%;
  }

  .tab {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: none;
    border-right: 1px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    min-width: 120px;
    max-width: 200px;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  .tab:hover {
    background: var(--bg-hover);
  }

  .tab.active {
    background: var(--bg-active);
    border-bottom: 2px solid var(--accent-color);
  }

  .tab-icon {
    margin-right: 6px;
    font-size: 14px;
  }

  .tab-name {
    flex: 1;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-close {
    margin-left: 6px;
    padding: 2px 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--text-secondary);
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .tab:hover .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .add-tab-btn {
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .add-tab-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
</style>