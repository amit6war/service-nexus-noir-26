import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero3D from '../components/Hero3D';
import ServiceCard from '../components/ServiceCard';
import ProviderCard from '../components/ProviderCard';
import MobileBottomNav from '../components/MobileBottomNav';
import { ArrowRight, Star, Users, Clock, Shield } from 'lucide-react';

const Index = () => {
  const popularServices = [{
    icon: '🏠',
    title: 'House Cleaning',
    count: '200+ providers'
  }, {
    icon: '🔧',
    title: 'Handyman',
    count: '150+ providers'
  }, {
    icon: '🐕',
    title: 'Pet Care',
    count: '80+ providers'
  }, {
    icon: '💆',
    title: 'Massage Therapy',
    count: '60+ providers'
  }, {
    icon: '🚗',
    title: 'Auto Service',
    count: '90+ providers'
  }, {
    icon: '🌱',
    title: 'Landscaping',
    count: '70+ providers'
  }];

  const featuredProviders = [{
    name: 'Sophia Bennett',
    service: 'House Cleaning',
    rating: 4.9,
    reviews: 125,
    hourlyRate: 35,
    location: 'Fredericton',
    verified: true
  }, {
    name: 'John Mitchell',
    service: 'Handyman Services',
    rating: 4.8,
    reviews: 87,
    hourlyRate: 45,
    location: 'Saint John',
    verified: true
  }, {
    name: 'Maria Rodriguez',
    service: 'Pet Care & Walking',
    rating: 4.9,
    reviews: 156,
    hourlyRate: 25,
    location: 'Moncton',
    verified: true
  }];

  const featuredServices = [{
    icon: '🏠',
    title: 'Deep House Cleaning',
    provider: 'Sophia Bennett',
    rating: 4.9,
    reviews: 125,
    price: '$35/hr',
    location: 'Fredericton'
  }, {
    icon: '🔧',
    title: 'Home Repairs & Maintenance',
    provider: 'John Mitchell',
    rating: 4.8,
    reviews: 87,
    price: '$45/hr',
    location: 'Saint John'
  }];

  const stats = [{
    icon: Users,
    value: '500+',
    label: 'Verified Providers'
  }, {
    icon: Star,
    value: '4.8',
    label: 'Average Rating'
  }, {
    icon: Clock,
    value: '24/7',
    label: 'Support Available'
  }, {
    icon: Shield,
    value: '100%',
    label: 'Satisfaction Guaranteed'
  }];

  const navigate = useNavigate();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return <div className="min-h-screen bg-navy">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <Hero3D />
        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }}>
          <motion.h1 className="text-4xl md:text-6xl font-bold mb-6" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }}>
            Find <span className="text-gradient">Trusted Services</span>
            <br />
            in New Brunswick
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-muted-foreground mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.6
        }}>
            Connect with verified local service providers for all your needs
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.8
        }}>
            <motion.button
              type="button"
              onClick={() => scrollTo('popular-services')}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(78, 205, 196, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="btn-hero">
              Find Services
              <motion.div animate={{
              x: [0, 5, 0]
            }} transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}>
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.div>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/auth')}
              whileHover={{
                scale: 1.02,
                borderColor: "hsl(var(--teal))",
                backgroundColor: "rgba(78, 205, 196, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary">
              Become a Provider
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-teal/10 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }}>
            {stats.map((stat, index) => <motion.div key={index} className="text-center" variants={itemVariants} whileHover={{
            y: -5,
            scale: 1.05
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}>
                <motion.div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4" whileHover={{
              backgroundColor: "rgba(78, 205, 196, 0.3)",
              scale: 1.1
            }}>
                  <motion.div whileHover={{
                rotate: 360
              }} transition={{
                duration: 0.5
              }}>
                    <stat.icon className="w-8 h-8 text-teal" />
                  </motion.div>
                </motion.div>
                <motion.div className="text-3xl font-bold text-foreground mb-2" initial={{
              scale: 0
            }} whileInView={{
              scale: 1
            }} transition={{
              type: "spring",
              stiffness: 300,
              delay: index * 0.1 + 0.5
            }}>
                  {stat.value}
                </motion.div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      <section id="popular-services" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="flex items-center justify-between mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl font-bold text-foreground">Popular Services</h2>
            <motion.button
              type="button"
              onClick={() => scrollTo('popular-services-grid')}
              className="btn-ghost"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See All 
              <motion.div animate={{
              x: [0, 3, 0]
            }} transition={{
              duration: 1.5,
              repeat: Infinity
            }}>
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>
          
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-50px"
        }}>
            {popularServices.map((service, index) => <motion.div key={index} className="card-service text-center" variants={itemVariants} whileHover={{
            y: -8,
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}>
                <motion.div className="text-4xl mb-4" whileHover={{
              scale: 1.2,
              rotate: [0, -10, 10, 0]
            }} transition={{
              duration: 0.5
            }}>
                  {service.icon}
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.count}</p>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      <section id="featured-providers" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div className="flex items-center justify-between mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
          }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl font-bold text-foreground">Featured Providers</h2>
            <motion.button
              type="button"
              onClick={() => scrollTo('featured-providers-grid')}
              className="btn-ghost" whileHover={{
              scale: 1.05
            }}>
              See All <ArrowRight className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div>
          
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-50px"
        }}>
            {featuredProviders.map((provider, index) => <motion.div key={index} variants={itemVariants} whileHover={{
            y: -5
          }} transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}>
                <ProviderCard {...provider} />
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      <section id="featured-services" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="flex items-center justify-between mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl font-bold text-foreground">Featured Services</h2>
            <motion.button
              type="button"
              onClick={() => scrollTo('featured-services-grid')}
              className="btn-ghost" whileHover={{
              scale: 1.05
            }}>
              See All <ArrowRight className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div>
          
          <motion.div className="grid md:grid-cols-2 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-50px"
        }}>
            {featuredServices.map((service, index) => <motion.div key={index} variants={itemVariants} transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}>
                <ServiceCard {...service} />
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section className="py-20 bg-gradient-to-r from-teal/20 to-teal/10" initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} viewport={{
      once: true
    }}>
        <div className="container mx-auto px-4 text-center">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            Ready to Get Started?
          </motion.h2>
          <motion.p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            Join thousands of satisfied customers who found their perfect service provider through ServiceLink NB
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.4
        }}>
            <motion.button className="btn-hero" whileHover={{
            scale: 1.05,
            boxShadow: "0 15px 30px rgba(78, 205, 196, 0.4)"
          }} whileTap={{
            scale: 0.95
          }}>
              Find Services Now
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/auth')}
              className="btn-secondary" whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(78, 205, 196, 0.1)"
            }} whileTap={{
              scale: 0.98
            }}>
              Register as Provider
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <MobileBottomNav />
    </div>;
};

export default Index;
