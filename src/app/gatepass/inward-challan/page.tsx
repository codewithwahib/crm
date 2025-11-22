'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-bold">Something went wrong.</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Interfaces - Updated to match Sanity schema
interface OutwardItem {
  serialNumber: number;
  description: string;
  width: number;
  length: number;
  qty: number; // Product quantity (for calculation)
  receivedQty: number;
  remainingQty: number;
  sqft: number;
  ratePerSqft: number;
  rate: number;
  amount: number;
}

interface OutwardChallan {
  _id: string;
  autoChallanNumber: string;
  date: string;
  workOrderNumber: string;
  paintColor: string;
  items: OutwardItem[];
  totalPieces: number; // Total physical pieces
  totalReceivedPieces: number;
  totalRemainingPieces: number;
  totalAmount: number;
  summary?: string;
}

interface InwardItem {
  serialNumber: number;
  description: string;
  width: number;
  length: number;
  qty: number; // Product quantity (for calculation - DO NOT EDIT)
  availableQty: number; // Available physical pieces from outward
  receivedQty: number; // Received physical pieces (editable)
  remainingQty: number; // Remaining physical pieces (auto-calculated)
  sqft: number;
  ratePerSqft: number;
  rate: number;
  amount: number;
}

interface InwardChallanFormData {
  _type: 'inwardChallan';
  autoChallanNumber: string;
  outwardChallanNumber: string;
  date: string;
  time: string;
  workOrderNumber: string;
  paintColor: string;
  items: InwardItem[];
  totalPieces: number; // Total physical pieces (auto-calculated)
  totalReceivedPieces: number; // Total received physical pieces (EDITABLE)
  totalRemainingPieces: number; // Total remaining physical pieces (auto-calculated)
  totalAmount: number;
  summary?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Main Component
function NewInwardChallanContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOutwardChallans, setIsLoadingOutwardChallans] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [outwardChallans, setOutwardChallans] = useState<OutwardChallan[]>([]);
  const [selectedOutwardChallan, setSelectedOutwardChallan] = useState<OutwardChallan | null>(null);
  
  const [formData, setFormData] = useState<InwardChallanFormData>({
    _type: 'inwardChallan',
    autoChallanNumber: '',
    outwardChallanNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }),
    workOrderNumber: '',
    paintColor: 'RAL 7035',
    items: [],
    totalPieces: 0,
    totalReceivedPieces: 0,
    totalRemainingPieces: 0,
    totalAmount: 0,
    summary: ''
  });

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add notification
  const addNotification = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  // Load outward challans
  useEffect(() => {
    const loadOutwardChallans = async () => {
      setIsLoadingOutwardChallans(true);
      try {
        const response = await fetch('/api/outward-challan');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success) {
          const challans = data.data || [];
          
          // Filter only challans that have remaining pieces
          const challansWithRemaining = challans.filter((challan: OutwardChallan) => 
            challan.totalRemainingPieces > 0
          );
          
          // Remove duplicate challans based on autoChallanNumber
          const uniqueChallans = challansWithRemaining.reduce((acc: OutwardChallan[], current: OutwardChallan) => {
            const exists = acc.find(challan => challan.autoChallanNumber === current.autoChallanNumber);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          console.log('✅ Loaded unique challans with remaining pieces:', uniqueChallans.length);
          setOutwardChallans(uniqueChallans);
          
          if (uniqueChallans.length === 0) {
            addNotification('info', 'No outward challans with remaining pieces found');
          }
        } else {
          addNotification('error', data.error || 'Failed to load outward challans');
        }
      } catch (error) {
        console.error('❌ Error loading outward challans:', error);
        addNotification('error', 'Error loading outward challans. Please check console for details.');
      } finally {
        setIsLoadingOutwardChallans(false);
      }
    };

    loadOutwardChallans();
  }, [addNotification]);

  // Generate inward challan number
  useEffect(() => {
    const generateChallanNumber = async () => {
      try {
        const response = await fetch('/api/inward-challan?action=getNextNumber');
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

  // Handle outward challan selection
  const handleOutwardChallanSelect = (challanNumber: string) => {
    console.log('🎯 Selected challan number:', challanNumber);
    
    const selected = outwardChallans.find(challan => challan.autoChallanNumber === challanNumber);
    
    if (selected) {
      setSelectedOutwardChallan(selected);
      
      // Convert outward items to inward items
      const inwardItems: InwardItem[] = selected.items.map(item => ({
        serialNumber: item.serialNumber,
        description: item.description,
        width: item.width,
        length: item.length,
        qty: item.qty, // Product quantity - DO NOT EDIT (for calculation purposes)
        availableQty: item.remainingQty, // Available physical pieces from outward
        receivedQty: 0, // Received physical pieces - editable
        remainingQty: item.remainingQty, // Remaining physical pieces - auto-calculated
        sqft: item.sqft,
        ratePerSqft: item.ratePerSqft,
        rate: item.rate,
        amount: item.amount
      }));

      console.log('🔄 Converted inward items:', inwardItems);

      // Calculate initial totals based on physical pieces
      const totalReceivedPieces = 0;
      const totalRemainingPieces = selected.totalRemainingPieces;
      const totalPieces = totalReceivedPieces + totalRemainingPieces;

      setFormData(prev => ({
        ...prev,
        outwardChallanNumber: challanNumber,
        workOrderNumber: selected.workOrderNumber,
        paintColor: selected.paintColor,
        items: inwardItems,
        totalPieces, // Physical pieces total
        totalReceivedPieces, // Physical pieces received
        totalRemainingPieces, // Physical pieces remaining
        totalAmount: 0,
        summary: selected.summary || `Inward for ${challanNumber}`
      }));
      
      addNotification('success', `Outward challan ${challanNumber} loaded successfully`);
    } else {
      console.log('❌ No challan found with number:', challanNumber);
      addNotification('error', `Outward challan ${challanNumber} not found`);
    }
  };

  // Handle total received pieces change (EDITABLE)
  const handleTotalReceivedPiecesChange = (value: number) => {
    const totalReceived = Math.max(0, value);
    const totalRemaining = formData.totalPieces - totalReceived;
    
    setFormData(prev => ({
      ...prev,
      totalReceivedPieces: totalReceived,
      totalRemainingPieces: Math.max(0, totalRemaining)
    }));
  };

  // Handle total remaining pieces change (EDITABLE)
  const handleTotalRemainingPiecesChange = (value: number) => {
    const totalRemaining = Math.max(0, value);
    const totalReceived = formData.totalPieces - totalRemaining;
    
    setFormData(prev => ({
      ...prev,
      totalRemainingPieces: totalRemaining,
      totalReceivedPieces: Math.max(0, totalReceived)
    }));
  };

  // Recalculate totals whenever items change - ONLY FOR PHYSICAL PIECES
  useEffect(() => {
    if (formData.items.length > 0) {
      // Calculate based on PHYSICAL PIECES only (not product qty)
      const totalReceivedPieces = formData.items.reduce((total, item) => total + item.receivedQty, 0);
      const totalRemainingPieces = formData.items.reduce((total, item) => total + item.remainingQty, 0);
      const totalPieces = totalReceivedPieces + totalRemainingPieces;
      
      // Calculate amount based on PRODUCT QUANTITY (qty) for calculation
      const totalAmount = formData.items.reduce((total, item) => {
        if (item.receivedQty > 0) {
          // Use product quantity (qty) for rate calculation, but receivedQty for piece count
          const itemRatePerPiece = item.amount / item.qty; // Rate per piece based on product qty
          return total + (itemRatePerPiece * item.receivedQty);
        }
        return total;
      }, 0);

      setFormData(prev => ({
        ...prev,
        totalPieces, // Physical pieces
        totalReceivedPieces, // Physical pieces
        totalRemainingPieces, // Physical pieces
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }));
    }
  }, [formData.items]);

  const handleInputChange = (field: keyof InwardChallanFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InwardItem, value: string | number) => {
    const updatedItems = [...formData.items];
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    
    if (field === 'receivedQty') {
      // Received Qty is for PHYSICAL PIECES - validate against available physical pieces
      const maxAllowed = updatedItems[index].availableQty;
      const receivedQty = Math.max(0, Math.min(numValue, maxAllowed));
      
      updatedItems[index] = {
        ...updatedItems[index],
        receivedQty: receivedQty,
        // Auto-calculate remaining PHYSICAL pieces
        remainingQty: updatedItems[index].availableQty - receivedQty
      };
      
      // Show warning if trying to receive more than available
      if (numValue > maxAllowed) {
        addNotification('warning', `Cannot receive more than available pieces (${maxAllowed}) for item ${index + 1}`);
      }
    } else {
      // For other fields, just update the value
      // Note: qty (product quantity) should not be editable here
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Handle bulk received quantity update for PHYSICAL PIECES
  const handleBulkReceivedUpdate = (receivedQty: number) => {
    if (!selectedOutwardChallan) return;

    const updatedItems = formData.items.map(item => {
      const received = Math.max(0, Math.min(receivedQty, item.availableQty));
      return {
        ...item,
        receivedQty: received, // Physical pieces
        remainingQty: item.availableQty - received // Physical pieces
      };
    });

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    addNotification('info', `Updated all items to receive ${receivedQty} pieces each`);
  };

  // Updated function to include total received pieces in outward challan update
  const updateOutwardChallanReceivedQuantities = async (): Promise<boolean> => {
    if (!selectedOutwardChallan) {
      addNotification('error', 'No outward challan selected');
      return false;
    }

    try {
      // Prepare the received items data for outward challan update
      const receivedItems = formData.items
        .filter(item => item.receivedQty > 0)
        .map(item => ({
          serialNumber: item.serialNumber,
          receivedQty: item.receivedQty // Physical pieces
        }));

      if (receivedItems.length === 0) {
        addNotification('error', 'No items with received quantity > 0');
        return false;
      }

      const updateData = {
        outwardChallanId: selectedOutwardChallan._id,
        receivedItems: receivedItems,
        totalReceivedPieces: formData.totalReceivedPieces, // Physical pieces - ADDED
        totalRemainingPieces: formData.totalRemainingPieces // Physical pieces - ADDED
      };

      console.log('🔄 Updating outward challan with:', updateData);

      const response = await fetch('/api/outward-challan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Outward challan updated successfully:', result);
        addNotification('success', `Outward challan updated with ${formData.totalReceivedPieces} received pieces. Remaining: ${formData.totalRemainingPieces} pieces`);
        return true;
      } else {
        console.error('❌ Outward challan update failed:', result.error);
        addNotification('error', `Outward challan update failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating outward challan:', error);
      addNotification('error', 'Error updating outward challan');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!formData.outwardChallanNumber.trim()) {
      addNotification('error', 'Please select an outward challan');
      return;
    }
    
    if (formData.totalReceivedPieces <= 0) {
      addNotification('error', 'Total Received Pieces must be greater than 0');
      return;
    }

    // Validate that received quantities don't exceed available quantities
    const hasInvalidReceivedQty = formData.items.some(item => 
      item.receivedQty < 0 || item.receivedQty > item.availableQty
    );
    if (hasInvalidReceivedQty) {
      addNotification('error', 'Received pieces cannot exceed available pieces for any item');
      return;
    }

    // Validate we're not receiving more than outward's remaining PHYSICAL pieces
    const totalReceiving = formData.items.reduce((total, item) => total + item.receivedQty, 0);
    const outwardRemaining = selectedOutwardChallan?.totalRemainingPieces || 0;
    
    if (totalReceiving > outwardRemaining) {
      addNotification('error', `Cannot receive ${totalReceiving} pieces. Only ${outwardRemaining} pieces remaining in outward challan.`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Submitting inward challan data:', formData);

      // First update the outward challan with received quantities
      const outwardUpdateSuccess = await updateOutwardChallanReceivedQuantities();
      
      if (!outwardUpdateSuccess) {
        addNotification('error', 'Failed to update outward challan. Cannot proceed.');
        setIsSubmitting(false);
        return;
      }

      // Then create the inward challan
      const response = await fetch('/api/inward-challan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addNotification('success', 'Inward challan created successfully!');
        
        setTimeout(() => {
          router.push('/inward-challan');
        }, 1500);
      } else {
        addNotification('error', `Error: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      addNotification('error', 'Error creating inward challan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalSqft = () => {
    return formData.items.reduce((total, item) => {
      if (item.receivedQty > 0) {
        return total + (item.sqft || 0);
      }
      return total;
    }, 0);
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
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
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
      case 'warning':
        return '⚠️';
      default:
        return '💡';
    }
  };

  return (
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

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Inward Challan</h1>
      
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
              Select Outward Challan *
            </label>
            <select
              value={formData.outwardChallanNumber}
              onChange={(e) => handleOutwardChallanSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
              disabled={isLoadingOutwardChallans}
            >
              <option value="">Select Outward Challan</option>
              {isLoadingOutwardChallans ? (
                <option value="" disabled>Loading outward challans...</option>
              ) : outwardChallans.length === 0 ? (
                <option value="" disabled>No outward challans with remaining pieces</option>
              ) : (
                outwardChallans.map((challan) => (
                  <option 
                    key={`${challan.autoChallanNumber}-${challan._id}`} 
                    value={challan.autoChallanNumber}
                  >
                    {challan.autoChallanNumber} - {challan.workOrderNumber} - Remaining: {challan.totalRemainingPieces} pieces
                  </option>
                ))
              )}
            </select>
            {isLoadingOutwardChallans && (
              <p className="text-xs text-gray-500 mt-1">Loading outward challans...</p>
            )}
            {!isLoadingOutwardChallans && outwardChallans.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No outward challans with remaining pieces found.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Inward Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Inward Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Work Order Number
            </label>
            <input
              type="text"
              value={formData.workOrderNumber}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Paint Color Number
            </label>
            <input
              type="text"
              value={formData.paintColor}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
            />
          </div>

          {/* Auto-calculated totals - Read Only - ALL FOR PHYSICAL PIECES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Total Pieces
            </label>
            <input
              type="number"
              value={formData.totalPieces}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-1">Physical pieces (Received + Remaining)</p>
          </div>

          {/* Total Received Pieces - EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Total Received Pieces *
            </label>
            <input
              type="number"
              min="0"
              max={formData.totalPieces}
              value={formData.totalReceivedPieces}
              onChange={(e) => handleTotalReceivedPiecesChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider bg-green-50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter total received pieces manually</p>
          </div>

          {/* Total Remaining Pieces - EDITABLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Total Remaining Pieces *
            </label>
            <input
              type="number"
              min="0"
              readOnly
              max={formData.totalPieces}
              value={formData.totalRemainingPieces}
              onChange={(e) => handleTotalRemainingPiecesChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider bg-yellow-50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter total remaining pieces manually</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
              Total Amount (Rs)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount.toFixed(2)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-1">Based on received pieces</p>
          </div>
        </div>

        {/* Bulk Action */}
        {selectedOutwardChallan && formData.items.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Bulk Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleBulkReceivedUpdate(1)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                Set All to 1
              </button>
              <button
                type="button"
                onClick={() => handleBulkReceivedUpdate(0)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <div className="text-xs text-blue-600 mt-1">
                Quick set received quantities for all items
              </div>
            </div>
          </div>
        )}

        {/* Items Section - Only show if outward challan is selected */}
        {selectedOutwardChallan && formData.items && formData.items.length > 0 ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 tracking-wider">
                Inward Items (From {formData.outwardChallanNumber})
              </h2>
              <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded border border-yellow-200">
                Available: {selectedOutwardChallan.totalRemainingPieces} pieces
              </div>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50 border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700 tracking-wider">Item #{item.serialNumber}</h3>
                  <div className="text-sm text-gray-600">
                    Product Qty: <strong>{item.qty}</strong> | Available: <strong className="text-blue-600">{item.availableQty}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                    />
                  </div>

                  {/* Product Quantity - Read Only (for calculation) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Product Quantity
                    </label>
                    <input
                      type="number"
                      value={item.qty}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-purple-50 tracking-wider"
                    />
                    <p className="text-xs text-gray-500 mt-1">For calculation only - DO NOT EDIT</p>
                  </div>

                  {/* Available Qty - Read Only (from outward) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Available Pieces
                    </label>
                    <input
                      type="number"
                      value={item.availableQty}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 tracking-wider"
                    />
                    <p className="text-xs text-gray-500 mt-1">Physical pieces available</p>
                  </div>

                  {/* Received Qty - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Received Pieces *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={item.availableQty}
                      value={item.receivedQty}
                      onChange={(e) => handleItemChange(index, 'receivedQty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider bg-green-50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Max: {item.availableQty} pieces</p>
                  </div>

                  {/* Remaining Qty - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Remaining Pieces
                    </label>
                    <input
                      type="number"
                      value={item.remainingQty}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-50 tracking-wider"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto: Available - Received</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={item.width}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Length (mm)
                    </label>
                    <input
                      type="number"
                      value={item.length}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Rate Per SQFT (Rs)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.ratePerSqft}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 tracking-wider">
                      Item Amount (Rs)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.receivedQty > 0 ? (item.amount / item.qty * item.receivedQty).toFixed(2) : '0.00'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 tracking-wider"
                    />
                    <p className="text-xs text-gray-500 mt-1">For received pieces</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedOutwardChallan ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No items found in the selected outward challan.</p>
          </div>
        ) : null}

        {/* Challan Summary */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
            Challan Summary / Remarks
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md tracking-wider"
            placeholder="General summary or remarks for this inward challan"
          />
        </div>

        {/* Totals Display */}
        {selectedOutwardChallan && (
          <div className="bg-[#8B5E3C] bg-opacity-10 p-4 rounded-lg mb-6 border border-[#8B5E3C] border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-800 tracking-wider">
              <div className="font-medium">
                <strong>Total SQFT:</strong> {calculateTotalSqft().toFixed(2)}
              </div>
              <div className="font-medium">
                <strong>Total Pieces:</strong> {formData.totalPieces}
              </div>
              <div className="font-medium">
                <strong>Total Received:</strong> {formData.totalReceivedPieces}
              </div>
              <div className="font-medium">
                <strong>Total Remaining:</strong> {formData.totalRemainingPieces}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#8B5E3C] border-opacity-20">
              <div className="font-bold text-lg">
                <strong>Total Amount:</strong> Rs.{formData.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || !selectedOutwardChallan || formData.totalReceivedPieces === 0}
            className="bg-[#8B5E3C] text-white px-6 py-2 rounded-md hover:bg-[#7A4F32] disabled:bg-[#8B5E3C] disabled:opacity-50 transition-colors tracking-wider font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create Inward Challan'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewInwardChallanPage() {
  return (
    <ErrorBoundary>
      <NewInwardChallanContent />
    </ErrorBoundary>
  );
}