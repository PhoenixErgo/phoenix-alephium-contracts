import { Deployer, DeployFunction, Network } from '@alephium/cli';
import { PhoenixBank } from '../artifacts/ts';
import { ALPH_TOKEN_ID, ONE_ALPH } from '@alephium/web3';

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployBank: DeployFunction<{}> = async (
  deployer: Deployer,
  network: Network<{}>
): Promise<void> => {
  const result = await deployer.deployContract(PhoenixBank, {
    issueTokenAmount: ONE_ALPH * 10n ** 9n - ONE_ALPH,
    initialFields: {
      creatorAddress: '1CULcAHptZtG2NYfAwLxHQ4Zxqj8TyyLPiLsbakR1ndrZ', // testnet: 1BQqK3WZFJ3KFv9kBfUUQumiLwhFFHMydPBbvsNXBaBXP
      baseTokenId: ALPH_TOKEN_ID,
      symbol: Buffer.from('HALPH', 'utf8').toString('hex'),
      name: Buffer.from('hodlALPH', 'utf8').toString('hex'),
      bankFeeNum: BigInt(30),
      creatorFeeNum: BigInt(0),
      decimals: BigInt(18),
      totalTokenSupply: ONE_ALPH * 10n ** 9n,
      minBankValue: ONE_ALPH,
      reserveIn: ONE_ALPH,
      hodlTokenIn: ONE_ALPH * 10n ** 9n - ONE_ALPH
    },
    initialAttoAlphAmount: ONE_ALPH + ONE_ALPH
  });
  console.log('Phoenix contract id: ' + result.contractInstance.contractId);
  console.log('Phoenix contract address: ' + result.contractInstance.address);
};

export default deployBank;
