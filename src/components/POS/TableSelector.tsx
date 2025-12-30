import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Table, Order } from '../../types';

interface TableSelectorProps {
  tables: Table[];
  activeOrders: Order[];
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onTableSelect: (tableId: string) => void;
  onOrderSelect: (order: Order) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  activeOrders,
  selectedSection,
  onSectionChange,
  onTableSelect,
  onOrderSelect,
}) => {
  const sections = ['A', 'B', 'C', 'D'];

  const tablesWithOrders = tables.map(table => {
    const order = activeOrders.find(o => o.tableId === table.id);
    return { ...table, order };
  });

  const filteredTables = tablesWithOrders.filter(t => t.section === selectedSection);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => onSectionChange(section)}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              selectedSection === section
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredTables.map(table => (
          <button
            key={table.id}
            onClick={() => {
              if (table.order) {
                onOrderSelect(table.order);
              } else {
                onTableSelect(table.id);
              }
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              table.status === 'occupied'
                ? 'bg-orange-50 border-orange-300 hover:border-orange-400'
                : 'bg-white border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className={`h-5 w-5 ${table.status === 'occupied' ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className="font-bold text-xl">Table {table.number}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                table.status === 'occupied'
                  ? 'bg-orange-200 text-orange-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {table.status === 'occupied' ? 'Occupée' : 'Libre'}
              </span>
            </div>

            {table.order && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{table.order.items.length} article(s)</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(new Date(table.order.createdAt))}</span>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {table.order.total.toLocaleString('fr-FR')} CFA
                  </span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableSelector;
