import * as assert from 'assert';
import { PortType, portConfigTypes, typeSetsCompatible } from '../src/port';
import { Publisher } from '../src/nodes/publisher';
import { ContextMenuConfig, ContextMenuItemConfig } from '../src/contextMenu';

function itemNames(menu: ContextMenuConfig): Array<string> {
    const names: Array<string> = [];

    const walk = (m: ContextMenuConfig) => {
        (m.items ?? []).forEach((i: ContextMenuItemConfig) => names.push(i.name ?? ''));
        (m.subMenus ?? []).forEach(walk);
    };
    walk(menu);

    return names.sort();
}

const publisher = () => new Publisher({
    name: 'test',
    nodes: {
        'Math/Add': {
            inputs: [{ name: 'a', type: 'float64' }, { name: 'b', type: 'float64' }],
            outputs: [{ name: 'sum', type: 'float64' }],
        },
        'Mesh/Cube': {
            outputs: [{ name: 'out', type: 'mesh' }],
        },
        'Mesh/Translate': {
            inputs: [{ name: 'mesh', type: 'mesh' }],
            outputs: [{ name: 'out', type: 'mesh' }],
        },
        'Logic/Select': {
            inputs: [{ name: 'a', type: 'T', anyType: true }],
            outputs: [{ name: 'out', type: 'T', anyType: true }],
        },
        'Lifted/Negate': {
            inputs: [{ name: 'in', type: 'float64', acceptedTypes: ['float64', '[]float64'] }],
            outputs: [{ name: 'out', type: 'float64' }],
        },
    },
});

describe('type set matching', () => {
    it('overlapping sets match', () => {
        assert.ok(typeSetsCompatible(['mesh'], ['mesh']));
        assert.ok(typeSetsCompatible(['float64', '[]float64'], ['[]float64']));
    });

    it('disjoint sets do not', () => {
        assert.ok(!typeSetsCompatible(['mesh'], ['float64']));
    });

    it('an empty set takes anything, from either side', () => {
        assert.ok(typeSetsCompatible([], ['mesh']));
        assert.ok(typeSetsCompatible(['mesh'], []));
    });

    it('reads a port config the same way a built port reports itself', () => {
        assert.deepStrictEqual(portConfigTypes({ type: 'mesh' }), ['mesh']);
        assert.deepStrictEqual(portConfigTypes({ type: 'T', anyType: true }), []);
        assert.deepStrictEqual(
            portConfigTypes({ type: 'float64', acceptedTypes: ['float64', '[]float64'] }),
            ['float64', '[]float64'],
        );
    });
});

describe('filtering the new node menu to what could finish a wire', () => {
    const graph = {} as any;
    const at = { x: 0, y: 0 };

    it('offers everything when nothing is being dragged', () => {
        const names = itemNames(publisher().contextMenu(graph, at));
        assert.deepStrictEqual(names, ['Add', 'Cube', 'Negate', 'Select', 'Translate']);
    });

    it('dragging a mesh output offers only nodes taking a mesh', () => {
        const names = itemNames(publisher().contextMenu(graph, at, {
            needs: PortType.Input,
            types: ['mesh'],
        }));
        // Select takes anything, so it fits too. Cube has no inputs at all.
        assert.deepStrictEqual(names, ['Select', 'Translate']);
    });

    it('dragging a mesh input offers only nodes producing a mesh', () => {
        const names = itemNames(publisher().contextMenu(graph, at, {
            needs: PortType.Output,
            types: ['mesh'],
        }));
        assert.deepStrictEqual(names, ['Cube', 'Select', 'Translate']);
    });

    it('matches a lifted port on either of the types it takes', () => {
        const names = itemNames(publisher().contextMenu(graph, at, {
            needs: PortType.Input,
            types: ['[]float64'],
        }));
        assert.deepStrictEqual(names, ['Negate', 'Select'],
            'Add only takes a single float64, so it is left out');
    });

    it('an any-type drag offers everything with a port on that side', () => {
        const names = itemNames(publisher().contextMenu(graph, at, {
            needs: PortType.Input,
            types: [],
        }));
        assert.deepStrictEqual(names, ['Add', 'Negate', 'Select', 'Translate']);
    });

    it('drops submenus that matched nothing', () => {
        const menu = publisher().contextMenu(graph, at, {
            needs: PortType.Output,
            types: ['mesh'],
        });
        const groups = (menu.subMenus ?? []).map((m) => m.name).sort();
        assert.ok(!groups.includes('Math'), `Math should be gone, got ${groups}`);
    });
});
