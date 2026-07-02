import { GraphQLClient, gql } from "graphql-request"

export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface GitHubActivityData {
  totalContributions: number
  weeks: ContributionDay[][]
}

const QUERY = gql`
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

interface QueryResult {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[]
      }
    }
  }
}

function levelForCount(count: number): ContributionDay["level"] {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

const CACHE_TTL_MS = 60 * 60 * 1000
let cache: { data: GitHubActivityData; fetchedAt: number } | null = null

export async function getGitHubActivity(): Promise<GitHubActivityData> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data
  }

  const token = process.env.GITHUB_TOKEN
  const login = process.env.GITHUB_USERNAME
  if (!token || !login) {
    throw new Error("GITHUB_TOKEN or GITHUB_USERNAME not configured")
  }

  const client = new GraphQLClient("https://api.github.com/graphql", {
    headers: { Authorization: `Bearer ${token}` },
  })

  const result = await client.request<QueryResult>(QUERY, { login })
  const calendar = result.user.contributionsCollection.contributionCalendar

  const data: GitHubActivityData = {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelForCount(day.contributionCount),
      }))
    ),
  }

  cache = { data, fetchedAt: Date.now() }
  return data
}
