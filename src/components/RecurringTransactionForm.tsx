"use client"

import { useState } from 'react';
import { RecurringTransaction, TransactionType, RecurrenceFrequency, expenseCategories, incomeCategories } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface RecurringTransactionFormProps {
  onAddRecurring: (data: Omit<RecurringTransaction, 'id' | 'lastGenerated'>) => void;
}

export function RecurringTransactionForm({ onAddRecurring }: RecurringTransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      return;
    }

    onAddRecurring({
      type,
      amount: parseFloat(amount),
      category,
      description,
      frequency,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
      isActive: true
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setFrequency('monthly');
    setStartDate(new Date());
    setHasEndDate(false);
    setEndDate(undefined);
  };

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div className="space-y-2">
        <Label>Transaction Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g., Monthly Salary"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Repeat Frequency</Label>
        <Select value={frequency} onValueChange={(value) => setFrequency(value as RecurrenceFrequency)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date (Optional) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasEndDate"
            checked={hasEndDate}
            onChange={(e) => setHasEndDate(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="hasEndDate" className="cursor-pointer">
            Set end date (optional)
          </Label>
        </div>
        {hasEndDate && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date < startDate}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <Button type="submit" className="w-full">
        Create Recurring Transaction
      </Button>
    </form>
  );
}
