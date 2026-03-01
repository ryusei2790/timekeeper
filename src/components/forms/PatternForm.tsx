'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
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
import type { LifePattern, RoutineItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
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
          routineItemIds: defaultValues.routineItemIds,
        }
      : {
          name: '',
          rules: {
            dayOfWeek: [],
            keywords: [],
            isDefault: false,
            priority: 10,
          },
          routineItemIds: [],
        },
  });

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
              name="routineItemIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>含める習慣項目</FormLabel>
                  {routineItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      習慣項目がありません。先に習慣項目を追加してください。
                    </p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                      {routineItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-center gap-2 select-none"
                        >
                          <Checkbox
                            checked={field.value.includes(item.id)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...field.value, item.id]
                                : field.value.filter((id) => id !== item.id);
                              field.onChange(next);
                            }}
                          />
                          <span className="text-sm">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.name}
                          </span>
                          <span className="text-muted-foreground ml-auto text-xs">
                            {item.startTime} / {item.duration}分
                          </span>
                        </label>
                      ))}
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
