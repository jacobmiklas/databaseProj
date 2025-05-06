'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/data-table';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default function QueriesTab() {
  const [activeQuery, setActiveQuery] = useState('team_rosters');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const queries = {
    team_rosters: {
      name: 'Team Rosters',
      description: 'View complete team rosters with player details',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'player_name', header: 'Player' },
        { key: 'position', header: 'Position' },
        { key: 'jersey_number', header: 'Jersey #' }
      ],
      query: `
        SELECT 
          t.team_name,
          p.first_name || ' ' || p.last_name as player_name,
          p.position,
          p.jersey_number
        FROM teams t
        JOIN players p ON t.team_id = p.team_id
        ORDER BY t.team_name, p.jersey_number
      `
    },
    top_scorers: {
      name: 'Top Goal Scorers',
      description: 'View players with the most goals scored',
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
          COUNT(CASE WHEN g.goal_type = 'goal' THEN 1 END) as goals_scored,
          COUNT(CASE WHEN g.goal_type = 'assist' THEN 1 END) as assists
        FROM players p
        JOIN teams t ON p.team_id = t.team_id
        LEFT JOIN goals g ON p.player_id = g.player_id
        GROUP BY p.player_id, t.team_id
        ORDER BY goals_scored DESC, assists DESC
        LIMIT 10
      `
    },
    league_standings: {
      name: 'League Standings',
      description: 'Current league standings sorted by points',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'games_played', header: 'GP' },
        { key: 'wins', header: 'W' },
        { key: 'losses', header: 'L' },
        { key: 'draws', header: 'D' },
        { key: 'points', header: 'PTS' }
      ],
      query: `
        SELECT 
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
        LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        GROUP BY t.team_id
        ORDER BY points DESC, wins DESC
      `
    },
    team_schedule: {
      name: 'Team Schedule',
      description: 'View team schedules with past results',
      columns: [
        { key: 'date', header: 'Date' },
        { key: 'home_team', header: 'Home Team' },
        { key: 'score', header: 'Score' },
        { key: 'away_team', header: 'Away Team' }
      ],
      query: `
        SELECT 
          m.date,
          ht.team_name as home_team,
          ms.home_score || ' - ' || ms.away_score as score,
          at.team_name as away_team
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.team_id
        JOIN teams at ON m.away_team_id = at.team_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        ORDER BY m.date DESC
      `
    },
    referee_games: {
      name: 'Referee Games',
      description: 'View games officiated by each referee',
      columns: [
        { key: 'referee_name', header: 'Referee' },
        { key: 'date', header: 'Date' },
        { key: 'home_team', header: 'Home Team' },
        { key: 'away_team', header: 'Away Team' }
      ],
      query: `
        SELECT 
          r.first_name || ' ' || r.last_name as referee_name,
          m.date,
          ht.team_name as home_team,
          at.team_name as away_team
        FROM referees r
        JOIN matches m ON r.referee_id = m.referee_id
        JOIN teams ht ON m.home_team_id = ht.team_id
        JOIN teams at ON m.away_team_id = at.team_id
        ORDER BY r.last_name, m.date DESC
      `
    },
    player_stats: {
      name: 'Player Career Stats',
      description: 'View comprehensive player statistics',
      columns: [
        { key: 'player_name', header: 'Player' },
        { key: 'team_name', header: 'Team' },
        { key: 'games_played', header: 'GP' },
        { key: 'goals', header: 'Goals' },
        { key: 'assists', header: 'Assists' },
        { key: 'yellow_cards', header: 'YC' },
        { key: 'red_cards', header: 'RC' }
      ],
      query: `
        SELECT 
          p.first_name || ' ' || p.last_name as player_name,
          t.team_name,
          COUNT(DISTINCT m.match_id) as games_played,
          COUNT(CASE WHEN g.goal_type = 'goal' THEN 1 END) as goals,
          COUNT(CASE WHEN g.goal_type = 'assist' THEN 1 END) as assists,
          COUNT(CASE WHEN c.card_type = 'yellow' THEN 1 END) as yellow_cards,
          COUNT(CASE WHEN c.card_type = 'red' THEN 1 END) as red_cards
        FROM players p
        JOIN teams t ON p.team_id = t.team_id
        LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
        LEFT JOIN goals g ON p.player_id = g.player_id
        LEFT JOIN cards c ON p.player_id = c.player_id
        GROUP BY p.player_id, t.team_id
        ORDER BY goals DESC, assists DESC
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
    <div className="space-y-6">
      <div className="flex space-x-4">
        {Object.keys(queries).map((queryKey) => (
          <button
            key={queryKey}
            onClick={() => setActiveQuery(queryKey)}
            className={`px-4 py-2 rounded-md ${
              activeQuery === queryKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {queries[queryKey].name}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">{queries[activeQuery].name}</h2>
        <p className="text-gray-600 mb-4">{queries[activeQuery].description}</p>
        
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DataTable
            columns={queries[activeQuery].columns}
            data={queryResults}
            title={queries[activeQuery].name}
          />
        )}
      </div>
    </div>
  );
} 