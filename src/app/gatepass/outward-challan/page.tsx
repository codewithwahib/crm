'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/app/Components/ProtectedRoute";


interface OutwardItem {
  serialNumber: number;
  description: string;
  width: number;
  length: number;
  qty: number;
  sqft: number;
  ratePerSqft: number;
  rate: number;
  amount: number;
}

interface OutwardChallanFormData {
  autoChallanNumber: string;
  date: string;
  time: string;
  workOrderNumber: string;
  paintColor: string;
  items: OutwardItem[];
  totalPieces: number;
  totalAmount: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export default function NewOutwardChallanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState<OutwardChallanFormData>({
    autoChallanNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }),
    workOrderNumber: '',
    paintColor: 'RAL 7035',
    items: [
      {
        serialNumber: 1,
        description: '',
        width: 0,
        length: 0,
        qty: 1,
        sqft: 0,
        ratePerSqft: 0,
        rate: 0,
        amount: 0
      }
    ],
    totalPieces: 0,
    totalAmount: 0
  });

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add notification
  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  // Reset form to initial state
  const resetForm = async () => {
    try {
      // Get new challan number
      const response = await fetch('/api/outward-challan?action=getNextNumber');
      const data = await response.json();
      
      const newChallanNumber = data.success && data.nextChallanNumber ? data.nextChallanNumber : '';

      setFormData({
        autoChallanNumber: newChallanNumber,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        workOrderNumber: '',
        paintColor: 'RAL 7035',
        items: [
          {
            serialNumber: 1,
            description: '',
            width: 0,
            length: 0,
            qty: 1,
            sqft: 0,
            ratePerSqft: 0,
            rate: 0,
            amount: 0
          }
        ],
        totalPieces: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  };

  // Calculate next challan number
  useEffect(() => {
    const generateChallanNumber = async () => {
      try {
        const response = await fetch('/api/outward-challan?action=getNextNumber');
        const data = await response.json();
        
        if (data.success && data.nextChallanNumber) {
          setFormData(prev => ({
            ...prev,
            autoChallanNumber: data.nextChallanNumber
          }));
        }
      } catch (error) {
        console.error('Error generating challan number:', error);
        addNotification('error', 'Failed to generate challan number');
      }
    };

    generateChallanNumber();
  }, [addNotification]);

  // Calculate total amount whenever items change
  useEffect(() => {
    const totalAmount = formData.items.reduce((total, item) => total + (item.amount || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      totalAmount
    }));
  }, [formData.items]);

  const handleInputChange = (field: keyof OutwardChallanFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof OutwardItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate SQFT when width or length changes using formula: (length * width) / 625 / 144
    if ((field === 'width' || field === 'length') && updatedItems[index].width > 0 && updatedItems[index].length > 0) {
      const sqft = (updatedItems[index].length * updatedItems[index].width) / 625 / 144;
      updatedItems[index].sqft = parseFloat(sqft.toFixed(2));
    }

    // Calculate rate and amount when any relevant field changes
    if (['width', 'length', 'qty', 'ratePerSqft', 'sqft'].includes(field)) {
      const sqft = updatedItems[index].sqft || 0;
      const qty = updatedItems[index].qty || 0;
      const ratePerSqft = updatedItems[index].ratePerSqft || 0;
      
      // Calculate rate using formula: SQFT × Rate Per SQFT × 2
      updatedItems[index].rate = parseFloat((sqft * ratePerSqft * 2).toFixed(2));
      
      // Calculate amount using formula: Quantity × Rate
      updatedItems[index].amount = parseFloat((qty * updatedItems[index].rate).toFixed(2));
    }

    // Reset calculations if dimensions are cleared
    if ((field === 'width' || field === 'length') && (!updatedItems[index].width || !updatedItems[index].length)) {
      updatedItems[index].sqft = 0;
      updatedItems[index].rate = 0;
      updatedItems[index].amount = 0;
    }

    // Recalculate rate and amount if quantity changes
    if (field === 'qty') {
      if (updatedItems[index].sqft > 0 && updatedItems[index].ratePerSqft > 0) {
        // Recalculate rate (should remain the same as it's based on SQFT and rate per sqft)
        updatedItems[index].rate = parseFloat((updatedItems[index].sqft * updatedItems[index].ratePerSqft * 2).toFixed(2));
        // Recalculate amount based on new quantity
        updatedItems[index].amount = parseFloat((Number(value) * updatedItems[index].rate).toFixed(2));
      } else {
        updatedItems[index].amount = 0;
      }
    }

    // Recalculate rate and amount if rate per sqft changes
    if (field === 'ratePerSqft') {
      if (updatedItems[index].sqft > 0) {
        // Recalculate rate with the new rate per sqft
        updatedItems[index].rate = parseFloat((updatedItems[index].sqft * Number(value) * 2).toFixed(2));
        // Recalculate amount with the new rate
        updatedItems[index].amount = parseFloat((updatedItems[index].qty * updatedItems[index].rate).toFixed(2));
      } else {
        updatedItems[index].rate = 0;
        updatedItems[index].amount = 0;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          serialNumber: prev.items.length + 1,
          description: '',
          width: 0,
          length: 0,
          qty: 1,
          sqft: 0,
          ratePerSqft: 0,
          rate: 0,
          amount: 0
        }
      ]
    }));
    addNotification('info', 'New item added to the list');
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, serialNumber: idx + 1 }));
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      addNotification('info', 'Item removed from the list');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!formData.workOrderNumber.trim()) {
      addNotification('error', 'Work Order Number is required');
      return;
    }
    
    if (!formData.paintColor.trim()) {
      addNotification('error', 'Paint Color is required');
      return;
    }
    
    if (formData.totalPieces <= 0) {
      addNotification('error', 'Total Pieces must be greater than 0');
      return;
    }
    
    // Validate items
    const hasEmptyDescriptions = formData.items.some(item => !item.description.trim());
    if (hasEmptyDescriptions) {
      addNotification('error', 'All items must have a description');
      return;
    }

    const hasInvalidItems = formData.items.some(item => 
      item.width < 0 || item.length < 0 || item.qty < 1 || item.ratePerSqft < 0
    );
    if (hasInvalidItems) {
      addNotification('error', 'Please check all item fields for valid values');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting data:', formData);

      const response = await fetch('/api/outward-challan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addNotification('success', 'Outward challan created successfully!');
        
        // Reset the form after successful submission
        setTimeout(() => {
          resetForm();
        }, 1000);
        
        // Redirect after a slightly longer delay
        setTimeout(() => {
          router.push('/gatepass/outward-challan');
        }, 1500);
      } else {
        addNotification('error', `Error: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error creating outward challan. Please try again.';
      addNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalSqft = () => {
    return formData.items.reduce((total, item) => total + (item.sqft || 0), 0);
  };

  // Notification component styles
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  return (
    <ProtectedRoute allowedUser='="mechanical'>
    <div className="container mx-auto px-4 py-8 font-dm-sans tracking-wider relative">
      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border shadow-lg transition-all duration-300 transform ${getNotificationStyles(notification.type)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <span className="font-medium tracking-wide">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors ml-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Outward Challan</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Auto Challan Number *
            </label>
            <input
              type="text"
              value={formData.autoChallanNumber}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Work Order Number *
            </label>
            <input
              type="text"
              value={formData.workOrderNumber}
              onChange={(e) => handleInputChange('workOrderNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Paint Color *
            </label>
            <input
              type="text"
              value={formData.paintColor}
              onChange={(e) => handleInputChange('paintColor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Total Pieces *
            </label>
            <input
              type="number"
              min="1"
              value={formData.totalPieces || ''}
              onChange={(e) => handleInputChange('totalPieces', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Manually enter total pieces</p>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 tracking-wider">Outward Items</h2>
            <button
              type="button"
              onClick={addNewItem}
              className="bg-[#8B5E3C] text-white px-4 py-2 rounded-md hover:bg-[#7A4F32] transition-colors tracking-wider font-medium"
            >
              Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50 border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700 tracking-wider">Item #{item.serialNumber}</h3>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors tracking-wider"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.width || ''}
                    onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
                    placeholder="Width in millimeters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Length (mm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.length || ''}
                    onChange={(e) => handleItemChange(index, 'length', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
                    placeholder="Length in millimeters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty || 1}
                    onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    SQFT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.sqft}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-1">(Length × Width) / 625 / 144</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Rate Per SQFT (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.ratePerSqft || ''}
                    onChange={(e) => handleItemChange(index, 'ratePerSqft', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Rate (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-1">SQFT × Rate Per SQFT × 2</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                    Amount (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quantity × Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-[#8B5E3C] bg-opacity-10 p-4 rounded-lg mb-6 border border-[#8B5E3C] border-opacity-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 tracking-wider">
            <div className="font-medium">
              <strong>Total SQFT:</strong> {calculateTotalSqft().toFixed(2)}
            </div>
            <div className="font-medium">
              <strong>Total Pieces:</strong> {formData.totalPieces}
            </div>
            <div className="font-medium">
              <strong>Total Amount:</strong> Rs.{formData.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors tracking-wider font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#8B5E3C] text-white px-6 py-2 rounded-md hover:bg-[#7A4F32] disabled:bg-[#8B5E3C] disabled:opacity-50 transition-colors tracking-wider font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create Outward Challan'}
          </button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}