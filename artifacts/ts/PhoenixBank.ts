/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  ContractInstance,
  getContractEventsCurrentCount,
} from "@alephium/web3";
import { default as PhoenixBankContractJson } from "../PhoenixBank.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace PhoenixBankTypes {
  export type Fields = {
    creatorAddress: Address;
    baseTokenId: HexString;
    symbol: HexString;
    name: HexString;
    bankFeeNum: bigint;
    creatorFeeNum: bigint;
    decimals: bigint;
    totalTokenSupply: bigint;
    minBankValue: bigint;
    reserveIn: bigint;
    hodlTokenIn: bigint;
  };

  export type State = ContractState<Fields>;

  export type MintEvent = ContractEvent<{
    address: Address;
    amountHodlToken: bigint;
  }>;
  export type BurnEvent = ContractEvent<{
    address: Address;
    amountHodlToken: bigint;
    newPrice: bigint;
  }>;
  export type DepositEvent = ContractEvent<{
    address: Address;
    amountHodlToken: bigint;
    newPrice: bigint;
  }>;

  export interface CallMethodTable {
    getSymbol: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getName: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getDecimals: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTotalSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getbaseTokenId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getBankFeeNum: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getCreatorFeeNum: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getMinBankValue: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getBaseBalance: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getHodlTokenBalance: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getDevFeeNum: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getFeeDenom: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getCirculatingSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getPrice: {
      params: CallContractParams<{ isMint: boolean }>;
      result: CallContractResult<bigint>;
    };
    getCreatorAddress: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<Address>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
}

class Factory extends ContractFactory<
  PhoenixBankInstance,
  PhoenixBankTypes.Fields
> {
  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as PhoenixBankTypes.Fields;
  }

  eventIndex = { Mint: 0, Burn: 1, Deposit: 2 };
  consts = {
    FeeDenom: BigInt(1000),
    PhoenixAddress: "1CULcAHptZtG2NYfAwLxHQ4Zxqj8TyyLPiLsbakR1ndrZ",
    BrunoAddress: "12vQhNocmdeth7uxESTUkms8Kre9UPfyzwRMv4asGnxLM",
    ErrorCodes: {
      ZeroCirculation: BigInt(0),
      ZeroReserve: BigInt(1),
      DivideByZero: BigInt(2),
    },
  };

  at(address: string): PhoenixBankInstance {
    return new PhoenixBankInstance(address);
  }

  tests = {
    getSymbol: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getSymbol", params);
    },
    getName: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getName", params);
    },
    getDecimals: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getDecimals", params);
    },
    getTotalSupply: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getTotalSupply", params);
    },
    getbaseTokenId: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getbaseTokenId", params);
    },
    getBankFeeNum: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getBankFeeNum", params);
    },
    getCreatorFeeNum: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getCreatorFeeNum", params);
    },
    getMinBankValue: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getMinBankValue", params);
    },
    getBaseBalance: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getBaseBalance", params);
    },
    getHodlTokenBalance: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getHodlTokenBalance", params);
    },
    getDevFeeNum: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getDevFeeNum", params);
    },
    getFeeDenom: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getFeeDenom", params);
    },
    getCirculatingSupply: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getCirculatingSupply", params);
    },
    getPrice: async (
      params: TestContractParams<PhoenixBankTypes.Fields, { isMint: boolean }>
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getPrice", params);
    },
    mint: async (
      params: TestContractParams<
        PhoenixBankTypes.Fields,
        { amountHodlTokenDesired: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "mint", params);
    },
    burn: async (
      params: TestContractParams<
        PhoenixBankTypes.Fields,
        { amountHodlTokenToBurn: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "burn", params);
    },
    deposit: async (
      params: TestContractParams<
        PhoenixBankTypes.Fields,
        { amountTokenToDeposit: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "deposit", params);
    },
    payDevs: async (
      params: TestContractParams<
        PhoenixBankTypes.Fields,
        { amountToDistribute: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "payDevs", params);
    },
    divUp: async (
      params: TestContractParams<
        PhoenixBankTypes.Fields,
        { dividend: bigint; divisor: bigint }
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "divUp", params);
    },
    getCreatorAddress: async (
      params: Omit<
        TestContractParams<PhoenixBankTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResult<Address>> => {
      return testMethod(this, "getCreatorAddress", params);
    },
  };
}

// Use this object to test and deploy the contract
export const PhoenixBank = new Factory(
  Contract.fromJson(
    PhoenixBankContractJson,
    "",
    "9d6a3fc1b5e483da067658c7817aa8f1e48fcf65d18c0c02e18d58d499374f7e"
  )
);

// Use this class to interact with the blockchain
export class PhoenixBankInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<PhoenixBankTypes.State> {
    return fetchContractState(PhoenixBank, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeMintEvent(
    options: EventSubscribeOptions<PhoenixBankTypes.MintEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PhoenixBank.contract,
      this,
      options,
      "Mint",
      fromCount
    );
  }

  subscribeBurnEvent(
    options: EventSubscribeOptions<PhoenixBankTypes.BurnEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PhoenixBank.contract,
      this,
      options,
      "Burn",
      fromCount
    );
  }

  subscribeDepositEvent(
    options: EventSubscribeOptions<PhoenixBankTypes.DepositEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PhoenixBank.contract,
      this,
      options,
      "Deposit",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      | PhoenixBankTypes.MintEvent
      | PhoenixBankTypes.BurnEvent
      | PhoenixBankTypes.DepositEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(
      PhoenixBank.contract,
      this,
      options,
      fromCount
    );
  }

  methods = {
    getSymbol: async (
      params?: PhoenixBankTypes.CallMethodParams<"getSymbol">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getSymbol">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getSymbol",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: PhoenixBankTypes.CallMethodParams<"getName">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getName">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDecimals: async (
      params?: PhoenixBankTypes.CallMethodParams<"getDecimals">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getDecimals">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getDecimals",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalSupply: async (
      params?: PhoenixBankTypes.CallMethodParams<"getTotalSupply">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getTotalSupply">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getTotalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getbaseTokenId: async (
      params?: PhoenixBankTypes.CallMethodParams<"getbaseTokenId">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getbaseTokenId">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getbaseTokenId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getBankFeeNum: async (
      params?: PhoenixBankTypes.CallMethodParams<"getBankFeeNum">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getBankFeeNum">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getBankFeeNum",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCreatorFeeNum: async (
      params?: PhoenixBankTypes.CallMethodParams<"getCreatorFeeNum">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getCreatorFeeNum">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getCreatorFeeNum",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getMinBankValue: async (
      params?: PhoenixBankTypes.CallMethodParams<"getMinBankValue">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getMinBankValue">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getMinBankValue",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getBaseBalance: async (
      params?: PhoenixBankTypes.CallMethodParams<"getBaseBalance">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getBaseBalance">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getBaseBalance",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getHodlTokenBalance: async (
      params?: PhoenixBankTypes.CallMethodParams<"getHodlTokenBalance">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getHodlTokenBalance">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getHodlTokenBalance",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDevFeeNum: async (
      params?: PhoenixBankTypes.CallMethodParams<"getDevFeeNum">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getDevFeeNum">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getDevFeeNum",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getFeeDenom: async (
      params?: PhoenixBankTypes.CallMethodParams<"getFeeDenom">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getFeeDenom">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getFeeDenom",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCirculatingSupply: async (
      params?: PhoenixBankTypes.CallMethodParams<"getCirculatingSupply">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getCirculatingSupply">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getCirculatingSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getPrice: async (
      params: PhoenixBankTypes.CallMethodParams<"getPrice">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getPrice">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getPrice",
        params,
        getContractByCodeHash
      );
    },
    getCreatorAddress: async (
      params?: PhoenixBankTypes.CallMethodParams<"getCreatorAddress">
    ): Promise<PhoenixBankTypes.CallMethodResult<"getCreatorAddress">> => {
      return callMethod(
        PhoenixBank,
        this,
        "getCreatorAddress",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends PhoenixBankTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PhoenixBankTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      PhoenixBank,
      this,
      calls,
      getContractByCodeHash
    )) as PhoenixBankTypes.MultiCallResults<Calls>;
  }
}
