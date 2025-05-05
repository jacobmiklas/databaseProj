'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { getMatches, getTeams, getReferees, createMatch, updateMatch, deleteMatch } from '../../actions/db';

export default function MatchesTab() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [referees, setReferees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    location: '',
    referee_id: '',
    home_team_score: 0,
    away_team_score: 0
  });

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchReferees();
  }, []);

  const fetchMatches = async () => {
    try {
      const result = await getMatches();
      setMatches(result);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const result = await getTeams();
      setTeams(result);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchReferees = async () => {
    try {
      const result = await getReferees();
      setReferees(result);
    } catch (error) {
      console.error('Error fetching referees:', error);
    }
  };

  const handleAdd = () => {
    setSelectedMatch(null);
    setFormData({
      home_team_id: '',
      away_team_id: '',
      date: '',
      location: '',
      referee_id: '',
      home_team_score: 0,
      away_team_score: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setFormData({
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      date: match.date,
      location: match.location,
      referee_id: match.referee_id,
      home_team_score: match.home_team_score || 0,
      away_team_score: match.away_team_score || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (match) => {
    if (window.confirm(`Are you sure you want to delete the match between ${match.home_team_name} and ${match.away_team_name}?`)) {
      try {
        await deleteMatch(match.match_id);
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMatch) {
        await updateMatch(selectedMatch.match_id, formData);
      } else {
        await createMatch(formData);
      }
      setIsModalOpen(false);
      fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'location', header: 'Location' },
    { key: 'home_team_name', header: 'Home Team' },
    { key: 'away_team_name', header: 'Away Team' },
    { key: 'referee_name', header: 'Referee' },
    { key: 'home_team_score', header: 'Home Score' },
    { key: 'away_team_score', header: 'Away Score' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={matches}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Matches"
        searchPlaceholder="Search matches..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMatch ? 'Edit Match' : 'Add Match'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Home Team</label>
            <select
              value={formData.home_team_id}
              onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Home Team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Away Team</label>
            <select
              value={formData.away_team_id}
              onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Away Team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Referee</label>
            <select
              value={formData.referee_id}
              onChange={(e) => setFormData({ ...formData, referee_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Referee</option>
              {referees.map((referee) => (
                <option key={referee.referee_id} value={referee.referee_id}>
                  {referee.referee_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Team Score</label>
            <input
              type="number"
              value={formData.home_team_score}
              onChange={(e) => setFormData({ ...formData, home_team_score: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Away Team Score</label>
            <input
              type="number"
              value={formData.away_team_score}
              onChange={(e) => setFormData({ ...formData, away_team_score: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="0"
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
              {selectedMatch ? 'Update' : 'Add'} Match
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 