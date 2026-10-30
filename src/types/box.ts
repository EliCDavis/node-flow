import { VectorPool } from "./pool";
import { AddVector2, CopyVector2, SubVector2, Vector2, Zero } from "./vector2";

export interface Box {
    Position: Vector2
    Size: Vector2
}

export function CopyBox(dst: Box, src: Box): void {
    dst.Position.x = src.Position.x;
    dst.Position.y = src.Position.y;
    dst.Size.x = src.Size.x;
    dst.Size.y = src.Size.y;
}

function normalizeMinMax(min: Vector2, max: Vector2) {
    if (min.x > max.x) {
        let temp = max.x;
        max.x = min.x;
        min.x = temp;
    }

    if (min.y > max.y) {
        let temp = max.y;
        max.y = min.y;
        min.y = temp;
    }
}

export function BoxIntersection(a: Box, b: Box): boolean {
    let intersects = false;

    VectorPool.run(() => {
        const aMin = VectorPool.get();
        const aMax = VectorPool.get();
        CopyVector2(aMin, a.Position);
        AddVector2(aMax, aMin, a.Size);
        normalizeMinMax(aMin, aMax);

        const bMin = VectorPool.get();
        const bMax = VectorPool.get();
        CopyVector2(bMin, b.Position);
        AddVector2(bMax, bMin, b.Size);
        normalizeMinMax(bMin, bMax);

        intersects = (aMin.x <= bMax.x) && (aMax.x >= bMin.x) &&
            (aMin.y <= bMax.y) && (aMax.y >= bMin.y);
    })

    return intersects;
}

// TODO: This is probably incorrect. Needs more testing
// export function ExpandBox(boxToExpand: Box, box: Box): void {
//     const newPos: Vector2 = Zero();
//     const newSize: Vector2 = Zero();

//     CopyVector2(newPos, boxToExpand.Position);
//     CopyVector2(newSize, boxToExpand.Size);


//     const positionOffset: Vector2 = Zero();

//     // Get Position Adjustment
//     SubVector2(positionOffset, box.Position, boxToExpand.Position);

//     // We only care about adjustments that make us bigger.
//     positionOffset.x = Math.min(positionOffset.x, 0);
//     positionOffset.y = Math.min(positionOffset.y, 0);

//     // Adjust our position 
//     AddVector2(boxToExpand.Position, boxToExpand.Position, positionOffset);

//     // Increase our size to take into account new position
//     SubVector2(newSize, newSize, positionOffset);

//     const sizeIncrease: Vector2 = Zero();

//     const curEndPos: Vector2 = {
//         x: boxToExpand.Position.x + boxToExpand.Size.x,
//         y: boxToExpand.Position.y + boxToExpand.Size.y,
//     };

//     const boxEndPos: Vector2 = {
//         x: box.Position.x + box.Size.x,
//         y: box.Position.y + box.Size.y,
//     };

//     SubVector2(sizeIncrease, boxEndPos, curEndPos);

//     // We only care about increases to our size
//     sizeIncrease.x = Math.max(sizeIncrease.x, 0);
//     sizeIncrease.y = Math.max(sizeIncrease.y, 0);

//     // Increase our size to take into account new position
//     SubVector2(newSize, newSize, sizeIncrease)

//     // Finally, Set result
//     CopyVector2(boxToExpand.Position, newPos)
//     CopyVector2(boxToExpand.Size, newSize)
// }

export function BoxCenter(box: Box, out: Vector2): Vector2 {
    out.x = box.Position.x + (box.Size.x / 2);
    out.y = box.Position.y + (box.Size.y / 2);
    return out
}

export function InBox(box: Box, position: Vector2): boolean {
    const min = box.Position
    if (position.x < min.x) {
        return false
    }
    if (position.y < min.y) {
        return false
    }

    if (position.x > min.x + box.Size.x) {
        return false
    }
    if (position.y > min.y + box.Size.y) {
        return false
    }

    return true
}