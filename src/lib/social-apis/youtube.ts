interface YouTubeChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  channelTitle: string;
  channelId: string;
  customUrl?: string;
  publishedAt: string;
}

interface YouTubeVideoStats {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  title: string;
  publishedAt: string;
}

interface YouTubeAnalytics {
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  averageViewsPerVideo: number;
  estimatedMonthlyViews: number;
  engagementRate: number;
  recentVideos: YouTubeVideoStats[];
}

export class YouTubeAPI {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getChannelStats(accessToken: string): Promise<YouTubeChannelStats | null> {
    try {
      console.log('Fetching channel stats with access token:', accessToken ? 'Token present' : 'No token');
      
      let response = await fetch(
        `${this.baseUrl}/channels?part=statistics,snippet&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('YouTube API response status:', response.status);
      console.log('YouTube API response ok:', response.ok);
      
      // If token is expired (401), try to refresh it
      if (response.status === 401) {
        console.log('Access token expired, attempting to refresh...');
        const refreshedToken = await this.refreshAccessToken();
        
        if (refreshedToken) {
          console.log('Token refreshed successfully, retrying API call...');
          response = await fetch(
            `${this.baseUrl}/channels?part=statistics,snippet&mine=true`,
            {
              headers: {
                'Authorization': `Bearer ${refreshedToken}`
              }
            }
          );
        } else {
          console.log('Token refresh failed, user needs to re-authenticate');
          return null;
        }
      }
      
      const data = await response.json();
      console.log('YouTube API response data:', data);
      
      if (!response.ok) {
        console.error('YouTube API error response:', data);
        return null;
      }
      
      if (!data.items || data.items.length === 0) {
        console.log('No YouTube channel found for the authenticated user');
        return null;
      }

      const channel = data.items[0];
      console.log('Found YouTube channel:', channel.snippet.title);
      
      return {
        subscriberCount: channel.statistics.subscriberCount,
        viewCount: channel.statistics.viewCount,
        videoCount: channel.statistics.videoCount,
        channelTitle: channel.snippet.title,
        channelId: channel.id,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching YouTube channel stats:', error);
      return null;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const tokens = localStorage.getItem('youtube_tokens');
      if (!tokens) return null;

      const { refresh_token } = JSON.parse(tokens);
      if (!refresh_token) {
        console.log('No refresh token available');
        return null;
      }

      const response = await fetch('/api/youtube/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refresh_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Token refresh failed:', data);
        return null;
      }

      // Update stored tokens with new access token
      const updatedTokens = {
        ...JSON.parse(tokens),
        access_token: data.access_token,
        // Refresh token might be renewed
        ...(data.refresh_token && { refresh_token: data.refresh_token })
      };

      localStorage.setItem('youtube_tokens', JSON.stringify(updatedTokens));
      console.log('Tokens updated in localStorage');

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  async getChannelByUsername(username: string): Promise<YouTubeChannelStats | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=statistics,snippet&forUsername=${username}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }

      return this.getChannelStats(data.items[0].id);
    } catch (error) {
      console.error('Error fetching YouTube channel by username:', error);
      return null;
    }
  }

  async getRecentVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideoStats[]> {
    try {
      // First, get the uploads playlist ID
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`
      );
      
      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // Get recent videos from uploads playlist
      const videosResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );
      
      const videosData = await videosResponse.json();
      const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // Get statistics for these videos
      const statsResponse = await fetch(
        `${this.baseUrl}/videos?part=statistics,snippet&id=${videoIds}&key=${this.apiKey}`
      );
      
      const statsData = await statsResponse.json();
      
      return statsData.items.map((video: any) => ({
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        commentCount: video.statistics.commentCount,
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
      }));
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      return [];
    }
  }

  async calculateAnalytics(accessToken: string): Promise<YouTubeAnalytics | null> {
    try {
      const channelStats = await this.getChannelStats(accessToken);
      if (!channelStats) return null;
      
      const recentVideos = await this.getRecentVideos(channelStats.channelId, 20);

      const subscriberCount = parseInt(channelStats.subscriberCount);
      const totalViews = parseInt(channelStats.viewCount);
      const videoCount = parseInt(channelStats.videoCount);

      // Calculate average views per video
      const averageViewsPerVideo = totalViews / videoCount;

      // Estimate monthly views based on recent videos
      const recentTotalViews = recentVideos.reduce(
        (sum, video) => sum + parseInt(video.viewCount), 0
      );
      const estimatedMonthlyViews = recentTotalViews * (30 / recentVideos.length);

      // Calculate engagement rate based on recent videos
      const totalEngagements = recentVideos.reduce(
        (sum, video) => sum + parseInt(video.likeCount) + parseInt(video.commentCount), 0
      );
      const engagementRate = (totalEngagements / recentTotalViews) * 100;

      return {
        subscriberCount,
        totalViews,
        videoCount,
        averageViewsPerVideo,
        estimatedMonthlyViews,
        engagementRate,
        recentVideos,
      };
    } catch (error) {
      console.error('Error calculating YouTube analytics:', error);
      return null;
    }
  }

  // OAuth flow for accessing private analytics
  getOAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    const response = await fetch('/api/youtube/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Token exchange failed');
    }

    return data;
  }
} 