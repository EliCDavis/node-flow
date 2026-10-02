import { strict as assert } from 'assert';
import { NumberWidget } from '../src/widgets/number';
import { StringWidget } from '../src/widgets/string';
import { ToggleWidget } from '../src/widgets/toggle';
import { SliderWidget } from '../src/widgets/slider';
import { FlowNode } from '../src/node';

function stubNode(): FlowNode {
    const properties = new Map<string, unknown>();
    return {
        getProperty: (name: string) => properties.get(name),
        setProperty: (name: string, value: unknown) => { properties.set(name, value); },
        addPropertyChangeListener: () => { },
    } as unknown as FlowNode;
}

describe('widget construction', () => {
    it('does not fire a number callback for its initial value', () => {
        let fired = 0;
        new NumberWidget(stubNode(), { value: 42, callback: () => { fired++; } });
        assert.equal(fired, 0);
    });

    it('does not fire a string callback for its initial value', () => {
        let fired = 0;
        new StringWidget(stubNode(), { value: 'hello', callback: () => { fired++; } });
        assert.equal(fired, 0);
    });

    it('does not fire a toggle callback for its initial value', () => {
        let fired = 0;
        new ToggleWidget(stubNode(), { value: true, callback: () => { fired++; } });
        assert.equal(fired, 0);
    });

    it('does not fire a slider callback for its initial value', () => {
        let fired = 0;
        new SliderWidget(stubNode(), { value: 7, min: 0, max: 10, change: () => { fired++; } });
        assert.equal(fired, 0);
    });

    it('still fires the number callback on a real change', () => {
        const values: Array<number> = [];
        const widget = new NumberWidget(stubNode(), { value: 42, callback: (v) => { values.push(v); } });
        widget.Set(43);
        assert.deepEqual(values, [43]);
    });
});
