
import React from 'react';
import { useParams } from 'react-router-dom';

const Service = () => {
  const { serviceId } = useParams();

  return (
    <div className="min-h-screen bg-navy p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Service Details</h1>
        <p className="text-muted-foreground">Service ID: {serviceId}</p>
        <p className="text-muted-foreground mt-4">This page is under development.</p>
      </div>
    </div>
  );
};

export default Service;
