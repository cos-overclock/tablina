<script lang="ts">
  import { formatFileSize } from '$lib/utils';

  export let selectedFiles: number = 0;
  export let totalFiles: number = 0;
  export let totalSize: number = 0;
  export let currentPath: string = '';
  export let loading: boolean = false;
  export let connectionStatus: 'online' | 'offline' = 'online';

  $: statusText = getStatusText();

  function getStatusText(): string {
    if (loading) return '読み込み中...';
    
    if (selectedFiles > 0) {
      return `${selectedFiles} 個のアイテムを選択中`;
    }
    
    if (totalFiles === 0) {
      return 'アイテムなし';
    }
    
    return `${totalFiles} 個のアイテム`;
  }

  function getSizeText(): string {
    if (totalSize === 0) return '';
    return formatFileSize(totalSize);
  }
</script>

<div class="status-bar">
  <div class="status-section">
    <span class="status-text">{statusText}</span>
    {#if totalSize > 0}
      <span class="size-text">({getSizeText()})</span>
    {/if}
  </div>

  <div class="status-section center">
    <span class="path-text" title={currentPath}>
      {currentPath}
    </span>
  </div>

  <div class="status-section right">
    <div class="connection-status" class:offline={connectionStatus === 'offline'}>
      <span class="connection-icon">
        {connectionStatus === 'online' ? '🟢' : '🔴'}
      </span>
      <span class="connection-text">
        {connectionStatus === 'online' ? 'オンライン' : 'オフライン'}
      </span>
    </div>

    <div class="progress-section">
      {#if loading}
        <div class="progress-spinner"></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    height: 24px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 0 12px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .status-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .status-section.center {
    justify-content: center;
    flex: 2;
  }

  .status-section.right {
    justify-content: flex-end;
  }

  .status-text {
    font-weight: 500;
  }

  .size-text {
    color: var(--text-tertiary);
  }

  .path-text {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--bg-primary);
  }

  .connection-status.offline {
    background: var(--error-bg, #fee);
    color: var(--error-text, #c53030);
  }

  .connection-icon {
    font-size: 8px;
  }

  .connection-text {
    font-size: 11px;
  }

  .progress-section {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-spinner {
    width: 12px;
    height: 12px;
    border: 1px solid var(--border-color);
    border-top: 1px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .status-section.center {
      display: none;
    }
    
    .path-text {
      max-width: 150px;
    }
  }
</style>