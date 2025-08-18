import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Calendar, MessageSquare, DollarSign, 
  FileText, Star, BarChart3, Bell, LogOut, Menu,
  CheckCircle, Clock, AlertCircle, Upload, Camera,
  Plus, Edit, Trash2, Send, Phone, MapPin, Filter,
  TrendingUp, TrendingDown, Eye, Download, Search,
  X, Save, ChevronDown, ChevronRight, Zap, Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Mock data for demonstration
  const mockData = {
    profile: {
      name: user?.user_metadata?.full_name || 'John Smith',
      title: 'Licensed Electrician',
      rating: 4.8,
      completedJobs: 127,
      verificationStatus: 'verified',
      joinDate: '2023-01-15'
    },
    stats: {
      pendingRequests: 5,
      activeJobs: 3,
      monthlyEarnings: 4250,
      completionRate: 98
    },
    recentRequests: [
      { id: 1, customer: 'Sarah Johnson', service: 'Electrical Repair', location: 'Downtown', time: '2 hours ago', status: 'pending' },
      { id: 2, customer: 'Mike Chen', service: 'Panel Upgrade', location: 'Suburbs', time: '4 hours ago', status: 'accepted' },
      { id: 3, customer: 'Lisa Brown', service: 'Outlet Installation', location: 'Midtown', time: '1 day ago', status: 'completed' }
    ]
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Verification', icon: User },
    { id: 'services', label: 'Service Configuration', icon: Settings },
    { id: 'requests', label: 'Job Requests', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'portfolio', label: 'Portfolio', icon: Camera },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-foreground">{mockData.stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-foreground">{mockData.stats.activeJobs}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                <p className="text-2xl font-bold text-foreground">${mockData.stats.monthlyEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">{mockData.stats.completionRate}%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Job Requests</CardTitle>
          <CardDescription>Manage your incoming service requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{request.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{request.customer}</p>
                    <p className="text-sm text-muted-foreground">{request.service} • {request.location}</p>
                    <p className="text-xs text-muted-foreground">{request.time}</p>
                  </div>
                </div>
                <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'accepted' ? 'default' : 'outline'}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-foreground">Professional Profile</CardTitle>
          <CardDescription>Manage your professional information and verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">{mockData.profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{mockData.profile.name}</h3>
              <p className="text-muted-foreground">{mockData.profile.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-foreground">{mockData.profile.rating}</span>
                <span className="text-sm text-muted-foreground">({mockData.profile.completedJobs} jobs completed)</span>
              </div>
            </div>
            <Badge variant={mockData.profile.verificationStatus === 'verified' ? 'default' : 'secondary'}>
              {mockData.profile.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Verification Documents</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm text-foreground">Red Seal Certificate</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm text-foreground">Professional License</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm text-foreground">Insurance Certificate</span>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <motion.button 
                className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </motion.button>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Profile Completion</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Profile Completion</span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>✓ Basic information completed</p>
                  <p>✓ Professional credentials verified</p>
                  <p>✓ Service areas defined</p>
                  <p className="text-orange-500">• Add portfolio images</p>
                  <p className="text-orange-500">• Complete service pricing</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'services':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Service Configuration</CardTitle>
                <CardDescription>Manage your service offerings and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Service Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <span className="text-foreground">Electrical Repair</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <span className="text-foreground">Panel Upgrades</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <span className="text-foreground">Outlet Installation</span>
                            <Badge variant="secondary">Inactive</Badge>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Service Category
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Pricing & Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Base Hourly Rate</label>
                            <Input placeholder="$75/hour" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Service Area</label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select service area" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="downtown">Downtown</SelectItem>
                                <SelectItem value="suburbs">Suburbs</SelectItem>
                                <SelectItem value="citywide">City-wide</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Availability</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Button variant="outline" size="sm">Mon-Fri</Button>
                              <Button variant="outline" size="sm">Weekends</Button>
                              <Button variant="outline" size="sm">Emergency</Button>
                              <Button variant="outline" size="sm">24/7</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'requests':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Job Requests</CardTitle>
                <CardDescription>Manage incoming service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Requests section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Messages</CardTitle>
                <CardDescription>Communicate with your clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Messages section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'earnings':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Earnings</CardTitle>
                <CardDescription>Track your income and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Earnings section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Portfolio</CardTitle>
                <CardDescription>Showcase your work and projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Portfolio section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Calendar</CardTitle>
                <CardDescription>Manage your schedule and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Calendar section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Analytics</CardTitle>
                <CardDescription>View your performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Analytics section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-foreground">Notifications</CardTitle>
                <CardDescription>View your alerts and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Notifications section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Mobile Header */}
      <div className="lg:hidden bg-navy-light border-b border-border p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:text-teal transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Provider Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="text-foreground hover:text-teal transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-light border-r border-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          initial={false}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{mockData.profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-foreground">{mockData.profile.name}</h2>
                <p className="text-sm text-muted-foreground">{mockData.profile.title}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-teal/20 text-teal'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              <motion.button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
                <p className="text-muted-foreground">Manage your services and grow your business</p>
              </div>
              {/* Removed the redundant sign out button from here */}
            </div>

            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;