'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { getMatches, getTeams, getReferees, createMatch, updateMatch, deleteMatch, getMatchStats, createMatchStats, updateMatchStats } from '../../actions/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

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
    corners_away: 0,
    home_score: 0,
    away_score: 0
  });

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchReferees();
  }, []);

  const fetchMatches = async () => {
    try {
      const result = await sql`
        SELECT 
          m.*,
          ht.team_name as home_team_name,
          at.team_name as away_team_name,
          r.first_name as referee_first_name,
          r.last_name as referee_last_name,
          ms.home_score,
          ms.away_score,
          ms.possession_home,
          ms.possession_away,
          ms.fouls_home,
          ms.fouls_away,
          ms.corners_home,
          ms.corners_away
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.team_id
        JOIN teams at ON m.away_team_id = at.team_id
        LEFT JOIN referees r ON m.referee_id = r.referee_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        ORDER BY m.date DESC
      `;
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
    const date = new Date(match.date);
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
    setFormData({
      date: date.toISOString().slice(0, 16),
      location: match.location,
      league_id: match.league_id?.toString() || '',
      home_team_id: match.home_team_id?.toString() || '',
      away_team_id: match.away_team_id?.toString() || '',
      referee_id: match.referee_id?.toString() || ''
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
      // Create a new Date object from the form date
      const formDate = new Date(formData.date);
      // Adjust for timezone offset
      const adjustedDate = new Date(formDate.getTime() - formDate.getTimezoneOffset() * 60000);

      const matchData = {
        date: adjustedDate.toISOString(),
        location: formData.location,
        league_id: formData.league_id ? parseInt(formData.league_id) : null,
        home_team_id: formData.home_team_id ? parseInt(formData.home_team_id) : null,
        away_team_id: formData.away_team_id ? parseInt(formData.away_team_id) : null,
        referee_id: formData.referee_id ? parseInt(formData.referee_id) : null
      };

      if (selectedMatch) {
        await updateMatch({
          match_id: selectedMatch.match_id,
          ...matchData
        });
      } else {
        const matchId = await createMatch(matchData);
        // Create default match stats for the new match
        await createMatchStats({
          match_id: matchId,
          possession_home: 50,
          possession_away: 50,
          fouls_home: 0,
          fouls_away: 0,
          corners_home: 0,
          corners_away: 0,
          home_score: 0,
          away_score: 0
        });
      }
      setIsModalOpen(false);
      setFormData({
        date: '',
        location: '',
        league_id: '',
        home_team_id: '',
        away_team_id: '',
        referee_id: ''
      });
      await fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleViewStats = async (match) => {
    if (!match || !match.match_id) {
      console.error('Invalid match data');
      return;
    }
    setSelectedMatch(match);
    try {
      const stats = await getMatchStats(match.match_id);
      if (stats) {
        setStatsFormData({
          possession_home: stats.possession_home ?? 50,
          possession_away: stats.possession_away ?? 50,
          fouls_home: stats.fouls_home ?? 0,
          fouls_away: stats.fouls_away ?? 0,
          corners_home: stats.corners_home ?? 0,
          corners_away: stats.corners_away ?? 0,
          home_score: stats.home_score ?? 0,
          away_score: stats.away_score ?? 0
        });
      } else {
        setStatsFormData({
          possession_home: 50,
          possession_away: 50,
          fouls_home: 0,
          fouls_away: 0,
          corners_home: 0,
          corners_away: 0,
          home_score: 0,
          away_score: 0
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
      if (selectedMatch && selectedMatch.match_id) {
        const statsData = {
          match_id: selectedMatch.match_id,
          possession_home: parseInt(statsFormData.possession_home) || 0,
          possession_away: parseInt(statsFormData.possession_away) || 0,
          fouls_home: parseInt(statsFormData.fouls_home) || 0,
          fouls_away: parseInt(statsFormData.fouls_away) || 0,
          corners_home: parseInt(statsFormData.corners_home) || 0,
          corners_away: parseInt(statsFormData.corners_away) || 0,
          home_score: parseInt(statsFormData.home_score) || 0,
          away_score: parseInt(statsFormData.away_score) || 0
        };

        const stats = await getMatchStats(selectedMatch.match_id);
        if (stats) {
          await updateMatchStats(statsData);
        } else {
          await createMatchStats(statsData);
        }
        setIsStatsModalOpen(false);
        setStatsFormData({
          possession_home: 50,
          possession_away: 50,
          fouls_home: 0,
          fouls_away: 0,
          corners_home: 0,
          corners_away: 0,
          home_score: 0,
          away_score: 0
        });
        await fetchMatches();
      } else {
        throw new Error('No match selected or invalid match ID');
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
        if (!row.date) return '';
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
    { 
      key: 'score', 
      header: 'Score',
      render: (row) => {
        return `${row.home_score || 0} - ${row.away_score || 0}`;
      }
    },
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
              <label className="block text-sm font-medium text-gray-700">Home Score</label>
              <input
                type="number"
                value={statsFormData.home_score}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, home_score: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Away Score</label>
              <input
                type="number"
                value={statsFormData.away_score}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, away_score: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Possession (%)</label>
              <input
                type="number"
                value={statsFormData.possession_home}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const home = Math.min(100, Math.max(0, value));
                  setStatsFormData({
                    ...statsFormData,
                    possession_home: home,
                    possession_away: 100 - home
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Away Possession (%)</label>
              <input
                type="number"
                value={statsFormData.possession_away}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Fouls</label>
              <input
                type="number"
                value={statsFormData.fouls_home}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, fouls_home: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Away Fouls</label>
              <input
                type="number"
                value={statsFormData.fouls_away}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, fouls_away: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Corners</label>
              <input
                type="number"
                value={statsFormData.corners_home}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, corners_home: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Away Corners</label>
              <input
                type="number"
                value={statsFormData.corners_away}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setStatsFormData({ ...statsFormData, corners_away: value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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