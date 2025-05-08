'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default function TeamSchedulePage() {
  const { team_id } = useParams();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      const id = parseInt(team_id, 10);
      if (isNaN(id)) {
        console.error('Invalid team_id:', team_id);
        setIsLoading(false);
        return;
      }

      try {
        const result = await sql`
          SELECT 
            m.match_id,
            TRIM(TO_CHAR(m.date, 'Month DD, YYYY')) AS match_date,
            ht.team_name AS home_team,
            COALESCE(ms.home_score || ' - ' || ms.away_score, 'TBD') AS score,
            at.team_name AS away_team,
            m.location
          FROM matches m
          JOIN teams ht ON m.home_team_id = ht.team_id
          JOIN teams at ON m.away_team_id = at.team_id
          LEFT JOIN match_stats ms ON m.match_id = ms.match_id
          WHERE m.home_team_id = ${id} OR m.away_team_id = ${id}
          ORDER BY m.date DESC;
        `;

        setMatches(result);
        if (result.length > 0) {
          const match = result[0];
          setTeamName(match.home_team === match.away_team ? match.home_team : match.home_team);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [team_id]);

  // ✅ Listen for browser back button
  useEffect(() => {
    const handlePopState = () => {
      const fromTab = sessionStorage.getItem('fromTab');
      if (fromTab === 'teams') {
        sessionStorage.removeItem('fromTab'); // prevent loops
        router.replace('/dashboard'); // this redirects manually to dashboard
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  const getPossessive = (name) => {
    if (!name) return '';
    return name.endsWith('s') ? `${name}'` : `${name}'s`;
  };

  if (isLoading) return <div>Loading schedule...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {matches.length > 0 ? `${getPossessive(teamName)} schedule` : 'Team Schedule'}
      </h1>
      {matches.length === 0 ? (
        <p>No matches found for this team.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Home</th>
              <th className="p-2">Score</th>
              <th className="p-2">Away</th>
              <th className="p-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.match_id} className="border-t">
                <td className="p-2">{match.match_date}</td>
                <td className="p-2">{match.home_team}</td>
                <td className="p-2">{match.score}</td>
                <td className="p-2">{match.away_team}</td>
                <td className="p-2">{match.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
