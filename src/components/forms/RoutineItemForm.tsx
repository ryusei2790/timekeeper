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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreateRoutineItemSchema, type RoutineItemFormValues } from '@/lib/validations/schemas';
import type { Location, RoutineItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface RoutineItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 編集時に渡す既存データ（undefined の場合は新規作成） */
  defaultValues?: RoutineItem;
  locations: Location[];
  onSubmit: (data: RoutineItemFormValues) => void;
  onDelete?: () => void;
}

/**
 * 習慣項目の作成・編集ダイアログ
 */
export function RoutineItemForm({
  open,
  onOpenChange,
  defaultValues,
  locations,
  onSubmit,
  onDelete,
}: RoutineItemFormProps) {
  const isEditing = !!defaultValues;

  const form = useForm<RoutineItemFormValues>({
    resolver: zodResolver(CreateRoutineItemSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          startTime: defaultValues.startTime,
          duration: defaultValues.duration,
          locationId: defaultValues.locationId,
          icon: defaultValues.icon ?? '',
          isFlexible: defaultValues.isFlexible,
          priority: defaultValues.priority,
        }
      : {
          name: '',
          startTime: '07:00',
          duration: 30,
          locationId: null,
          icon: '',
          isFlexible: true,
          priority: 3,
        },
  });

  function handleSubmit(data: RoutineItemFormValues) {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '習慣項目を編集' : '習慣項目を追加'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 名前 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名前</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 朝食" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* アイコン */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>アイコン（絵文字）</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 🍽️" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* 開始時刻 */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開始時刻</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 所要時間 */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所要時間（分）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 場所 */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>場所</FormLabel>
                  <Select
                    value={field.value ?? 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="現在地のまま" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">現在地のまま</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* 優先度 */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>優先度（1〜5）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 時間調整可能 */}
              <FormField
                control={form.control}
                name="isFlexible"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>時間調整可能</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
