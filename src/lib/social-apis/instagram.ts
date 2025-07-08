interface InstagramAccountStats {
  followersCount: string;
  followsCount: string;
  mediaCount: string;
  accountType: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
  website?: string;
  biography?: string;
}

interface InstagramMediaStats {
  id: string;
  mediaType: string;
  mediaUrl?: string;
  permalink: string;
  timestamp: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  impressions?: number;
  reach?: number;
  saved?: number;
}

interface InstagramAnalytics {
  followersCount: number;
  mediaCount: number;
  averageLikes: number;
  averageComments: number;
  engagementRate: number;
  recentMedia: InstagramMediaStats[];
  insights: {
    impressions: number;
    reach: number;
    profileViews: number;
    websiteClicks: number;
  };
}

export class InstagramAPI {
  private baseUrl = 'https://graph.instagram.com';
  private facebookGraphUrl = 'https://graph.facebook.com/v18.0';

  async getAccountStats(accessToken: string): Promise<InstagramAccountStats | null> {
    try {
      console.log('Fetching Instagram account stats...');
      
      // First try to get Instagram Business Account (for full analytics)
      try {
        const accountResponse = await fetch(
          `${this.facebookGraphUrl}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
        );
        
        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          
          if (accountData.data && accountData.data.length > 0) {
            const instagramAccountId = accountData.data[0]?.instagram_business_account?.id;
            
            if (instagramAccountId) {
              // Get business account stats
              const statsResponse = await fetch(
                `${this.baseUrl}/${instagramAccountId}?fields=account_type,media_count,followers_count,follows_count,name,username,profile_picture_url,website,biography&access_token=${accessToken}`
              );
              
              if (statsResponse.ok) {
                const stats = await statsResponse.json();
                
                return {
                  followersCount: stats.followers_count?.toString() || '0',
                  followsCount: stats.follows_count?.toString() || '0',
                  mediaCount: stats.media_count?.toString() || '0',
                  accountType: stats.account_type || 'BUSINESS',
                  username: stats.username || '',
                  name: stats.name || '',
                  profilePictureUrl: stats.profile_picture_url,
                  website: stats.website,
                  biography: stats.biography,
                };
              }
            }
          }
        }
      } catch (businessError) {
        console.log('Business account access failed, trying basic display...');
      }
      
      // Fallback: Try Instagram Basic Display for personal accounts
      try {
        const basicResponse = await fetch(
          `${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
        );
        
        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          
          return {
            followersCount: 'N/A', // Not available for personal accounts
            followsCount: 'N/A',   // Not available for personal accounts
            mediaCount: basicData.media_count?.toString() || '0',
            accountType: basicData.account_type || 'PERSONAL',
            username: basicData.username || '',
            name: basicData.username || '', // Use username as name fallback
            profilePictureUrl: undefined,    // Not available in basic display
            website: undefined,              // Not available in basic display
            biography: undefined,            // Not available in basic display
          };
        }
      } catch (basicError) {
        console.error('Basic display access also failed:', basicError);
      }
      
      console.log('No Instagram account data available');
      return null;
      
    } catch (error) {
      console.error('Error fetching Instagram account stats:', error);
      return null;
    }
  }

  async getRecentMedia(accessToken: string, limit: number = 10): Promise<InstagramMediaStats[]> {
    try {
      // Get Instagram Business Account ID first
      const accountResponse = await fetch(
        `${this.facebookGraphUrl}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
      );
      
      const accountData = await accountResponse.json();
      const instagramAccountId = accountData.data[0]?.instagram_business_account?.id;
      
      if (!instagramAccountId) {
        return [];
      }
      
      // Get recent media
      const mediaResponse = await fetch(
        `${this.baseUrl}/${instagramAccountId}/media?fields=id,media_type,media_url,permalink,timestamp,caption&limit=${limit}&access_token=${accessToken}`
      );
      
      if (!mediaResponse.ok) {
        return [];
      }
      
      const mediaData = await mediaResponse.json();
      
      // Get insights for each media item
      const mediaWithInsights = await Promise.all(
        mediaData.data.map(async (media: any) => {
          try {
            const insightsResponse = await fetch(
              `${this.baseUrl}/${media.id}/insights?metric=likes,comments,impressions,reach,saved&access_token=${accessToken}`
            );
            
            if (insightsResponse.ok) {
              const insights = await insightsResponse.json();
              const insightsMap = insights.data.reduce((acc: any, insight: any) => {
                acc[insight.name] = insight.values[0]?.value || 0;
                return acc;
              }, {});
              
              return {
                ...media,
                likesCount: insightsMap.likes || 0,
                commentsCount: insightsMap.comments || 0,
                impressions: insightsMap.impressions || 0,
                reach: insightsMap.reach || 0,
                saved: insightsMap.saved || 0,
              };
            }
            
            return media;
          } catch (error) {
            console.error(`Error fetching insights for media ${media.id}:`, error);
            return media;
          }
        })
      );
      
      return mediaWithInsights;
    } catch (error) {
      console.error('Error fetching recent media:', error);
      return [];
    }
  }

  async calculateAnalytics(accessToken: string): Promise<InstagramAnalytics | null> {
    try {
      const accountStats = await this.getAccountStats(accessToken);
      const recentMedia = await this.getRecentMedia(accessToken, 20);
      
      if (!accountStats) return null;
      
      const followersCount = parseInt(accountStats.followersCount);
      const mediaCount = parseInt(accountStats.mediaCount);
      
      // Calculate averages from recent media
      const totalLikes = recentMedia.reduce((sum, media) => sum + (media.likesCount || 0), 0);
      const totalComments = recentMedia.reduce((sum, media) => sum + (media.commentsCount || 0), 0);
      const totalImpressions = recentMedia.reduce((sum, media) => sum + (media.impressions || 0), 0);
      const totalReach = recentMedia.reduce((sum, media) => sum + (media.reach || 0), 0);
      
      const averageLikes = recentMedia.length > 0 ? totalLikes / recentMedia.length : 0;
      const averageComments = recentMedia.length > 0 ? totalComments / recentMedia.length : 0;
      
      // Calculate engagement rate
      const engagementRate = followersCount > 0 ? ((averageLikes + averageComments) / followersCount) * 100 : 0;
      
      // Get account insights
      let insights = {
        impressions: 0,
        reach: 0,
        profileViews: 0,
        websiteClicks: 0,
      };
      
      try {
        const accountResponse = await fetch(
          `${this.facebookGraphUrl}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
        );
        const accountData = await accountResponse.json();
        const instagramAccountId = accountData.data[0]?.instagram_business_account?.id;
        
        if (instagramAccountId) {
          const insightsResponse = await fetch(
            `${this.baseUrl}/${instagramAccountId}/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&until=${new Date().toISOString().split('T')[0]}&access_token=${accessToken}`
          );
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            insights = insightsData.data.reduce((acc: any, insight: any) => {
              const total = insight.values.reduce((sum: number, value: any) => sum + (value.value || 0), 0);
              acc[insight.name] = total;
              return acc;
            }, insights);
          }
        }
      } catch (error) {
        console.error('Error fetching account insights:', error);
      }
      
      return {
        followersCount,
        mediaCount,
        averageLikes,
        averageComments,
        engagementRate,
        recentMedia,
        insights,
      };
    } catch (error) {
      console.error('Error calculating Instagram analytics:', error);
      return null;
    }
  }

  // OAuth flow for Instagram Business API
  getOAuthUrl(redirectUri: string, state: string): string {
    // Use Instagram Basic Display API for initial authentication
    // This works for both personal and business accounts
    const scopes = [
      'user_profile',
      'user_media'
    ].join(',');

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      state: state,
    });

    // Use Instagram Basic Display API endpoint
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    const response = await fetch('/api/instagram/exchange-token', {
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

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const tokens = localStorage.getItem('instagram_tokens');
      if (!tokens) return null;

      const { access_token } = JSON.parse(tokens);
      
      // Instagram uses long-lived tokens that last 60 days
      // For now, we'll extend the current token
      const response = await fetch('/api/instagram/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: access_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Token refresh failed:', data);
        return null;
      }

      // Update stored tokens
      const updatedTokens = {
        ...JSON.parse(tokens),
        access_token: data.access_token,
      };

      localStorage.setItem('instagram_tokens', JSON.stringify(updatedTokens));
      console.log('Instagram tokens updated');

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Instagram access token:', error);
      return null;
    }
  }
} 