# バグ修正記録：ホーム画面にスケジュールが表示されない問題

## 概要

TimeKeeper アプリのホーム画面（`/`）で、パターンを選択してもスケジュールが一切表示されないバグがありました。`/settings` ページを一度も開かずにアプリを使い始めると必ず再現します。

---

## 原因

**一言でいうと：「設定データがDBに存在しないと、スケジュール生成処理が永遠に実行されない設計になっていた」**

少し詳しく説明します。

このアプリのスケジュール生成は `useDailySchedule` フックが担当しています。フック内部では「必要なデータがすべて揃ってから生成する」という安全装置があり、以下のように書かれていました。

```typescript
if (!settings) {
  console.log('[useDailySchedule] settings未ロード → スキップ');
  return; // ← settingsがnullなら生成しない
}
```

`settings` は DB に `id='default'` という1件だけ存在する特殊なレコードです。このレコードは `/settings` ページを最初に開いたときに初めて作成される設計になっていました。

つまり「`/settings` を一度も開いていないユーザー」は DB に settings レコードがない状態で、ホーム画面を何度リロードしても `settings = null` のままになり、スケジュール生成処理がずっとスキップされ続けていました。

---

## バグに気づいたきっかけ

最初の症状は「ホーム画面でパターンを選択してもスケジュールが何も表示されない」というものでした。

コードを読んでも原因が一目ではわからなかったため、**「データがどこで詰まっているか」を可視化する**方針を取りました。具体的には、DB初期化 → マイグレーション → サービス層 → Zustand Store → フックという、データが流れる全経路にコンソールログを追加しました。

追加したログの場所：

| ファイル | 追加したログの内容 |
|---|---|
| `src/lib/db/index.ts` | PGlite の初期化開始・完了 |
| `src/lib/db/migrate.ts` | 各テーブルの移行件数 |
| `src/lib/data/settings.ts` | settings レコードの取得結果 |
| `src/lib/data/patterns.ts` | パターンの取得・作成・削除 |
| `src/lib/data/dailyState.ts` | 日次状態の取得・保存 |
| `src/store/usePatternStore.ts` | ストアへのパターン反映 |
| `src/store/useDailyStateStore.ts` | ストアへの日次状態反映 |
| `src/hooks/useDailySchedule.ts` | スケジュール生成の各チェックポイント |

実際にブラウザで開いたときのコンソール出力がこちらです。

```
[DbInitializer] マイグレーション開始
[DbInitializer] マイグレーション完了
[settingsService] get() → なし（未初期化）      ← ここで異変に気づく
[useDailySchedule] データロード開始 (today=2026-03-05)
[useDailySchedule] スケジュール生成チェック: settings=null, patterns=1件
[useDailySchedule] settings未ロード → スキップ  ← 永遠にここで止まる
[useDailySchedule] スケジュール生成チェック: settings=null, patterns=1件
[useDailySchedule] settings未ロード → スキップ  ← 何度リロードしても同じ
```

`[settingsService] get() → なし（未初期化）` というログが決定打でした。DB に settings レコードが存在しないことが一目でわかり、そこから「なぜ存在しないのか」を掘り下げることで原因にたどり着きました。

---

## 修正内容

`src/components/common/DbInitializer.tsx` を修正しました。このファイルはアプリ起動時に一度だけ実行されるコンポーネントです。

**修正前：** マイグレーション（旧データの移行処理）だけを実行していた
**修正後：** マイグレーション後に settings の存在チェックを追加し、なければデフォルト値で自動初期化する

```typescript
async function init() {
  await migrateFromLocalStorage();

  // settings が未初期化の場合はデフォルト値で初期化する（修正箇所）
  const existing = await settingsService.get();
  if (!existing) {
    await settingsService.initialize('');
  }
}
```

これでアプリを最初に開いた瞬間に settings レコードが自動で作られるようになり、どのページから使い始めてもスケジュール生成が動作するようになりました。

---

## 確認結果

- シークレットウィンドウ（DBが空の状態）でも正常にスケジュール表示を確認
- 本番環境でも同様に動作確認済み

---

## 教訓

「必ず事前に別のページで初期化が必要なデータ」は、アプリ起動時に自動で存在チェックして初期化する設計にすべきでした。ユーザーが特定のページを訪問することを前提とした設計は、使い方によっては永遠に動かない状態を生み出してしまいます。

---

*修正日: 2026-03-05*
*修正ファイル: [src/components/common/DbInitializer.tsx](../src/components/common/DbInitializer.tsx)*
