'use client';

import React, { useState, useEffect } from 'react';

interface SocialMetrics {
  platform: string;
  followers: number;
  engagementRate: number;
  averageViews?: number;
  niche: string;
}

interface RateEstimate {
  platform: string;
  contentType: string;
  minRate: number;
  maxRate: number;
  recommendedRate: number;
  ratePerFollower: number;
}

interface RateCalculatorProps {
  metrics: SocialMetrics[];
}

export default function RateCalculator({ metrics }: RateCalculatorProps) {
  const [estimates, setEstimates] = useState<RateEstimate[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<{[key: string]: string}>({});

  const contentTypes = {
    youtube: ['video', 'shorts', 'live_stream', 'integration'],
    instagram: ['post', 'story', 'reel', 'live'],
    tiktok: ['video', 'live_stream'],
    twitter: ['tweet', 'thread', 'spaces'],
    twitch: ['stream_mention', 'sponsored_stream', 'chat_command']
  };

  const baseRatesPerFollower = {
    youtube: { video: 0.018, shorts: 0.008, live_stream: 0.025, integration: 0.035 },
    instagram: { post: 0.012, story: 0.005, reel: 0.015, live: 0.020 },
    tiktok: { video: 0.020, live_stream: 0.030 },
    twitter: { tweet: 0.008, thread: 0.015, spaces: 0.025 },
    twitch: { stream_mention: 0.002, sponsored_stream: 0.015, chat_command: 0.001 }
  };

  const engagementMultipliers = {
    low: 0.8,    // < 2%
    average: 1.0, // 2-5%
    good: 1.3,   // 5-8%
    excellent: 1.6 // > 8%
  };

  const nicheMultipliers = {
    tech: 1.4,
    finance: 1.5,
    fashion: 1.2,
    gaming: 1.1,
    lifestyle: 1.0,
    fitness: 1.1,
    food: 0.9,
    travel: 1.2,
    beauty: 1.3,
    education: 1.1
  };

  const getEngagementTier = (rate: number): keyof typeof engagementMultipliers => {
    if (rate < 2) return 'low';
    if (rate < 5) return 'average';
    if (rate < 8) return 'good';
    return 'excellent';
  };

  const calculateRate = (metric: SocialMetrics, contentType: string): RateEstimate => {
    const platform = metric.platform as keyof typeof baseRatesPerFollower;
    const baseRate = baseRatesPerFollower[platform]?.[contentType as keyof typeof baseRatesPerFollower[typeof platform]] || 0.01;
    
    const engagementTier = getEngagementTier(metric.engagementRate);
    const engagementMultiplier = engagementMultipliers[engagementTier];
    
    const nicheMultiplier = nicheMultipliers[metric.niche as keyof typeof nicheMultipliers] || 1.0;
    
    // Calculate follower tier multiplier
    let followerMultiplier = 1.0;
    if (metric.followers < 1000) followerMultiplier = 0.5;
    else if (metric.followers < 10000) followerMultiplier = 0.7;
    else if (metric.followers < 100000) followerMultiplier = 1.0;
    else if (metric.followers < 1000000) followerMultiplier = 1.2;
    else followerMultiplier = 1.5;

    const adjustedRate = baseRate * engagementMultiplier * nicheMultiplier * followerMultiplier;
    const recommendedRate = metric.followers * adjustedRate;
    
    return {
      platform: metric.platform,
      contentType,
      minRate: recommendedRate * 0.7,
      maxRate: recommendedRate * 1.4,
      recommendedRate,
      ratePerFollower: adjustedRate
    };
  };

  useEffect(() => {
    const newEstimates: RateEstimate[] = [];
    
    metrics.forEach(metric => {
      const platformContentTypes = contentTypes[metric.platform as keyof typeof contentTypes] || ['post'];
      const selectedType = selectedContentTypes[metric.platform] || platformContentTypes[0];
      
      const estimate = calculateRate(metric, selectedType);
      newEstimates.push(estimate);
    });
    
    setEstimates(newEstimates);
  }, [metrics, selectedContentTypes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEngagementBadge = (rate: number) => {
    const tier = getEngagementTier(rate);
    const colors = {
      low: 'bg-red-100 text-red-800',
      average: 'bg-yellow-100 text-yellow-800',
      good: 'bg-green-100 text-green-800',
      excellent: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tier]}`}>
        {rate.toFixed(1)}% {tier}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">💰 Sponsorship Rate Calculator</h3>
      
      {estimates.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Connect your social media accounts to see rate estimates
        </p>
      ) : (
        <div className="space-y-6">
          {estimates.map((estimate, index) => {
            const metric = metrics[index];
            const platformContentTypes = contentTypes[estimate.platform as keyof typeof contentTypes] || ['post'];
            
            return (
              <div key={`${estimate.platform}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {estimate.platform === 'youtube' && '📺'}
                      {estimate.platform === 'instagram' && '📸'}
                      {estimate.platform === 'tiktok' && '🎵'}
                      {estimate.platform === 'twitter' && '🐦'}
                      {estimate.platform === 'twitch' && '🎮'}
                    </span>
                    <div>
                      <h4 className="font-semibold capitalize">{estimate.platform}</h4>
                      <p className="text-sm text-gray-500">
                        {metric.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  {getEngagementBadge(metric.engagementRate)}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={selectedContentTypes[estimate.platform] || platformContentTypes[0]}
                    onChange={(e) => setSelectedContentTypes(prev => ({
                      ...prev,
                      [estimate.platform]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {platformContentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Minimum</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatCurrency(estimate.minRate)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-600">Recommended</p>
                    <p className="text-xl font-bold text-blue-800">
                      {formatCurrency(estimate.recommendedRate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Maximum</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatCurrency(estimate.maxRate)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  Rate per follower: {formatCurrency(estimate.ratePerFollower * 1000)} per 1K followers
                </div>
              </div>
            );
          })}

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Rate Calculation Factors</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Follower count and platform</li>
              <li>• Engagement rate (likes, comments, shares)</li>
              <li>• Content niche and market demand</li>
              <li>• Content type complexity</li>
              <li>• Current market rates</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 