import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestServiceFetch = () => {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFetch = async () => {
      console.log('TestServiceFetch: Starting test fetch...');
      console.log('Supabase client:', supabase);
      
      try {
        setLoading(true);
        setError(null);
        
        // Test 1: Simple count query
        console.log('Test 1: Counting services...');
        const { count: serviceCount, error: countError } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Count error:', countError);
          throw countError;
        }
        
        console.log('Service count:', serviceCount);
        
        // Test 2: Fetch services
        console.log('Test 2: Fetching services...');
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, title, is_active, provider_id')
          .limit(5);
          
        if (servicesError) {
          console.error('Services error:', servicesError);
          throw servicesError;
        }
        
        console.log('Services data:', services);
        
        // Test 3: Fetch provider profiles
        console.log('Test 3: Fetching provider profiles...');
        const { data: providers, error: providersError } = await supabase
          .from('provider_profiles')
          .select('user_id, business_name, verification_status')
          .limit(5);
          
        if (providersError) {
          console.error('Providers error:', providersError);
          throw providersError;
        }
        
        console.log('Providers data:', providers);
        
        setTestData({
          serviceCount,
          services,
          providers,
          timestamp: new Date().toISOString()
        });
        
      } catch (err: any) {
        console.error('Test fetch error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    testFetch();
  }, []);

  if (loading) {
    return (
      <div className="p-4 border border-blue-500 bg-blue-50">
        <h3 className="font-bold text-blue-800">Test Service Fetch - Loading...</h3>
        <p>Testing Supabase connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 bg-red-50">
        <h3 className="font-bold text-red-800">Test Service Fetch - Error!</h3>
        <p className="text-red-600">Error: {error}</p>
        <p className="text-sm text-red-500 mt-2">Check console for details</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-green-500 bg-green-50">
      <h3 className="font-bold text-green-800">Test Service Fetch - Success!</h3>
      <div className="mt-2 text-sm">
        <p><strong>Service Count:</strong> {testData?.serviceCount}</p>
        <p><strong>Services Found:</strong> {testData?.services?.length || 0}</p>
        <p><strong>Providers Found:</strong> {testData?.providers?.length || 0}</p>
        <p><strong>Timestamp:</strong> {testData?.timestamp}</p>
        
        {testData?.services && testData.services.length > 0 && (
          <div className="mt-2">
            <strong>Sample Services:</strong>
            <ul className="list-disc list-inside">
              {testData.services.slice(0, 3).map((service: any) => (
                <li key={service.id}>{service.title} (ID: {service.id})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestServiceFetch;