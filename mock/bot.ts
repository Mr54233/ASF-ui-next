import { MockMethod } from 'vite-plugin-mock'

// Bot 状态枚举（复制自 types/bot.ts）
const BotStatus = {
  DISABLED: 'disabled',
  OFFLINE: 'offline',
  ONLINE: 'online',
  FARMING: 'farming',
} as const

// Mock Bot 数据
const mockBots = {
  bot1: {
    BotName: 'bot1',
    Nickname: '主号',
    s_SteamID: '76561198123456789',
    AvatarHash: 'abc123',
    GamesToRedeemInBackgroundCount: 0,
    WalletBalance: 0,
    WalletBalanceDelayed: 0,
    WalletCurrency: 0,
    HasMobileAuthenticator: true,
    RequiredInput: 0,
    KeepRunning: true,
    BotConfig: {
      BotName: 'bot1',
      SteamLogin: 'bot1',
      SteamPassword: '***',
      Enabled: true,
    },
    IsConnectedAndLoggedOn: true,
    CardsFarmer: {
      Paused: false,
      GamesToFarm: [
        {
          AppID: 123456,
          GameName: 'Game 1',
          CardsRemaining: 3,
          Hours: 2.5,
        },
        {
          AppID: 234567,
          GameName: 'Game 2',
          CardsRemaining: 2,
          Hours: 1.5,
        },
      ],
      CurrentGamesFarming: [
        {
          AppID: 123456,
          GameName: 'Game 1',
          CardsRemaining: 3,
          Hours: 2.5,
        },
      ],
      TimeRemaining: '02:30:00',
    },
    Status: BotStatus.FARMING,
  },
  bot2: {
    BotName: 'bot2',
    Nickname: '小号1',
    s_SteamID: '76561198987654321',
    AvatarHash: 'def456',
    GamesToRedeemInBackgroundCount: 0,
    WalletBalance: 0,
    WalletBalanceDelayed: 0,
    WalletCurrency: 0,
    HasMobileAuthenticator: true,
    RequiredInput: 0,
    KeepRunning: true,
    BotConfig: {
      BotName: 'bot2',
      SteamLogin: 'bot2',
      SteamPassword: '***',
      Enabled: true,
    },
    IsConnectedAndLoggedOn: true,
    CardsFarmer: {
      Paused: true,
      GamesToFarm: [
        {
          AppID: 345678,
          GameName: 'Game 3',
          CardsRemaining: 5,
          Hours: 3,
        },
      ],
      CurrentGamesFarming: [],
      TimeRemaining: '00:00:00',
    },
    Status: BotStatus.ONLINE,
  },
  bot3: {
    BotName: 'bot3',
    Nickname: '小号2',
    s_SteamID: '76561198111223344',
    AvatarHash: 'ghi789',
    GamesToRedeemInBackgroundCount: 0,
    WalletBalance: 0,
    WalletBalanceDelayed: 0,
    WalletCurrency: 0,
    HasMobileAuthenticator: true,
    RequiredInput: 0,
    KeepRunning: false,
    BotConfig: {
      BotName: 'bot3',
      SteamLogin: 'bot3',
      SteamPassword: '***',
      Enabled: false,
    },
    IsConnectedAndLoggedOn: false,
    CardsFarmer: {
      Paused: false,
      GamesToFarm: [],
      CurrentGamesFarming: [],
      TimeRemaining: '00:00:00',
    },
    Status: BotStatus.DISABLED,
  },
}

export default [
  {
    url: '/Api/Bot/asf',
    method: 'get',
    response: () => {
      return mockBots
    },
  },
  {
    url: '/Api/Bot/:botName',
    method: 'get',
    response: ({ query }) => {
      const botName = query.botName as string
      return {
        [botName]: mockBots[botName] || null,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/Start',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock startBot:', query.botNames, body)
      return {
        Success: true,
        Message: 'Bot 已启动',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/Stop',
    method: 'post',
    response: ({ query }) => {
      console.log('Mock stopBot:', query.botNames)
      return {
        Success: true,
        Message: 'Bot 已停止',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/Pause',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock pauseBot:', query.botNames, body)
      return {
        Success: true,
        Message: '已暂停挂卡',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/Resume',
    method: 'post',
    response: ({ query }) => {
      console.log('Mock resumeBot:', query.botNames)
      return {
        Success: true,
        Message: '已恢复挂卡',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames',
    method: 'delete',
    response: ({ query }) => {
      console.log('Mock deleteBot:', query.botNames)
      return {
        Success: true,
        Message: 'Bot 已删除',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/Bot',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock createBot:', body)
      return {
        Success: true,
        Message: 'Bot 已创建',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botName/Copy',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock copyBot:', query.botName, body)
      return {
        Success: true,
        Message: 'Bot 已复制',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botName/Rename',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock renameBot:', query.botName, body)
      return {
        Success: true,
        Message: 'Bot 已重命名',
        Result: true,
      }
    },
  },
] as MockMethod[]
