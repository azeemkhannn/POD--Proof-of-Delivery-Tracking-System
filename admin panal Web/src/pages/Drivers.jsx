import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import driverService from '../services/driver.service';
import routeService from '../services/route.service';

const Drivers = () => {
  const [openDriverId, setOpenDriverId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isActive: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const driversRes = await driverService.getAllDrivers();
      // const [driversRes, routesRes] = await Promise.all([
      //   driverService.getAllDrivers(),
      //   // routeService.getAllRoutes()
      // ]);
      if (driversRes.success) setDrivers(driversRes.drivers);
      // if (routesRes.success) setRoutes(routesRes.routes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = editingDriver
        ? await driverService.updateDriver(editingDriver._id, formData)
        : await driverService.createDriver(formData);

      if (result.success) {
        loadData();
        closeModal();
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (error) {
      alert(error.message || 'Error saving driver');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      const result = await driverService.deleteDriver(id);
      if (result.success) {
        loadData();
      } else {
        alert(result.message || 'Delete failed');
      }
    } catch (error) {
      alert(error.message || 'Error deleting driver');
    }
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: '',
      phone: driver.phone,
      isActive: driver.isActive
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      assignedRoute: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading drivers...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Drivers Management</h1>
          <p className="text-gray-600 mt-1">Manage your delivery drivers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Phone</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Assigned Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-medium">{driver.name}</td>
                  <td className="py-3 px-6 text-sm text-gray-600">{driver.email}</td>
                  <td className="py-3 px-6 text-sm">{driver.phone}</td>
                  {/* ✅ Assigned Routes Dropdown */}
                  <td className="py-3 px-6 text-sm relative">
                    {driver.assignedRoutes && driver.assignedRoutes.length > 0 ? (
                      <div className="relative inline-block w-full text-left">
                        {/* Dropdown button */}
                        <button
                          onClick={() =>
                            setOpenDriverId(openDriverId === driver._id ? null : driver._id)
                          }
                          className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md"
                        >
                          <span>
                            {driver.assignedRoutes.length} Routes
                            {driver.assignedRoutes.length > 1 ? "s" : ""}
                          </span>
                          {openDriverId === driver._id ? (
                            <ChevronUp className="w-4 h-4 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-2" />
                          )}
                        </button>

                        {/* Dropdown list */}
                        {openDriverId === driver._id && (
                          <div className="fixed z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-56">
                            <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                              {driver.assignedRoutes.map((route, index) => (
                                <li key={index} className="p-2 text-sm text-gray-700">
                                  <div className="font-semibold">{route.routeName}</div>
                                  <div className="text-xs text-gray-500">
                                    Days: {route.deliveryDays.join(", ")}
                                  </div>
                                  <div
                                    className={`text-xs font-medium mt-1 ${route.isActive ? "text-green-600" : "text-red-600"
                                      }`}
                                  >
                                    {route.isActive ? "Active" : "Inactive"}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>

                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${driver.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {driver.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(driver)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {drivers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No drivers found</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Add your first driver
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingDriver && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required={!editingDriver}
                />
              </div>
              <div>
                <label
                  className={`px-2 py-1 rounded-full text-xs font-medium ${formData.isActive
                      ? 'bg-green-200 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  Status *
                </label>

                <select
                  value={formData.isActive ? 'Active' : 'Inactive'}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === 'Active' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mt-1"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="03001234567"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Route</label>
                <select
                  value={formData.assignedRoute}
                  onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">No route assigned</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeName}
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingDriver ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;