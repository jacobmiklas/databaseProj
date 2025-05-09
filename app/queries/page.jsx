'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../components/ui/data-table';
import { neon } from '@neondatabase/serverless';
import { useRouter } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL);

export default function QueriesPage() {
  const [activeQuery, setActiveQuery] = useState('top_scorers');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const queries = {
    top_scorers: {
      name: 'Top 10 Goal Contributors',
      description: 'View players with the most goal contributions',
      columns: [
        { key: 'player_name', header: 'Player' },
        { key: 'team_name', header: 'Team' },
        { key: 'goals_scored', header: 'Goals' },
        { key: 'assists', header: 'Assists' }
      ],
      query: `
        SELECT 
          p.first_name || ' ' || p.last_name as player_name,
          t.team_name,
          ps.goals_scored as goals_scored,
          ps.assists as assists
        FROM players p
        JOIN teams t ON p.team_id = t.team_id
        JOIN player_stats ps ON p.player_id = ps.player_id
        ORDER BY ps.goals_scored + ps.assists DESC
        LIMIT 10
      `
    },
    least_disciplined: {
      name: 'Top 5 Least Disciplined Teams',
      description: 'View teams with the most cards',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'ycards', header: 'Yellow Cards' },
        { key: 'rcards', header: 'Red Cards' },
      ],
      query: `
        SELECT sum(yellow_cards) as ycards, sum(red_cards) as rcards, t.team_name
        FROM players p
        JOIN teams t on p.team_id = t.team_id
        JOIN player_stats ps on p.player_id = ps.player_id
        GROUP BY team_name
        ORDER BY SUM(yellow_cards) + SUM(red_cards) DESC, SUM(red_cards) DESC, team_name ASC
        LIMIT 5
      `
    },
    defensive_teams: {
      name: 'Top 5 Most Defensive Teams',
      description: 'View teams with the most clean sheets and least goals against',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'clean_sheets', header: 'Clean Sheets' },
        { key: 'goals_against', header: 'Goals Against' },
      ],
      query: `
         SELECT 
           t.team_name as team_name,
           SUM(CASE 
             WHEN (m.home_team_id = t.team_id AND ms.away_score = 0) OR 
                  (m.away_team_id = t.team_id AND ms.home_score = 0) THEN 1 
             ELSE 0 
           END) as clean_sheets,
           SUM(CASE 
             WHEN (m.home_team_id = t.team_id) THEN ms.away_score
             ELSE 
                 ms.home_score
           END) as goals_against
         FROM teams t
         LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
         LEFT JOIN match_stats ms ON m.match_id = ms.match_id
         GROUP BY team_name
         ORDER BY clean_sheets DESC, goals_against ASC
         LIMIT 5
      `
    },
    league_standings: {
      name: 'League Standings',
      description: 'Current league standings sorted by points',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'league_name', header: 'League' },
        { key: 'games_played', header: 'GP' },
        { key: 'wins', header: 'W' },
        { key: 'losses', header: 'L' },
        { key: 'draws', header: 'D' },
        { key: 'points', header: 'PTS' }
      ],
      query: `
        SELECT 
          l.name as league_name,
          t.team_name,
          COUNT(m.match_id) as games_played,
          SUM(CASE 
            WHEN (m.home_team_id = t.team_id AND ms.home_score > ms.away_score) OR 
                 (m.away_team_id = t.team_id AND ms.away_score > ms.home_score) THEN 1 
            ELSE 0 
          END) as wins,
          SUM(CASE 
            WHEN (m.home_team_id = t.team_id AND ms.home_score < ms.away_score) OR 
                 (m.away_team_id = t.team_id AND ms.away_score < ms.home_score) THEN 1 
            ELSE 0 
          END) as losses,
          SUM(CASE 
            WHEN ms.home_score = ms.away_score THEN 1 
            ELSE 0 
          END) as draws,
          SUM(CASE 
            WHEN (m.home_team_id = t.team_id AND ms.home_score > ms.away_score) OR 
                 (m.away_team_id = t.team_id AND ms.away_score > ms.home_score) THEN 3 
            WHEN ms.home_score = ms.away_score THEN 1 
            ELSE 0 
          END) as points
        FROM teams t
        JOIN leagues l ON t.league_id = l.league_id
        LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        GROUP BY l.name, t.team_name
        ORDER BY l.name, points DESC, wins DESC
      `
    },
    venue_stats: {
      name: 'Venue Statistics',
      description: 'Analyze match performance by venue',
      columns: [
        { key: 'venue', header: 'Venue' },
        { key: 'total_matches', header: 'Total Matches' },
        { key: 'home_wins', header: 'Home Wins' },
        { key: 'away_wins', header: 'Away Wins' },
        { key: 'draws', header: 'Draws' },
        { key: 'avg_goals', header: 'Avg Goals' }
      ],
      query: `
        SELECT 
          m.location as venue,
          COUNT(m.match_id) as total_matches,
          SUM(CASE WHEN ms.home_score > ms.away_score THEN 1 ELSE 0 END) as home_wins,
          SUM(CASE WHEN ms.away_score > ms.home_score THEN 1 ELSE 0 END) as away_wins,
          SUM(CASE WHEN ms.home_score = ms.away_score THEN 1 ELSE 0 END) as draws,
          ROUND(AVG(ms.home_score + ms.away_score), 2) as avg_goals
        FROM matches m
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        GROUP BY m.location
        ORDER BY total_matches DESC
      `
    }

  };

  useEffect(() => {
    fetchQueryResults();
  }, [activeQuery]);

  const fetchQueryResults = async () => {
    setIsLoading(true);
    try {
      const result = await sql(queries[activeQuery].query);
      setQueryResults(result);
    } catch (error) {
      console.error('Error fetching query results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Advanced Queries</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.keys(queries).map((queryKey) => (
          <button
            key={queryKey}
            onClick={() => setActiveQuery(queryKey)}
            className={`p-4 rounded-lg text-left transition-colors ${
              activeQuery === queryKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <h3 className="font-semibold">{queries[queryKey].name}</h3>
            <p className="text-sm mt-1">{queries[queryKey].description}</p>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">{queries[activeQuery].name}</h2>
        <p className="text-gray-600 mb-4">{queries[activeQuery].description}</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            columns={queries[activeQuery].columns}
            data={queryResults}
            
          />
        )}
      </div>
    </div>
  );
} 