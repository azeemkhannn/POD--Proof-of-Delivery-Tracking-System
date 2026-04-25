import React, { useState, useEffect } from 'react';
import { Users, MapPin, Package, CheckCircle } from 'lucide-react';
import reportService from '../services/report.service';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await reportService.getDashboardStats();
      if (result.success) {
        setData(result.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Drivers',
      value: data?.overview?.totalDrivers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Routes',
      value: data?.overview?.totalRoutes || 0,
      icon: MapPin,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: "Today's Deliveries",
      value: data?.today?.totalDeliveries || 0,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Completed Today',
      value: data?.today?.completed || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your delivery operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pickup</span>
              <span className="font-semibold text-lg">{data?.today?.totalPickup || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sellout</span>
              <span className="font-semibold text-lg text-green-600">{data?.today?.totalSellout || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining</span>
              <span className="font-semibold text-lg text-orange-600">{data?.today?.totalRemaining || 0}</span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers (This Month)</h3>
          <div className="space-y-3">
            {data?.topDrivers?.slice(0, 5).map((driver, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-gray-800">{driver._id?.name || 'Unknown'}</span>
                </div>
                <span className="font-semibold text-green-600">{driver.totalSellout}</span>
              </div>
            ))}
            {(!data?.topDrivers || data.topDrivers.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No data available yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Driver</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Pickup</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Sellout</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentReports?.map((report, idx) => (
                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm">{report.driver?.name || 'N/A'}</td>
                  <td className="py-3 px-6 text-sm">{report.route?.routeName || 'N/A'}</td>
                  <td className="py-3 px-6 text-sm font-semibold">{report.totalPickup}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-green-600">{report.totalSellout}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-700' :
                      report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recentReports || data.recentReports.length === 0) && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No reports available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;