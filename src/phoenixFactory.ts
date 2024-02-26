import { ALPH_TOKEN_ID, NetworkId, ONE_ALPH, SignerProvider, stringToHex } from '@alephium/web3';
import { PhoenixFactoryInstance } from '../artifacts/ts';
import { Deployments, loadDeployments } from './deploys';
import { CreateContract } from './scripts';

export interface CreateContractParam {
  name: string;
  contractId: string;
  creatorFeeNum: number;
  bankFeeNum: number;
  totalSupply: bigint;
  symbol: string;
  baseTokenId: string;
  interfaceFee: bigint;
}

export class PhoenixFactory {
  private readonly deploys: Deployments;

  constructor(deploys: Deployments) {
    this.deploys = deploys;
  }

  static forNetwork(network: NetworkId): PhoenixFactory {
    return new PhoenixFactory(loadDeployments(network));
  }

  public async createContract(signer: SignerProvider, param: CreateContractParam): Promise<string> {
    const attoAlphAmount = param.baseTokenId === ALPH_TOKEN_ID ? ONE_ALPH + ONE_ALPH : ONE_ALPH;
    const decimals = (await signer.nodeProvider!.fetchFungibleTokenMetaData(param.baseTokenId))
      .decimals;
    const oneUnit = 10 ** decimals;
    const tokens =
      param.baseTokenId === ALPH_TOKEN_ID ? [] : [{ id: param.baseTokenId, amount: oneUnit }];
    const result = await CreateContract.execute(signer, {
      initialFields: {
        factory: param.contractId,
        baseTokenId: param.baseTokenId,
        symbol: stringToHex(param.symbol),
        name: stringToHex(param.name),
        totalSupply: param.totalSupply,
        bankFeeNum: BigInt(param.bankFeeNum),
        creatorFeeNum: BigInt(param.creatorFeeNum),
        interfaceFee: param.interfaceFee
      },
      attoAlphAmount,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      tokens
    });

    return result.txId;
  }

  get phoenixFactoryInstance(): PhoenixFactoryInstance {
    return this.deploys.contracts.PhoenixFactory.contractInstance;
  }
}
