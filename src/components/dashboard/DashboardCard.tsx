import { LucideIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
}

export default function DashboardCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}: DashboardCardProps) {
  const ChangeIcon = changeType === 'positive' ? TrendingUpIcon : TrendingDownIcon;
  
  return (
    <div
      className="relative overflow-hidden bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-200 group hover:shadow-lg"
      data-testid={`dashboard-card-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-neutral-50/50"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">{title}</p>
            </div>
            <p
              className="text-3xl font-bold text-neutral-900 mt-3 mb-4 group-hover:text-salesforce-600 transition-colors"
              data-testid="card-value"
            >
              {value}
            </p>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <ChangeIcon className="h-3 w-3" />
                <span>{change}</span>
              </div>
              <span className="text-xs text-neutral-500">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
            changeType === 'positive' 
              ? 'bg-green-50 text-green-600 group-hover:bg-green-100' 
              : 'bg-red-50 text-red-600 group-hover:bg-red-100'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
      
      {/* Hover effect bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-salesforce-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}
