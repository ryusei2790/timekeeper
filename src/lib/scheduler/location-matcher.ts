import type { Location } from '@/types';

/**
 * カレンダー予定の場所文字列から Location を特定する
 *
 * マッチング順:
 * 1. name の完全一致（大文字小文字無視）
 * 2. aliases の完全一致（大文字小文字無視）
 * 3. name の部分一致
 * 4. aliases の部分一致
 *
 * @param locationName カレンダー予定の場所文字列
 * @param locations 全場所一覧
 * @returns マッチした Location。見つからない場合は null
 */
export function matchLocation(locationName: string | null, locations: Location[]): Location | null {
  if (!locationName || locations.length === 0) return null;

  const normalized = locationName.toLowerCase().trim();

  // 1. name の完全一致
  const exactName = locations.find((loc) => loc.name.toLowerCase() === normalized);
  if (exactName) return exactName;

  // 2. aliases の完全一致
  const exactAlias = locations.find((loc) =>
    loc.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
  if (exactAlias) return exactAlias;

  // 3. name の部分一致
  const partialName = locations.find(
    (loc) =>
      loc.name.toLowerCase().includes(normalized) || normalized.includes(loc.name.toLowerCase())
  );
  if (partialName) return partialName;

  // 4. aliases の部分一致
  const partialAlias = locations.find((loc) =>
    loc.aliases.some(
      (alias) =>
        alias.toLowerCase().includes(normalized) || normalized.includes(alias.toLowerCase())
    )
  );
  if (partialAlias) return partialAlias;

  return null;
}
