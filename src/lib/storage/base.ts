/**
 * LocalStorage の汎用ラッパークラス
 * SSR 安全性と型安全性を提供する
 *
 * @template T 格納するデータの型
 */
export class BaseStorage<T> {
  constructor(private readonly key: string) {}

  /**
   * データを取得する
   * @returns 格納されているデータ、存在しない場合は null
   */
  get(): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(this.key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[Storage] Failed to read "${this.key}":`, error);
      return null;
    }
  }

  /**
   * データを保存する
   * @param data 保存するデータ
   * @throws LocalStorage が満杯の場合にエラーをスロー
   */
  set(data: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`[Storage] Failed to write "${this.key}":`, error);
      throw new Error(`データの保存に失敗しました: ${this.key}`);
    }
  }

  /**
   * データを更新する（read-modify-write パターン）
   * @param updater 現在のデータを受け取り新しいデータを返す関数
   */
  update(updater: (data: T | null) => T): void {
    const current = this.get();
    const updated = updater(current);
    this.set(updated);
  }

  /**
   * データを削除する
   */
  delete(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(this.key);
  }

  /**
   * データが存在するか確認する
   */
  exists(): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(this.key) !== null;
  }
}
