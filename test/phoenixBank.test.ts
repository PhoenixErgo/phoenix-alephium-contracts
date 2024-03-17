import { beforeAll, describe, expect, it } from 'vitest';
import { testAddress } from '@alephium/web3-test';
import { prepareForTests } from './utils';
import {
  addressFromContractId,
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  ONE_ALPH,
  stringToHex
} from '@alephium/web3';
import { PhoenixBank } from '../artifacts/ts';

const NUM_LOOPS = 10;

describe('PhoenixBank', () => {
  const PhoenixAddress = '1CULcAHptZtG2NYfAwLxHQ4Zxqj8TyyLPiLsbakR1ndrZ';
  const BrunoAddress = '13UsdFLqmkN9SASBh7MLL6QEhjsfGp2CKmJZrERyMcVAo';
  const CreatorAddress = '14pjHtCtxQ5UQfZJ8vQiyQwXvgRg9rnUipdL9JSjCQfm8';

  const tokenId = '1a281053ba8601a658368594da034c2e99a0fb951b86498d05e76aedfe666800';
  const hodlTokenId = tokenId;
  const baseTokenId = 'b2d71c116408ae47b931482a440f675dc9ea64453db24ee931dacd578cae9002';
  const bankContractAddress = addressFromContractId(tokenId);
  beforeAll(async () => {
    await prepareForTests();
  });
  describe('mint()', () => {
    it('1:1 mint should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenDesired: ONE_ALPH
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      const event = await PhoenixBank.tests.mint(params);

      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice({
        ...event,
        testArgs: {
          isMint: true
        },
        initialFields: event.contracts[0].fields,
        initialAsset: event.contracts[0].asset
      });

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe(
        '2000000000000000000'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999998000000000000000000'
      );
      expect(
        price.returns.toString(),
        'price does not correspond to manually calculated value'
      ).toBe('1000000000000000000');
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens!.length, 'user token outputs do not match').toBe(1);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user token amount does not match manual value'
      ).toBe('1000000000000000000');
      expect(bankOutput[0].tokens!.length, 'bank token outputs do not match').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank token amount does not match manual value'
      ).toBe('999999998000000000000000000');
    });

    it('1:1 native token mint should work', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1)
        },
        testArgs: {
          amountHodlTokenDesired: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: baseTokenId, amount: BigInt(1000) }] }
          }
        ]
      };
      const event = await PhoenixBank.tests.mint(params);

      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice({
        ...event,
        testArgs: {
          isMint: true
        },
        initialFields: event.contracts[0].fields,
        initialAsset: event.contracts[0].asset
      });

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe('1001');
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999998999');
      expect(
        price.returns.toString(),
        'price does not correspond to manually calculated value'
      ).toBe('1');
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens!.length, 'user token outputs do not match').toBe(1);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user token amount does not match manual value'
      ).toBe('1000');
      expect(bankOutput[0].tokens!.length, 'bank token outputs do not match').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank baseToken token amount does not match manual value'
      ).toBe('1001');
      expect(
        bankOutput[0].tokens![1].amount.toString(),
        'bank hodlToken amount does not match manual value'
      ).toBe('999998999');
    });

    it('smallest unit mint should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenDesired: BigInt(1)
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      const event = await PhoenixBank.tests.mint(params);

      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice({
        ...event,
        testArgs: {
          isMint: true
        },
        initialFields: event.contracts[0].fields,
        initialAsset: event.contracts[0].asset
      });

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe(
        '1000000000000000001'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999998999999999999999999'
      );
      expect(
        price.returns.toString(),
        'price does not correspond to manually calculated value'
      ).toBe('1000000000000000000');
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens!.length, 'user token outputs do not match').toBe(1);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user token amount does not match manual value'
      ).toBe('1');
      expect(bankOutput[0].tokens!.length, 'bank token outputs do not match').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank token amount does not match manual value'
      ).toBe('999999998999999999999999999');
    });
  });

  describe('burn()', () => {
    it('1:1 burn should work', async () => {
      const event = await PhoenixBank.tests.burn({
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          decimals: BigInt(18),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH + ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenToBurn: ONE_ALPH
        },
        inputAssets: [
          {
            address: testAddress,
            asset: {
              alphAmount: ONE_ALPH,
              tokens: [{ id: tokenId, amount: ONE_ALPH }]
            }
          }
        ]
      });

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe(
        '1030000000000000000'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999999000000000000000000'
      );
      expect(phoenixOutput.length).eq(1);
      expect(phoenixOutput[0].alphAmount.toString()).toBe('3250000000000000');
      expect(brunoOutput.length).eq(1);
      expect(brunoOutput[0].alphAmount.toString()).toBe('1750000000000000');
      expect(creatorOutput.length).eq(1);
      expect(creatorOutput[0].alphAmount.toString()).toBe('11000000000000000');
      expect(userOutput[0].alphAmount.toString()).toBe('1891500000000000000');
      expect(bankOutput.length).eq(1);
      expect(bankOutput[0].alphAmount.toString()).toBe('2030000000000000000');
    });

    it('1:1 native token burn should work', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1) + BigInt(1000)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1) + BigInt(1000), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
        },
        testArgs: {
          amountHodlTokenToBurn: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: hodlTokenId, amount: BigInt(1000) }] }
          }
        ]
      };

      const event = await PhoenixBank.tests.burn(params);

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter(
        (output) => output.address === testAddress && output.alphAmount == DUST_AMOUNT
      );
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe('31');
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999999999');
      expect(phoenixOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe('1000000000000000');
      expect(
        phoenixOutput[0].tokens![0].amount.toString(),
        'phoenix fee should match manually calculated amount'
      ).toBe('2');
      expect(brunoOutput.length, 'only one bruno output').eq(1);
      expect(brunoOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(
        brunoOutput[0].tokens![0].amount.toString(),
        'bruno fee should match manually calculated amount'
      ).toBe('1');
      expect(creatorOutput.length, 'only one creator output').eq(1);
      expect(creatorOutput[0].alphAmount.toString(), 'creator gets dust').toBe('1000000000000000');
      expect(
        creatorOutput[0].tokens![0].amount.toString(),
        'creator fee should match manually calculated amount'
      ).toBe('10');
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user baseToken should match manually calculated value'
      ).toBe('957');
      expect(bankOutput.length, 'only one bank output').eq(1);
      expect(bankOutput[0].alphAmount.toString(), 'bank ALPH amount should stay constant').toBe(
        '1000000000000000000'
      );
      expect(bankOutput[0].tokens!.length, 'bank should have two types of token').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank baseToken value should match manually calculated value'
      ).toBe('31');
      expect(
        bankOutput[0].tokens![1].amount.toString(),
        'bank hodlToken value should match manually calculated value'
      ).toBe('999999999');
    });

    it('1 unit burn should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          decimals: BigInt(18),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH + ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenToBurn: BigInt(1)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: {
              alphAmount: ONE_ALPH,
              tokens: [{ id: tokenId, amount: BigInt(1) }]
            }
          }
        ]
      };
      const event = await PhoenixBank.tests.burn(params);

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe(
        '2000000000000000000'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999998000000000000000001'
      );
      expect(phoenixOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe('1000000000000000');
      expect(brunoOutput.length, 'only one bruno output').eq(1);
      expect(brunoOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(creatorOutput.length, 'only one creator output').eq(1);
      expect(creatorOutput[0].alphAmount.toString(), 'creator gets dust').toBe('1000000000000000');
      expect(userOutput[0].alphAmount.toString(), 'user should get nothing').toBe(
        '934500000000000000'
      );
      expect(bankOutput.length, 'only one bank output').eq(1);
      expect(bankOutput[0].alphAmount.toString(), 'bank should not distribute base').toBe(
        '3000000000000000000'
      );
      expect(bankOutput[0].tokens!.length, 'bank should have one type of token').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank should gain one unit hodlToken'
      ).toBe('999999998000000000000000001');
    });

    it('1 unit native token burn should work', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1) + BigInt(1000)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1) + BigInt(1000), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
        },
        testArgs: {
          amountHodlTokenToBurn: BigInt(1)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: hodlTokenId, amount: BigInt(1) }] }
          }
        ]
      };

      const event = await PhoenixBank.tests.burn(params);

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe('1001');
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999999000');
      expect(phoenixOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe('1000000000000000');
      expect(phoenixOutput[0].tokens!.length, 'phoenix fee should contain no tokens').toBe(0);
      expect(brunoOutput.length, 'only one bruno output').eq(1);
      expect(brunoOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(brunoOutput[0].tokens!.length, 'bruno fee should contain no tokens').toBe(0);
      expect(creatorOutput.length, 'only one creator output').eq(1);
      expect(creatorOutput[0].alphAmount.toString(), 'creator gets dust').toBe('1000000000000000');
      expect(creatorOutput[0].tokens!.length, 'creator fee should contain no tokens').toBe(0);
      expect(userOutput[0].tokens!.length, 'user output should contain no tokens').toBe(0);
      expect(bankOutput.length, 'only one bank output').eq(1);
      expect(bankOutput[0].alphAmount.toString(), 'bank ALPH amount should stay constant').toBe(
        '1000000000000000000'
      );
      expect(bankOutput[0].tokens!.length, 'bank should have two types of token').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank baseToken value should match manually calculated value'
      ).toBe('1001');
      expect(
        bankOutput[0].tokens![1].amount.toString(),
        'bank hodlToken value should match manually calculated value'
      ).toBe('999999000');
    });

    it('2 unit burn should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          decimals: BigInt(18),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH + ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenToBurn: BigInt(2)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: {
              alphAmount: ONE_ALPH,
              tokens: [{ id: tokenId, amount: BigInt(2) }]
            }
          }
        ]
      };
      const event = await PhoenixBank.tests.burn(params);

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe(
        '1999999999999999999'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999998000000000000000002'
      );
      expect(phoenixOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe('1000000000000000');
      expect(brunoOutput.length, 'only one bruno output').eq(1);
      expect(brunoOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(creatorOutput.length, 'only one creator output').eq(1);
      expect(creatorOutput[0].alphAmount.toString(), 'creator gets dust').toBe('1000000000000000');
      expect(userOutput[0].alphAmount.toString(), 'user gets back one unit').toBe(
        '934500000000000001'
      );
      expect(bankOutput.length, 'only one bank output').eq(1);
      expect(bankOutput[0].alphAmount.toString(), 'bank looses one unit').toBe(
        '2999999999999999999'
      );
      expect(bankOutput[0].tokens!.length, 'bank should have one type of token').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank should gain two units hodlToken'
      ).toBe('999999998000000000000000002');
    });

    it('2 unit native token burn should work', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1) + BigInt(1000)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1) + BigInt(1000), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1) - BigInt(1000)
        },
        testArgs: {
          amountHodlTokenToBurn: BigInt(2)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: hodlTokenId, amount: BigInt(2) }] }
          }
        ]
      };

      const event = await PhoenixBank.tests.burn(params);

      const phoenixOutput = event.txOutputs.filter((output) => output.address === PhoenixAddress);
      const brunoOutput = event.txOutputs.filter((output) => output.address === BrunoAddress);
      const creatorOutput = event.txOutputs.filter((output) => output.address === CreatorAddress);
      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserveIn does not match manual value').toBe('1000');
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999999001');
      expect(phoenixOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe('1000000000000000');
      expect(phoenixOutput[0].tokens!.length, 'phoenix fee should contain no tokens').toBe(0);
      expect(brunoOutput.length, 'only one bruno output').eq(1);
      expect(brunoOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(brunoOutput[0].tokens!.length, 'bruno fee should contain no tokens').toBe(0);
      expect(creatorOutput.length, 'only one creator output').eq(1);
      expect(creatorOutput[0].alphAmount.toString(), 'creator gets dust').toBe('1000000000000000');
      expect(creatorOutput[0].tokens!.length, 'creator fee should contain no tokens').toBe(0);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user baseToken should match manually calculated value'
      ).toBe('1');
      expect(bankOutput.length, 'only one bank output').eq(1);
      expect(bankOutput[0].alphAmount.toString(), 'bank ALPH amount should stay constant').toBe(
        '1000000000000000000'
      );
      expect(bankOutput[0].tokens!.length, 'bank should have two types of token').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank baseToken value should match manually calculated value'
      ).toBe('1000');
      expect(
        bankOutput[0].tokens![1].amount.toString(),
        'bank hodlToken value should match manually calculated value'
      ).toBe('999999001');
    });
  });

  describe('mint and burn', () => {
    it('minting and immediately burning should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenDesired: ONE_ALPH
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      const mintEvent = await PhoenixBank.tests.mint(params);

      const userOutput = mintEvent.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = mintEvent.txOutputs.filter(
        (output) => output.address === bankContractAddress
      );

      const reserveIn = mintEvent.contracts[0].fields.reserveIn;
      const hodlTokenIn = mintEvent.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice({
        ...mintEvent,
        testArgs: {
          isMint: true
        },
        initialFields: mintEvent.contracts[0].fields,
        initialAsset: mintEvent.contracts[0].asset
      });

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe(
        '2000000000000000000'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999998000000000000000000'
      );
      expect(
        price.returns.toString(),
        'price does not correspond to manually calculated value'
      ).toBe('1000000000000000000');
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens!.length, 'user token outputs do not match').toBe(1);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user token amount does not match manual value'
      ).toBe('1000000000000000000');
      expect(bankOutput[0].tokens!.length, 'bank token outputs do not match').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank token amount does not match manual value'
      ).toBe('999999998000000000000000000');

      const burnEvent = await PhoenixBank.tests.burn({
        ...mintEvent,
        address: bankContractAddress,
        testArgs: {
          amountHodlTokenToBurn: ONE_ALPH
        },
        inputAssets: [
          {
            address: testAddress,
            asset: {
              alphAmount: ONE_ALPH,
              tokens: [{ id: tokenId, amount: ONE_ALPH }]
            }
          }
        ],
        initialFields: mintEvent.contracts[0].fields,
        initialAsset: mintEvent.contracts[0].asset
      });

      const phoenixFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === PhoenixAddress
      );
      const brunoFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === BrunoAddress
      );
      const creatorFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === CreatorAddress
      );
      const userBurnOutput = burnEvent.txOutputs.filter((output) => output.address === testAddress);
      const bankBurnOutput = burnEvent.txOutputs.filter(
        (output) => output.address === bankContractAddress
      );

      const burnReserveIn = burnEvent.contracts[0].fields.reserveIn;
      const burnHodlTokenIn = burnEvent.contracts[0].fields.hodlTokenIn;

      expect(burnReserveIn.toString(), 'reserveIn does not match manual value').toBe(
        '1030000000000000000'
      );
      expect(burnHodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999999000000000000000000'
      );
      expect(
        BigInt(burnReserveIn.toString()) > BigInt(reserveIn.toString()),
        'reserve does not increase'
      );
      expect(phoenixFeeOutput.length).eq(1);
      expect(phoenixFeeOutput[0].alphAmount.toString()).toBe('3250000000000000');
      expect(brunoFeeOutput.length).eq(1);
      expect(brunoFeeOutput[0].alphAmount.toString()).toBe('1750000000000000');
      expect(creatorFeeOutput.length).eq(1);
      expect(creatorFeeOutput[0].alphAmount.toString()).toBe('11000000000000000');
      expect(userBurnOutput[0].alphAmount.toString()).toBe('1891500000000000000');
      expect(bankBurnOutput.length).eq(1);
      expect(bankBurnOutput[0].alphAmount.toString()).toBe('2030000000000000000');
    });

    it('minting and immediately burning should work for native token', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1)
        },
        testArgs: {
          amountHodlTokenDesired: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: baseTokenId, amount: BigInt(1000) }] }
          }
        ]
      };
      const mintEvent = await PhoenixBank.tests.mint(params);

      const userOutput = mintEvent.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = mintEvent.txOutputs.filter(
        (output) => output.address === bankContractAddress
      );

      const reserveIn = mintEvent.contracts[0].fields.reserveIn;
      const hodlTokenIn = mintEvent.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice({
        ...mintEvent,
        testArgs: {
          isMint: true
        },
        initialFields: mintEvent.contracts[0].fields,
        initialAsset: mintEvent.contracts[0].asset
      });

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe('1001');
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999998999');
      expect(
        price.returns.toString(),
        'price does not correspond to manually calculated value'
      ).toBe('1');
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens!.length, 'user token outputs do not match').toBe(1);
      expect(
        userOutput[0].tokens![0].amount.toString(),
        'user token amount does not match manual value'
      ).toBe('1000');
      expect(bankOutput[0].tokens!.length, 'bank token outputs do not match').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank baseToken token amount does not match manual value'
      ).toBe('1001');
      expect(
        bankOutput[0].tokens![1].amount.toString(),
        'bank hodlToken amount does not match manual value'
      ).toBe('999998999');

      const burnEvent = await PhoenixBank.tests.burn({
        ...mintEvent,
        address: bankContractAddress,
        testArgs: {
          amountHodlTokenToBurn: BigInt(1)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: hodlTokenId, amount: BigInt(1) }] }
          }
        ],
        initialFields: mintEvent.contracts[0].fields,
        initialAsset: mintEvent.contracts[0].asset
      });

      const phoenixFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === PhoenixAddress
      );
      const brunoFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === BrunoAddress
      );
      const creatorFeeOutput = burnEvent.txOutputs.filter(
        (output) => output.address === CreatorAddress
      );
      const userBurnOutput = burnEvent.txOutputs.filter((output) => output.address === testAddress);
      const bankBurnOutput = burnEvent.txOutputs.filter(
        (output) => output.address === bankContractAddress
      );

      const burnReserveIn = burnEvent.contracts[0].fields.reserveIn;
      const burnHodlTokenIn = burnEvent.contracts[0].fields.hodlTokenIn;

      expect(burnReserveIn.toString(), 'reserveIn does not match manual value').toBe('1001');
      expect(burnHodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe(
        '999999000'
      );
      expect(phoenixFeeOutput.length, 'only one phoenix output').eq(1);
      expect(phoenixFeeOutput[0].alphAmount.toString(), 'phoenix gets dust').toBe(
        '1000000000000000'
      );
      expect(phoenixFeeOutput[0].tokens!.length, 'phoenix fee should contain no tokens').toBe(0);
      expect(brunoFeeOutput.length, 'only one bruno output').eq(1);
      expect(brunoFeeOutput[0].alphAmount.toString(), 'bruno gets dust').toBe('1000000000000000');
      expect(brunoFeeOutput[0].tokens!.length, 'bruno fee should contain no tokens').toBe(0);
      expect(creatorFeeOutput.length, 'only one creator output').eq(1);
      expect(creatorFeeOutput[0].alphAmount.toString(), 'creator gets dust').toBe(
        '1000000000000000'
      );
      expect(creatorFeeOutput[0].tokens!.length, 'creator fee should contain no tokens').toBe(0);
      expect(userBurnOutput[0].tokens!.length, 'user output should contain no tokens').toBe(0);
      expect(bankBurnOutput.length, 'only one bank output').eq(1);
      expect(bankBurnOutput[0].alphAmount.toString(), 'bank ALPH amount should stay constant').toBe(
        '1000000000000000000'
      );
      expect(bankBurnOutput[0].tokens!.length, 'bank should have two types of token').toBe(2);
      expect(
        bankBurnOutput[0].tokens![0].amount.toString(),
        'bank baseToken value should match manually calculated value'
      ).toBe('1001');
      expect(
        bankBurnOutput[0].tokens![1].amount.toString(),
        'bank hodlToken value should match manually calculated value'
      ).toBe('999999000');
    });

    function divUp(dividend: bigint, divisor: bigint): bigint {
      if (divisor === BigInt(0)) {
        return BigInt(-1);
      } else {
        return (dividend + (divisor - BigInt(1))) / divisor;
      }
    }

    it('reserve should increase for any arbitrary sequence of minting and burning actions', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(100),
          creatorFeeNum: BigInt(100),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenDesired: ONE_ALPH
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      let prevEvent = await PhoenixBank.tests.mint(params);

      for (let i = 0; i < NUM_LOOPS; i++) {
        const reserveBeforeMint = i === 0 ? ONE_ALPH : prevEvent.contracts[0].fields.reserveIn;
        const circulatingSupplyBeforeMint = await PhoenixBank.tests.getCirculatingSupply({
          ...prevEvent,
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const mintAmount = BigInt(Math.floor(Math.random() * 100000) + 1) * ONE_ALPH;
        const mintEvent =
          i === 0
            ? prevEvent
            : await PhoenixBank.tests.mint({
                ...prevEvent,
                address: bankContractAddress,
                testArgs: {
                  amountHodlTokenDesired: mintAmount
                },
                inputAssets: [
                  {
                    address: testAddress,
                    asset: {
                      alphAmount:
                        divUp(
                          mintAmount * BigInt(reserveBeforeMint.toString()),
                          circulatingSupplyBeforeMint.returns
                        ) + ONE_ALPH
                    }
                  }
                ],
                initialFields: prevEvent.contracts[0].fields,
                initialAsset: prevEvent.contracts[0].asset
              });

        const burnAmount = mintEvent.txOutputs
          .filter((output) => output.address === testAddress)[0]
          .tokens.filter((t) => t.id === tokenId)[0].amount;

        const burnEvent = await PhoenixBank.tests.burn({
          ...mintEvent,
          address: bankContractAddress,
          testArgs: {
            amountHodlTokenToBurn: burnAmount
          },
          inputAssets: [
            {
              address: testAddress,
              asset: {
                alphAmount: ONE_ALPH,
                tokens: [{ id: tokenId, amount: burnAmount }]
              }
            }
          ],
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        const burnReserveIn = burnEvent.contracts[0].fields.reserveIn;
        expect(BigInt(burnReserveIn.toString())).toBeGreaterThan(
          BigInt(reserveBeforeMint.toString())
        );

        prevEvent = burnEvent;
      }
    }, 30000);

    it('reserve should increase for any arbitrary sequence of minting and burning actions for native token', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1)
        },
        testArgs: {
          amountHodlTokenDesired: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: baseTokenId, amount: BigInt(1000) }] }
          }
        ]
      };

      let prevEvent = await PhoenixBank.tests.mint(params);

      for (let i = 0; i < NUM_LOOPS; i++) {
        const reserveBeforeMint = i === 0 ? BigInt(1) : prevEvent.contracts[0].fields.reserveIn;
        const circulatingSupplyBeforeMint = await PhoenixBank.tests.getCirculatingSupply({
          ...prevEvent,
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const mintAmount = BigInt(Math.floor(Math.random() * 100000) + 1);
        const mintEvent =
          i === 0
            ? prevEvent
            : await PhoenixBank.tests.mint({
                ...prevEvent,
                address: bankContractAddress,
                testArgs: {
                  amountHodlTokenDesired: mintAmount
                },
                inputAssets: [
                  {
                    address: testAddress,
                    asset: {
                      alphAmount: ONE_ALPH,
                      tokens: [
                        {
                          id: baseTokenId,
                          amount: divUp(
                            mintAmount * BigInt(reserveBeforeMint.toString()),
                            circulatingSupplyBeforeMint.returns
                          )
                        }
                      ]
                    }
                  }
                ],
                initialFields: prevEvent.contracts[0].fields,
                initialAsset: prevEvent.contracts[0].asset
              });

        const burnAmount = mintEvent.txOutputs
          .filter((output) => output.address === testAddress)[0]
          .tokens.filter((t) => t.id === tokenId)[0].amount;

        const burnEvent = await PhoenixBank.tests.burn({
          ...mintEvent,
          address: bankContractAddress,
          testArgs: {
            amountHodlTokenToBurn: burnAmount
          },
          inputAssets: [
            {
              address: testAddress,
              asset: {
                alphAmount: ONE_ALPH,
                tokens: [{ id: tokenId, amount: burnAmount }]
              }
            }
          ],
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        const burnReserveIn = burnEvent.contracts[0].fields.reserveIn;
        expect(BigInt(burnReserveIn.toString())).toBeGreaterThan(
          BigInt(reserveBeforeMint.toString())
        );

        prevEvent = burnEvent;
      }
    }, 30000);

    it('price should never decrease for any arbitrary sequence of minting and burning actions', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountHodlTokenDesired: ONE_ALPH
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      let prevEvent = await PhoenixBank.tests.mint(params);

      for (let i = 0; i < NUM_LOOPS; i++) {
        const reserveBeforeMint = i === 0 ? ONE_ALPH : prevEvent.contracts[0].fields.reserveIn;
        const priceBeforeMint = await PhoenixBank.tests.getPrice({
          ...prevEvent,
          testArgs: {
            isMint: true
          },
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const circulatingSupplyBeforeMint = await PhoenixBank.tests.getCirculatingSupply({
          ...prevEvent,
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const mintAmount = BigInt(Math.floor(Math.random() * 100000) + 1) * ONE_ALPH;
        const mintEvent =
          i === 0
            ? prevEvent
            : await PhoenixBank.tests.mint({
                ...prevEvent,
                address: bankContractAddress,
                testArgs: {
                  amountHodlTokenDesired: mintAmount
                },
                inputAssets: [
                  {
                    address: testAddress,
                    asset: {
                      alphAmount:
                        divUp(
                          mintAmount * BigInt(reserveBeforeMint.toString()),
                          circulatingSupplyBeforeMint.returns
                        ) + ONE_ALPH
                    }
                  }
                ],
                initialFields: prevEvent.contracts[0].fields,
                initialAsset: prevEvent.contracts[0].asset
              });

        const priceAfterMint = await PhoenixBank.tests.getPrice({
          ...mintEvent,
          testArgs: {
            isMint: true
          },
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        expect(priceBeforeMint.returns.toString()).eq(
          priceAfterMint.returns.toString(),
          'price should remain same after mint'
        );

        const burnAmount = mintEvent.txOutputs
          .filter((output) => output.address === testAddress)[0]
          .tokens.filter((t) => t.id === tokenId)[0].amount;

        const burnEvent = await PhoenixBank.tests.burn({
          ...mintEvent,
          address: bankContractAddress,
          testArgs: {
            amountHodlTokenToBurn: burnAmount
          },
          inputAssets: [
            {
              address: testAddress,
              asset: {
                alphAmount: ONE_ALPH,
                tokens: [{ id: tokenId, amount: burnAmount }]
              }
            }
          ],
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        const priceAfterBurn = await PhoenixBank.tests.getPrice({
          ...burnEvent,
          testArgs: {
            isMint: true
          },
          initialFields: burnEvent.contracts[0].fields,
          initialAsset: burnEvent.contracts[0].asset
        });

        expect(BigInt(priceAfterBurn.returns.toString())).toBeGreaterThanOrEqual(
          BigInt(priceAfterMint.returns.toString())
        );

        prevEvent = burnEvent;
      }
    }, 30000);

    it('price should never decrease for any arbitrary sequence of minting and burning actions for native token', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1)
        },
        testArgs: {
          amountHodlTokenDesired: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: baseTokenId, amount: BigInt(1000) }] }
          }
        ]
      };
      let prevEvent = await PhoenixBank.tests.mint(params);

      for (let i = 0; i < NUM_LOOPS; i++) {
        const reserveBeforeMint = i === 0 ? BigInt(1) : prevEvent.contracts[0].fields.reserveIn;
        const priceBeforeMint = await PhoenixBank.tests.getPrice({
          ...prevEvent,
          testArgs: {
            isMint: true
          },
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const circulatingSupplyBeforeMint = await PhoenixBank.tests.getCirculatingSupply({
          ...prevEvent,
          initialFields: prevEvent.contracts[0].fields,
          initialAsset: prevEvent.contracts[0].asset
        });
        const mintAmount = BigInt(Math.floor(Math.random() * 100000) + 1);
        const mintEvent =
          i === 0
            ? prevEvent
            : await PhoenixBank.tests.mint({
                ...prevEvent,
                address: bankContractAddress,
                testArgs: {
                  amountHodlTokenDesired: mintAmount
                },
                inputAssets: [
                  {
                    address: testAddress,
                    asset: {
                      alphAmount: ONE_ALPH,
                      tokens: [
                        {
                          id: baseTokenId,
                          amount: divUp(
                            mintAmount * BigInt(reserveBeforeMint.toString()),
                            circulatingSupplyBeforeMint.returns
                          )
                        }
                      ]
                    }
                  }
                ],
                initialFields: prevEvent.contracts[0].fields,
                initialAsset: prevEvent.contracts[0].asset
              });

        const priceAfterMint = await PhoenixBank.tests.getPrice({
          ...mintEvent,
          testArgs: {
            isMint: true
          },
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        expect(priceBeforeMint.returns.toString()).eq(
          priceAfterMint.returns.toString(),
          'price should remain same after mint'
        );

        const burnAmount = mintEvent.txOutputs
          .filter((output) => output.address === testAddress)[0]
          .tokens.filter((t) => t.id === tokenId)[0].amount;

        const burnEvent = await PhoenixBank.tests.burn({
          ...mintEvent,
          address: bankContractAddress,
          testArgs: {
            amountHodlTokenToBurn: burnAmount
          },
          inputAssets: [
            {
              address: testAddress,
              asset: {
                alphAmount: ONE_ALPH,
                tokens: [{ id: tokenId, amount: burnAmount }]
              }
            }
          ],
          initialFields: mintEvent.contracts[0].fields,
          initialAsset: mintEvent.contracts[0].asset
        });

        const priceAfterBurn = await PhoenixBank.tests.getPrice({
          ...burnEvent,
          testArgs: {
            isMint: true
          },
          initialFields: burnEvent.contracts[0].fields,
          initialAsset: burnEvent.contracts[0].asset
        });

        expect(BigInt(priceAfterBurn.returns.toString())).toBeGreaterThanOrEqual(
          BigInt(priceAfterMint.returns.toString())
        );

        prevEvent = burnEvent;
      }
    }, 30000);
  });

  describe('deposit()', () => {
    it('deposit should work', async () => {
      const params = {
        address: bankContractAddress,
        initialAsset: {
          alphAmount: ONE_ALPH + ONE_ALPH,
          tokens: [
            {
              id: tokenId,
              amount: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(18),
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH, // base balance
          hodlTokenIn: ONE_ALPH * BigInt(10) ** BigInt(9) - ONE_ALPH
        },
        testArgs: {
          amountTokenToDeposit: ONE_ALPH
        },
        inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH * 20n } }]
      };
      const event = await PhoenixBank.tests.deposit(params);

      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe(
        '2000000000000000000'
      );
      expect(hodlTokenIn.toString(), 'hodlTokenIn should remain constant').toBe(
        '999999999000000000000000000'
      );
      expect(bankOutput.length, 'there should be only one bank output').toBe(1);
      expect(bankOutput[0].tokens!.length, 'only one type of token expected').toBe(1);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank token amount should remain constant'
      ).toBe('999999999000000000000000000');
    });

    it('native token deposit should work', async () => {
      // decimals 0
      // max token supply = 1 billion

      const params = {
        address: bankContractAddress,
        initialAsset: {
          creatorAddress: CreatorAddress,
          alphAmount: ONE_ALPH,
          tokens: [
            {
              id: baseTokenId,
              amount: BigInt(1)
            },
            {
              id: hodlTokenId,
              amount: BigInt(10) ** BigInt(9) - BigInt(1)
            }
          ]
        },
        initialFields: {
          creatorAddress: CreatorAddress,
          baseTokenId: baseTokenId,
          symbol: stringToHex('HToken'),
          name: stringToHex('HodlToken'),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          decimals: BigInt(0),
          totalTokenSupply: BigInt(10) ** BigInt(9),
          minBankValue: BigInt(1),
          reserveIn: BigInt(1), // base balance
          hodlTokenIn: BigInt(10) ** BigInt(9) - BigInt(1)
        },
        testArgs: {
          amountTokenToDeposit: BigInt(1000)
        },
        inputAssets: [
          {
            address: testAddress,
            asset: { alphAmount: ONE_ALPH, tokens: [{ id: baseTokenId, amount: BigInt(1000) }] }
          }
        ]
      };

      const event = await PhoenixBank.tests.deposit(params);

      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe('1001');
      expect(hodlTokenIn.toString(), 'hodlTokenIn should remain constant').toBe('999999999');
      expect(bankOutput.length, 'there should be only one bank output').toBe(1);
      expect(bankOutput[0].tokens!.length, 'only two types of token expected').toBe(2);
      expect(
        bankOutput[0].tokens![0].amount.toString(),
        'bank hodlToken amount should remain constant'
      ).toBe('1001');
    });
  });
});
