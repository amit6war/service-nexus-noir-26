import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  UserCheck,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  Calendar,
  Star,
  CreditCard,
  Award,
  Target,
  RefreshCw,
  Edit,
  Trash2,
  Send,
  Flag,
  Archive,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Interface for section configuration
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  category: 'core' | 'management' | 'analytics' | 'system';
  order: number;
  description: string;
  isEnabled: boolean;
  badge?: {
    count: number;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  };
}

// Dashboard Overview Section
const DashboardOverviewSection = ({ metrics, onNavigate }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Providers</p>
              <p className="text-3xl font-bold text-white">{metrics.totalProviders}</p>
              <p className="text-xs text-green-400">+12% from last month</p>
            </div>
            <Users className="h-12 w-12 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold text-white">{metrics.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-400">+8% from last month</p>
            </div>
            <UserCheck className="h-12 w-12 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-white">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-400">+15% from last month</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold text-white">{metrics.averageRating}</p>
              <p className="text-xs text-green-400">+0.2 from last month</p>
            </div>
            <Star className="h-12 w-12 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="card-glass cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onNavigate('provider-management')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <AlertTriangle className="h-8 w-8 mb-3 text-orange-400" />
              <h3 className="text-lg font-semibold text-white mb-1">Pending Approvals</h3>
              <p className="text-2xl font-bold text-white">{metrics.pendingApprovals}</p>
              <p className="text-sm text-muted-foreground">providers waiting approval</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Review Applications
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onNavigate('dispute-resolution')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <AlertTriangle className="h-8 w-8 mb-3 text-red-400" />
              <h3 className="text-lg font-semibold text-white mb-1">Active Disputes</h3>
              <p className="text-2xl font-bold text-white">{metrics.activeDisputes}</p>
              <p className="text-sm text-muted-foreground">disputes need attention</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              Resolve Disputes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onNavigate('advanced-analytics')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Clock className="h-8 w-8 mb-3 text-teal" />
              <h3 className="text-lg font-semibold text-white mb-1">Avg Fulfillment</h3>
              <p className="text-2xl font-bold text-white">{metrics.averageFulfillmentTime} hours</p>
              <p className="text-sm text-muted-foreground">average service time</p>
            </div>
            <Button className="bg-teal hover:bg-teal/80">
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// User Management Section
const UserManagementSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">User Management</h2>
      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search users..." className="pl-10 w-64" />
        </div>
        <Button className="bg-teal hover:bg-teal/80">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>

    {/* User Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">{metrics.activeUsers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">{metrics.totalProviders}</p>
            <p className="text-sm text-muted-foreground">Total Providers</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-sm text-muted-foreground">Premium Users</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Recent Activity */}
    <Card className="card-glass">
      <CardHeader>
        <CardTitle>Recent User Activity</CardTitle>
        <CardDescription>Latest user registrations and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">User {i} joined</p>
                  <p className="text-sm text-muted-foreground">{i} hours ago</p>
                </div>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Provider Management Section
const ProviderManagementSection = ({ pendingProviders, handleProviderApproval }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Provider Management</h2>
      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search providers..." className="pl-10 w-64" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card className="card-glass">
      <CardHeader>
        <CardTitle>Provider Applications</CardTitle>
        <CardDescription>Review and manage provider applications</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingProviders?.map((provider: any) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-white">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">{provider.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{provider.service}</Badge>
                </TableCell>
                <TableCell className="text-white">{provider.location}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">License</Badge>
                    <Badge variant="outline" className="text-xs">Insurance</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    {provider.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleProviderApproval(provider.id, 'approved')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this provider application? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleProviderApproval(provider.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// Financial Overview Section
const FinancialOverviewSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Financial Overview</h2>
      <div className="flex gap-2">
        <Select defaultValue="30d">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>

    {/* Revenue Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-white">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-400">+15% from last month</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Commission Revenue</p>
              <p className="text-3xl font-bold text-white">${metrics.commissionRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-400">10% commission rate</p>
            </div>
            <CreditCard className="h-12 w-12 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Premium Subscriptions</p>
              <p className="text-3xl font-bold text-white">{metrics.premiumSubscriptions}</p>
              <p className="text-xs text-green-400">+8% this month</p>
            </div>
            <Award className="h-12 w-12 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ad Revenue</p>
              <p className="text-3xl font-bold text-white">${metrics.adRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-400">+12% this month</p>
            </div>
            <Target className="h-12 w-12 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Revenue Breakdown */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Monthly revenue by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-white">Service Commissions</span>
              </div>
              <span className="text-white font-medium">${metrics.commissionRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-white">Premium Subscriptions</span>
              </div>
              <span className="text-white font-medium">$15,600</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-white">Advertisement Revenue</span>
              </div>
              <span className="text-white font-medium">${metrics.adRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-white">Express Booking Fees</span>
              </div>
              <span className="text-white font-medium">${metrics.expressBookingFees.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Transaction #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">$125.00</p>
                  <Badge variant="outline" className="text-xs">Completed</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Dispute Resolution Section
const DisputeResolutionSection = ({ disputes }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Dispute Resolution</h2>
      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disputes</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-teal hover:bg-teal/80">
          <Plus className="h-4 w-4 mr-2" />
          Create Case
        </Button>
      </div>
    </div>

    {/* Dispute Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-white">7</p>
            <p className="text-sm text-muted-foreground">Open Disputes</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">45</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">2.3</p>
            <p className="text-sm text-muted-foreground">Avg Resolution (days)</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Disputes Table */}
    <Card className="card-glass">
      <CardHeader>
        <CardTitle>Active Disputes</CardTitle>
        <CardDescription>Manage customer-provider disputes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes?.map((dispute: any) => (
              <TableRow key={dispute.id}>
                <TableCell className="font-medium">{dispute.id}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{dispute.customer}</div>
                    <div className="text-xs text-muted-foreground">vs {dispute.provider}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{dispute.service}</Badge>
                </TableCell>
                <TableCell>${dispute.amount}</TableCell>
                <TableCell>
                  <Badge variant={dispute.priority === 'high' ? 'destructive' : 'default'}>
                    {dispute.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={dispute.status === 'open' ? 'destructive' : 'default'}>
                    {dispute.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// Advanced Analytics Section
const AdvancedAnalyticsSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
      <div className="flex gap-2">
        <Select defaultValue="30d">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Analytics
        </Button>
      </div>
    </div>

    {/* Analytics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-white">{metrics.totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-green-400">+18% from last month</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Booking Value</p>
              <p className="text-3xl font-bold text-white">${metrics.averageBookingValue}</p>
              <p className="text-xs text-green-400">+5% from last month</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              <p className="text-3xl font-bold text-white">{metrics.customerSatisfactionScore}</p>
              <p className="text-xs text-green-400">+0.3 from last month</p>
            </div>
            <Star className="h-12 w-12 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Provider Growth</p>
              <p className="text-3xl font-bold text-white">{metrics.providerGrowthRate}%</p>
              <p className="text-xs text-green-400">Monthly growth rate</p>
            </div>
            <TrendingUp className="h-12 w-12 text-teal" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Analytics Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
          <CardDescription>Monthly booking analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-border rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>Popular service breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Home Cleaning', percentage: 35, color: 'bg-blue-500' },
              { name: 'Plumbing', percentage: 25, color: 'bg-green-500' },
              { name: 'Electrical', percentage: 20, color: 'bg-yellow-500' },
              { name: 'Gardening', percentage: 15, color: 'bg-purple-500' },
              { name: 'Others', percentage: 5, color: 'bg-gray-500' }
            ].map((service) => (
              <div key={service.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{service.name}</span>
                  <span className="text-muted-foreground">{service.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${service.color} h-2 rounded-full`} 
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Security Center Section
const SecurityCenterSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Security Center</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
        <Button className="bg-teal hover:bg-teal/80">
          <Shield className="h-4 w-4 mr-2" />
          Security Scan
        </Button>
      </div>
    </div>

    {/* Security Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">Secure</p>
            <p className="text-sm text-muted-foreground">System Status</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-muted-foreground">Security Alerts</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">1,247</p>
            <p className="text-sm text-muted-foreground">Active Sessions</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-sm text-muted-foreground">Monitoring</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Security Features */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security activities and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'login', message: 'Admin login from new device', time: '2 minutes ago', severity: 'info' },
              { type: 'alert', message: 'Suspicious activity detected', time: '1 hour ago', severity: 'warning' },
              { type: 'update', message: 'Security patch applied', time: '3 hours ago', severity: 'success' },
              { type: 'scan', message: 'System security scan completed', time: '6 hours ago', severity: 'success' }
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  event.severity === 'warning' ? 'bg-yellow-500' :
                  event.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{event.message}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage user permissions and access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Enhanced security for admin accounts</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">IP Whitelist</p>
                <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Badge variant="outline">30 minutes</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Content Moderation Section
const ContentModerationSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="reviews">Reviews</SelectItem>
            <SelectItem value="profiles">Profiles</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-teal hover:bg-teal/80">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
    </div>

    {/* Moderation Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">23</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <X className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-sm text-muted-foreground">Reported Content</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">98.5%</p>
            <p className="text-sm text-muted-foreground">Approval Rate</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Content Review Table */}
    <Card className="card-glass">
      <CardHeader>
        <CardTitle>Content Review Queue</CardTitle>
        <CardDescription>Review and moderate platform content</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content Type</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { type: 'Review', author: 'John Doe', content: 'Great service, very professional...', status: 'pending', reported: false },
              { type: 'Profile', author: 'Jane Smith', content: 'Professional cleaner with 5 years...', status: 'approved', reported: false },
              { type: 'Review', author: 'Bob Wilson', content: 'Terrible experience, would not...', status: 'pending', reported: true }
            ].map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.author}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-muted-foreground">
                    {item.content}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'pending' ? 'destructive' : 'default'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.reported && <Badge variant="destructive">Reported</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// System Notifications Section
const SystemNotificationsSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">System Notifications</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
        <Button className="bg-teal hover:bg-teal/80">
          <Plus className="h-4 w-4 mr-2" />
          New Notification
        </Button>
      </div>
    </div>

    {/* Notification Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-sm text-muted-foreground">Total Sent</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">89%</p>
            <p className="text-sm text-muted-foreground">Open Rate</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </CardContent>
      </Card>
      <Card className="card-glass">
        <CardContent className="p-4">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">8,934</p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Notification Management */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest system notifications sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'System Maintenance', message: 'Scheduled maintenance tonight at 2 AM', time: '2 hours ago', type: 'system' },
              { title: 'New Feature Release', message: 'Advanced analytics now available', time: '1 day ago', type: 'feature' },
              { title: 'Security Update', message: 'Important security patch applied', time: '2 days ago', type: 'security' }
            ].map((notification, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <Bell className="h-5 w-5 mt-1 text-blue-400" />
                <div className="flex-1">
                  <p className="font-medium text-white">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
                <Badge variant="outline">{notification.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send notifications via email</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-white">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
              </div>
              <Badge variant="outline">Disabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// System Settings Section
const SystemSettingsSection = ({ metrics }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">System Settings</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button className="bg-teal hover:bg-teal/80">
          <Settings className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>

    {/* Settings Categories */}
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Basic platform settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="ServiceNexus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" defaultValue="support@servicenexus.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-providers">Max Providers per Service</Label>
                <Input id="max-providers" type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-window">Booking Window (days)</Label>
                <Input id="booking-window" type="number" defaultValue="30" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Pricing & Commission</CardTitle>
            <CardDescription>Configure platform pricing and commission rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                <Input id="commission-rate" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium-price">Premium Subscription ($/month)</Label>
                <Input id="premium-price" type="number" defaultValue="29.99" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express-fee">Express Booking Fee ($)</Label>
                <Input id="express-fee" type="number" defaultValue="5.99" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation-fee">Cancellation Fee ($)</Label>
                <Input id="cancellation-fee" type="number" defaultValue="15.00" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Real-time Chat', description: 'Enable chat between customers and providers', enabled: true },
              { name: 'GPS Tracking', description: 'Track provider location during service', enabled: true },
              { name: 'Auto-matching', description: 'Automatically match customers with providers', enabled: false },
              { name: 'Review System', description: 'Allow customers to review services', enabled: true },
              { name: 'Premium Features', description: 'Enable premium subscription features', enabled: true }
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-white">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Badge variant={feature.enabled ? 'default' : 'outline'} className={feature.enabled ? 'text-green-400 border-green-400' : ''}>
                  {feature.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations" className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Third-party Integrations</CardTitle>
            <CardDescription>Manage external service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Stripe Payment', description: 'Payment processing integration', status: 'connected' },
              { name: 'Google Maps', description: 'Location and mapping services', status: 'connected' },
              { name: 'Twilio SMS', description: 'SMS notification service', status: 'disconnected' },
              { name: 'SendGrid Email', description: 'Email delivery service', status: 'connected' },
              { name: 'Firebase Push', description: 'Push notification service', status: 'connected' }
            ].map((integration, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-white">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.status === 'connected' ? 'default' : 'outline'} 
                         className={integration.status === 'connected' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}>
                    {integration.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

// Main AdminDashboard Component
const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard-overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock dashboard metrics
  const dashboardMetrics = {
    totalProviders: 1247,
    activeUsers: 8934,
    totalRevenue: 2456789,
    averageRating: 4.7,
    pendingApprovals: 23,
    activeDisputes: 8,
    averageFulfillmentTime: 2.4,
    // Add missing financial metrics
    commissionRevenue: 245678,
    premiumSubscriptions: 156,
    adRevenue: 45230,
    expressBookingFees: 12450,
    // Add missing analytics metrics
    customerSatisfactionScore: 4.6,
    providerGrowthRate: 12.5,
    // Add missing Advanced Analytics metrics
    totalTransactions: 15847,
    averageBookingValue: 156.75
  };

  // Mock pending providers data
  const pendingProviders = [
    { id: 1, name: 'John Smith', service: 'Plumbing', location: 'Downtown', rating: 4.8, experience: '5 years' },
    { id: 2, name: 'Sarah Johnson', service: 'Electrical', location: 'Suburbs', rating: 4.9, experience: '8 years' }
  ];

  // Section configurations using useMemo
  const sectionConfigs: SectionConfig[] = useMemo(() => [
    {
      id: 'dashboard-overview',
      label: 'Dashboard Overview',
      icon: BarChart3,
      component: (props: any) => <DashboardOverviewSection {...props} metrics={dashboardMetrics} onNavigate={handleSectionChange} />,
      category: 'core',
      order: 1,
      description: 'Main dashboard with key metrics and overview',
      isEnabled: true
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      component: (props: any) => <UserManagementSection {...props} metrics={dashboardMetrics} />,
      category: 'management',
      order: 2,
      description: 'Manage platform users and their activities',
      isEnabled: true
    },
    {
      id: 'provider-management',
      label: 'Provider Management',
      icon: UserCheck,
      component: (props: any) => <ProviderManagementSection {...props} pendingProviders={pendingProviders} handleProviderApproval={handleProviderApproval} />,
      category: 'management',
      order: 3,
      description: 'Review and manage service provider applications',
      isEnabled: true
    },
    {
      id: 'financial-overview',
      label: 'Financial Overview',
      icon: DollarSign,
      component: (props: any) => <FinancialOverviewSection {...props} metrics={dashboardMetrics} />,
      category: 'analytics',
      order: 4,
      description: 'Revenue tracking and financial analytics',
      isEnabled: true
    },
    {
      id: 'dispute-resolution',
      label: 'Dispute Resolution',
      icon: AlertTriangle,
      component: (props: any) => <DisputeResolutionSection {...props} metrics={dashboardMetrics} />,
      category: 'management',
      order: 5,
      description: 'Handle customer and provider disputes',
      isEnabled: true
    },
    {
      id: 'advanced-analytics',
      label: 'Advanced Analytics',
      icon: TrendingUp,
      component: (props: any) => <AdvancedAnalyticsSection {...props} metrics={dashboardMetrics} />,
      category: 'analytics',
      order: 6,
      description: 'Detailed analytics and reporting tools',
      isEnabled: true
    },
    {
      id: 'security-center',
      label: 'Security Center',
      icon: Shield,
      component: (props: any) => <SecurityCenterSection {...props} metrics={dashboardMetrics} />,
      category: 'system',
      order: 7,
      description: 'Security monitoring and access controls',
      isEnabled: true
    },
    {
      id: 'content-moderation',
      label: 'Content Moderation',
      icon: FileText,
      component: (props: any) => <ContentModerationSection {...props} metrics={dashboardMetrics} />,
      category: 'system',
      order: 8,
      description: 'Review and moderate platform content',
      isEnabled: true
    },
    {
      id: 'system-notifications',
      label: 'System Notifications',
      icon: Bell,
      component: (props: any) => <SystemNotificationsSection {...props} metrics={dashboardMetrics} />,
      category: 'system',
      order: 9,
      description: 'Manage system-wide notifications',
      isEnabled: true
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: Settings,
      component: (props: any) => <SystemSettingsSection {...props} metrics={dashboardMetrics} />,
      category: 'system',
      order: 10,
      description: 'Configure platform settings and preferences',
      isEnabled: true
    }
  ], [dashboardMetrics, pendingProviders]);

  const handleProviderApproval = (providerId: number, action: 'approve' | 'reject') => {
    console.log(`${action} provider ${providerId}`);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const currentSection = sectionConfigs.find(section => section.id === activeSection);
  const CurrentComponent = currentSection?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Service Management</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sectionConfigs
              .filter(section => section.isEnabled)
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                    {section.badge && (
                      <Badge 
                        variant={section.badge.variant} 
                        className="ml-auto"
                      >
                        {section.badge.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">System Administrator</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentSection?.label}</h1>
                <p className="text-sm text-slate-400">{currentSection?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {CurrentComponent && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentComponent 
                metrics={dashboardMetrics}
                pendingProviders={pendingProviders}
                handleProviderApproval={handleProviderApproval}
                onNavigate={handleSectionChange}
              />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;