<script lang="ts">
  import { onMount } from 'svelte';
  import { FileSystemAPI, type FileInfo } from '$lib/api';
  import { formatFileSize, formatDate, getFileIcon } from '$lib/utils';

  export let currentPath: string = '/';
  export let viewMode: 'list' | 'grid' | 'details' = 'details';
  export let loading: boolean = false;

  let files: FileInfo[] = [];
  let error: string | null = null;
  let searchQuery = '';
  let sortBy: 'name' | 'size' | 'modified' = 'name';
  let sortOrder: 'asc' | 'desc' = 'asc';

  $: filteredFiles = files
    .filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case 'name':
          result = a.name.localeCompare(b.name);
          break;
        case 'size':
          result = a.size - b.size;
          break;
        case 'modified':
          result = a.modified.localeCompare(b.modified);
          break;
      }
      return sortOrder === 'asc' ? result : -result;
    });

  async function loadDirectory(path: string) {
    loading = true;
    error = null;
    try {
      const result = await FileSystemAPI.listDirectory(path);
      files = result.files;
      currentPath = result.path;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      files = [];
    } finally {
      loading = false;
    }
  }

  function handleSort(field: typeof sortBy) {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'asc';
    }
  }

  function handleFileDoubleClick(file: FileInfo) {
    if (file.is_dir) {
      loadDirectory(file.path);
    }
  }

  function getSortIcon(field: typeof sortBy) {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? '▲' : '▼';
  }

  onMount(() => {
    loadDirectory(currentPath);
  });

  $: if (currentPath) {
    loadDirectory(currentPath);
  }
</script>

<div class="main-pane">
  <div class="toolbar">
    <div class="path-bar">
      <input
        type="text"
        class="path-input"
        bind:value={currentPath}
        placeholder="パスを入力..."
      />
    </div>
    
    <div class="search-bar">
      <input
        type="text"
        class="search-input"
        bind:value={searchQuery}
        placeholder="ファイルを検索..."
      />
    </div>

    <div class="view-controls">
      <button
        class="view-btn"
        class:active={viewMode === 'list'}
        onclick={() => (viewMode = 'list')}
        title="リスト表示"
      >
        ☰
      </button>
      <button
        class="view-btn"
        class:active={viewMode === 'grid'}
        onclick={() => (viewMode = 'grid')}
        title="グリッド表示"
      >
        ⊞
      </button>
      <button
        class="view-btn"
        class:active={viewMode === 'details'}
        onclick={() => (viewMode = 'details')}
        title="詳細表示"
      >
        ≡
      </button>
    </div>
  </div>

  <div class="file-area">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <span>読み込み中...</span>
      </div>
    {:else if error}
      <div class="error">
        <span class="error-icon">⚠️</span>
        <span class="error-message">{error}</span>
        <button class="retry-btn" onclick={() => loadDirectory(currentPath)}>
          再試行
        </button>
      </div>
    {:else if viewMode === 'details'}
      <div class="file-table-container">
        <table class="file-table">
          <thead>
            <tr>
              <th class="sortable" onclick={() => handleSort('name')}>
                名前 {getSortIcon('name')}
              </th>
              <th class="sortable" onclick={() => handleSort('size')}>
                サイズ {getSortIcon('size')}
              </th>
              <th class="sortable" onclick={() => handleSort('modified')}>
                更新日時 {getSortIcon('modified')}
              </th>
            </tr>
          </thead>
          <tbody>
            {#each filteredFiles as file (file.path)}
              <tr
                class="file-row"
                ondblclick={() => handleFileDoubleClick(file)}
              >
                <td class="file-name">
                  <span class="file-icon">{getFileIcon(file.name, file.is_dir)}</span>
                  <span class="file-text">{file.name}</span>
                </td>
                <td class="file-size">
                  {file.is_dir ? '-' : formatFileSize(file.size)}
                </td>
                <td class="file-modified">
                  {formatDate(file.modified)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if viewMode === 'grid'}
      <div class="file-grid">
        {#each filteredFiles as file (file.path)}
          <button
            class="file-item-grid"
            ondblclick={() => handleFileDoubleClick(file)}
            tabindex="0"
          >
            <div class="file-icon-large">{getFileIcon(file.name, file.is_dir)}</div>
            <div class="file-name-grid">{file.name}</div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="file-list">
        {#each filteredFiles as file (file.path)}
          <button
            class="file-item-list"
            ondblclick={() => handleFileDoubleClick(file)}
            tabindex="0"
          >
            <span class="file-icon">{getFileIcon(file.name, file.is_dir)}</span>
            <span class="file-name-list">{file.name}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if !loading && !error && filteredFiles.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📁</span>
        <span class="empty-message">
          {searchQuery ? '検索結果がありません' : 'このフォルダは空です'}
        </span>
      </div>
    {/if}
  </div>
</div>

<style>
  .main-pane {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: var(--bg-primary);
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    gap: 12px;
  }

  .path-bar {
    flex: 1;
  }

  .path-input {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 13px;
  }

  .search-bar {
    min-width: 200px;
  }

  .search-input {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 13px;
  }

  .view-controls {
    display: flex;
    gap: 4px;
  }

  .view-btn {
    padding: 6px 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .view-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .view-btn.active {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .file-area {
    flex: 1;
    overflow: auto;
    padding: 12px;
  }

  .loading, .error, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: 12px;
    color: var(--text-secondary);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-icon, .empty-icon {
    font-size: 48px;
  }

  .retry-btn {
    padding: 6px 12px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .file-table-container {
    overflow: auto;
  }

  .file-table {
    width: 100%;
    border-collapse: collapse;
  }

  .file-table th {
    text-align: left;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .file-table th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .file-table th.sortable:hover {
    background: var(--bg-hover);
  }

  .file-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .file-row:hover {
    background: var(--bg-hover);
  }

  .file-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    font-size: 13px;
  }

  .file-name {
    display: flex;
    align-items: center;
  }

  .file-icon {
    margin-right: 8px;
    font-size: 16px;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .file-item-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: inherit;
    color: inherit;
    width: 100%;
  }

  .file-item-grid:hover {
    background: var(--bg-hover);
  }

  .file-icon-large {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .file-name-grid {
    font-size: 12px;
    text-align: center;
    word-break: break-word;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .file-item-list {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: inherit;
    color: inherit;
    width: 100%;
    text-align: left;
  }

  .file-item-list:hover {
    background: var(--bg-hover);
  }

  .file-name-list {
    font-size: 13px;
    margin-left: 8px;
  }
</style>