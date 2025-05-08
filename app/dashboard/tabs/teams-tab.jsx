'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    coach_name: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchTeams = async () => {
    try {
      const result = await sql`
        SELECT 
          t.*,
          l.name as league_name,
          (
            SELECT COUNT(*) 
            FROM matches m 
            JOIN match_stats ms ON m.match_id = ms.match_id
            WHERE (m.home_team_id = t.team_id AND ms.home_score > ms.away_score)
               OR (m.away_team_id = t.team_id AND ms.away_score > ms.home_score)
          ) as wins,
          (
            SELECT COUNT(*) 
            FROM matches m 
            JOIN match_stats ms ON m.match_id = ms.match_id
            WHERE (m.home_team_id = t.team_id AND ms.home_score < ms.away_score)
               OR (m.away_team_id = t.team_id AND ms.away_score < ms.home_score)
          ) as losses,
          (
            SELECT COUNT(*) 
            FROM matches m 
            JOIN match_stats ms ON m.match_id = ms.match_id
            WHERE (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
              AND ms.home_score = ms.away_score
          ) as draws
        FROM teams t
        LEFT JOIN leagues l ON t.league_id = l.league_id
        ORDER BY t.team_name
      `;
      setTeams(result);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const result = await sql`SELECT league_id, name FROM leagues ORDER BY name`;
      setLeagues(result);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleAdd = () => {
    setSelectedTeam(null);
    setFormData({ team_name: '', league_id: '', coach_name: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (team) => {
    setSelectedTeam(team);
    setFormData({
      team_name: team.team_name,
      league_id: team.league_id,
      coach_name: team.coach_name
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (team) => {
    if (window.confirm(`Are you sure you want to delete ${team.team_name}?`)) {
      try {
        await sql`DELETE FROM teams WHERE team_id = ${team.team_id}`;
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
          UPDATE teams
          SET 
            team_name = ${formData.team_name},
            league_id = ${formData.league_id},
            coach_name = ${formData.coach_name}
          WHERE team_id = ${selectedTeam.team_id}
        `;
      } else {
        await sql`
          INSERT INTO teams (
            team_name, league_id, coach_name
          ) VALUES (
            ${formData.team_name},
            ${formData.league_id},
            ${formData.coach_name}
          )
        `;
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleSchedule = (team) => {
    // ✅ Use push (not replace) so Teams tab stays in history
    router.push(`/dashboard/schedule/${team.team_id}`);
  };

  const columns = [
    { key: 'team_name', header: 'Team Name' },
    { key: 'coach_name', header: 'Coach' },
    { key: 'league_name', header: 'League' },
    { 
      key: 'record', 
      header: 'Record (W-L-D)',
      render: (row) => `${row.wins || 0}-${row.losses || 0}-${row.draws || 0}`
    }
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable
        columns={columns}
        data={teams}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSchedule={handleSchedule}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">League</label>
            <select
              value={formData.league_id}
              onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
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
