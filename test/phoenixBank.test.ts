import { describe, it, expect, beforeAll } from 'vitest';
import { testAddress } from '@alephium/web3-test';
import { prepareForTests } from './utils';
import { ALPH_TOKEN_ID, ONE_ALPH, stringToHex, addressFromContractId } from '@alephium/web3';
import {PhoenixBank} from "../artifacts/ts";

describe('PhoenixBank', () => {
  const PhoenixAddress = '1BroxRnYkkPrmur5LeBTYwbF2WzsKPb1jJLkbJC3LuJwe';
  const BrunoAddress = '13JRgHCUFnJcHXAx52QvSQ1MgghJiyyAMGMvLT9t3NaRc';
  const CreatorAddress = '14pjHtCtxQ5UQfZJ8vQiyQwXvgRg9rnUipdL9JSjCQfm8';

  const tokenId = '1a281053ba8601a658368594da034c2e99a0fb951b86498d05e76aedfe666800';
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
      }
      const event = await PhoenixBank.tests.mint(params);

      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice(params)

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe('2000000000000000000')
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999999998000000000000000000')
      expect(price.returns.toString(), 'price does not correspond to manually calculated value').toBe('1')
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens.length, 'user token outputs do not match').toBe(1);
      expect(userOutput[0].tokens[0].amount.toString(), 'user token amount does not match manual value').toBe('1000000000000000000');
      expect(bankOutput[0].tokens.length, 'bank token outputs do not match').toBe(1);
      expect(bankOutput[0].tokens[0].amount.toString(), 'bank token amount does not match manual value').toBe('999999998000000000000000000');
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
      }
      const event = await PhoenixBank.tests.mint(params);

      const userOutput = event.txOutputs.filter((output) => output.address === testAddress);
      const bankOutput = event.txOutputs.filter((output) => output.address === bankContractAddress);

      const reserveIn = event.contracts[0].fields.reserveIn;
      const hodlTokenIn = event.contracts[0].fields.hodlTokenIn;

      const price = await PhoenixBank.tests.getPrice(params)

      expect(reserveIn.toString(), 'reserve does not match manual value').toBe('1000000000000000001')
      expect(hodlTokenIn.toString(), 'hodlTokenIn does not match manual value').toBe('999999998999999999999999999')
      expect(price.returns.toString(), 'price does not correspond to manually calculated value').toBe('1')
      expect(userOutput.length, 'user outputs do not match').toBe(2);
      expect(bankOutput.length, 'bank outputs do not match').toBe(1);
      expect(userOutput[0].tokens.length, 'user token outputs do not match').toBe(1);
      expect(userOutput[0].tokens[0].amount.toString(), 'user token amount does not match manual value').toBe('1');
      expect(bankOutput[0].tokens.length, 'bank token outputs do not match').toBe(1);
      expect(bankOutput[0].tokens[0].amount.toString(), 'bank token amount does not match manual value').toBe('999999998999999999999999999');
    });
  });

  describe('burn()', () => {
    it('1:1 burn should work', async () => {
      const event = await PhoenixBank.tests.burn({
        address: bankContractAddress,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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
          baseTokenId: ALPH_TOKEN_ID,
          symbol: stringToHex('HALPH'),
          name: stringToHex('HodlAlph'),
          decimals: BigInt(18),
          bankFeeNum: BigInt(30),
          creatorFeeNum: BigInt(10),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          totalTokenSupply: ONE_ALPH * BigInt(10) ** BigInt(9),
          minBankValue: ONE_ALPH, // 10 ** 18
          reserveIn: ONE_ALPH + ONE_ALPH, // base balance
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
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

      expect(phoenixOutput.length).eq(1);
      expect(phoenixOutput[0].alphAmount.toString()).toBe('3250000000000000');
      expect(brunoOutput.length).eq(1);
      expect(brunoOutput[0].alphAmount.toString()).toBe('1750000000000000');
      expect(creatorOutput.length).eq(1);
      expect(creatorOutput[0].alphAmount.toString()).toBe('11000000000000000');
      expect(userOutput.length).eq(1);
      expect(userOutput[0].alphAmount.toString()).toBe('1891500000000000000');
      expect(bankOutput.length).eq(1);
      expect(bankOutput[0].alphAmount.toString()).toBe('2030000000000000000');
    });
  });
});
