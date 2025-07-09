interface TikTokUserStats {
  followerCount: string;
  followingCount: string;
  likesCount: string;
  videoCount: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
}

interface TikTokVideoStats {
  id: string;
  title: string;
  createTime: number;
  coverImageUrl: string;
  shareUrl: string;
  videoUrl: string;
  duration: number;
  height: number;
  width: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

interface TikTokAnalytics {
  followerCount: number;
  videoCount: number;
  totalLikes: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  engagementRate: number;
  recentVideos: TikTokVideoStats[];
}

// Export interfaces for use in components
export type { TikTokUserStats, TikTokVideoStats, TikTokAnalytics };

export class TikTokAPI {
  private baseUrl = 'https://open.tiktokapis.com';

  async getUserInfo(accessToken: string): Promise<TikTokUserStats | null> {
    try {
      console.log('Fetching TikTok user info...');
      
      const response = await fetch(
        `${this.baseUrl}/v2/user/info/?fields=display_name,bio_description,avatar_url,is_verified,follower_count,following_count,likes_count,video_count`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('TikTok API error:', errorData);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error_code !== 0) {
        console.error('TikTok API error:', data.message);
        return null;
      }
      
      const userInfo = data.data.user;
      
      return {
        followerCount: userInfo.follower_count?.toString() || '0',
        followingCount: userInfo.following_count?.toString() || '0',
        likesCount: userInfo.likes_count?.toString() || '0',
        videoCount: userInfo.video_count?.toString() || '0',
        displayName: userInfo.display_name || '',
        username: userInfo.username || '',
        avatarUrl: userInfo.avatar_url,
        bio: userInfo.bio_description,
        isVerified: userInfo.is_verified || false,
      };
    } catch (error) {
      console.error('Error fetching TikTok user info:', error);
      return null;
    }
  }

  // Alias for getUserInfo to match component expectations
  async getUserStats(accessToken: string): Promise<{
    followerCount?: number;
    totalViews?: number;
    totalLikes?: number;
    videoCount?: number;
  } | null> {
    try {
      const userInfo = await this.getUserInfo(accessToken);
      if (!userInfo) return null;

      return {
        followerCount: parseInt(userInfo.followerCount) || 0,
        totalViews: 0, // TikTok doesn't provide total views in user info
        totalLikes: parseInt(userInfo.likesCount) || 0,
        videoCount: parseInt(userInfo.videoCount) || 0,
      };
    } catch (error) {
      console.error('Error fetching TikTok user stats:', error);
      return null;
    }
  }

  async getVideoList(accessToken: string, maxCount: number = 20): Promise<TikTokVideoStats[]> {
    try {
      console.log('Fetching TikTok video list...');
      
      const response = await fetch(
        `${this.baseUrl}/v2/video/list/?fields=id,title,create_time,cover_image_url,share_url,video_url,duration,height,width&max_count=${maxCount}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch TikTok videos');
        return [];
      }
      
      const data = await response.json();
      
      if (data.error_code !== 0) {
        console.error('TikTok API error:', data.message);
        return [];
      }
      
      const videos = data.data.videos || [];
      
      // Get video analytics for each video
      const videosWithAnalytics = await Promise.all(
        videos.map(async (video: any) => {
          const analytics = await this.getVideoAnalytics(accessToken, video.id);
          return {
            id: video.id,
            title: video.title,
            createTime: video.create_time,
            coverImageUrl: video.cover_image_url,
            shareUrl: video.share_url,
            videoUrl: video.video_url,
            duration: video.duration,
            height: video.height,
            width: video.width,
            ...analytics,
          };
        })
      );
      
      return videosWithAnalytics;
    } catch (error) {
      console.error('Error fetching TikTok video list:', error);
      return [];
    }
  }

  async getVideoAnalytics(accessToken: string, videoId: string): Promise<{
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/video/query/?fields=view_count,like_count,comment_count,share_count&video_ids=[${videoId}]`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        return {};
      }
      
      const data = await response.json();
      
      if (data.error_code !== 0 || !data.data.videos || data.data.videos.length === 0) {
        return {};
      }
      
      const videoData = data.data.videos[0];
      
      return {
        viewCount: videoData.view_count || 0,
        likeCount: videoData.like_count || 0,
        commentCount: videoData.comment_count || 0,
        shareCount: videoData.share_count || 0,
      };
    } catch (error) {
      console.error(`Error fetching analytics for video ${videoId}:`, error);
      return {};
    }
  }

  async calculateAnalytics(accessToken: string): Promise<TikTokAnalytics | null> {
    try {
      const userStats = await this.getUserInfo(accessToken);
      const recentVideos = await this.getVideoList(accessToken, 50);
      
      if (!userStats) return null;
      
      const followerCount = parseInt(userStats.followerCount);
      const videoCount = parseInt(userStats.videoCount);
      const totalLikes = parseInt(userStats.likesCount);
      
      // Calculate averages from recent videos
      const videosWithViews = recentVideos.filter(video => video.viewCount && video.viewCount > 0);
      
      const totalViews = videosWithViews.reduce((sum, video) => sum + (video.viewCount || 0), 0);
      const totalVideoLikes = recentVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0);
      const totalComments = recentVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0);
      const totalShares = recentVideos.reduce((sum, video) => sum + (video.shareCount || 0), 0);
      
      const averageViews = videosWithViews.length > 0 ? totalViews / videosWithViews.length : 0;
      const averageLikes = recentVideos.length > 0 ? totalVideoLikes / recentVideos.length : 0;
      const averageComments = recentVideos.length > 0 ? totalComments / recentVideos.length : 0;
      const averageShares = recentVideos.length > 0 ? totalShares / recentVideos.length : 0;
      
      // Calculate engagement rate based on average interactions vs followers
      const averageEngagements = averageLikes + averageComments + averageShares;
      const engagementRate = followerCount > 0 ? (averageEngagements / followerCount) * 100 : 0;
      
      return {
        followerCount,
        videoCount,
        totalLikes,
        averageViews,
        averageLikes,
        averageComments,
        averageShares,
        engagementRate,
        recentVideos: recentVideos.slice(0, 10), // Return latest 10 for display
      };
    } catch (error) {
      console.error('Error calculating TikTok analytics:', error);
      return null;
    }
  }

  // OAuth flow for TikTok Login Kit
  getOAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.list',
      'video.insights'
    ].join(',');

    const params = new URLSearchParams({
      client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state,
    });

    return `https://www.tiktok.com/auth/authorize/?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    const response = await fetch('/api/tiktok/exchange-token', {
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
      const tokens = localStorage.getItem('tiktok_tokens');
      if (!tokens) return null;

      const { refresh_token } = JSON.parse(tokens);
      
      if (!refresh_token) {
        console.log('No TikTok refresh token available');
        return null;
      }

      const response = await fetch('/api/tiktok/refresh-token', {
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
        console.error('TikTok token refresh failed:', data);
        return null;
      }

      // Update stored tokens
      const updatedTokens = {
        ...JSON.parse(tokens),
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };

      localStorage.setItem('tiktok_tokens', JSON.stringify(updatedTokens));
      console.log('TikTok tokens updated');

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing TikTok access token:', error);
      return null;
    }
  }
} 