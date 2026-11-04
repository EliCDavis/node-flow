import { strict as assert } from 'assert';
import { FlowNode } from '../src/node';
import { NumberWidget } from '../src/widgets/number';
import { SliderWidget } from '../src/widgets/slider';

describe('property binding', () => {
    it('settles when a number widget is bound to a property set to NaN', () => {
        const node = new FlowNode({ title: 'test', position: { x: 0, y: 0 } });
        new NumberWidget(node, { property: 'x' });

        node.setProperty('x', NaN);

        assert.ok(Number.isNaN(node.getProperty('x')));
    });

    it('settles when a slider is bound to a property set to NaN', () => {
        const node = new FlowNode({ title: 'test', position: { x: 0, y: 0 } });
        new SliderWidget(node, { property: 'x', min: 0, max: 1 });

        node.setProperty('x', NaN);
    });

    it('does not report a NaN property as changed when it stays NaN', () => {
        const node = new FlowNode({ title: 'test', position: { x: 0, y: 0 } });
        let changes = 0;
        node.addPropertyChangeListener('x', () => { changes++; });

        node.setProperty('x', NaN);
        node.setProperty('x', NaN);

        assert.equal(changes, 1);
    });
});

describe('programmatic title and info', () => {
    it('sets the title of a node the user cannot retitle', () => {
        const node = new FlowNode({ title: 'before', position: { x: 0, y: 0 }, canEditTitle: false });
        node.setTitle('after');
        assert.equal(node.title(), 'after');
    });

    it('sets the info of a node the user cannot edit the info of', () => {
        const node = new FlowNode({ title: 'test', position: { x: 0, y: 0 }, canEditInfo: false });
        let changed = 0;
        node.addInfoChangeListener(() => { changed++; });
        node.setInfo('carrying a mesh');
        assert.equal(changed, 1);
    });
});
