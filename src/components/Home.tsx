import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import Map from './Map';

const ReportHistory: React.FC = () => {
  const reports = [
    { id: 1, description: "Large pothole on HSR Layout 2nd Sector", severity: "high", date: "2024-05-01", user_id: 1, latitude: 12.925370, longitude: 77.616423, status: "in-progress" },
    { id: 2, description: "Small crack on Puneeth-Rajkumar Main Road", severity: "low", date: "2024-05-02", user_id: 2, latitude: 12.935933, longitude: 77.535420, status: "reported" },
    { id: 3, description: "Deep pothole near Puttenahalli", severity: "medium", date: "2024-05-03", user_id: 3, latitude: 12.892166, longitude: 77.581895, status: "resolved" },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen overflow-hidden">
      <h1 className="text-xl text-center font-semibold mb-4">Potholes Reported:</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-2">
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="border-b pb-3">
                <div className="flex items-start mb-1">
                  <div className={`w-4 h-4 rounded-full mr-2 ${report.severity === 'high' ? 'bg-red-500' : report.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-base">{report.description}</p>
                    <p className="text-xs text-gray-500">Reported on: {report.date}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="self-center">
          <Link 
            to="/report" 
            className="group flex justify-center items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold hover:from-amber-500 hover:to-amber-700 transition-colors duration-300 ease-in-out"
          >
            <Briefcase className="h-4 w-4 group-hover:animate-bounce" />Report Pothole
          </Link>
          <p className="mt-1 text-xs text-gray-500">Help us identify road hazards in your area.</p>
        </div>

        {/* Reported Potholes Map */}
        <div className="col-span-full self-center mt-4">
          <h2 className="text-lg text-center font-semibold mb-2">Reported Potholes Map</h2>
          <div className="bg-gray-200 rounded-lg p-2">
            <Map reports={reports} filter="all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHistory;