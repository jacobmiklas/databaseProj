'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    team_id: '',
    position: '',
    jersey_number: '',
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
      const result = await sql`
        SELECT 
          p.*,
          t.team_name,
          t.league_id
        FROM player p
        JOIN team t ON p.team_id = t.team_id
        ORDER BY p.last_name, p.first_name
      `;
      setPlayers(result);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const result = await sql`
        SELECT team_id, team_name
        FROM team
        ORDER BY team_name
      `;
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
      team_id: '',
      position: '',
      jersey_number: '',
      goals_scored: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      team_id: player.team_id,
      position: player.position,
      jersey_number: player.jersey_number,
      goals_scored: player.goals_scored,
      assists: player.assists,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (player) => {
    if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
      try {
        await sql`
          DELETE FROM player
          WHERE player_id = ${player.player_id}
        `;
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlayer) {
        await sql`
          UPDATE player
          SET 
            first_name = ${formData.first_name},
            last_name = ${formData.last_name},
            team_id = ${formData.team_id},
            position = ${formData.position},
            jersey_number = ${formData.jersey_number},
            goals_scored = ${formData.goals_scored},
            assists = ${formData.assists},
            yellow_cards = ${formData.yellow_cards},
            red_cards = ${formData.red_cards}
          WHERE player_id = ${selectedPlayer.player_id}
        `;
      } else {
        await sql`
          INSERT INTO player (
            first_name, last_name, team_id, position, jersey_number,
            goals_scored, assists, yellow_cards, red_cards
          ) VALUES (
            ${formData.first_name},
            ${formData.last_name},
            ${formData.team_id},
            ${formData.position},
            ${formData.jersey_number},
            ${formData.goals_scored},
            ${formData.assists},
            ${formData.yellow_cards},
            ${formData.red_cards}
          )
        `;
      }
      setIsModalOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'team_name', header: 'Team' },
    { key: 'position', header: 'Position' },
    { key: 'jersey_number', header: 'Jersey #' },
    { key: 'goals_scored', header: 'Goals' },
    { key: 'assists', header: 'Assists' },
    { key: 'yellow_cards', header: 'Yellow Cards' },
    { key: 'red_cards', header: 'Red Cards' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={players}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Players"
        searchPlaceholder="Search players..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlayer ? 'Edit Player' : 'Add Player'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goals</label>
              <input
                type="number"
                value={formData.goals_scored}
                onChange={(e) => setFormData({ ...formData, goals_scored: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assists</label>
              <input
                type="number"
                value={formData.assists}
                onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Yellow Cards</label>
              <input
                type="number"
                value={formData.yellow_cards}
                onChange={(e) => setFormData({ ...formData, yellow_cards: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Red Cards</label>
              <input
                type="number"
                value={formData.red_cards}
                onChange={(e) => setFormData({ ...formData, red_cards: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
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
              {selectedPlayer ? 'Update' : 'Add'} Player
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 