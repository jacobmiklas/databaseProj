'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../components/ui/data-table';
import { neon } from '@neondatabase/serverless';
import { useRouter } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL);

export default function QueriesPage() {
  const [activeQuery, setActiveQuery] = useState('team_rosters');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        { key: 'goals_scored', header: 'Goals' }
      ],
      query: `
        SELECT 
          p.first_name || ' ' || p.last_name as player_name,
          t.team_name,
          COUNT(*) as goals_scored
        FROM players p
        JOIN teams t ON p.team_id = t.team_id
        GROUP BY p.player_id, t.team_id
        ORDER BY goals_scored DESC
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
        { key: 'games_played', header: 'GP' }
      ],
      query: `
        SELECT 
          p.first_name || ' ' || p.last_name as player_name,
          t.team_name,
          COUNT(DISTINCT m.match_id) as games_played
        FROM players p
        JOIN teams t ON p.team_id = t.team_id
        LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
        GROUP BY p.player_id, t.team_id
        ORDER BY games_played DESC
      `
    },
    team_performance: {
      name: 'Team Performance by Month',
      description: 'Analyze team performance trends over time',
      columns: [
        { key: 'team_name', header: 'Team' },
        { key: 'month', header: 'Month' },
        { key: 'games_played', header: 'GP' },
        { key: 'wins', header: 'W' },
        { key: 'losses', header: 'L' },
        { key: 'win_percentage', header: 'Win %' }
      ],
      query: `
        SELECT 
          t.team_name,
          TO_CHAR(m.date, 'YYYY-MM') as month,
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
          ROUND(
            SUM(CASE 
              WHEN (m.home_team_id = t.team_id AND ms.home_score > ms.away_score) OR 
                   (m.away_team_id = t.team_id AND ms.away_score > ms.home_score) THEN 1 
              ELSE 0 
            END)::float / NULLIF(COUNT(m.match_id), 0) * 100, 
            1
          ) as win_percentage
        FROM teams t
        LEFT JOIN matches m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        GROUP BY t.team_id, TO_CHAR(m.date, 'YYYY-MM')
        ORDER BY t.team_name, month DESC
      `
    },
    head_to_head: {
      name: 'Head-to-Head Records',
      description: 'View historical performance between teams',
      columns: [
        { key: 'team1', header: 'Team 1' },
        { key: 'team2', header: 'Team 2' },
        { key: 'team1_wins', header: 'Team 1 Wins' },
        { key: 'team2_wins', header: 'Team 2 Wins' },
        { key: 'draws', header: 'Draws' }
      ],
      query: `
        WITH matchups AS (
          SELECT 
            LEAST(ht.team_name, at.team_name) as team1,
            GREATEST(ht.team_name, at.team_name) as team2,
            CASE 
              WHEN ms.home_score > ms.away_score AND ht.team_name = LEAST(ht.team_name, at.team_name) THEN 1
              WHEN ms.away_score > ms.home_score AND at.team_name = LEAST(ht.team_name, at.team_name) THEN 1
              ELSE 0
            END as team1_wins,
            CASE 
              WHEN ms.home_score > ms.away_score AND ht.team_name = GREATEST(ht.team_name, at.team_name) THEN 1
              WHEN ms.away_score > ms.home_score AND at.team_name = GREATEST(ht.team_name, at.team_name) THEN 1
              ELSE 0
            END as team2_wins,
            CASE WHEN ms.home_score = ms.away_score THEN 1 ELSE 0 END as draws
          FROM matches m
          JOIN teams ht ON m.home_team_id = ht.team_id
          JOIN teams at ON m.away_team_id = at.team_id
          LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        )
        SELECT 
          team1,
          team2,
          SUM(team1_wins) as team1_wins,
          SUM(team2_wins) as team2_wins,
          SUM(draws) as draws
        FROM matchups
        GROUP BY team1, team2
        ORDER BY team1, team2
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
    },
    referee_stats: {
      name: 'Referee Statistics',
      description: 'Analyze referee performance and patterns',
      columns: [
        { key: 'referee_name', header: 'Referee' },
        { key: 'matches_officiated', header: 'Matches' },
        { key: 'avg_goals', header: 'Avg Goals' },
        { key: 'home_win_percentage', header: 'Home Win %' }
      ],
      query: `
        SELECT 
          r.first_name || ' ' || r.last_name as referee_name,
          COUNT(m.match_id) as matches_officiated,
          ROUND(AVG(ms.home_score + ms.away_score), 2) as avg_goals,
          ROUND(
            SUM(CASE WHEN ms.home_score > ms.away_score THEN 1 ELSE 0 END)::float / 
            NULLIF(COUNT(m.match_id), 0) * 100, 
            1
          ) as home_win_percentage
        FROM referees r
        JOIN matches m ON r.referee_id = m.referee_id
        LEFT JOIN match_stats ms ON m.match_id = ms.match_id
        GROUP BY r.referee_id
        ORDER BY matches_officiated DESC
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
            title={queries[activeQuery].name}
          />
        )}
      </div>
    </div>
  );
} 