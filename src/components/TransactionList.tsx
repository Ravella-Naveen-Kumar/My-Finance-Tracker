"use client"

import { useState, useMemo } from 'react';
import { Transaction } from '@/types/finance';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Calendar, DollarSign } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((transaction) => {
      const monthKey = format(transaction.date, 'yyyy-MM');
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach((transaction) => categories.add(transaction.category));
    return Array.from(categories).sort();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by month
      if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthStart = startOfMonth(new Date(year, month - 1));
        const monthEnd = endOfMonth(new Date(year, month - 1));
        
        if (!isWithinInterval(transaction.date, { start: monthStart, end: monthEnd })) {
          return false;
        }
      }

      // Filter by category
      if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [filteredTransactions]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredTransactions]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totals.income.toFixed(2)}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totals.expense.toFixed(2)}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totals.net.toFixed(2)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Transactions ({sortedTransactions.length})</h3>
        {sortedTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{transaction.description}</h4>
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(transaction.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}