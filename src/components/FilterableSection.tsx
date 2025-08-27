
import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FilterableSection<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  searchFields: string[];
  filterOptions?: {
    key: string;
    label: string;
    values: { label: string; value: any }[];
  }[];
  title: string;
  emptyMessage: string;
  className?: string;
}

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export function FilterableSection<T>({
  data,
  renderItem,
  searchFields,
  filterOptions = [],
  title,
  emptyMessage,
  className = ""
}: FilterableSection<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        })
      );
    }

    // Apply additional filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const itemValue = getNestedValue(item, key);
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, activeFilters, searchFields]);

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Search and Filter Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {(searchTerm || activeFilterCount > 0) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        {showFilters && filterOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                <Select
                  value={activeFilters[filter.key] || 'all'}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filter.values.map((option) => (
                      <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm || activeFilterCount > 0 ? (
              <div>
                <p className="text-lg mb-2">No results found</p>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <p>{emptyMessage}</p>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {data.length} {title.toLowerCase()}
            </div>
            <div className="space-y-4">
              {filteredData.map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
