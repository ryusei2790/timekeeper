'use client';

import { PatternForm } from '@/components/forms/PatternForm';
import { RoutineItemForm } from '@/components/forms/RoutineItemForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationStore } from '@/store/useLocationStore';
import { usePatternStore } from '@/store/usePatternStore';
import { useRoutineStore } from '@/store/useRoutineStore';
import type { LifePattern, RoutineItem } from '@/types';
import { Pencil, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** 曜日番号の配列を読みやすい文字列に変換する */
function formatDayOfWeek(days: number[]): string {
  if (days.length === 0) return 'なし';
  if (days.length === 7) return '毎日';
  if (JSON.stringify(days.sort()) === JSON.stringify([1, 2, 3, 4, 5])) return '平日';
  if (JSON.stringify(days.sort()) === JSON.stringify([0, 6])) return '週末';
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join('・');
}

export default function PatternsPage() {
  const {
    patterns,
    isLoading: pLoading,
    loadPatterns,
    addPattern,
    updatePattern,
    deletePattern,
  } = usePatternStore();
  const {
    routineItems,
    isLoading: rLoading,
    loadRoutineItems,
    addRoutineItem,
    updateRoutineItem,
    deleteRoutineItem,
  } = useRoutineStore();
  const { locations, loadLocations } = useLocationStore();

  // パターンフォーム用の state
  const [patternFormOpen, setPatternFormOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<LifePattern | undefined>(undefined);

  // 習慣項目フォーム用の state
  const [routineFormOpen, setRoutineFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | undefined>(undefined);

  useEffect(() => {
    loadPatterns();
    loadRoutineItems();
    loadLocations();
  }, [loadPatterns, loadRoutineItems, loadLocations]);

  // ---- パターン操作 ----

  function handlePatternSubmit(data: Parameters<typeof addPattern>[0]) {
    if (editingPattern) {
      updatePattern(editingPattern.id, data);
      toast.success('パターンを更新しました');
    } else {
      addPattern(data);
      toast.success('パターンを追加しました');
    }
    setEditingPattern(undefined);
  }

  function handlePatternDelete() {
    if (!editingPattern) return;
    deletePattern(editingPattern.id);
    setEditingPattern(undefined);
    toast.success('パターンを削除しました');
  }

  function openPatternEdit(pattern: LifePattern) {
    setEditingPattern(pattern);
    setPatternFormOpen(true);
  }

  function openPatternCreate() {
    setEditingPattern(undefined);
    setPatternFormOpen(true);
  }

  // ---- 習慣項目操作 ----

  function handleRoutineSubmit(data: Parameters<typeof addRoutineItem>[0]) {
    if (editingRoutine) {
      updateRoutineItem(editingRoutine.id, data);
      toast.success('習慣項目を更新しました');
    } else {
      addRoutineItem(data);
      toast.success('習慣項目を追加しました');
    }
    setEditingRoutine(undefined);
  }

  function handleRoutineDelete() {
    if (!editingRoutine) return;
    deleteRoutineItem(editingRoutine.id);
    setEditingRoutine(undefined);
    toast.success('習慣項目を削除しました');
  }

  function openRoutineEdit(item: RoutineItem) {
    setEditingRoutine(item);
    setRoutineFormOpen(true);
  }

  function openRoutineCreate() {
    setEditingRoutine(undefined);
    setRoutineFormOpen(true);
  }

  const isLoading = pLoading || rLoading;

  return (
    <div className="container mt-8 ml-8 max-w-2xl space-y-8 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">パターン管理</h1>
        <p className="text-muted-foreground mt-1 text-sm">生活習慣パターンと習慣項目を管理します</p>
      </div>

      {/* -------- 習慣項目セクション -------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">習慣項目</h2>
          <Button size="sm" onClick={openRoutineCreate}>
            <Plus className="mr-1 h-4 w-4" />
            追加
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : routineItems.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              習慣項目がありません。「追加」ボタンから登録してください。
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {routineItems.map((item) => (
              <Card key={item.id} className="group">
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 text-center text-2xl">{item.icon ?? '📋'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.duration}分{item.isFlexible ? '' : ' · 固定'}
                      &nbsp;· 優先度 {item.priority}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => openRoutineEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* -------- パターンセクション -------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">パターン</h2>
          <Button size="sm" onClick={openPatternCreate}>
            <Plus className="mr-1 h-4 w-4" />
            追加
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : patterns.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              パターンがありません。「追加」ボタンから登録してください。
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {patterns.map((pattern) => {
              const includedIds = new Set(pattern.patternItems.map((pi) => pi.routineItemId));
              const included = routineItems.filter((r) => includedIds.has(r.id));
              return (
                <Card key={pattern.id} className="group">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <div className="space-y-0.5">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {pattern.name}
                        {pattern.rules.isDefault && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {formatDayOfWeek(pattern.rules.dayOfWeek)}
                        {pattern.rules.keywords.length > 0 &&
                          ` · キーワード: ${pattern.rules.keywords.join(', ')}`}
                      </CardDescription>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => openPatternEdit(pattern)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {included.length === 0 ? (
                      <p className="text-muted-foreground text-xs">習慣項目なし</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {included.map((item) => {
                          const pi = pattern.patternItems.find((p) => p.routineItemId === item.id);
                          return (
                            <Badge key={item.id} variant="secondary" className="text-xs">
                              {item.icon && <span className="mr-1">{item.icon}</span>}
                              {item.name}
                              {pi && (
                                <span className="text-muted-foreground ml-1">{pi.startTime}</span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ダイアログ */}
      <PatternForm
        open={patternFormOpen}
        onOpenChange={setPatternFormOpen}
        defaultValues={editingPattern}
        routineItems={routineItems}
        onSubmit={handlePatternSubmit}
        onDelete={editingPattern ? handlePatternDelete : undefined}
      />

      <RoutineItemForm
        open={routineFormOpen}
        onOpenChange={setRoutineFormOpen}
        defaultValues={editingRoutine}
        locations={locations}
        onSubmit={handleRoutineSubmit}
        onDelete={editingRoutine ? handleRoutineDelete : undefined}
      />
    </div>
  );
}
