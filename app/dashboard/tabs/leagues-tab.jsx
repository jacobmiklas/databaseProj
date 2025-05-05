'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { getLeagues, createLeague, updateLeague, deleteLeague } from '../../actions/db';

export default function LeaguesTab() {
  const [leagues, setLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const result = await getLeagues();
      setLeagues(result);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedLeague(null);
    setFormData({
      name: '',
      city: '',
      country: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (league) => {
    setSelectedLeague(league);
    setFormData({
      name: league.name,
      city: league.city,
      country: league.country
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (league) => {
    if (window.confirm(`Are you sure you want to delete ${league.name}?`)) {
      try {
        await deleteLeague(league.league_id);
        fetchLeagues();
      } catch (error) {
        console.error('Error deleting league:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLeague) {
        await updateLeague(selectedLeague.league_id, formData);
      } else {
        await createLeague(formData);
      }
      setIsModalOpen(false);
      fetchLeagues();
    } catch (error) {
      console.error('Error saving league:', error);
    }
  };

  const columns = [
    { key: 'name', header: 'League Name' },
    { key: 'city', header: 'City' },
    { key: 'country', header: 'Country' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={leagues}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Leagues"
        searchPlaceholder="Search leagues..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLeague ? 'Edit League' : 'Add League'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">League Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              {selectedLeague ? 'Update' : 'Add'} League
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 