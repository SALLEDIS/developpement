import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';

interface CategoryPerformanceProps {
  categoryStats: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ categoryStats }) => {
  const totalRevenue = categoryStats.reduce((sum, cat) => sum + cat.revenue, 0);
  const totalQuantity = categoryStats.reduce((sum, cat) => sum + cat.quantity, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Performance par catégorie
        </h3>
        <div className="text-sm text-gray-600">
          Aujourd'hui
        </div>
      </div>

      {categoryStats.length > 0 ? (
        <div className="space-y-3">
          {categoryStats.slice(0, 5).map((category, index) => {
            const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-green-600' :
                      index === 1 ? 'bg-blue-600' :
                      index === 2 ? 'bg-purple-600' :
                      index === 3 ? 'bg-amber-600' :
                      'bg-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    {index === 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {category.revenue.toLocaleString('fr-FR')} CFA
                    </div>
                    <div className="text-xs text-gray-600">{category.quantity} articles</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-green-600' :
                      index === 1 ? 'bg-blue-600' :
                      index === 2 ? 'bg-purple-600' :
                      index === 3 ? 'bg-amber-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}% du CA</span>
                  <span>{((category.quantity / totalQuantity) * 100).toFixed(1)}% des articles</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Aucune vente aujourd'hui</p>
        </div>
      )}

      {categoryStats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{totalRevenue.toLocaleString('fr-FR')}</div>
              <div className="text-xs text-gray-600">Chiffre d'affaires</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{totalQuantity}</div>
              <div className="text-xs text-gray-600">Articles vendus</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CategoryPerformance;