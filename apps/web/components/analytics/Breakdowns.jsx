import React from 'react';
import { Card } from '../ui/Card';
import { Globe, Smartphone, Compass } from 'lucide-react';
export function BreakdownCard({ title, items, emptyMessage = 'No data available', icon, }) {
    return (<Card className="p-5 flex-1">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</h4>
      </div>

      {items.length === 0 ? (<p className="text-xs text-gray-400 py-6 text-center">{emptyMessage}</p>) : (<div className="space-y-3">
          {items.map((item, index) => (<div key={index} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-gray-700">
                <span className="truncate max-w-[180px]">{item.name}</span>
                <span className="text-gray-500 font-mono">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(item.percentage, 3)}%` }}/>
              </div>
            </div>))}
        </div>)}
    </Card>);
}
export function ReferrerList({ items }) {
    return (<BreakdownCard title="Top Referrers" items={items} icon={<Globe className="w-4 h-4 text-brand-500"/>} emptyMessage="No referrer information yet"/>);
}
export function DeviceBreakdown({ items }) {
    return (<BreakdownCard title="Device Breakdown" items={items} icon={<Smartphone className="w-4 h-4 text-brand-500"/>} emptyMessage="No device data available"/>);
}
export function BrowserBreakdown({ items }) {
    return (<BreakdownCard title="Browser Breakdown" items={items} icon={<Compass className="w-4 h-4 text-brand-500"/>} emptyMessage="No browser data available"/>);
}
