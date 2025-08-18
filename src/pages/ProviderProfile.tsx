
import React from 'react';
import Header from '../components/Header';
import MobileBottomNav from '../components/MobileBottomNav';
import { ArrowLeft, Star, MapPin, Clock, Shield, CheckCircle, Phone, Mail } from 'lucide-react';

const ProviderProfile = () => {
  const provider = {
    name: 'Sophia Bennett',
    service: 'Professional House Cleaning',
    hourlyRate: 35,
    location: 'Fredericton, NB',
    rating: 4.8,
    totalReviews: 125,
    verified: true,
    avatar: null,
    about: 'Professional house cleaner with 5 years of experience. I provide thorough, reliable cleaning services using eco-friendly products. Fully insured and bonded.',
    phone: '+1 (506) 555-0123',
    email: 'sophia.bennett@servicelink.ca'
  };

  const ratingDistribution = [
    { stars: 5, percentage: 75, count: 94 },
    { stars: 4, percentage: 15, count: 19 },
    { stars: 3, percentage: 5, count: 6 },
    { stars: 2, percentage: 3, count: 4 },
    { stars: 1, percentage: 2, count: 2 }
  ];

  const reviews = [
    {
      id: 1,
      author: 'Olivia Carter',
      rating: 5,
      date: '2024-01-15',
      comment: 'Sophia is amazing! She cleaned my house thoroughly and was very professional. I highly recommend her services.',
      avatar: null
    },
    {
      id: 2,
      author: 'Ethan Walker',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great service, very reliable and did a fantastic job. Will definitely book again.',
      avatar: null
    }
  ];

  const availability = [
    { day: 'Monday', times: ['9:00 AM - 5:00 PM'] },
    { day: 'Tuesday', times: ['9:00 AM - 5:00 PM'] },
    { day: 'Wednesday', times: ['9:00 AM - 5:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM - 3:00 PM'] },
    { day: 'Friday', times: ['9:00 AM - 5:00 PM'] },
    { day: 'Saturday', times: ['10:00 AM - 4:00 PM'] },
    { day: 'Sunday', times: ['Unavailable'] }
  ];

  return (
    <div className="min-h-screen bg-navy pb-20 md:pb-0">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-teal transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Services</span>
        </button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Info */}
            <div className="card-glass">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-teal/20 to-teal/10 rounded-full flex items-center justify-center">
                    {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-6xl">👤</span>
                    )}
                  </div>
                  {provider.verified && (
                    <CheckCircle className="absolute -bottom-2 -right-2 w-8 h-8 text-teal bg-navy rounded-full p-1" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{provider.name}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{provider.service}</p>
                  <div className="text-2xl font-bold text-teal mb-4">${provider.hourlyRate}/hr</div>
                  
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-foreground">{provider.rating}</span>
                      <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span>{provider.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-teal">
                      <Shield className="w-5 h-5" />
                      <span>Verified Provider</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button className="flex items-center gap-2 btn-ghost">
                      <Phone className="w-4 h-4" />
                      <span className="hidden sm:inline">Call</span>
                    </button>
                    <button className="flex items-center gap-2 btn-ghost">
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card-glass">
              <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">{provider.about}</p>
            </div>

            {/* Rating Distribution */}
            <div className="card-glass">
              <h2 className="text-2xl font-bold text-foreground mb-6">Ratings</h2>
              <div className="space-y-3">
                {ratingDistribution.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm text-foreground">{rating.stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-teal h-2 rounded-full transition-all duration-500"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {rating.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                <button className="btn-ghost text-sm">View All</button>
              </div>
              
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal/20 to-teal/10 rounded-full flex items-center justify-center">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.author} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{review.author}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="card-glass sticky top-24">
              <h3 className="text-xl font-bold text-foreground mb-6">Book Service</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Service Date</label>
                  <input type="date" className="input-dark w-full" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (hours)</label>
                  <select className="input-dark w-full">
                    <option>2 hours</option>
                    <option>3 hours</option>
                    <option>4 hours</option>
                    <option>Full day</option>
                  </select>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Service (2 hours)</span>
                  <span className="text-foreground">$70.00</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="text-foreground">$5.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-teal">$75.00</span>
                </div>
              </div>
              
              <button className="btn-hero w-full">Book Now</button>
            </div>

            {/* Availability */}
            <div className="card-glass">
              <h3 className="text-xl font-bold text-foreground mb-6">Availability</h3>
              <div className="space-y-3">
                {availability.map((day, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-foreground font-medium">{day.day}</span>
                    <span className={`${day.times[0] === 'Unavailable' ? 'text-muted-foreground' : 'text-teal'}`}>
                      {day.times[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ProviderProfile;
