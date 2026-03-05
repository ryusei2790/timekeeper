'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreateLifePatternSchema, type LifePatternFormValues } from '@/lib/validations/schemas';
import type { LifePattern, PatternRoutineItem, RoutineItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

interface PatternFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 編集時に渡す既存データ（undefined の場合は新規作成） */
  defaultValues?: LifePattern;
  routineItems: RoutineItem[];
  onSubmit: (data: LifePatternFormValues) => void;
  onDelete?: () => void;
}

/**
 * 生活習慣パターンの作成・編集ダイアログ
 */
export function PatternForm({
  open,
  onOpenChange,
  defaultValues,
  routineItems,
  onSubmit,
  onDelete,
}: PatternFormProps) {
  const isEditing = !!defaultValues;

  const form = useForm<LifePatternFormValues>({
    resolver: zodResolver(CreateLifePatternSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          rules: {
            dayOfWeek: defaultValues.rules.dayOfWeek,
            keywords: defaultValues.rules.keywords,
            isDefault: defaultValues.rules.isDefault,
            priority: defaultValues.rules.priority,
          },
          patternItems: defaultValues.patternItems,
        }
      : {
          name: '',
          rules: {
            dayOfWeek: [],
            keywords: [],
            isDefault: false,
            priority: 10,
          },
          patternItems: [],
        },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        defaultValues
          ? {
              name: defaultValues.name,
              rules: {
                dayOfWeek: defaultValues.rules.dayOfWeek,
                keywords: defaultValues.rules.keywords,
                isDefault: defaultValues.rules.isDefault,
                priority: defaultValues.rules.priority,
              },
              patternItems: defaultValues.patternItems,
            }
          : {
              name: '',
              rules: {
                dayOfWeek: [],
                keywords: [],
                isDefault: false,
                priority: 10,
              },
              patternItems: [],
            }
      );
    }
  }, [open, defaultValues]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(data: LifePatternFormValues) {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  }

  /** キーワード文字列（カンマ区切り）→ 配列 */
  const keywordsValue = form.watch('rules.keywords');
  const keywordsString = keywordsValue.join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'パターンを編集' : 'パターンを追加'}</DialogTitle>
          <DialogDescription>
            生活習慣パターンを作成・編集します。適用曜日や含める習慣項目を設定できます。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* パターン名 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パターン名</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 平日パターン" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 適用曜日 */}
            <FormField
              control={form.control}
              name="rules.dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>適用曜日</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map((label, index) => (
                      <label
                        key={index}
                        className="flex cursor-pointer items-center gap-1 select-none"
                      >
                        <Checkbox
                          checked={field.value.includes(index)}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...field.value, index]
                              : field.value.filter((d) => d !== index);
                            field.onChange(next.sort((a, b) => a - b));
                          }}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* キーワード */}
            <FormItem>
              <FormLabel>キーワード（カンマ区切り）</FormLabel>
              <FormControl>
                <Input
                  placeholder="例: 出張, 外出"
                  value={keywordsString}
                  onChange={(e) => {
                    const keywords = e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean);
                    form.setValue('rules.keywords', keywords);
                  }}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                カレンダー予定のタイトルにこのキーワードが含まれている日に優先適用されます
              </p>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              {/* 優先度 */}
              <FormField
                control={form.control}
                name="rules.priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>優先度（1〜100）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* デフォルト */}
              <FormField
                control={form.control}
                name="rules.isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>デフォルト使用</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 含める習慣項目 */}
            <FormField
              control={form.control}
              name="patternItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>含める習慣項目</FormLabel>
                  {routineItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      習慣項目がありません。先に習慣項目を追加してください。
                    </p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                      {routineItems.map((item) => {
                        const patternItem = (field.value as PatternRoutineItem[]).find(
                          (pi) => pi.routineItemId === item.id
                        );
                        const isChecked = !!patternItem;
                        return (
                          <div key={item.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...(field.value as PatternRoutineItem[]),
                                    { routineItemId: item.id, startTime: '07:00' },
                                  ]);
                                } else {
                                  field.onChange(
                                    (field.value as PatternRoutineItem[]).filter(
                                      (pi) => pi.routineItemId !== item.id
                                    )
                                  );
                                }
                              }}
                            />
                            <span className="flex-1 text-sm">
                              {item.icon && <span className="mr-1">{item.icon}</span>}
                              {item.name}
                              <span className="text-muted-foreground ml-1 text-xs">
                                {item.duration}分
                              </span>
                            </span>
                            {isChecked && (
                              <Input
                                type="time"
                                className="h-7 w-24 text-xs"
                                value={patternItem.startTime}
                                onChange={(e) => {
                                  field.onChange(
                                    (field.value as PatternRoutineItem[]).map((pi) =>
                                      pi.routineItemId === item.id
                                        ? { ...pi, startTime: e.target.value }
                                        : pi
                                    )
                                  );
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => {
                    onDelete();
                    onOpenChange(false);
                  }}
                >
                  削除
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
