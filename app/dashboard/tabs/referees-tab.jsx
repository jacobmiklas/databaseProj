'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default function RefereesTab() {
  const [referees, setReferees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    certification_level: ''
  });

  useEffect(() => {
    fetchReferees();
  }, []);

  const fetchReferees = async () => {
    try {
      const result = await sql`
        SELECT 
          r.*,
          COUNT(m.match_id) as matches_officiated
        FROM referees r
        LEFT JOIN matches m ON r.referee_id = m.referee_id
        GROUP BY r.referee_id
        ORDER BY r.last_name, r.first_name
      `;
      setReferees(result);
    } catch (error) {
      console.error('Error fetching referees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedReferee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      certification_level: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (referee) => {
    setSelectedReferee(referee);
    setFormData({
      first_name: referee.first_name,
      last_name: referee.last_name,
      email: referee.email,
      phone: referee.phone,
      certification_level: referee.certification_level
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (referee) => {
    if (window.confirm(`Are you sure you want to delete ${referee.first_name} ${referee.last_name}?`)) {
      try {
        await sql`
          DELETE FROM referee
          WHERE referee_id = ${referee.referee_id}
        `;
        fetchReferees();
      } catch (error) {
        console.error('Error deleting referee:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedReferee) {
        await sql`
          UPDATE referee
          SET 
            first_name = ${formData.first_name},
            last_name = ${formData.last_name},
            email = ${formData.email},
            phone = ${formData.phone},
            certification_level = ${formData.certification_level}
          WHERE referee_id = ${selectedReferee.referee_id}
        `;
      } else {
        await sql`
          INSERT INTO referee (
            first_name, last_name, email, phone, certification_level
          ) VALUES (
            ${formData.first_name},
            ${formData.last_name},
            ${formData.email},
            ${formData.phone},
            ${formData.certification_level}
          )
        `;
      }
      setIsModalOpen(false);
      fetchReferees();
    } catch (error) {
      console.error('Error saving referee:', error);
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'matches_officiated', header: 'Matches Officiated' },
    { key: 'certification_level', header: 'Certification Level' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={referees}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Referees"
        searchPlaceholder="Search referees..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedReferee ? 'Edit Referee' : 'Add Referee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Certification Level</label>
            <select
              value={formData.certification_level}
              onChange={(e) => setFormData({ ...formData, certification_level: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select certification level</option>
              <option value="FIFA">FIFA</option>
              <option value="National">National</option>
              <option value="Regional">Regional</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {selectedReferee ? 'Update' : 'Add'} Referee
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 