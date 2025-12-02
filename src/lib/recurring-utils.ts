import { RecurringTransaction, Transaction } from '@/types/finance';
import { addDays, addWeeks, addMonths, addYears, isAfter, isBefore, startOfDay } from 'date-fns';

export function getNextOccurrence(recurring: RecurringTransaction, fromDate: Date): Date {
  const start = startOfDay(fromDate);
  
  switch (recurring.frequency) {
    case 'daily':
      return addDays(start, 1);
    case 'weekly':
      return addWeeks(start, 1);
    case 'monthly':
      return addMonths(start, 1);
    case 'yearly':
      return addYears(start, 1);
    default:
      return start;
  }
}

export function generateDueTransactions(
  recurringTransactions: RecurringTransaction[],
  existingTransactions: Transaction[]
): { transactions: Transaction[], updatedRecurring: RecurringTransaction[] } {
  const now = startOfDay(new Date());
  const newTransactions: Transaction[] = [];
  const updatedRecurring: RecurringTransaction[] = [];

  recurringTransactions.forEach((recurring) => {
    // Skip if not active
    if (!recurring.isActive) {
      updatedRecurring.push(recurring);
      return;
    }

    // Skip if end date has passed
    if (recurring.endDate && isAfter(now, startOfDay(new Date(recurring.endDate)))) {
      updatedRecurring.push(recurring);
      return;
    }

    // Determine the date to check from
    const checkFromDate = recurring.lastGenerated 
      ? startOfDay(new Date(recurring.lastGenerated))
      : startOfDay(new Date(recurring.startDate));

    // Check if we need to generate a new transaction
    let nextDue = checkFromDate;
    let shouldGenerate = false;
    let updatedLastGenerated = recurring.lastGenerated;

    // Keep generating until we're caught up to today
    while (true) {
      nextDue = getNextOccurrence({ ...recurring, startDate: nextDue }, nextDue);
      
      // If next occurrence is in the future, stop
      if (isAfter(nextDue, now)) {
        break;
      }

      // If next occurrence is before start date, skip
      if (isBefore(nextDue, startOfDay(new Date(recurring.startDate)))) {
        continue;
      }

      // If end date exists and next occurrence is after it, stop
      if (recurring.endDate && isAfter(nextDue, startOfDay(new Date(recurring.endDate)))) {
        break;
      }

      // Check if transaction already exists for this date
      const alreadyExists = existingTransactions.some(
        (t) => t.recurringId === recurring.id && 
        startOfDay(new Date(t.date)).getTime() === nextDue.getTime()
      );

      if (!alreadyExists) {
        // Generate new transaction
        newTransactions.push({
          id: `${recurring.id}-${nextDue.getTime()}`,
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category,
          description: `${recurring.description} (Auto)`,
          date: nextDue,
          recurringId: recurring.id
        });
        shouldGenerate = true;
      }

      updatedLastGenerated = nextDue;
    }

    // Update recurring transaction with new lastGenerated date
    updatedRecurring.push({
      ...recurring,
      lastGenerated: shouldGenerate ? updatedLastGenerated : recurring.lastGenerated
    });
  });

  return { transactions: newTransactions, updatedRecurring };
}
