import { strict as assert } from 'assert';
import { GraphView } from '../src/graph';
import { NoteSubsystem } from '../src/notes/subsystem';
import { CursorStyle } from '../src/styles/cursor';
import { SliderWidget } from '../src/widgets/slider';
import { center, widgetScene } from './support';

describe('the cursor', () => {
    it('shows the hovered widget\'s cursor once drawn through the graph', () => {
        const { graph, camera, ctx, widgetBox } = widgetScene((node) => new SliderWidget(node, { value: 0.5 }));
        const view = new GraphView([new NoteSubsystem(), graph]);

        const results = view.render(ctx, camera, center(widgetBox()));

        assert.equal(results?.cursorStyle, CursorStyle.EWResize);
    });
});
