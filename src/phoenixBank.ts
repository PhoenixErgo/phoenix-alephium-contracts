import { DUST_AMOUNT, NetworkId, SignerProvider } from '@alephium/web3';
import { PhoenixBankInstance } from '../artifacts/ts';
import { Deployments, loadDeployments } from './deploys';
import { PhoenixBurn, PhoenixDeposit, PhoenixMint } from './scripts';

export interface MintParam {
  baseTokenId: string;
  amountHodlTokenDesired: bigint;
  baseTokenApprovalAmount: bigint;
  contractId: string;
}

export interface BurnParam {
  amountHodlTokenToBurn: bigint;
  contractId: string;
}

export interface DepositParam {
  baseTokenId: string;
  amountBaseTokenToDeposit: bigint;
  contractId: string;
}

export class PhoenixBank {
  private readonly deploys: Deployments;

  constructor(deploys: Deployments) {
    this.deploys = deploys;
  }

  static forNetwork(network: NetworkId): PhoenixBank {
    return new PhoenixBank(loadDeployments(network));
  }

  public async mint(signer: SignerProvider, param: MintParam): Promise<string> {
    const result = await PhoenixMint.execute(signer, {
      initialFields: {
        bank: param.contractId,
        baseTokenId: param.baseTokenId,
        baseTokenApprovalAmount: param.baseTokenApprovalAmount,
        amountHodlTokenDesired: param.amountHodlTokenDesired
      },
      attoAlphAmount: param.baseTokenApprovalAmount
    });

    return result.txId;
  }

  public async burn(signer: SignerProvider, param: BurnParam): Promise<string> {
    const result = await PhoenixBurn.execute(signer, {
      initialFields: {
        bank: param.contractId,
        amountHodlTokenToBurn: param.amountHodlTokenToBurn
      },
      attoAlphAmount: DUST_AMOUNT + DUST_AMOUNT + DUST_AMOUNT,
      tokens: [
        {
          id: param.contractId,
          amount: param.amountHodlTokenToBurn
        }
      ]
    });

    return result.txId;
  }

  public async deposit(signer: SignerProvider, param: DepositParam): Promise<string> {
    const result = await PhoenixDeposit.execute(signer, {
      initialFields: {
        bank: param.contractId,
        baseTokenId: param.baseTokenId,
        amountBaseTokenToDeposit: param.amountBaseTokenToDeposit
      },
      attoAlphAmount: param.amountBaseTokenToDeposit
    });

    return result.txId;
  }

  get phoenixBankInstance(): PhoenixBankInstance {
    return this.deploys.contracts.PhoenixBank.contractInstance;
  }
}
