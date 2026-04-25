import React, { useState, useEffect } from 'react';
import { Eye, X, FileText } from 'lucide-react';
import reportService from '../services/report.service';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const result = await reportService.getAllReports();
      if (result.success) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading reports...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">View delivery reports and performance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Driver</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Pickup</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Sellout</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Remaining</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm">{formatDate(report.date)}</td>
                  <td className="py-3 px-6 font-medium">{report.driver?.name || 'N/A'}</td>
                  <td className="py-3 px-6 text-sm">{report.route?.routeName || 'N/A'}</td>
                  <td className="py-3 px-6 text-sm font-semibold">{report.totalPickup}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-green-600">{report.totalSellout}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-orange-600">{report.totalRemaining}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-700' :
                      report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No reports available</p>
              <p className="text-sm mt-1">Reports will appear here once drivers submit their delivery data</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-xl font-bold">Report Details</h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="font-semibold">{selectedReport.driver?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold">{selectedReport.route?.routeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(selectedReport.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedReport.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedReport.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Shop-wise Details */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4">Shop-wise Details</h4>
                <div className="space-y-3">
                  {selectedReport.shops?.map((shop, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-lg">{shop.shopName}</p>
                          {shop.notes && (
                            <p className="text-sm text-gray-600 mt-1">Note: {shop.notes}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Pickup</p>
                          <p className="text-xl font-bold">{shop.pickup}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sellout</p>
                          <p className="text-xl font-bold text-green-600">{shop.sellout}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="text-xl font-bold text-orange-600">{shop.remaining}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedReport.shops || selectedReport.shops.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No shop details available</p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4">Summary</h4>
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Pickup</p>
                      <p className="text-3xl font-bold text-gray-800">{selectedReport.totalPickup}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Sellout</p>
                      <p className="text-3xl font-bold text-green-600">{selectedReport.totalSellout}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Remaining</p>
                      <p className="text-3xl font-bold text-orange-600">{selectedReport.totalRemaining}</p>
                    </div>
                  </div>
                  
                  {selectedReport.totalPickup > 0 && (
                    <div className="mt-4 pt-4 border-t border-indigo-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Sellout Percentage</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {Math.round((selectedReport.totalSellout / selectedReport.totalPickup) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {selectedReport.notes && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-2">Additional Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;