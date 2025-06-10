
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ChartSelectorProps {
  columns: string[];
  selectedColumn: string;
  onColumnChange: (column: string) => void;
  label: string;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({
  columns,
  selectedColumn,
  onColumnChange,
  label
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <Select value={selectedColumn} onValueChange={onColumnChange}>
        <SelectTrigger className="w-48 bg-card border-border">
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChartSelector;
