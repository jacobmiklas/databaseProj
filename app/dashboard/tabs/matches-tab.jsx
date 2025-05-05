'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { getMatches, getTeams, getReferees, createMatch, updateMatch, deleteMatch, getMatchStats, createMatchStats, updateMatchStats } from '../../actions/db';

export default function MatchesTab() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [referees, setReferees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    league_id: '',
    home_team_id: '',
    away_team_id: '',
    referee_id: ''
  });
  const [statsFormData, setStatsFormData] = useState({
    possession_home: 50,
    possession_away: 50,
    fouls_home: 0,
    fouls_away: 0,
    corners_home: 0,
    corners_away: 0
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
      date: '',
      location: '',
      league_id: '',
      home_team_id: '',
      away_team_id: '',
      referee_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setFormData({
      date: new Date(match.date).toISOString().slice(0, 16),
      location: match.location,
      league_id: match.league_id,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      referee_id: match.referee_id
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

  const handleViewStats = async (match) => {
    setSelectedMatch(match);
    try {
      const stats = await getMatchStats(match.match_id);
      if (stats && stats.length > 0) {
        setStatsFormData(stats[0]);
      } else {
        setStatsFormData({
          possession_home: 50,
          possession_away: 50,
          fouls_home: 0,
          fouls_away: 0,
          corners_home: 0,
          corners_away: 0
        });
      }
      setIsStatsModalOpen(true);
    } catch (error) {
      console.error('Error fetching match stats:', error);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMatch) {
        const stats = await getMatchStats(selectedMatch.match_id);
        if (stats && stats.length > 0) {
          await updateMatchStats(selectedMatch.match_id, statsFormData);
        } else {
          await createMatchStats({
            match_id: selectedMatch.match_id,
            ...statsFormData
          });
        }
        setIsStatsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving match stats:', error);
    }
  };

  const columns = [
    { 
      key: 'date', 
      header: 'Date',
      render: (row) => {
        const date = new Date(row.date);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    { key: 'location', header: 'Location' },
    { key: 'home_team_name', header: 'Home Team' },
    { key: 'away_team_name', header: 'Away Team' },
    { 
      key: 'referee', 
      header: 'Referee',
      render: (row) => `${row.referee_first_name} ${row.referee_last_name}`
    }
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
        onViewStats={handleViewStats}
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
                  {referee.first_name} {referee.last_name}
                </option>
              ))}
            </select>
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

      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="Match Statistics"
      >
        <form onSubmit={handleStatsSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Team Possession (%)</label>
              <input
                type="number"
                value={statsFormData.possession_home}
                onChange={(e) => setStatsFormData({ ...statsFormData, possession_home: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Away Team Possession (%)</label>
              <input
                type="number"
                value={statsFormData.possession_away}
                onChange={(e) => setStatsFormData({ ...statsFormData, possession_away: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Home Team Fouls</label>
              <input
                type="number"
                value={statsFormData.fouls_home}
                onChange={(e) => setStatsFormData({ ...statsFormData, fouls_home: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Away Team Fouls</label>
              <input
                type="number"
                value={statsFormData.fouls_away}
                onChange={(e) => setStatsFormData({ ...statsFormData, fouls_away: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Home Team Corners</label>
              <input
                type="number"
                value={statsFormData.corners_home}
                onChange={(e) => setStatsFormData({ ...statsFormData, corners_home: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Away Team Corners</label>
              <input
                type="number"
                value={statsFormData.corners_away}
                onChange={(e) => setStatsFormData({ ...statsFormData, corners_away: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Statistics
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 