import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Relay Minifier: Create new relay successfully",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('relay-minifier', 'create-relay', [
        types.ascii('ethereum'),
        types.buff(Buffer.from('testMessageHash', 'utf8')),
        types.uint(256)
      ], deployer.address)
    ]);

    // Assert successful relay creation
    assertEquals(block.receipts[0].result.type, 'ok');
    assertEquals(block.receipts[0].result.value, 0n);
  }
});

Clarinet.test({
  name: "Relay Minifier: Confirm existing relay",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('relay-minifier', 'create-relay', [
        types.ascii('polygon'),
        types.buff(Buffer.from('confirmMessageHash', 'utf8')),
        types.uint(128)
      ], deployer.address),
      Tx.contractCall('relay-minifier', 'confirm-relay', [
        types.uint(0)
      ], deployer.address)
    ]);

    // Assert successful relay confirmation
    assertEquals(block.receipts[1].result.type, 'ok');
    assertEquals(block.receipts[1].result.value, true);
  }
});

Clarinet.test({
  name: "Relay Minifier: Reject invalid relay creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('relay-minifier', 'create-relay', [
        types.ascii(''),  // Invalid destination chain
        types.buff(Buffer.from('', 'utf8')),  // Invalid message hash
        types.uint(0)  // Invalid payload size
      ], deployer.address)
    ]);

    // Assert failure due to invalid message
    assertEquals(block.receipts[0].result.type, 'err');
    assertEquals(block.receipts[0].result.value, 101n);  // ERR-INVALID-MESSAGE
  }
});