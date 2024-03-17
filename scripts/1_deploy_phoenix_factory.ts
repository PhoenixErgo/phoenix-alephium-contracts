import { Deployer, DeployFunction, Network } from '@alephium/cli';
import { PhoenixBank, PhoenixFactory } from '../artifacts/ts';
import { ALPH_TOKEN_ID, ONE_ALPH } from '@alephium/web3';

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFactory: DeployFunction<{}> = async (
  deployer: Deployer,
  network: Network<{}>
): Promise<void> => {
  const fundTemplateResult = deployer.getDeployContractResult('PhoenixBank');
  const result = await deployer.deployContract(PhoenixFactory, {
    initialFields: {
      phoenixBankTemplateId: fundTemplateResult.contractInstance.contractId,
      selfOwner: '158qs4SAj1tKPMJq2M4VjYqpewrdZ71EFmpRhZVEGsxeq',
      fee: ONE_ALPH,
      active: true,
      maxDecimals: BigInt(18),
      maxBankFeeNum: BigInt(500),
      maxCreatorFeeNum: BigInt(200),
      minValueDivisor: BigInt(1),
      contractCreationALPH: ONE_ALPH
    },
    initialAttoAlphAmount: ONE_ALPH
  });
  console.log('Phoenix Factory contract id: ' + result.contractInstance.contractId);
  console.log('Phoenix Factory contract address: ' + result.contractInstance.address);
};

export default deployFactory;
