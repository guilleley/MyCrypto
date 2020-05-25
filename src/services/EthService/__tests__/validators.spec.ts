import { ResolutionError } from '@unstoppabledomains/resolution/build/resolutionError';
import {
  isTransactionFeeHigh,
  isValidETHRecipientAddress,
  isValidMixedCaseETHAddress,
  isValidUpperOrLowerCaseETHAddress,
  isValidAddress,
  isENSLabelHash,
  validateTransactionFee,
  TransactionFeeResponseType
} from '../validators';

describe('isTransactionFeeHigh', () => {
  it('return true for cases where transaction fee is high', () => {
    // Check for when fiat value is over $10
    expect(isTransactionFeeHigh('1', 300, false, '21000', '2000')).toBe(true);
    // Check for when fiat value is over $10 also works for ERC20
    expect(isTransactionFeeHigh('100', 300, true, '21000', '2000')).toBe(true);
    // Transaction fee higher than amount sent
    expect(isTransactionFeeHigh('0.001', 300, false, '21000', '200')).toBe(true);
  });

  it('return false for cases where transaction fee isnt high', () => {
    // If amount is zero or very small return false
    expect(isTransactionFeeHigh('0', 300, false, '21000', '20')).toBe(false);
    expect(isTransactionFeeHigh('0.0000001', 300, false, '21000', '20')).toBe(false);
    // Other examples that should result in false
    expect(isTransactionFeeHigh('1', 300, false, '21000', '20')).toBe(false);
    expect(isTransactionFeeHigh('0.001', 300, false, '21000', '20')).toBe(false);

    // Invalid string examples
    expect(isTransactionFeeHigh('-0.001', 300, false, '21000', '20')).toBe(false);
    expect(isTransactionFeeHigh('0,001', 300, false, '21000', '20')).toBe(false);
    expect(isTransactionFeeHigh('0.001', 300, false, '21000*', '20')).toBe(false);
    expect(isTransactionFeeHigh('0.001', 300, false, '21000*', '20+')).toBe(false);
    expect(isTransactionFeeHigh('0.001', 300, false, '21000*', '20a')).toBe(false);
  });
});

describe('validateTransactionFee', () => {
  it('should return Invalid', () => {
    expect(validateTransactionFee('-0.001', 100, false, '21000', '10000')).toMatchObject({
      type: 'Invalid' as TransactionFeeResponseType
    });
    expect(validateTransactionFee('0,001', 100, true, '21000', '10000')).toMatchObject({
      type: 'Invalid' as TransactionFeeResponseType
    });
    expect(validateTransactionFee('0.001', 100, false, '-21000', '10000')).toMatchObject({
      type: 'Invalid' as TransactionFeeResponseType
    });
    expect(validateTransactionFee('0.001', 100, false, '21000', '+10000')).toMatchObject({
      type: 'Invalid' as TransactionFeeResponseType
    });
  });
  it('should return None for small amounts', () => {
    expect(validateTransactionFee('0.0000001', 100, false, '21000', '10000')).toMatchObject({
      type: 'None' as TransactionFeeResponseType
    });
    expect(validateTransactionFee('0.0000002', 100, false, '21000', '10000')).toMatchObject({
      type: 'None' as TransactionFeeResponseType
    });
  });
  it('should return Warning for fee bigger than amounts', () => {
    expect(validateTransactionFee('0.000002', 100, true, '21000', '21000')).toMatchObject({
      type: 'Warning' as TransactionFeeResponseType
    });
  });
  it('return Error-Very-High-Tx-Fee', () => {
    expect(validateTransactionFee('100', 1000, true, '21000', '10000')).toMatchObject({
      type: 'Error-Very-High-Tx-Fee' as TransactionFeeResponseType
    });
    // Should take into account eth fraction 0.5
    expect(validateTransactionFee('100', 50, true, '21000', '100000', 5000)).toMatchObject({
      type: 'Error-Very-High-Tx-Fee' as TransactionFeeResponseType
    });
  });
  it('return Error-High-Tx-Fee', () => {
    expect(validateTransactionFee('100', 200, true, '21000', '10000')).toMatchObject({
      type: 'Error-High-Tx-Fee' as TransactionFeeResponseType
    });
    // Should take into account eth fraction 0.15
    expect(validateTransactionFee('100', 50, true, '21000', '25000', 5000)).toMatchObject({
      type: 'Error-High-Tx-Fee' as TransactionFeeResponseType
    });
  });
  it('return Error-Use-Lower', () => {
    expect(validateTransactionFee('100', 40, true, '21000', '10000')).toMatchObject({
      type: 'Error-Use-Lower' as TransactionFeeResponseType
    });
    // Should take into account eth fraction 0.025
    expect(validateTransactionFee('100', 50, true, '21000', '5000', 5000)).toMatchObject({
      type: 'Error-Use-Lower' as TransactionFeeResponseType
    });
  });
});

describe('isValidETHRecipientAddress', () => {
  it('returns true for a valid checksummed address', () => {
    const expected = { success: true };
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });
  it('returns true for a valid all-lowercase address', () => {
    const expected = { success: true };
    const testAddress = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });
  it('returns true for a valid all-uppercase address', () => {
    const expected = { success: true };
    const testAddress = '0X4BBEEB066ED09B7AED07BF39EEE0460DFA261520';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });
  it('returns true for a valid ens name', () => {
    const expected = { success: true };
    const testAddress = 'mycryptoid.eth';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });
  it('returns false for an invalid ens name', () => {
    const expected = { success: false };
    const testAddress = 'mycryptoid.ethhhhh';
    const returned = isValidETHRecipientAddress(
      testAddress,
      ('Domain mycryptoid.ethhhh is not supported' as unknown) as ResolutionError
    );
    expect(returned.success).toBe(expected.success);
  });
  it('returns false for an unresolved ens name', () => {
    const expected = { success: false };
    const testAddress = 'a.eth';
    const returned = isValidETHRecipientAddress(
      testAddress,
      ('Domain a.eth is not registered' as unknown) as ResolutionError
    );
    expect(returned.success).toBe(expected.success);
  });
  it('returns false for an invalid checksummed address', () => {
    const expected = { success: false };
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFA261520';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });

  it('returns false for an invalid too-short address', () => {
    const expected = { success: false };
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39E';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });

  it('returns false for an invalid too-long address', () => {
    const expected = { success: false };
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa2615200000';
    const returned = isValidETHRecipientAddress(testAddress, undefined);
    expect(returned.success).toBe(expected.success);
  });
});

describe('isValidMixedCaseETHAddress', () => {
  it('returns true for cases where ETH address is mixed-case', () => {
    const expected = true;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520';
    const returned = isValidMixedCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too long', () => {
    const expected = false;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa2615200000';
    const returned = isValidMixedCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too short', () => {
    const expected = false;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DF';
    const returned = isValidMixedCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });
});

describe('isValidUpperOrLowerCaseETHAddress', () => {
  it('returns true for cases where ETH address is all upper-case', () => {
    const expected = true;
    const testAddress = '0X4BBEEB066ED09B7AED07BF39EEE0460DFA261520';
    const returned = isValidUpperOrLowerCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns true for cases where ETH address is all lower-case', () => {
    const expected = true;
    const testAddress = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';
    const returned = isValidUpperOrLowerCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is mixed-case', () => {
    const expected = false;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520';
    const returned = isValidUpperOrLowerCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too long', () => {
    const expected = false;
    const testAddress = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520111111';
    const returned = isValidUpperOrLowerCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too short', () => {
    const expected = false;
    const testAddress = '0x4bbeeb066ed09b7aed07bf39eee0460df';
    const returned = isValidUpperOrLowerCaseETHAddress(testAddress);
    expect(returned).toBe(expected);
  });
});

describe('isValidAddress', () => {
  it('returns true for cases where ETH address is mixed-case && valid checksum', () => {
    const expected = true;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520';
    const returned = isValidAddress(testAddress, 1);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is mixed-case && invalid checksum', () => {
    const expected = false;
    const testAddress = '0x4bBeEB066eD09B7AED07bF39EEe0460DFa261520';
    const returned = isValidAddress(testAddress, 1);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too long', () => {
    const expected = false;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa2615200000';
    const returned = isValidAddress(testAddress, 1);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where ETH address is too short', () => {
    const expected = false;
    const testAddress = '0x4bbeEB066eD09B7AEd07bF39EEe0460DF';
    const returned = isValidAddress(testAddress, 1);
    expect(returned).toBe(expected);
  });
});

describe('isENSLabelHash', () => {
  it('returns true for cases where label hash is an ENS labelhash', () => {
    const expected = true;
    const testLabelhash = '[fcf95f7b04588874e96107e6cc371491b657a00e91cb3535b045031d945ebe57]';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where testLabelhash is an ENS name', () => {
    const expected = false;
    const testLabelhash = 'mycryptoid.eth';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where testLabelhash is an ENS name with subdomain', () => {
    const expected = false;
    const testLabelhash = 'donate.mycryptoid.eth';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where testLabelhash is too long', () => {
    const expected = false;
    const testLabelhash = '[fcf95f7b04588874e96107e6cc371491b657a00e91cb3535b045031d945ebe57aa]';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where testLabelhash is too sort', () => {
    const expected = false;
    const testLabelhash = '[fcf95f7b04588874e96107e6cc371491b657a00e91cb3535b045031d945ebe]';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });

  it('returns false for cases where testLabelhash is an invalid-formatted labelhash', () => {
    const expected = false;
    const testLabelhash = 'fcf95f7b04588874e96107e6cc371491b657a00e91cb3535b045031d945ebe57';
    const returned = isENSLabelHash(testLabelhash);
    expect(returned).toBe(expected);
  });
});
