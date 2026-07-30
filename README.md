# VISTAVAULT Dashboard (Next.js + Supabase)

Aurumデザインのモニタリングダッシュボード。Vercelにデプロイして使用する。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の publishable key を記入
npm run dev
```

## Vercelデプロイ

1. このリポジトリをVercelにインポート
2. Environment Variables に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. デプロイ

## Supabase Realtime を有効化する

リアルタイム更新を使うには、Supabase側で対象テーブルのReplicationを有効にする:

Supabase Dashboard → Database → Replication → `supabase_realtime` に
`sensor_logs` と `operation_logs` を追加。

有効化しない場合も30秒ポーリングで更新される。

## 構成

```
app/
  layout.tsx      フォント読み込み・メタデータ
  page.tsx        メインダッシュボード（データ取得・状態管理）
  globals.css     グローバルスタイル
components/
  Chart.tsx       recharts グラフ（湿度・温度・VOC・Rosahl電流）
  Panels.tsx      Navbar / Hero / ControlBar / OpLog / Segmented
lib/
  supabase.ts     Supabaseクライアント・型・データ取得関数
  tokens.ts       Aurumデザイントークン（色・ヘルパー）
```

## データソース

- `sensor_logs`: temperature / humidity / voc_index / rosahl_dehumid_current_ma / rosahl_humid_current_ma
- `operation_logs`: event_type / detail（preset_change / shutter_open / shutter_close / mode_change / solenoid_unlock）

湿度プリセット: DRY=30% / STD=50% / MOIST=70%（operation_logs の preset_change から解決）
