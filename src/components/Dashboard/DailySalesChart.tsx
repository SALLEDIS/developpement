import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import Card from '../ui/Card';

interface DailySalesChartProps {
  salesData: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

const DailySalesChart: React.FC<DailySalesChartProps> = ({ salesData }) => {
  const maxSales = Math.max(...salesData.map(d => d.sales));
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const averageSales = totalSales / salesData.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Ventes des 7 derniers jours
        </h3>
        <div className="text-sm text-gray-600">
          Moyenne: {averageSales.toLocaleString('fr-FR')} CFA
        </div>
      </div>

      <div className="space-y-3">
        {salesData.map((day, index) => {
          const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
          const isToday = index === salesData.length - 1;
          const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
          
          return (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    isToday ? 'text-blue-600' : 
                    isWeekend ? 'text-purple-600' : 'text-gray-900'
                  }`}>
                    {new Date(day.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  {isToday && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
                  {isWeekend && !isToday && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Weekend</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{day.orders} cmd</span>
                  <span className="font-semibold">{day.sales.toLocaleString('fr-FR')} CFA</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isToday ? 'bg-blue-600' :
                    day.sales > averageSales ? 'bg-green-600' :
                    day.sales > 0 ? 'bg-amber-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{totalSales.toLocaleString('fr-FR')}</div>
            <div className="text-xs text-gray-600">Total 7 jours</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{salesData.reduce((sum, d) => sum + d.orders, 0)}</div>
            <div className="text-xs text-gray-600">Commandes totales</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{Math.max(...salesData.map(d => d.sales)).toLocaleString('fr-FR')}</div>
            <div className="text-xs text-gray-600">Meilleur jour</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailySalesChart;