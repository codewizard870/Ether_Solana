import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenInfo } from "@solana/spl-token-registry";
import { MarketsMap } from "../hooks/useMarketsMap";
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  getEmptyDataWrapper,
  receiveDataWrapper,
} from "./helpers";

export interface TokenMetadataState {
  solanaTokenMap: DataWrapper<TokenInfo[]>;  
  marketsMap: DataWrapper<MarketsMap>;
}

const initialState: TokenMetadataState = {
  solanaTokenMap: getEmptyDataWrapper(),  
  marketsMap: getEmptyDataWrapper(),
};

export const tokenSlice = createSlice({
  name: "tokenInfos",
  initialState,
  reducers: {
    receiveSolanaTokenMap: (state, action: PayloadAction<TokenInfo[]>) => {
      state.solanaTokenMap = receiveDataWrapper(action.payload);
    },
    fetchSolanaTokenMap: (state) => {
      state.solanaTokenMap = fetchDataWrapper();
    },
    errorSolanaTokenMap: (state, action: PayloadAction<string>) => {
      state.solanaTokenMap = errorDataWrapper(action.payload);
    },

    receiveMarketsMap: (state, action: PayloadAction<MarketsMap>) => {
      state.marketsMap = receiveDataWrapper(action.payload);
    },
    fetchMarketsMap: (state) => {
      state.marketsMap = fetchDataWrapper();
    },
    errorMarketsMap: (state, action: PayloadAction<string>) => {
      state.marketsMap = errorDataWrapper(action.payload);
    },

    reset: () => initialState,
  },
});

export const {
  receiveSolanaTokenMap,
  fetchSolanaTokenMap,
  errorSolanaTokenMap,
  receiveMarketsMap,
  fetchMarketsMap,
  errorMarketsMap,
  reset,
} = tokenSlice.actions;

export default tokenSlice.reducer;
