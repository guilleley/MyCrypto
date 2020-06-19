import { NetworkId, TURL } from '@types';

export const INFURA_API_KEY = 'c02fff6b5daa434d8422b8ece54c7286';

export const MYC_API_MAINNET = 'https://api.mycryptoapi.com/eth';

export const DEFI_RESERVE_MAPPING_URL = 'https://defi.mycryptoapi.com';

export const GITHUB_RELEASE_NOTES_URL = 'https://github.com/MyCryptoHQ/MyCrypto/releases/latest' as TURL;

// The URL for Token Info API requests.
export const TOKEN_INFO_URL = 'https://api.mycryptoapi.com/tokens';

// The URL for MYC api.
export const MYC_API = 'https://mycryptoapi.com/api/v1';

export const ENS_MANAGER_URL = 'https://app.ens.domains';

// this will be changed when we figure out networks
export const DEFAULT_NETWORK_FOR_FALLBACK = 'ropsten';

export const DEFAULT_NETWORK: NetworkId = 'Ethereum';

export const DEFAULT_NETWORK_SYMBOL = 'ETH';

export const DEFAULT_ASSET_DECIMAL = 18;

export const MYC_DEXAG_COMMISSION_RATE = 2.5;

export const MYC_DEXAG_MARKUP_THRESHOLD = 1.5;

export const CREATION_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEFAULT_NETWORK_CHAINID = 1;

export const SECONDS_IN_MONTH = 60 * 60 * 24 * 30;

// Assets that are excluded when loading assets from asset API
export const EXCLUDED_ASSETS = [
  '1e917c91-e52b-5997-af67-2ffd01843701',
  '17da00cc-4901-5e04-87e0-f7e3cf9b382a'
];

export const ETH_SCAN_BATCH_SIZE = 300;
