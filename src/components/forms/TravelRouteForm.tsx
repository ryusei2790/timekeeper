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
import { TRAVEL_METHOD_ICONS, TRAVEL_METHOD_LABELS } from '@/constants';
import { CreateTravelRouteSchema, type TravelRouteFormValues } from '@/lib/validations/schemas';
import type { Location, TravelMethod, TravelRoute } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const TRAVEL_METHODS: TravelMethod[] = ['walk', 'car', 'train', 'bus', 'bike', 'other'];

interface TravelRouteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 編集時に渡す既存データ（undefined の場合は新規作成） */
  defaultValues?: TravelRoute;
  locations: Location[];
  onSubmit: (data: TravelRouteFormValues) => void;
  onDelete?: () => void;
}

/**
 * 移動ルートの作成・編集ダイアログ
 */
export function TravelRouteForm({
  open,
  onOpenChange,
  defaultValues,
  locations,
  onSubmit,
  onDelete,
}: TravelRouteFormProps) {
  const isEditing = !!defaultValues;

  const form = useForm<TravelRouteFormValues>({
    resolver: zodResolver(CreateTravelRouteSchema),
    defaultValues: defaultValues
      ? {
          fromLocationId: defaultValues.fromLocationId,
          toLocationId: defaultValues.toLocationId,
          method: defaultValues.method,
          duration: defaultValues.duration,
          isDefault: defaultValues.isDefault,
        }
      : {
          fromLocationId: locations[0]?.id ?? '',
          toLocationId: locations[1]?.id ?? '',
          method: 'walk',
          duration: 10,
          isDefault: false,
        },
  });

  function handleSubmit(data: TravelRouteFormValues) {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '移動ルートを編集' : '移動ルートを追加'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 出発地 */}
            <FormField
              control={form.control}
              name="fromLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>出発地</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="出発地を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* 目的地 */}
            <FormField
              control={form.control}
              name="toLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目的地</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="目的地を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
              {/* 移動手段 */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>移動手段</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRAVEL_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {TRAVEL_METHOD_ICONS[method]} {TRAVEL_METHOD_LABELS[method]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            {/* デフォルト */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>デフォルトルート</FormLabel>
                    <p className="text-muted-foreground text-xs">
                      同区間に複数ルートがある場合に優先使用されます
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
