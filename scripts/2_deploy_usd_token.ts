import { Deployer, DeployFunction, Network } from '@alephium/cli';
import { Settings } from '../alephium.config';
import { PhoenixBank, PhoenixFactory, USDToken } from '../artifacts/ts';
import { ALPH_TOKEN_ID, ONE_ALPH, stringToHex } from '@alephium/web3';

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployToken: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const fundTemplateResult = deployer.getDeployContractResult('PhoenixBank');
  const result = await deployer.deployContract(USDToken, {
    issueTokenAmount: BigInt(10) ** BigInt(2) * (BigInt(21) * BigInt(10) ** BigInt(12)),
    initialFields: {
      symbol: stringToHex('USD'),
      name: stringToHex('US dollar'),
      decimals: BigInt(2),
      supply: BigInt(10) ** BigInt(2) * (BigInt(21) * BigInt(10) ** BigInt(12))
    },
    initialAttoAlphAmount: ONE_ALPH
  });
  console.log('USD Token contract id: ' + result.contractInstance.contractId);
  console.log('USD Token contract address: ' + result.contractInstance.address);
};

export default deployToken;
