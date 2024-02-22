export interface UserPosition {
  id: number | string;
  avatar: string;
  asset: string;
  type: string;
  link: string;
  feeBalance: string;
  orderBalance: string;
  usdBalance: string;
};

export interface PositionInfo {
  amount: BigInt;
  uniswapTokenId: BigInt;
  positionDirection: BigInt | boolean;
  isNativeA: boolean;
  isNativeB: boolean;
}

export interface Positions {
  pos: PositionInfo;
  nonce: BigInt;
  operator: string;
  token0: string;
  token1: string;
  fee: BigInt;
  tickLower: BigInt;
  tickUpper: BigInt;
  liquidity: BigInt;
  feeGrowthInside0LastX128: BigInt;
  feeGrowthInside1LastX128: BigInt;
  tokensOwed0: BigInt;
  tokensOwed1: BigInt;
}