
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useServices } from '@/hooks/useServices';
import ServiceCard from './ServiceCard';
import LoadingSpinner from './LoadingSpinner';
import { FilterableSection } from './FilterableSection';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  duration_minutes: number;
  is_featured: boolean;
  provider_id: string;
  provider_profiles?: {
    business_name: string;
    rating?: number;
    total_reviews?: number;
  };
}

const ServiceBrowserWithFilters = () => {
  const { services, loading, error } = useServices();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (services.length > 0) {
      const uniqueCategories = [...new Set(services.map(service => service.category))];
      setCategories(uniqueCategories);
    }
  }, [services]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading services: {error}</p>
      </div>
    );
  }

  const renderServiceCard = (service: Service) => (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <ServiceCard service={service} />
    </motion.div>
  );

  const categoryFilterOptions = categories.map(cat => ({
    label: cat,
    value: cat
  }));

  const priceRangeOptions = [
    { label: 'Under $50', value: 'under_50' },
    { label: '$50 - $100', value: '50_100' },
    { label: '$100 - $200', value: '100_200' },
    { label: 'Over $200', value: 'over_200' }
  ];

  const durationOptions = [
    { label: 'Under 30 min', value: 'under_30' },
    { label: '30-60 min', value: '30_60' },
    { label: '1-2 hours', value: '60_120' },
    { label: 'Over 2 hours', value: 'over_120' }
  ];

  // Apply additional filtering logic for price and duration
  const processedServices = services.map(service => ({
    ...service,
    price_range: service.base_price < 50 ? 'under_50' :
                 service.base_price < 100 ? '50_100' :
                 service.base_price < 200 ? '100_200' : 'over_200',
    duration_range: service.duration_minutes < 30 ? 'under_30' :
                    service.duration_minutes < 60 ? '30_60' :
                    service.duration_minutes < 120 ? '60_120' : 'over_120'
  }));

  return (
    <div className="space-y-6">
      <FilterableSection
        data={processedServices}
        renderItem={renderServiceCard}
        searchFields={['title', 'description', 'category', 'subcategory', 'provider_profiles.business_name']}
        filterOptions={[
          {
            key: 'category',
            label: 'Category',
            values: categoryFilterOptions
          },
          {
            key: 'price_range',
            label: 'Price Range',
            values: priceRangeOptions
          },
          {
            key: 'duration_range',
            label: 'Duration',
            values: durationOptions
          },
          {
            key: 'is_featured',
            label: 'Featured',
            values: [
              { label: 'Featured Only', value: true },
              { label: 'Regular', value: false }
            ]
          }
        ]}
        title="Available Services"
        emptyMessage="No services available at the moment."
        className="grid-container"
      />
    </div>
  );
};

export default ServiceBrowserWithFilters;
