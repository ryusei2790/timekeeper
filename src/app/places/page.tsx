'use client';

import { LocationForm } from '@/components/forms/LocationForm';
import { TravelRouteForm } from '@/components/forms/TravelRouteForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TRAVEL_METHOD_ICONS, TRAVEL_METHOD_LABELS } from '@/constants';
import { useLocationStore } from '@/store/useLocationStore';
import { useTravelRouteStore } from '@/store/useTravelRouteStore';
import type { Location, TravelRoute } from '@/types';
import { MapPin, Pencil, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PlacesPage() {
  const {
    locations,
    isLoading: locLoading,
    loadLocations,
    addLocation,
    updateLocation,
    deleteLocation,
  } = useLocationStore();
  const {
    travelRoutes,
    isLoading: routeLoading,
    loadTravelRoutes,
    addTravelRoute,
    updateTravelRoute,
    deleteTravelRoute,
  } = useTravelRouteStore();

  // 場所フォーム用 state
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined);

  // 移動ルートフォーム用 state
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TravelRoute | undefined>(undefined);

  useEffect(() => {
    loadLocations();
    loadTravelRoutes();
  }, [loadLocations, loadTravelRoutes]);

  // ---- 場所操作 ----

  function handleLocationSubmit(data: Parameters<typeof addLocation>[0]) {
    if (editingLocation) {
      updateLocation(editingLocation.id, data);
      toast.success('場所を更新しました');
    } else {
      addLocation(data);
      toast.success('場所を追加しました');
    }
    setEditingLocation(undefined);
  }

  function handleLocationDelete() {
    if (!editingLocation) return;
    deleteLocation(editingLocation.id);
    setEditingLocation(undefined);
    toast.success('場所を削除しました');
  }

  function openLocationEdit(loc: Location) {
    setEditingLocation(loc);
    setLocationFormOpen(true);
  }

  function openLocationCreate() {
    setEditingLocation(undefined);
    setLocationFormOpen(true);
  }

  // ---- 移動ルート操作 ----

  function handleRouteSubmit(data: Parameters<typeof addTravelRoute>[0]) {
    if (editingRoute) {
      updateTravelRoute(editingRoute.id, data);
      toast.success('移動ルートを更新しました');
    } else {
      addTravelRoute(data);
      toast.success('移動ルートを追加しました');
    }
    setEditingRoute(undefined);
  }

  function handleRouteDelete() {
    if (!editingRoute) return;
    deleteTravelRoute(editingRoute.id);
    setEditingRoute(undefined);
    toast.success('移動ルートを削除しました');
  }

  function openRouteEdit(route: TravelRoute) {
    setEditingRoute(route);
    setRouteFormOpen(true);
  }

  function openRouteCreate() {
    setEditingRoute(undefined);
    setRouteFormOpen(true);
  }

  /** 場所 ID から名前を取得するヘルパー */
  function locationName(id: string): string {
    return locations.find((l) => l.id === id)?.name ?? id;
  }

  return (
    <div className="container mt-8 ml-8 max-w-2xl space-y-6 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">場所・移動時間</h1>
        <p className="text-muted-foreground mt-1 text-sm">よく使う場所と移動ルートを管理します</p>
      </div>

      <Tabs defaultValue="locations">
        <TabsList className="w-full">
          <TabsTrigger value="locations" className="flex-1">
            場所
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex-1">
            移動ルート
          </TabsTrigger>
        </TabsList>

        {/* -------- 場所タブ -------- */}
        <TabsContent value="locations" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openLocationCreate}>
              <Plus className="mr-1 h-4 w-4" />
              場所を追加
            </Button>
          </div>

          {locLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center text-sm">
                場所が登録されていません。「場所を追加」から登録してください。
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {locations.map((loc) => (
                <Card key={loc.id} className="group">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <MapPin className="text-muted-foreground h-5 w-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{loc.name}</p>
                      {loc.aliases.length > 0 && (
                        <p className="text-muted-foreground truncate text-xs">
                          別名: {loc.aliases.join(', ')}
                        </p>
                      )}
                      {loc.address && (
                        <p className="text-muted-foreground truncate text-xs">{loc.address}</p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => openLocationEdit(loc)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* -------- 移動ルートタブ -------- */}
        <TabsContent value="routes" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openRouteCreate} disabled={locations.length < 2}>
              <Plus className="mr-1 h-4 w-4" />
              ルートを追加
            </Button>
          </div>
          {locations.length < 2 && (
            <p className="text-muted-foreground text-center text-xs">
              移動ルートを追加するには、先に場所を2つ以上登録してください。
            </p>
          )}

          {routeLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : travelRoutes.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center text-sm">
                移動ルートが登録されていません。「ルートを追加」から登録してください。
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {travelRoutes.map((route) => (
                <Card key={route.id} className="group">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <span className="w-8 text-center text-2xl">
                      {TRAVEL_METHOD_ICONS[route.method]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {locationName(route.fromLocationId)} → {locationName(route.toLocationId)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {TRAVEL_METHOD_LABELS[route.method]} / {route.duration}分
                        {route.isDefault && (
                          <Star className="ml-1 inline h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => openRouteEdit(route)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ダイアログ */}
      <LocationForm
        open={locationFormOpen}
        onOpenChange={setLocationFormOpen}
        defaultValues={editingLocation}
        onSubmit={handleLocationSubmit}
        onDelete={editingLocation ? handleLocationDelete : undefined}
      />

      <TravelRouteForm
        open={routeFormOpen}
        onOpenChange={setRouteFormOpen}
        defaultValues={editingRoute}
        locations={locations}
        onSubmit={handleRouteSubmit}
        onDelete={editingRoute ? handleRouteDelete : undefined}
      />
    </div>
  );
}
