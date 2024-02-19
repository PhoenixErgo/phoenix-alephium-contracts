import { Project, web3 } from '@alephium/web3';

export async function prepareForTests() {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973');
  await Project.build();
}
