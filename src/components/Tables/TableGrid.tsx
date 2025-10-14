import React from 'react';
import { Users, Clock, CheckCircle, Settings } from 'lucide-react';
import Card from '../ui/Card';
import { Table } from '../../types';

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'maintenance':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5" />;
      case 'occupied':
        return <Users className="h-5 w-5" />;
      case 'reserved':
        return <Clock className="h-5 w-5" />;
      case 'maintenance':
        return <Settings className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'disponible';
      case 'occupied':
        return 'occupée';
      case 'reserved':
        return 'réservée';
      case 'maintenance':
        return 'maintenance';
      default:
        return status;
    }
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case 'Main':
        return 'Principale';
      case 'Terrace':
        return 'Terrasse';
      case 'Private':
        return 'Privée';
      default:
        return section;
    }
  };

  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.section]) {
      acc[table.section] = [];
    }
    acc[table.section].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTables).map(([section, sectionTables]) => (
        <Card key={section}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section {getSectionName(section)}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sectionTables.map((table) => (
              <button
                key={table.id}
                onClick={() => onTableClick(table)}
                className={`p-4 rounded-lg border-2 transition-colors hover:shadow-md ${getStatusColor(table.status)}`}
              >
                <div className="flex flex-col items-center">
                  {getStatusIcon(table.status)}
                  <span className="font-semibold mt-2">Table {table.number}</span>
                  <span className="text-sm">{table.capacity} places</span>
                  <span className="text-xs mt-1 capitalize">{getStatusText(table.status)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TableGrid;