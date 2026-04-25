import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, MapPin, Calendar, Users,Upload } from 'lucide-react';
import routeService from '../services/route.service';
import driverService from '../services/driver.service';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    routeName: '',
    description: '',
    deliveryDays: [],
    assignedDriver: '',
    shops: []
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routesRes, driversRes] = await Promise.all([
        routeService.getAllRoutes(),
        driverService.getAllDrivers()
      ]);
      if (routesRes.success) setRoutes(routesRes.routes);
      if (driversRes.success) setDrivers(driversRes.drivers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = editingRoute
        ? await routeService.updateRoute(editingRoute._id, formData)
        : await routeService.createRoute(formData);

      if (result.success) {
        loadData();
        closeModal();
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (error) {
      alert(error.message || 'Error saving route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      const result = await routeService.deleteRoute(id);
      if (result.success) {
        loadData();
      } else {
        alert(result.message || 'Delete failed');
      }
    } catch (error) {
      alert(error.message || 'Error deleting route');
    }
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setFormData({
      routeName: route.routeName,
      description: route.description || '',
      deliveryDays: route.deliveryDays || [],
      assignedDriver: route.assignedDriver?._id || '',
      shops: route.shops || []
    });
    setShowModal(true);
  };
  
  const importShops = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const shops = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((header, i) => (obj[header] = values[i]));
      return obj;
    });
    setFormData({ ...formData, shops: [...formData.shops, ...shops] });
  };
  reader.readAsText(file);
};


  const closeModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      routeName: '',
      description: '',
      deliveryDays: [],
      assignedDriver: '',
      shops: []
    });
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      deliveryDays: formData.deliveryDays.includes(day)
        ? formData.deliveryDays.filter(d => d !== day)
        : [...formData.deliveryDays, day]
    });
  };

  const addShop = () => {
    setFormData({
      ...formData,
      shops: [...formData.shops, { shopName: '', address: '', contact: '', targetAmount: 0 }]
    });
  };

  const updateShop = (index, field, value) => {
    const newShops = [...formData.shops];
    newShops[index][field] = value;
    setFormData({...formData, shops: newShops});
  };

  const removeShop = (index) => {
    setFormData({
      ...formData,
      shops: formData.shops.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading routes...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Routes Management</h1>
          <p className="text-gray-600 mt-1">Manage delivery routes and shops</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{route.routeName}</h3>
                {route.description && (
                  <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(route)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(route._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {route.assignedDriver?.name || (
                    <span className="text-gray-400">No driver assigned</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {route.deliveryDays?.length > 0 
                    ? route.deliveryDays.join(', ')
                    : <span className="text-gray-400">No days set</span>
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{route.shops?.length || 0} shops</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {route.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {routes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="mb-2">No routes found</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Create your first route
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-xl font-bold">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                <input
                  type="text"
                  value={formData.routeName}
                  onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        formData.deliveryDays.includes(day)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                <select
                  value={formData.assignedDriver}
                  onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">No driver assigned</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
  <div className="flex justify-between items-center mb-2">
    <label className="  block text-sm   p-3 font-bold text-gray-1000">All-Shops</label>
    <div className="flex items-center gap-2">
      {/* ✅ Import CSV Button */}
      <label className="cursor-pointer text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700">
        <Upload className="w-4 h-4" /> Import CSV
        <input
          type="file"
          accept=".csv"
          onChange={importShops}
          className="hidden"
        />
      </label>

      {/* Existing Add Shop Button */}
      <button
        type="button"
        onClick={addShop}
        className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
      >
        <Plus className="w-4 h-4" /> Add Shop
      </button>
    </div>
  </div>

  <div className=" space-y-4 max-h-90 overflow-y-auto">
    {formData.shops.map((shop, idx) => (
      <div key={idx} className="bg-gray-200 p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Shop {idx + 1}</span>
          <button
            type="button"
            onClick={() => removeShop(idx)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Shop Name *"
          value={shop.shopName}
          onChange={(e) => updateShop(idx, 'shopName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="text"
          placeholder="Address *"
          value={shop.address}
          onChange={(e) => updateShop(idx, 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Contact"
            value={shop.contact}
            onChange={(e) => updateShop(idx, 'contact', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Target Amount"
            value={shop.targetAmount}
            onChange={(e) =>
              updateShop(idx, 'targetAmount', parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    ))}

    {formData.shops.length === 0 && (
      <p className="text-sm text-gray-500 text-center py-4">
        No shops added yet
      </p>
    )}
  </div>
</div>


              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
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
                  {editingRoute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes;