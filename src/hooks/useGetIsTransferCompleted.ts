import {
  CHAIN_ID_SOLANA,  
  getIsTransferCompletedEth,
  getIsTransferCompletedSolana,  
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import {
  selectTransferIsRecovery,
  selectTransferTargetAddressHex,
  selectTransferTargetChain,
} from "../store/selectors";
import {
  getEvmChainId,
  getTokenBridgeAddressForChain,
  SOLANA_HOST
} from "../utils/consts";
import useTransferSignedVAA from "./useTransferSignedVAA";
import useIsWalletReady from "./useIsWalletReady";

/**
 * @param recoveryOnly Only fire when in recovery mode
 */
export default function useGetIsTransferCompleted(recoveryOnly: boolean): {
  isTransferCompletedLoading: boolean;
  isTransferCompleted: boolean;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);

  const isRecovery = useSelector(selectTransferIsRecovery);
  const targetAddress = useSelector(selectTransferTargetAddressHex);
  const targetChain = useSelector(selectTransferTargetChain);

  const { isReady, walletAddress } = useIsWalletReady(targetChain, false);
  const { provider, chainId: evmChainId } = useEthereumProvider();
  const signedVAA = useTransferSignedVAA();

  const hasCorrectEvmNetwork = evmChainId === getEvmChainId(targetChain);
  const shouldFire = !recoveryOnly || isRecovery;

  useEffect(() => {
    if (!shouldFire) {
      return;
    }

    let cancelled = false;
    let transferCompleted = false;
    if (targetChain && targetAddress && signedVAA && isReady) {
      if (isEVMChain(targetChain) && hasCorrectEvmNetwork && provider) {
        setIsLoading(true);
        (async () => {
          try {
            transferCompleted = await getIsTransferCompletedEth(
              getTokenBridgeAddressForChain(targetChain),
              provider,
              signedVAA
            );
          } catch (error) {
            console.error(error);
          }
          if (!cancelled) {
            setIsTransferCompleted(transferCompleted);
            setIsLoading(false);
          }
        })();
      } else if (targetChain === CHAIN_ID_SOLANA) {
        setIsLoading(true);
        (async () => {
          try {
            const connection = new Connection(SOLANA_HOST, "confirmed");
            transferCompleted = await getIsTransferCompletedSolana(
              getTokenBridgeAddressForChain(targetChain),
              signedVAA,
              connection
            );
          } catch (error) {
            console.error(error);
          }
          if (!cancelled) {
            setIsTransferCompleted(transferCompleted);
            setIsLoading(false);
          }
        })();
      }
    }
    return () => {
      cancelled = true;
    };
  }, [
    shouldFire,
    hasCorrectEvmNetwork,
    targetChain,
    targetAddress,
    signedVAA,
    isReady,
    walletAddress,
    provider,
  ]);

  return { isTransferCompletedLoading: isLoading, isTransferCompleted };
}
