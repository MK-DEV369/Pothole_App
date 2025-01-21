import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PotholeReport } from '../types/database.types';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Map from './Map';

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'in-progress' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pothole_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: PotholeReport['status']) => {
    try {
      await supabase
        .from('pothole_reports')
        .update({ status })
        .eq('id', id);

      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, [fetchReports]);

  const getStatusIcon = useCallback((status: PotholeReport['status']) => {
    switch (status) {
      case 'reported':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">BBMP Admin Dashboard</h1>
        
        <div className="mb-6">
          <div className="flex space-x-4">
            {['all', 'reported', 'in-progress', 'resolved'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as 'all' | 'reported' | 'in-progress' | 'resolved')}
                className={`px-4 py-2 rounded-full ${
                  filter === filterOption
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                } transition-colors duration-200`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Map reports={reports} filter={filter} />

        <div className="mt-8 space-y-6">
          {loading ? (
            <p>Loading reports...</p>
          ) : (
            reports
              .filter((report) => filter === 'all' || report.status === filter)
              .map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-[1.02] animate-slideIn"
                >
                  <div className="flex justify-between items-center mt-4">
                    <span>Status:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span>{report.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => updateStatus(report.id, 'in-progress')}
                      disabled={report.status !== 'reported'}
                      className={`px-4 py-2 rounded-full ${report.status === 'reported' ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-500'} transition-colors duration-200`}
                    >
                      Mark as In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      disabled={report.status !== 'in-progress'}
                      className={`px-4 py-2 rounded-full ${report.status === 'in-progress' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'} transition-colors duration-200`}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;