'use client';

import Image from 'next/image';

/**
 * 使い方ガイドページ
 */
export default function HowPage() {
  return (
    <div className="container mt-8 ml-8 max-w-2xl space-y-8 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">使い方</h1>
        <p className="text-muted-foreground mt-1 text-sm">TimeKeeper の使用方法ガイド</p>
      </div>

      {/* セットアップ概要 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">セットアップ手順</h2>
        <p className="text-muted-foreground text-sm">
          初めて使用する際は、以下の順序で設定することを推奨します。
        </p>
        <ol className="marker:text-muted-foreground list-inside list-decimal space-y-1 text-sm">
          <li className="font-medium">場所を登録する（場所・移動ページ）</li>
          <li className="font-medium">習慣項目を登録する（パターンページ）</li>
          <li className="font-medium">パターンを作成する（パターンページ）</li>
        </ol>
      </section>

      <hr className="border-border" />

      {/* ステップ 1 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ステップ 1: 場所を登録する</h2>
        <p className="text-sm">
          ナビゲーションから「場所・移動」を開き、「<strong>場所を追加</strong>
          」ボタンをクリックして、よく使う場所（自宅、職場など）を登録します。
          場所を登録しておくと、習慣項目ごとに実行場所を設定したり、スケジュール生成時に移動時間を自動計算できます。
        </p>
        <Image
          src="/docs/images/3.png"
          alt="場所・移動時間画面"
          width={700}
          height={400}
          className="h-auto w-full rounded-lg border"
        />
        <div className="bg-muted rounded-lg p-4 text-sm">
          <strong>ポイント:</strong> 場所を 2
          つ以上登録すると、「移動ルート」タブから移動ルート（手段・所要時間）を追加できます。
        </div>
      </section>

      <hr className="border-border" />

      {/* ステップ 2 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ステップ 2: 習慣項目を登録する</h2>
        <p className="text-sm">
          ナビゲーションから「パターン」を開き、「習慣項目」セクションの「<strong>追加</strong>
          」ボタンをクリックして、毎日の習慣（朝食、運動、読書など）を登録します。
        </p>
        <Image
          src="/docs/images/1.png"
          alt="パターン管理画面"
          width={700}
          height={400}
          className="h-auto w-full rounded-lg border"
        />
        <Image
          src="/docs/images/2.png"
          alt="習慣項目を追加フォーム"
          width={400}
          height={600}
          className="mx-auto block h-auto max-w-sm rounded-lg border"
        />
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="w-32 py-2 pr-4 text-left font-medium">項目</th>
              <th className="py-2 text-left font-medium">説明</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 pr-4 font-medium">名前</td>
              <td className="text-muted-foreground py-2">習慣の名前（例: 朝食）</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">アイコン（絵文字）</td>
              <td className="text-muted-foreground py-2">表示用の絵文字（例: 🍳）</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">所要時間（分）</td>
              <td className="text-muted-foreground py-2">この習慣にかかる時間</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">場所</td>
              <td className="text-muted-foreground py-2">
                実行場所（ステップ 1 で登録した場所から選択）
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">優先度（1〜5）</td>
              <td className="text-muted-foreground py-2">スケジュール調整時の優先度</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">時間調整可能</td>
              <td className="text-muted-foreground py-2">
                オンにするとスケジュール生成時に時間を柔軟に調整できます
              </td>
            </tr>
          </tbody>
        </table>
        <div className="bg-muted rounded-lg p-4 text-sm">
          <strong>注意:</strong>{' '}
          場所の選択肢は「場所・移動」ページで登録した後に表示されます。先に場所を登録しておきましょう。
        </div>
      </section>

      <hr className="border-border" />

      {/* ステップ 3 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ステップ 3: パターンを作成する</h2>
        <p className="text-sm">
          「パターン」セクションの「<strong>追加</strong>
          」ボタンをクリックして、曜日ごとのルーティンパターンを作成します。
        </p>
        <Image
          src="/docs/images/4.png"
          alt="パターンを追加フォーム"
          width={400}
          height={600}
          className="mx-auto block h-auto max-w-sm rounded-lg border"
        />
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="w-36 py-2 pr-4 text-left font-medium">項目</th>
              <th className="py-2 text-left font-medium">説明</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 pr-4 font-medium">パターン名</td>
              <td className="text-muted-foreground py-2">パターンの名前（例: 平日パターン）</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">適用曜日</td>
              <td className="text-muted-foreground py-2">
                このパターンを適用する曜日（複数選択可）
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">キーワード</td>
              <td className="text-muted-foreground py-2">
                カレンダー予定のタイトルにこのキーワードが含まれる日に優先適用
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">優先度（1〜100）</td>
              <td className="text-muted-foreground py-2">複数パターンが一致した場合の優先順位</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">デフォルト使用</td>
              <td className="text-muted-foreground py-2">
                オンにするとどの条件にも合わない日に自動適用
              </td>
            </tr>
          </tbody>
        </table>
        <div className="bg-muted rounded-lg p-4 text-sm">
          <strong>ポイント:</strong> パターン名と適用曜日の 2
          つだけ設定すれば使い始めることができます。
        </div>
        <p className="text-sm">
          パターン作成後は「編集」から習慣項目を追加し、各項目の開始時刻を設定します。「含める習慣項目」セクションで使いたい習慣項目にチェックを入れ、右側の時刻フィールドで開始時刻を指定します。
        </p>
        <Image
          src="/docs/images/5.png"
          alt="パターン編集フォーム"
          width={700}
          height={400}
          className="h-auto w-full rounded-lg border"
        />
      </section>

      <hr className="border-border" />

      {/* カレンダー連携 */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">カレンダー連携</h2>

        {/* .ics インポート */}
        <div className="space-y-4">
          <h3 className="font-medium">.ics ファイルをインポートする</h3>
          <p className="text-sm">
            ナビゲーションから「カレンダー」を開き、「<strong>インポート</strong>
            」タブを選択します。ファイル選択エリアをクリックして{' '}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">.ics</code>{' '}
            ファイルを選択すると、カレンダーのイベントが取り込まれます。
          </p>
          <Image
            src="/docs/images/6.png"
            alt="カレンダー連携 - インポート"
            width={700}
            height={400}
            className="h-auto w-full rounded-lg border"
          />
          <div className="space-y-1 text-sm">
            <p className="font-medium">.ics ファイルの取得方法:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">TimeTree:</strong> アプリ設定 → カレンダー設定 →
                「iCal 購読」から .ics URL を開いて保存
              </li>
              <li>
                <strong className="text-foreground">Google Calendar:</strong> 設定 →
                カレンダーの設定 → 「カレンダーをエクスポート」
              </li>
              <li>
                <strong className="text-foreground">Apple Calendar:</strong> ファイル → 書き出し →
                カレンダーを書き出し
              </li>
            </ul>
          </div>
        </div>

        {/* Google Calendar 同期 */}
        <div className="space-y-4">
          <h3 className="font-medium">Google Calendar と同期する</h3>
          <p className="text-sm">
            「<strong>Google Calendar</strong>」タブでは、iCal URL
            を登録することで直接同期できます。「<strong>今すぐ同期</strong>
            」ボタンをクリックすると最新のイベントを取得できます。
          </p>
          <Image
            src="/docs/images/7.png"
            alt="Google Calendar タブ"
            width={700}
            height={400}
            className="h-auto w-full rounded-lg border"
          />
          <div className="space-y-1 text-sm">
            <p className="font-medium">iCal URL の取得方法:</p>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1">
              <li>Google Calendar を開き、右上の歯車アイコン → 「設定」</li>
              <li>左側のカレンダー一覧から対象のカレンダーをクリック</li>
              <li>「カレンダーの統合」セクションの「iCal 形式の限定公開 URL」をコピー</li>
              <li>設定ページの「Google Calendar 連携」に貼り付けて保存</li>
            </ol>
          </div>
          <Image
            src="/docs/images/9.png"
            alt="設定 - Google Calendar 連携"
            width={700}
            height={400}
            className="h-auto w-full rounded-lg border"
          />
          <div className="bg-muted rounded-lg p-4 text-sm">
            iCal URL の登録は「<strong>設定</strong>」ページの「Google Calendar
            連携」セクションからも行えます。
          </div>
        </div>
      </section>

      <hr className="border-border" />

      {/* アカウントとデータ管理 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">アカウントとデータ管理</h2>

        <h3 className="font-medium">ログインとクロスデバイス同期</h3>
        <p className="text-sm">
          未ログイン状態ではデータはこのデバイスのブラウザにのみ保存されます。「
          <strong>ログイン</strong>
          」ボタンからメールアドレスでサインインすると、複数デバイス間でデータを同期できます（Magic
          Link 認証）。
        </p>
        <Image
          src="/docs/images/8.png"
          alt="設定 - アカウント"
          width={700}
          height={200}
          className="h-auto w-full rounded-lg border"
        />

        <h3 className="mt-4 font-medium">データのエクスポート・インポート</h3>
        <p className="text-sm">
          設定ページの「<strong>データ管理</strong>
          」セクションでデータのバックアップと復元ができます。
        </p>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>
            <strong className="text-foreground">データをエクスポート:</strong> すべてのデータを JSON
            形式でダウンロード
          </li>
          <li>
            <strong className="text-foreground">データをインポート:</strong> エクスポートした JSON
            ファイルを読み込んでデータを復元
          </li>
          <li>
            <strong className="text-foreground">すべてのデータを削除:</strong>{' '}
            パターン・場所・習慣項目などすべてのデータを削除（確認ダイアログあり）
          </li>
        </ul>
      </section>

      <hr className="border-border" />

      {/* ホーム画面 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ホーム画面の使い方</h2>
        <p className="text-sm">設定が完了したら、ナビゲーションの「ホーム」を開きます。</p>
        <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
          <li>上部のドロップダウンから今日適用したいパターンを選択します</li>
          <li>
            「<strong className="text-foreground">再生成</strong>
            」ボタンをクリックすると、選択パターンとカレンダーのイベントを組み合わせてスケジュールを自動生成します
          </li>
          <li>
            <strong className="text-foreground">現在のイベントカード</strong>
            には実行中のイベントが表示され、「完了」または「スキップ」で進捗を記録できます
          </li>
          <li>
            <strong className="text-foreground">次のイベントカード</strong>
            には次に実行するイベントが表示されます
          </li>
          <li>
            <strong className="text-foreground">今日のスケジュール</strong>
            タイムラインで1日の流れを一覧確認できます
          </li>
        </ul>
      </section>
    </div>
  );
}
