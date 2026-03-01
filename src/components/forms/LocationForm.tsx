'use client';

import { Button } from '@/components/ui/button';
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
import { CreateLocationSchema, type LocationFormValues } from '@/lib/validations/schemas';
import type { Location } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 編集時に渡す既存データ（undefined の場合は新規作成） */
  defaultValues?: Location;
  onSubmit: (data: LocationFormValues) => void;
  onDelete?: () => void;
}

/**
 * 場所の作成・編集ダイアログ
 */
export function LocationForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  onDelete,
}: LocationFormProps) {
  const isEditing = !!defaultValues;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(CreateLocationSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          aliases: defaultValues.aliases,
          address: defaultValues.address ?? '',
        }
      : {
          name: '',
          aliases: [],
          address: '',
        },
  });

  function handleSubmit(data: LocationFormValues) {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  }

  /** エイリアス文字列（カンマ区切り）→ 配列 */
  const aliasesValue = form.watch('aliases');
  const aliasesString = aliasesValue.join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '場所を編集' : '場所を追加'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 場所名 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>場所名</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 自宅, 会社" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 別名 */}
            <FormItem>
              <FormLabel>別名（カンマ区切り）</FormLabel>
              <FormControl>
                <Input
                  placeholder="例: 家, ホーム"
                  value={aliasesString}
                  onChange={(e) => {
                    const aliases = e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean);
                    form.setValue('aliases', aliases);
                  }}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                カレンダー予定の場所名マッチングに使用されます
              </p>
            </FormItem>

            {/* 住所 */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>住所（任意）</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 東京都渋谷区..." {...field} value={field.value ?? ''} />
                  </FormControl>
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
