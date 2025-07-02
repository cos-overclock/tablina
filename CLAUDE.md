# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

本プロジェクトは、TauriとSvelteKitを使用したモダンなファイルエクスプローラーアプリケーションです。以下の特徴を持ちます：

- モダンなUI
- タブ機能
- ペイン機能
- インデックスによる高速な検索
- AddOnによるカスタマイズ
- レイアウトのカスタマイズ

## 技術スタック

- **フロントエンド**: SvelteKit 5.x + TypeScript
- **バックエンド**: Rust (Tauri 2.x)
- **ビルドツール**: Vite 6.x
- **パッケージマネージャー**: npm

## 主要なコマンド

### 開発サーバー起動
```bash
npm run dev
```
フロントエンド開発サーバーを起動します。

### Tauriアプリケーション起動
```bash
npm run tauri dev
```
TauriアプリケーションをdevモードでBuild & 起動します。

### プロダクションビルド
```bash
npm run build
```
フロントエンドをプロダクション用にビルドします。

### Tauriアプリケーションビルド
```bash
npm run tauri build
```
Tauriアプリケーションをプロダクション用にビルドし、実行可能ファイルを生成します。

### 型チェック
```bash
npm run check
```
TypeScriptの型チェックを実行します。

### ウォッチモードでの型チェック
```bash
npm run check:watch
```
ファイル変更を監視して型チェックを継続実行します。

## プロジェクト構造

```
├── src/                    # フロントエンドソースコード (SvelteKit)
│   ├── routes/            # ページルート
│   │   ├── +layout.ts     # レイアウト設定
│   │   └── +page.svelte   # メインページ
│   └── app.html           # HTMLテンプレート
├── src-tauri/             # Rustバックエンド
│   ├── src/
│   │   ├── main.rs        # メインエントリーポイント
│   │   └── lib.rs         # Tauriアプリケーションロジック
│   ├── Cargo.toml         # Rust依存関係設定
│   └── tauri.conf.json    # Tauri設定ファイル
├── static/                # 静的ファイル
└── package.json           # Node.js依存関係とスクリプト
```

## 重要な設定ファイル

### tauri.conf.json (src-tauri/tauri.conf.json:6-11)
Tauriアプリケーションの設定を管理します：
- 開発時のコマンド: `npm run dev`
- 開発サーバーURL: `http://localhost:1420`
- ビルドコマンド: `npm run build`
- フロントエンドディスト: `../build`

### vite.config.js
Vite設定では以下が重要です：
- 開発サーバーポート: 1420（Tauriと連携）
- HMRポート: 1421
- src-tauriディレクトリの監視を除外

### svelte.config.js
SvelteKitはTauriで動作するため、adapter-staticを使用してSSG（静的サイト生成）モードで動作します。

## Tauri コマンド

現在実装されているTauriコマンド：

### greet コマンド (src-tauri/src/lib.rs:2-5)
```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

フロントエンドからの呼び出し例：
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("greet", { name: "World" });
```

## 開発のヒント

1. **SvelteKit 5.x のRune APIを使用**: `$state()`、`$derived()`などの新しいリアクティブAPIを活用
2. **Tauriコマンドの追加**: src-tauri/src/lib.rs でコマンドを定義し、invoke_handlerに登録
3. **TypeScript設定**: tsconfig.jsonはSvelteKit用に設定済み
4. **静的アダプター**: Tauriでの動作のためadapter-staticを使用

## 注意事項

- フロントエンドの開発時はポート1420を使用
- TauriアプリケーションのビルドにはRustツールチェーンが必要
- 静的サイト生成（SSG）モードで動作するため、サーバーサイドレンダリング（SSR）は使用不可