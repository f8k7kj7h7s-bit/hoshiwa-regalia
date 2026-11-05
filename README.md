# 星環のレガリア PWA

## 含まれるもの
- `index.html`: 画面とデザイン
- `app.js`: ゲームロジック
- `manifest.webmanifest`: ホーム画面追加用設定
- `sw.js`: オフライン起動・キャッシュ
- `icon.svg`: アプリアイコン

## 公開方法（無料の例：GitHub Pages）
1. GitHubで新しいリポジトリを作成（例：`hoshiwa-regalia`）。
2. このフォルダ内の5ファイルをリポジトリ直下にアップロード。
3. Settings → Pages → Deploy from a branch を選び、`main` / `root` を指定して保存。
4. 発行された `https://ユーザー名.github.io/hoshiwa-regalia/` をiPhoneのSafariで開く。
5. 共有ボタン →「ホーム画面に追加」。

## アップデート方法
`app.js` や `index.html` を更新してGitHubへ再アップロードします。
キャッシュを更新する場合は `sw.js` の `CACHE` のバージョン名も変更してください（例：`astral-regalia-v1.0.1`）。
ゲームデータはブラウザのlocalStorageに保存します。セーブデータの書き出し・読み込みにも対応しています。
重要な更新前にはゲーム内の「セーブを書き出す」でバックアップしてください。

## 注意
- PWAのインストールとService WorkerにはHTTPS公開が必要です（localhostを除く）。
- この試作版のセーブデータは同じブラウザ・同じ端末内に保存されます。端末間同期にはサーバーとアカウント機能が別途必要です。
- 現時点の進化・ガチャ・オンライン対戦は未実装です。レベルアップと5つのダンジョンの基本ループを先行実装しています。
