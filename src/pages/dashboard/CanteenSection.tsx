import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { CanteenMenuItem } from './dashboardTypes';
import { CanteenCreateWizard, type CanteenCreatePayload } from './CanteenCreateWizard';

const MEAL_TYPE_OPTIONS: CanteenMenuItem['mealType'][] = ['Déjeuner', 'Dîner', 'Goûter'];

function getItemsForCell(
  items: CanteenMenuItem[],
  day: string,
  mealType: CanteenMenuItem['mealType'],
) {
  return items.filter((i) => i.day === day && i.mealType === mealType);
}

type CanteenSectionProps = {
  items: CanteenMenuItem[];
  onCreateItem: (payload: CanteenCreatePayload) => Promise<void>;
  dayOptions: string[];
  readOnly?: boolean;
};

export const CanteenSection: React.FC<CanteenSectionProps> = ({
  items,
  onCreateItem,
  dayOptions,
  readOnly = false,
}) => {
  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
        {!readOnly && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Ajouter un plat au menu</CardTitle>
            <CardDescription className='text-xs'>
              Parcours guidé en 2 étapes — plat puis validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CanteenCreateWizard dayOptions={dayOptions} onSubmit={onCreateItem} />
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              {readOnly ? 'Menu de la cantine' : 'Résumé des menus'}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-xs text-muted-foreground'>
            <p>
              Plats enregistrés :{' '}
              <span className='font-medium text-foreground'>{items.length}</span>
            </p>
            <p>
              Jours couverts :{' '}
              <span className='font-medium text-foreground'>
                {Array.from(new Set(items.map((i) => i.day))).join(', ') ||
                  'Aucun'}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Menus de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-xs'>
          {items.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun plat enregistré. Ajoutez des plats ci-dessus.
            </p>
          ) : (
            <>
              {/* Vue mobile : listes par jour */}
              <div className='md:hidden space-y-3'>
                {dayOptions.map((day) => {
                  const dayItems = items.filter((i) => i.day === day);
                  if (dayItems.length === 0) return null;
                  return (
                    <div key={day} className='dashboard-entity-card'>
                      <p className='text-xs font-semibold text-foreground mb-1.5'>
                        {day}
                      </p>
                      {MEAL_TYPE_OPTIONS.map((mealType) => {
                        const cellItems = dayItems.filter((i) => i.mealType === mealType);
                        if (cellItems.length === 0) return null;
                        return (
                          <div key={mealType} className='mb-1.5 last:mb-0'>
                            <p className='text-xs text-muted-foreground'>{mealType}</p>
                            {cellItems.map((item) => (
                              <p key={item.id} className='text-xs font-medium text-foreground'>
                                {item.dish}
                                {item.note ? ` · ${item.note}` : ''}
                              </p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Vue desktop : tableau jour × repas (comme l'emploi du temps) */}
              <div className='hidden md:block dashboard-table-wrap'>
                <table>
                  <thead className='bg-muted/60'>
                    <tr>
                      <th className='min-w-[90px] border-b border-border/80 px-2 py-1.5 text-left font-medium text-muted-foreground'>
                        Repas
                      </th>
                      {dayOptions.map((day) => (
                        <th
                          key={day}
                          className='min-w-[120px] border-b border-l border-border/80 px-2 py-1.5 text-left font-medium text-muted-foreground'
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEAL_TYPE_OPTIONS.map((mealType) => (
                      <tr key={mealType} className='odd:bg-background'>
                        <td className='border-t border-border/60 px-2 py-1.5 font-medium text-foreground'>
                          {mealType}
                        </td>
                        {dayOptions.map((day) => {
                          const cellItems = getItemsForCell(items, day, mealType);
                          return (
                            <td
                              key={day}
                              className='border-t border-l border-border/60 px-2 py-1.5 align-top'
                            >
                              {cellItems.length > 0 ? (
                                <div className='space-y-0.5'>
                                  {cellItems.map((item) => (
                                    <div key={item.id}>
                                      <p className='font-medium text-foreground'>
                                        {item.dish}
                                      </p>
                                      {item.note && (
                                        <p className='text-xs text-muted-foreground'>
                                          {item.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className='text-xs text-muted-foreground'>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
