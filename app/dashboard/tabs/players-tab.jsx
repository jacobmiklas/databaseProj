'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { getPlayers, getTeams, createPlayer, updatePlayer, deletePlayer, getPlayerStats, updatePlayerStats } from '../../actions/db';

export default function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    jersey_number: '',
    team_id: ''
  });
  const [statsFormData, setStatsFormData] = useState({
    goals_scored: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const result = await getPlayers();
      console.log('Fetched players:', result); // Add debug log
      setPlayers(result);
    } catch (error) {
      console.error('Error fetching players:', error);
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

  const handleAdd = () => {
    setSelectedPlayer(null);
    setFormData({
      first_name: '',
      last_name: '',
      age: '',
      jersey_number: '',
      team_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      age: player.age,
      jersey_number: player.jersey_number,
      team_id: player.team_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (player) => {
    if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
      try {
        await deletePlayer(player.player_id);
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: parseInt(formData.age),
        jersey_number: parseInt(formData.jersey_number),
        team_id: parseInt(formData.team_id)
      };

      if (selectedPlayer) {
        try {
          await updatePlayer({
            player_id: selectedPlayer.player_id,
            ...playerData
          });
        } catch (error) {
          if (error.message.includes('Jersey number is already taken')) {
            alert('Error: This jersey number is already taken by another player on this team');
            return;
          }
          throw error;
        }
      } else {
        await createPlayer(playerData);
      }
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        age: '',
        jersey_number: '',
        team_id: ''
      });
      await fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Error saving player: ' + error.message);
    }
  };

  const handleViewStats = async (player) => {
    if (!player || !player.player_id) {
      console.error('Invalid player data');
      return;
    }
    setSelectedPlayer(player);
    try {
      const stats = await getPlayerStats(player.player_id);
      if (stats) {
        setStatsFormData({
          goals_scored: stats.goals_scored || 0,
          assists: stats.assists || 0,
          yellow_cards: stats.yellow_cards || 0,
          red_cards: stats.red_cards || 0
        });
      } else {
        setStatsFormData({
          goals_scored: 0,
          assists: 0,
          yellow_cards: 0,
          red_cards: 0
        });
      }
      setIsStatsModalOpen(true);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      const statsData = {
        goals_scored: parseInt(statsFormData.goals_scored) || 0,
        assists: parseInt(statsFormData.assists) || 0,
        yellow_cards: parseInt(statsFormData.yellow_cards) || 0,
        red_cards: parseInt(statsFormData.red_cards) || 0
      };

      await updatePlayerStats(selectedPlayer.player_id, statsData);
      setIsStatsModalOpen(false);
      setStatsFormData({
        goals_scored: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0
      });
      setSelectedPlayer(null);
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  };

  const columns = [
    { 
      header: 'Name',
      key: 'name',
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { header: 'Age', key: 'age' },
    { header: 'Jersey Number', key: 'jersey_number' },
    { header: 'Team', key: 'team_name' },
    { header: 'Goals', key: 'goals_scored' },
    { header: 'Assists', key: 'assists' },
    { header: 'Yellow Cards', key: 'yellow_cards' },
    { header: 'Red Cards', key: 'red_cards' }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={players}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewStats={handleViewStats}
        onAdd={handleAdd}
        title="Players"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlayer ? 'Edit Player' : 'Add Player'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jersey Number</label>
            <input
              type="number"
              value={formData.jersey_number}
              onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Team</label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {selectedPlayer ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title={`${selectedPlayer?.first_name} ${selectedPlayer?.last_name} - Stats`}
      >
        <form onSubmit={handleStatsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Goals Scored</label>
            <input
              type="number"
              value={statsFormData.goals_scored}
              onChange={(e) => setStatsFormData({ ...statsFormData, goals_scored: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assists</label>
            <input
              type="number"
              value={statsFormData.assists}
              onChange={(e) => setStatsFormData({ ...statsFormData, assists: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yellow Cards</label>
            <input
              type="number"
              value={statsFormData.yellow_cards}
              onChange={(e) => setStatsFormData({ ...statsFormData, yellow_cards: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Red Cards</label>
            <input
              type="number"
              value={statsFormData.red_cards}
              onChange={(e) => setStatsFormData({ ...statsFormData, red_cards: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Stats
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 