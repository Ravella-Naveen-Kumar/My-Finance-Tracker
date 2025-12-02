"use client"

import { RecurringTransaction } from '@/types/finance';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface RecurringTransactionManagerProps {
  recurringTransactions: RecurringTransaction[];
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function RecurringTransactionManager({
  recurringTransactions,
  onDeleteRecurring,
  onToggleActive
}: RecurringTransactionManagerProps) {
  
  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Recurring Transactions</h2>
        <p className="text-muted-foreground">
          Manage your recurring income and expenses. Transactions will be automatically created based on the schedule.
        </p>
      </div>

      {recurringTransactions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No recurring transactions yet. Create one to automatically track regular income or expenses.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurringTransactions.map((recurring) => (
            <Card key={recurring.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Header with Type Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={recurring.type === 'income' ? 'default' : 'destructive'}
                      className={recurring.type === 'income' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {recurring.type === 'income' ? 'Income' : 'Expense'}
                    </Badge>
                    <Badge variant="outline">{recurring.category}</Badge>
                    <Badge variant="secondary">{getFrequencyLabel(recurring.frequency)}</Badge>
                    {!recurring.isActive && (
                      <Badge variant="outline" className="bg-muted">Paused</Badge>
                    )}
                  </div>

                  {/* Amount and Description */}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {recurring.description}
                    </h3>
                    <p className={`text-2xl font-bold ${
                      recurring.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      ${recurring.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Schedule Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Starts:</span> {format(new Date(recurring.startDate), 'MMM d, yyyy')}
                    </p>
                    {recurring.endDate && (
                      <p>
                        <span className="font-medium">Ends:</span> {format(new Date(recurring.endDate), 'MMM d, yyyy')}
                      </p>
                    )}
                    {recurring.lastGenerated && (
                      <p>
                        <span className="font-medium">Last generated:</span> {format(new Date(recurring.lastGenerated), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(recurring.id)}
                    className="gap-2"
                  >
                    {recurring.isActive ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteRecurring(recurring.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
