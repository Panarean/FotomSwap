// store.ts
import { createStore } from 'redux';

export type Tokens = {
  label: string;
  value: string;
  image: string;
  contract: string;
  oracle: string;
} | null;

// Define the state type
export interface AppState {
  tokens: Tokens[];
  selectedTokens : Record<string,Tokens>;
}

// Define the initial state
const initialState: AppState = {
  tokens:[],
  selectedTokens:{}
};

// Define action types
enum ActionType {
  TOKENS='tokens',
  SELECTTOKENS = 'selectTokens'
}

// Define action interfaces
interface TokensAction {
  type: ActionType.TOKENS;
  payload: any[];
}
interface SelectTokenAction {
  type: ActionType.SELECTTOKENS;
  payload: Record<string,Tokens>;
}


// Define the reducer
const networkReducer = (state = initialState, action: TokensAction | SelectTokenAction): AppState => {
  switch (action.type) {
    case ActionType.TOKENS:
      return { ...state, tokens: action.payload };
    case ActionType.SELECTTOKENS:
      return { ...state, selectedTokens:action.payload }
    default:
      return state;
  }
};

// Create the Redux store
const store = createStore(networkReducer);

export default store;