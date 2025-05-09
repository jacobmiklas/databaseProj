'use client';

import { useState } from 'react';

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onAdd,
  onViewStats,
  onSchedule,
  title,
  searchPlaceholder = "Search...",
  filterComponent
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Generate a unique key for a row based on its content
  const generateRowKey = (row, index) => {
    // First try to use any available ID fields
    const idField = row.id || row.match_id || row.player_id || row.team_id || row.league_id || row.referee_id;
    if (idField) {
      return `row-${idField}`;
    }

    // If no ID is available, create a key from the row's content
    const contentKey = columns
      .map(col => String(row[col.key] || ''))
      .filter(Boolean)
      .join('-');
    
    // If we have content, use it with the index as a fallback
    return contentKey ? `row-${contentKey}-${index}` : `row-${index}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded w-full max-w-md"
          />
          {filterComponent}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || onViewStats || onSchedule) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, index) => {
              const rowKey = generateRowKey(row, index);
              return (
                <tr key={rowKey}>
                  {columns.map((column) => (
                    <td key={`${rowKey}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onViewStats || onSchedule) && (
                    <td key={`${rowKey}-actions`} className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onSchedule && (
                        <button
                          onClick={() => onSchedule(row)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          Schedule
                        </button>
                      )}
                      {onViewStats && (
                        <button
                          onClick={() => onViewStats(row)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Stats
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
