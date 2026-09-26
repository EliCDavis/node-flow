import * as assert from 'assert';
import { Port, PortConfig, PortType, portsCompatible } from '../src/port';
import { FlowNode } from '../src/node';

function port(config: PortConfig): Port {
    // A port only reaches back to its node when it is drawn or connected,
    // neither of which the type rules touch.
    return new Port(undefined as unknown as FlowNode, PortType.Output, config);
}

describe('portsCompatible', () => {
    it('joins two ports declaring the same type', () => {
        assert.ok(portsCompatible(port({ type: 'mesh' }), port({ type: 'mesh' })));
    });

    it('refuses two ports declaring different types', () => {
        assert.ok(!portsCompatible(port({ type: 'mesh' }), port({ type: 'float64' })));
    });

    it('joins an any-type port to anything, from either side', () => {
        const anything = port({ type: 'T', anyType: true });
        assert.ok(portsCompatible(anything, port({ type: 'mesh' })));
        assert.ok(portsCompatible(port({ type: 'mesh' }), anything));
    });

    it('joins two any-type ports', () => {
        assert.ok(portsCompatible(
            port({ type: 'T', anyType: true }),
            port({ type: '[]T', anyType: true }),
        ));
    });

    it('still refuses a port that is missing', () => {
        assert.ok(!portsCompatible(port({ type: 'T', anyType: true }), undefined));
        assert.ok(!portsCompatible(null, port({ type: 'mesh' })));
    });

    it('does not treat an untyped port as accepting anything', () => {
        assert.ok(!portsCompatible(port({}), port({ type: 'mesh' })));
    });

    it('shows a type of its own before falling back to "any"', () => {
        assert.strictEqual(port({ type: 'T', anyType: true }).getDataType(), 'T');
        assert.ok(port({ type: 'T', anyType: true }).acceptsAnyType());
        assert.ok(!port({ type: 'T' }).acceptsAnyType());
    });
});

describe('a port that takes more than one type', () => {
    it('joins a port declaring either of them', () => {
        const lifted = port({ type: 'float64', acceptedTypes: ['float64', '[]float64'] });

        assert.ok(portsCompatible(lifted, port({ type: 'float64' })));
        assert.ok(portsCompatible(lifted, port({ type: '[]float64' })));
    });

    it('refuses a type outside its set', () => {
        const lifted = port({ type: 'float64', acceptedTypes: ['float64', '[]float64'] });

        assert.ok(!portsCompatible(lifted, port({ type: 'string' })),
            'this is the whole point: the drag is refused rather than accepted then errored');
    });

    it('joins another multi-type port when the sets overlap', () => {
        const a = port({ type: 'float64', acceptedTypes: ['float64', '[]float64'] });
        const b = port({ type: 'int', acceptedTypes: ['int', '[]float64'] });
        const c = port({ type: 'int', acceptedTypes: ['int', '[]int'] });

        assert.ok(portsCompatible(a, b));
        assert.ok(!portsCompatible(a, c));
    });

    it('still lets an any-type port through', () => {
        const lifted = port({ type: 'float64', acceptedTypes: ['float64', '[]float64'] });
        assert.ok(portsCompatible(lifted, port({ type: 'T', anyType: true })));
    });

    it('narrows to one type once it settles', () => {
        const lifted = port({ type: 'float64', acceptedTypes: ['float64', '[]float64'] });
        lifted.settleOn('[]float64');

        assert.strictEqual(lifted.getDataType(), '[]float64');
        assert.deepStrictEqual(lifted.acceptedTypes(), ['[]float64']);
        assert.ok(portsCompatible(lifted, port({ type: '[]float64' })));
        assert.ok(!portsCompatible(lifted, port({ type: 'float64' })));
    });
});

describe('settling a port on a type', () => {
    it('enforces the new type once it stops accepting anything', () => {
        const settled = port({ type: 'T', anyType: true });
        settled.setDataType('mesh');
        settled.setAnyType(false);

        assert.strictEqual(settled.getDataType(), 'mesh');
        assert.ok(portsCompatible(settled, port({ type: 'mesh' })));
        assert.ok(!portsCompatible(settled, port({ type: 'float64' })),
            'the whole point: a settled port refuses the drag the Go side would reject');
    });

    it('recolors a port whose fill came from its type', () => {
        const settled = port({ type: 'T', anyType: true });
        const before = settled.filledStyleColor();
        settled.setDataType('mesh');

        assert.notStrictEqual(settled.filledStyleColor(), before);
        assert.strictEqual(settled.filledStyleColor(), port({ type: 'mesh' }).filledStyleColor(),
            'and lands on the same color a port declaring that type gets');
    });

    it('leaves a fill the caller picked alone', () => {
        const settled = port({ type: 'T', anyType: true, filledStyle: { fillColor: '#abcdef' } });
        settled.setDataType('mesh');

        assert.strictEqual(settled.filledStyleColor(), '#abcdef');
    });

    it('can be handed back to accepting anything', () => {
        const settled = port({ type: 'T', anyType: true });
        settled.setAnyType(false);
        settled.setAnyType(true);

        assert.ok(portsCompatible(settled, port({ type: 'float64' })));
    });
});
