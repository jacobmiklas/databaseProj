'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import Modal from '../../components/ui/modal';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    team_name: '',
    league_id: '',
    coach_name: '',
    wins: 0,
    losses: 0,
    draws: 0
  });

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchTeams = async () => {
    try {
      const result = await sql`
        SELECT 
          t.*,
          l.name as league_name
        FROM team t
        JOIN league l ON t.league_id = l.league_id
        ORDER BY t.team_name
      `;
      const formatted = result.map(team => ({
        ...team,
        record: `${team.wins}-${team.losses}-${team.draws}`
      }));
      setTeams(formatted);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const result = await sql`
        SELECT league_id, name
        FROM league
        ORDER BY name
      `;
      setLeagues(result);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleAdd = () => {
    setSelectedTeam(null);
    setFormData({
      team_name: '',
      league_id: '',
      coach_name: '',
      wins: 0,
      losses: 0,
      draws: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (team) => {
    setSelectedTeam(team);
    setFormData({
      team_name: team.team_name,
      league_id: team.league_id,
      coach_name: team.coach_name,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (team) => {
    if (window.confirm(`Are you sure you want to delete ${team.team_name}?`)) {
      try {
        await sql`
          DELETE FROM team
          WHERE team_id = ${team.team_id}
        `;
        fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTeam) {
        await sql`
          UPDATE team
          SET 
            team_name = ${formData.team_name},
            league_id = ${formData.league_id},
            coach_name = ${formData.coach_name},
            wins = ${formData.wins},
            losses = ${formData.losses},
            draws = ${formData.draws}
          WHERE team_id = ${selectedTeam.team_id}
        `;
      } else {
        await sql`
          INSERT INTO team (
            team_name, league_id, coach_name, wins, losses, draws
          ) VALUES (
            ${formData.team_name},
            ${formData.league_id},
            ${formData.coach_name},
            ${formData.wins},
            ${formData.losses},
            ${formData.draws}
          )
        `;
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const columns = [
    { key: 'team_name', header: 'Team Name' },
    { key: 'league_name', header: 'League' },
    { key: 'coach_name', header: 'Coach' },
    { key: 'record', header: 'Record' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={teams}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Teams"
        searchPlaceholder="Search teams..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeam ? 'Edit Team' : 'Add Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Team Name</label>
            <input
              type="text"
              value={formData.team_name}
              onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">League</label>
            <select
              value={formData.league_id}
              onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a league</option>
              {leagues.map((league) => (
                <option key={league.league_id} value={league.league_id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Coach Name</label>
            <input
              type="text"
              value={formData.coach_name}
              onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Wins</label>
              <input
                type="number"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Losses</label>
              <input
                type="number"
                value={formData.losses}
                onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Draws</label>
              <input
                type="number"
                value={formData.draws}
                onChange={(e) => setFormData({ ...formData, draws: parseInt(e.target.value) })}
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
              {selectedTeam ? 'Update' : 'Add'} Team
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
