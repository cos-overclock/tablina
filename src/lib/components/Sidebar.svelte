<script lang="ts">
  import { appState } from '$lib/stores';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    navigate: string;
    toggleCollapse: void;
  }>();

  export let collapsed: boolean = false;

  const quickAccess = [
    { name: 'ホーム', path: '/', icon: '🏠' },
    { name: 'デスクトップ', path: '/Desktop', icon: '🖥️' },
    { name: 'ドキュメント', path: '/Documents', icon: '📄' },
    { name: 'ダウンロード', path: '/Downloads', icon: '⬇️' },
    { name: 'ピクチャ', path: '/Pictures', icon: '🖼️' },
    { name: 'ミュージック', path: '/Music', icon: '🎵' },
    { name: 'ビデオ', path: '/Videos', icon: '🎬' },
  ];

  const bookmarks = [
    { name: 'プロジェクト', path: '/Projects', icon: '📁' },
    { name: 'お気に入り', path: '/Favorites', icon: '⭐' },
  ];

  function handleNavigate(path: string) {
    dispatch('navigate', path);
  }

  function handleToggleCollapse() {
    dispatch('toggleCollapse');
  }
</script>

<div class="sidebar" class:collapsed>
  <div class="sidebar-header">
    <button class="collapse-btn" onclick={handleToggleCollapse}>
      {collapsed ? '▶' : '◀'}
    </button>
    {#if !collapsed}
      <span class="sidebar-title">エクスプローラー</span>
    {/if}
  </div>

  {#if !collapsed}
    <div class="sidebar-content">
      <section class="section">
        <h3 class="section-title">クイックアクセス</h3>
        <ul class="nav-list">
          {#each quickAccess as item}
            <li class="nav-item">
              <button
                class="nav-button"
                onclick={() => handleNavigate(item.path)}
                title={item.name}
              >
                <span class="nav-icon">{item.icon}</span>
                <span class="nav-text">{item.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      </section>

      <section class="section">
        <h3 class="section-title">ブックマーク</h3>
        <ul class="nav-list">
          {#each bookmarks as item}
            <li class="nav-item">
              <button
                class="nav-button"
                onclick={() => handleNavigate(item.path)}
                title={item.name}
              >
                <span class="nav-icon">{item.icon}</span>
                <span class="nav-text">{item.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      </section>

      <section class="section">
        <h3 class="section-title">ネットワーク</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <button class="nav-button" disabled>
              <span class="nav-icon">🌐</span>
              <span class="nav-text">ネットワークドライブ</span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  {:else}
    <div class="sidebar-content-collapsed">
      {#each quickAccess.slice(0, 5) as item}
        <button
          class="nav-button-collapsed"
          onclick={() => handleNavigate(item.path)}
          title={item.name}
        >
          <span class="nav-icon">{item.icon}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    width: 240px;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 50px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    height: 40px;
  }

  .collapse-btn {
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--text-secondary);
    border-radius: 4px;
  }

  .collapse-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .sidebar-title {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .sidebar-content {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
  }

  .sidebar-content-collapsed {
    flex: 1;
    padding: 8px 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 8px 0;
    padding: 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    margin-bottom: 2px;
  }

  .nav-button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    text-align: left;
  }

  .nav-button:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-button-collapsed {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }

  .nav-button-collapsed:hover {
    background: var(--bg-hover);
  }

  .nav-icon {
    margin-right: 8px;
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .nav-text {
    font-size: 13px;
    color: var(--text-primary);
  }
</style>