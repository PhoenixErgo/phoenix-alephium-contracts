import { Project, web3 } from '@alephium/web3';

export async function prepareForTests() {
  web3.setCurrentNodeProvider('https://lb-fullnode-alephium.notrustverify.ch');
  await Project.build();
}
