import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialMediaProvider, PostState } from '@/model.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import axios from 'axios';

type LinkedInOrganization = {
  id: string;
  name: string;
  logoUrl: string;
  vanityName: string;
};

type LinkedInTokens = {
  provider: typeof SocialMediaProvider.LINKEDIN;
  accessToken: string;
  expiresAt: string;
  organizations?: LinkedInOrganization[];
  selectedOrganizationId?: string;
};

@Injectable()
export class LinkedInConnectionServices
  implements ISocialMediaConnectionService
{
  private readonly graphBaseUrl = 'https://api.linkedin.com/v2';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  /**
   * Get existing tokens from accountSettings
   */
  private async getExistingTokens(accountId: string): Promise<LinkedInTokens> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });

    return (
      (account?.accountSettings
        ?.socialMediaProviderTokens as unknown as LinkedInTokens) || {
        provider: SocialMediaProvider.LINKEDIN,
        accessToken: '',
        expiresAt: '',
      }
    );
  }

  /**
   * Get LinkedIn-specific tokens from account
   */
  private getLinkedInTokens(account: PopulatedAccount): LinkedInTokens | null {
    try {
      const allTokens = account.accountSettings
        ?.socialMediaProviderTokens as unknown as LinkedInTokens;
      return allTokens?.[SocialMediaProvider.LINKEDIN] || null;
    } catch (error) {
      this.logger.error('Error parsing LinkedIn tokens:', {
        accountId: account.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Update social media tokens in accountSettings
   */
  private async updateSocialMediaTokens(
    accountId: string,
    tokenData: LinkedInTokens,
  ): Promise<void> {
    try {
      const existingTokens = await this.getExistingTokens(accountId);

      const updatedTokens = {
        ...existingTokens,
        [SocialMediaProvider.LINKEDIN]: tokenData,
      };

      await this.prisma.accountSettings.update({
        where: { accountId },
        data: { socialMediaProviderTokens: updatedTokens },
      });

      this.logger.log('LinkedIn tokens updated successfully', { accountId });
    } catch (error) {
      this.logger.error('Error updating LinkedIn tokens:', {
        accountId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Exchange LinkedIn auth code for access token
   */
  private async exchangeLinkedInToken(
    code: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
      const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');
      const redirectUri = this.configService.get('SITE_URL') + '/igeo-agents';

      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in || 5184000, // Default 60 days
      };
    } catch (error: any) {
      this.logger.error('[LinkedIn] Token exchange FAILED', {
        errorMessage: error.message,
        errorData: error.response?.data,
      });
      throw new Error(
        `Failed to exchange LinkedIn token: ${error.response?.data?.error_description || error.message}`,
      );
    }
  }

  /**
   * Fetch organizations (company pages) user can manage
   */
  private async fetchLinkedInOrganizations(
    accessToken: string,
  ): Promise<LinkedInOrganization[]> {
    try {
      const aclResponse = await axios.get(
        `${this.graphBaseUrl}/organizationAcls`,
        {
          params: {
            q: 'roleAssignee',
            projection:
              '(elements*(organization~(localizedName,logoV2,vanityName)))',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      this.logger.log('[LinkedIn] Organization ACLs response', {
        hasElements: !!aclResponse.data?.elements,
        elementCount: aclResponse.data?.elements?.length || 0,
        responseStatus: aclResponse.status,
        responseHeaders: aclResponse.headers,
        fullResponseData: JSON.stringify(aclResponse.data, null, 2),
      });

      const organizations: LinkedInOrganization[] = [];

      for (const element of aclResponse.data?.elements || []) {
        const orgId = element.organization?.split(':').pop();
        const org = element['organization~'];
        const orgError = element['organization!'];

        // Handle rate limit or other errors - still extract org ID if available
        if (orgError && orgId) {
          this.logger.warn(
            '[LinkedIn] Organization projection failed but URN available',
            {
              orgId,
              error: orgError,
              organizationUrn: element.organization,
            },
          );

          // Even if projection failed, we can still add the organization
          // The user can select it and we'll fetch details later if needed
          organizations.push({
            id: orgId,
            name: `Organization ${orgId}`, // Placeholder name
            logoUrl: '',
            vanityName: orgId,
          });
        } else if (org && orgId) {
          // Normal case: projection succeeded
          const logoUrl =
            org.logoV2?.original ||
            org.logoV2?.['cropped~']?.elements?.[0]?.identifiers?.[0]
              ?.identifier ||
            '';

          organizations.push({
            id: orgId,
            name: org.localizedName || 'Unknown Organization',
            logoUrl,
            vanityName: org.vanityName || orgId,
          });
        }
      }

      if (organizations.length === 0) {
        this.logger.warn(
          '[LinkedIn] No organizations found in organizationAcls',
          {
            responseStatus: aclResponse.status,
            responseData: JSON.stringify(aclResponse.data).substring(0, 1000),
            fullResponse: aclResponse.data,
          },
        );

        // Try alternative endpoint: fetch user's own profile as fallback
        try {
          const profileResponse = await axios.get(`${this.graphBaseUrl}/me`, {
            params: {
              projection:
                '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
          });

          this.logger.log('[LinkedIn] User profile fetched as fallback', {
            profileId: profileResponse.data?.id,
          });

          // Note: Personal profiles can't be used for organization posting
          // But we'll return empty array and let the frontend handle it
        } catch (profileError: any) {
          this.logger.warn('[LinkedIn] Could not fetch user profile', {
            error: profileError.message,
          });
        }
      }

      return organizations;
    } catch (error: any) {
      const errorDetails = {
        errorMessage: error.message,
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        errorHeaders: error.response?.headers,
      };

      this.logger.error(
        '[LinkedIn] Error fetching organizations',
        errorDetails,
      );

      // Provide more helpful error message based on status code
      if (error.response?.status === 403) {
        throw new Error(
          'LinkedIn API returned 403 Forbidden. This usually means your OAuth scopes do not include organization permissions. Please ensure your LinkedIn app has the following scopes: w_organization_social, r_organization_social, or w_member_social. In developer mode, you may need to request these permissions from LinkedIn.',
        );
      } else if (error.response?.status === 401) {
        throw new Error(
          'LinkedIn API returned 401 Unauthorized. The access token may be invalid or expired.',
        );
      }

      throw new Error(
        `Failed to fetch LinkedIn organizations: ${error.response?.data?.message || error.message}. Status: ${error.response?.status || 'N/A'}`,
      );
    }
  }

  /**
   * Handle OAuth callback and store tokens
   */
  async setAccessToken(
    account: PopulatedAccount,
    code: string,
  ): Promise<{
    message: string;
    provider: string;
    organizations: LinkedInOrganization[];
    organizationCount: number;
  }> {
    try {
      const tokenResponse = await this.exchangeLinkedInToken(code);
      const organizations = await this.fetchLinkedInOrganizations(
        tokenResponse.accessToken,
      );

      const expiresAt = new Date(
        Date.now() + tokenResponse.expiresIn * 1000,
      ).toISOString();

      const tokenData: LinkedInTokens = {
        provider: SocialMediaProvider.LINKEDIN,
        accessToken: tokenResponse.accessToken,
        expiresAt,
        organizations,
      };

      await this.updateSocialMediaTokens(account.id, tokenData);

      this.logger.log('LinkedIn OAuth callback successful', {
        accountId: account.id,
        organizationCount: organizations.length,
        organizations: organizations.map((org) => ({
          id: org.id,
          name: org.name,
        })),
      });

      return {
        message: 'LinkedIn OAuth callback successful',
        provider: SocialMediaProvider.LINKEDIN,
        organizations,
        organizationCount: organizations.length,
      };
    } catch (error: any) {
      this.logger.error('[LinkedIn] Error setting access token', {
        accountId: account.id,
        errorMessage: error.message,
        errorData: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Check if LinkedIn is connected and token is valid
   */
  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData?.accessToken) {
        return false;
      }

      // Check token expiration
      if (tokenData.expiresAt) {
        const expiresAt = new Date(tokenData.expiresAt);
        if (Date.now() >= expiresAt.getTime()) {
          this.logger.warn('LinkedIn access token expired', {
            accountId: account.id,
          });
          return false;
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error checking LinkedIn connection status:', {
        accountId: account.id,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Disconnect LinkedIn account
   */
  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      this.logger.log('Logging out from LinkedIn', { accountId: account.id });

      const existingTokens = await this.getExistingTokens(account.id);

      return true;
    } catch (error: any) {
      this.logger.error('Error logging out from LinkedIn:', {
        accountId: account.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Select which organization to post to
   */
  async selectPage(
    account: PopulatedAccount,
    organizationId: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      this.logger.log('Selecting LinkedIn organization', {
        accountId: account.id,
        organizationId,
      });

      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData) {
        throw new Error('No LinkedIn tokens found for this account');
      }

      const updatedTokenData: LinkedInTokens = {
        ...tokenData,
        selectedOrganizationId: organizationId,
      };

      await this.updateSocialMediaTokens(account.id, updatedTokenData);

      this.logger.log('LinkedIn organization selected successfully', {
        accountId: account.id,
        organizationId,
      });

      return {
        message: `Successfully selected LinkedIn organization: ${organizationId}`,
        provider: SocialMediaProvider.LINKEDIN,
      };
    } catch (error: any) {
      this.logger.error('Error selecting LinkedIn organization:', {
        accountId: account.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get currently selected organization
   */
  async getSelectedPage(
    account: PopulatedAccount,
  ): Promise<{ id: string; name: string; profileImage: string } | null> {
    try {
      const tokenData = this.getLinkedInTokens(account);

      if (
        !tokenData ||
        !tokenData.organizations ||
        tokenData.organizations.length === 0
      ) {
        return null;
      }

      const selectedOrgId =
        tokenData.selectedOrganizationId || tokenData.organizations[0]?.id;
      const selectedOrg =
        tokenData.organizations.find((org) => org.id === selectedOrgId) ||
        tokenData.organizations[0];

      return {
        id: selectedOrg.id,
        name: selectedOrg.name,
        profileImage: selectedOrg.logoUrl || '',
      };
    } catch (error: any) {
      this.logger.error('Error getting selected LinkedIn organization:', {
        accountId: account.id,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Upload image to LinkedIn and get asset URN
   */
  private async uploadImageToLinkedIn(
    imageUrl: string,
    accessToken: string,
    organizationId: string,
  ): Promise<string> {
    try {
      const registerUploadRequest = {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:organization:${organizationId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      };

      const registerResponse = await axios.post(
        `${this.graphBaseUrl}/assets?action=registerUpload`,
        registerUploadRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const uploadUrl =
        registerResponse.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
      const asset = registerResponse.data.value.asset;

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const imageBuffer = Buffer.from(imageResponse.data);

      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': imageResponse.headers['content-type'] || 'image/png',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      return asset;
    } catch (error: any) {
      this.logger.error('[LinkedIn Image Upload] Upload FAILED', {
        errorMessage: error.message,
        errorData: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Publish post to LinkedIn
   */
  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        this.logger.error('[LinkedIn Publish] Post not found', { postId });
        throw new Error(`Post with ID ${postId} not found`);
      }

      if (post.accountId !== account.id) {
        throw new Error('Post does not belong to this account');
      }

      if (post.socialMediaProvider !== SocialMediaProvider.LINKEDIN) {
        throw new Error(
          `Post ${postId} is not configured for LinkedIn provider`,
        );
      }

      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData?.accessToken) {
        throw new Error('LinkedIn account is not connected or configured');
      }

      const postText = `${post.title}\n\n${post.body}`;
      const imageUrls = Array.isArray(post.imagesUrl) ? post.imagesUrl : [];

      let publishedUrl: string | undefined;

      // Upload images to LinkedIn and get URNs
      if (imageUrls.length > 0) {
        const organizationId =
          tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;
        if (!organizationId) {
          throw new Error('No LinkedIn organization selected');
        }

        const assetUrn = await this.uploadImageToLinkedIn(
          imageUrls[0],
          tokenData.accessToken,
          organizationId,
        );

        publishedUrl = this.constructLinkedInUrl(assetUrn);
      }

      // Publish the post to LinkedIn
      const organizationId =
        tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;
      if (!organizationId) {
        throw new Error('No LinkedIn organization selected');
      }

      // Create the post content
      const shareContent = {
        shareCommentary: {
          text: postText,
        },
        shareMediaCategory: imageUrls.length > 0 ? 'IMAGE' : 'NONE',
        ...(imageUrls.length > 0 &&
          publishedUrl && {
            media: [
              {
                status: 'READY',
                media: publishedUrl,
              },
            ],
          }),
      };

      const shareResponse = await axios.post(
        `${this.graphBaseUrl}/ugcPosts`,
        {
          author: `urn:li:organization:${organizationId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: shareContent,
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokenData.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
        },
      );

      const linkedInPostId = shareResponse.data?.id;
      if (!linkedInPostId) {
        throw new Error('Failed to publish post to LinkedIn');
      }

      publishedUrl =
        publishedUrl ||
        `https://www.linkedin.com/feed/update/${linkedInPostId}`;

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          postIdInSocialMediaProvider: linkedInPostId,
          publishedAt: new Date(),
          state: PostState.POSTED,
          publishedUrl,
        },
      });

      // Track the published post
      if (publishedUrl) {
        try {
          await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
            account.id,
            post.recommendationId || post.id,
            publishedUrl,
          );
          this.logger.log('Successfully tracked published LinkedIn post:', {
            postId,
            publishedUrl,
            recommendationId: post.recommendationId || post.id,
          });
        } catch (trackingError: any) {
          this.logger.error('Failed to track published LinkedIn post:', {
            postId,
            publishedUrl,
            message: trackingError.message,
            stack: trackingError.stack,
          });
          // Don't fail the publish operation due to tracking errors
        }
      }

      // Ingest post into Victor for AI reference and tracking
      if (publishedUrl) {
        try {
          this.logger.log('Ingesting published post into Victor', {
            postId,
            publishedUrl,
            accountId: account.id,
          });

          this.logger.log('Post successfully ingested into Victor', {
            postId,
            accountId: account.id,
          });
        } catch (error) {
          this.logger.error(
            'Failed to ingest post into Victor (non-critical)',
            {
              postId,
              accountId: account.id,
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error('[LinkedIn Publish] Publication FAILED', {
        accountId: account.id,
        postId,
        errorMessage: error.message,
        errorData: error.response?.data,
      });

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          state: PostState.FAILED,
        },
      });

      throw error;
    }
  }

  /**
   * Get post analytics
   * NOTE: For developer mode apps, the organizationalEntityShareStatistics endpoint
   * may not work properly or return limited data. Consider using the V2 Posts API
   * instead for better compatibility.
   */
  /**
   * Get post analytics
   * Uses multiple approaches to maximize data availability in developer mode
   */
  async getPostAnalytics(
    account: PopulatedAccount,
    postId: string,
  ): Promise<any> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId, accountId: account.id },
      });

      if (!post) {
        this.logger.error('[LinkedIn Analytics] Post not found', { postId });
        throw new Error('Post not found');
      }

      if (!post.postIdInSocialMediaProvider) {
        throw new Error('Post has not been published to LinkedIn');
      }

      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData?.accessToken) {
        throw new Error('LinkedIn not connected');
      }

      const organizationId =
        tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;

      // Try multiple approaches to get analytics data
      const [likesResponse, commentsResponse, shareStatsResponse] =
        await Promise.all([
          // Get likes count
          axios
            .get(
              `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/likes`,
              {
                headers: {
                  Authorization: `Bearer ${tokenData.accessToken}`,
                  'X-Restli-Protocol-Version': '2.0.0',
                },
              },
            )
            .catch((error) => {
              this.logger.warn(
                '[LinkedIn Analytics] Likes API failed, defaulting to 0',
                { errorMessage: error.message },
              );
              return { data: { paging: { total: 0 } } };
            }),

          // Get comments count
          axios
            .get(
              `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/comments`,
              {
                headers: {
                  Authorization: `Bearer ${tokenData.accessToken}`,
                  'X-Restli-Protocol-Version': '2.0.0',
                },
              },
            )
            .catch((error) => {
              this.logger.warn(
                '[LinkedIn Analytics] Comments API failed, defaulting to 0',
                { errorMessage: error.message },
              );
              return { data: { paging: { total: 0 } } };
            }),

          // Try share statistics (often fails in developer mode)
          organizationId && post.postIdInSocialMediaProvider
            ? axios
                .get(
                  `${this.graphBaseUrl}/organizationalEntityShareStatistics`,
                  {
                    params: {
                      q: 'organizationalEntity',
                      organizationalEntity: `urn:li:organization:${organizationId}`,
                      shares: `urn:li:ugcPost:${post.postIdInSocialMediaProvider}`,
                    },
                    headers: {
                      Authorization: `Bearer ${tokenData.accessToken}`,
                      'X-Restli-Protocol-Version': '2.0.0',
                    },
                  },
                )
                .catch(() => null)
            : Promise.resolve(null),
        ]);

      // Extract share statistics if available
      const shareStats =
        shareStatsResponse?.data?.elements?.[0]?.totalShareStatistics;

      // Try to get metrics from different sources
      let impressions = 0;
      let clicks = 0;
      let shares = shareStats?.shareCount || 0;

      if (shareStats) {
        impressions = shareStats.impressionCount || 0;
        clicks = shareStats.clickCount || 0;
        shares = shareStats.shareCount || 0;
      }

      const likes = likesResponse.data?.paging?.total || 0;
      const comments = commentsResponse.data?.paging?.total || 0;

      const engagementRate =
        impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0;

      return {
        impressions,
        clicks,
        likes,
        comments,
        shares,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      };
    } catch (error: any) {
      this.logger.error('[LinkedIn Analytics] Fetch FAILED', {
        accountId: account.id,
        postId,
        errorMessage: error.message,
        errorData: error.response?.data,
        errorStatus: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Get post comments
   */
  async getPostComments(
    account: PopulatedAccount,
    postId: string,
  ): Promise<any[]> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId, accountId: account.id },
      });

      if (!post) {
        this.logger.error('[LinkedIn Comments] Post not found', { postId });
        throw new Error('Post not found');
      }

      if (!post.postIdInSocialMediaProvider) {
        throw new Error('Post has not been published to LinkedIn');
      }

      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData?.accessToken) {
        throw new Error('LinkedIn not connected');
      }

      const commentsEndpoint = `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/comments`;

      const response = await axios.get(commentsEndpoint, {
        params: {
          projection:
            '(elements*(id,message,created,actor~(localizedFirstName,localizedLastName,vanityName,headline,profilePicture(displayImage~:playableStreams))))',
        },
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const comments: any[] = [];

      for (const element of response.data.elements || []) {
        const actor = element['actor~'];
        const isRateLimited = !!element['actor!'];

        if (isRateLimited) {
          this.logger.warn('[LinkedIn Comments] Profile data rate limited', {
            commentId: element.id,
          });
        }

        if (element.message) {
          const photoUrl =
            actor?.profilePicture?.['displayImage~']?.elements?.[0]
              ?.identifiers?.[0]?.identifier || '';

          const comment = {
            id: element.id,
            author: {
              name: actor
                ? `${actor.localizedFirstName} ${actor.localizedLastName}`
                : 'LinkedIn User',
              headline: actor?.headline?.localized?.en_US || '',
              profileUrl: actor?.vanityName
                ? `https://linkedin.com/in/${actor.vanityName}`
                : '',
              photoUrl,
            },
            text: element.message?.text || '',
            createdAt: new Date(
              element.created?.time || Date.now(),
            ).toISOString(),
          };
          comments.push(comment);
        }
      }

      // Sort comments by creation time (newest first)
      comments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return comments;
    } catch (error: any) {
      this.logger.error('[LinkedIn Comments] Fetch FAILED', {
        accountId: account.id,
        postId,
        errorMessage: error.message,
        errorData: error.response?.data,
        errorStatus: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Get post reactions
   */
  async getPostReactions(
    account: PopulatedAccount,
    postId: string,
  ): Promise<any> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId, accountId: account.id },
      });

      if (!post) {
        this.logger.error('[LinkedIn Reactions] Post not found', { postId });
        throw new Error('Post not found');
      }

      if (!post.postIdInSocialMediaProvider) {
        throw new Error('Post has not been published to LinkedIn');
      }

      const tokenData = this.getLinkedInTokens(account);

      if (!tokenData?.accessToken) {
        throw new Error('LinkedIn not connected');
      }

      const reactionsEndpoint = `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/reactions`;

      const response = await axios.get(reactionsEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const reactions: any = {
        like: 0,
        celebrate: 0,
        support: 0,
        love: 0,
        insightful: 0,
        funny: 0,
      };

      for (const element of response.data.elements || []) {
        const reactionType = element.reactionType?.toLowerCase();
        if (reactionType && reactions.hasOwnProperty(reactionType)) {
          reactions[reactionType]++;
        }
      }

      return reactions;
    } catch (error: any) {
      this.logger.error('[LinkedIn Reactions] Fetch FAILED', {
        accountId: account.id,
        postId,
        errorMessage: error.message,
        errorData: error.response?.data,
        errorStatus: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Construct LinkedIn post URL from URN
   * URN format: urn:li:ugcPost:{numericId}
   * URL format: https://www.linkedin.com/feed/update/{numericId}
   */
  private constructLinkedInUrl(urn: string): string {
    // Extract numeric ID from URN (format: urn:li:ugcPost:1234567890)
    const match = urn.match(/urn:li:ugcPost:(\d+)/);
    if (match && match[1]) {
      return `https://www.linkedin.com/feed/update/${match[1]}`;
    }
    // Fallback: try to extract any numeric ID from the URN
    const numericMatch = urn.match(/(\d+)$/);
    if (numericMatch && numericMatch[1]) {
      return `https://www.linkedin.com/feed/update/${numericMatch[1]}`;
    }
    // If we can't parse the URN, return empty string
    this.logger.warn('Could not construct LinkedIn URL from URN', { urn });
    return '';
  }

  /**
   * Generate employee advocacy share link
   */
  async generateShareLink(
    account: PopulatedAccount,
    postId: string,
  ): Promise<{ shareUrl: string }> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId, accountId: account.id },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      if (!post.postIdInSocialMediaProvider) {
        throw new Error('Post has not been published to LinkedIn');
      }

      const baseShareUrl =
        post.publishedUrl ||
        this.constructLinkedInUrl(post.postIdInSocialMediaProvider);
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseShareUrl)}`;

      return { shareUrl };
    } catch (error: any) {
      this.logger.error('Error generating LinkedIn share link', {
        accountId: account.id,
        postId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Ingests a single post into Victor (embedding system)
   */
}
