export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface TokenPayload {
  accessToken: string
  tokenType: string
  expiresIn: number
}

/**
 * 约饭活动；列表展示字段与小程序 `pages/yuefan/yuefan` 卡片对齐。
 * （coverUrl/joinedCount/totalSlots ↔ cover/joined/total；categoryTag ↔ tag）
 */
export interface MeetupMemberDto {
  id: number
  meetupId: number
  userOpenid: string
  nickname: string
  avatarUrl: string
  joinedAt: string
}

export interface MeetupDto {
  id: number
  title: string
  locationLabel: string
  timeLabel: string
  coverUrl: string
  joinedCount: number
  totalSlots: number
  status: string
  /** 卡片左上角品类标签，如「日本料理」（小程序 item.tag） */
  categoryTag?: string
  /** 距离文案，如「800m」（小程序 item.distance） */
  distanceLabel?: string
  /** 行政区，如「静安区」（小程序 item.district） */
  district?: string
  /** 卡片摘要（小程序 item.desc） */
  description?: string
  hostName?: string
  hostAvatarUrl?: string
  /** 展示用评分文案，如「4.9」（小程序 item.hostRating） */
  hostRating?: string
  /** 东道主徽章（小程序 item.hostBadge） */
  hostBadge?: string
}

export interface PageMeetups {
  content: MeetupDto[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** Spring Data Page 通用结构 */
export interface PageDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** 小程序发现页「为你推荐」 */
export interface RecommendSpotDto {
  id: number
  name: string
  imageUrl: string
  rating: number
  tags: string
  address: string
  businessHours: string
  priceYuan: number
  sortOrder: number
  status: string
}

/** 小程序发现搜索热词 */
export interface HotSearchTagDto {
  id: number
  label: string
  sortOrder: number
  enabled: boolean
}

/** 小程序发现页横向分类 */
export interface DiscoverCategoryDto {
  id: number
  name: string
  sortOrder: number
  enabled: boolean
}

/** 小程序动态 Tab */
export interface FeedPostDto {
  id: number
  authorName: string
  authorAvatarUrl: string
  timeText: string
  content: string
  imageUrl: string
  locationLabel: string
  gatherBadge: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  status: string
  sortOrder: number
  likedByMe?: boolean | null
}

export interface FeedCommentDto {
  id: number
  postId: number
  userOpenid: string
  authorName: string
  authorAvatarUrl: string
  timeText: string
  content: string
  parentId: number | null
  replyToNickname: string
  replies: FeedCommentDto[]
}

/** 小程序动态页热门东道主 / 大V */
export interface InfluencerDto {
  id: number
  displayName: string
  avatarUrl: string
  badgeLabel: string
  ratingText: string
  bio: string
  sortOrder: number
  enabled: boolean
}

/** 小程序用户 */
export interface AppUserDto {
  id: number
  openid: string
  /** 账号密码登录用户名；未注册账号则为 null */
  username: string | null
  /** 是否已设置账号密码（小程序注册/登录账号） */
  accountLogin: boolean
  nickname: string
  avatarUrl: string
  levelText: string
  bio: string
  enabled: boolean
  lastLoginAt: string | null
  createdAt: string
  followCount: number
  conversationCount: number
}

/** 后台管理员账号（只读列表） */
export interface AdminUserListItemDto {
  id: number
  username: string
  role: string
  enabled: boolean
  createdAt: string
}

/** 小程序私信会话 */
export interface ChatConversationDto {
  id: number
  userOpenid: string
  peerKey: string
  peerId: string
  peerName: string
  peerAvatarUrl: string
  contextLabel: string
  lastMessage: string
  lastTime: string
  unreadForUser: number
}

/** 私信消息；from 为 me（小程序用户）或 peer（对方/管理员代回） */
export interface ChatMessageDto {
  id: number
  conversationId: number
  from: string
  content: string
  time: string
}
