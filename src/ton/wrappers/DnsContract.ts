import { TupleItem, Slice, Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';


export class DnsContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new DnsContract(address);
    }

    async getDnsRecord(provider: ContractProvider, domain: Slice, category: number) {
        const args: TupleItem[] = [
            { type: 'slice', cell: domain.asCell() },
            { type: 'int', value: BigInt(category) },
        ];

        const result = await provider.get('dnsresolve', args);  
        return {
            numberValue: result.stack.readNumber(),
            cellValue: result.stack.readCell(),
        };   
    }

}
