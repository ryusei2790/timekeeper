/**
 * ホーム画面（Phase 4 でタイムラインに置き換え）
 * 現在は Phase 1 完了確認用の最小実装
 */
export default function HomePage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">TimeKeeper</h1>
      <p className="text-muted-foreground mt-2">
        生活習慣とカレンダーを統合して最適なスケジュールを自動生成するアプリ
      </p>
    </main>
  );
}
