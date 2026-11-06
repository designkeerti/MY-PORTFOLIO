import type { RigDef } from './rig';

/**
 * Rigs for the cats in public/about/cats (one file per cat), in each drawing's own units
 * (its viewBox, from 0,0).
 * Regions and joints were placed on the /__rig page.
 */
const TAIL_GINGER = Array.from({ length: 35 }, (_, i) => 31 + i); // the tail and its spots, 31-65

export const RIGS: Record<string, RigDef> = {
  // walking, facing right; one silhouette (3) runs body, tail and near legs; far legs are 1 and 2
  tabby: {
    pivot: [71.67, 49.05],
    parts: [
      // the head (55) and its features lie over the neck: it turns on top of it, uncut
      { name: 'head', pivot: [112.67, 26.05], split: false, poly: [[93.67, 19.05], [104.67, -6.95], [157.67, -8.95], [157.67, 40.05], [121.67, 38.05], [111.67, 35.25], [93.67, 32.05]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [120.17, 18.55], poly: [[110.17, 14.55], [129.67, 14.55], [129.67, 22.05], [110.17, 22.05]] },
      // the tail leaves the rump at y 54.5, between its outer edge (x 21) and the notch (x 31)
      { name: 'tail', pivot: [26.17, 55.05], layer: 'under', pad: 3, poly: [[9.67, 54.55], [32.17, 54.55], [32.17, 67.05], [21.67, 75.05], [9.67, 73.05]] },
      { name: 'tailTip', parent: 'tail', pivot: [24.67, 71.05], layer: 'under', pad: 3, poly: [[-8.33, 73.05], [9.67, 73.05], [21.67, 75.05], [32.17, 67.05], [33.17, 91.05], [-8.33, 91.05]] },
      { name: 'frontNear', pivot: [91.67, 55.05], layer: 'under', pad: 3.5, poly: [[81.67, 55.05], [98.67, 58.55], [99.67, 63.05], [104.67, 75.05], [104.67, 90.05], [80.67, 90.05]] },
      { name: 'backNear', pivot: [45.67, 66.05], layer: 'under', pad: 3.5, poly: [[33.67, 65.55], [51.67, 65.55], [58.67, 69.05], [62.67, 74.05], [67.67, 93.05], [33.67, 93.05]] },
      { name: 'frontFar', pivot: [102.67, 62.05], split: false, poly: [[97.67, 61.05], [109.67, 61.05], [109.67, 83.05], [97.67, 83.05]] },
      { name: 'backFar', pivot: [37.67, 58.05], split: false, poly: [[27.67, 51.05], [53.67, 51.05], [53.67, 86.05], [27.67, 86.05]] },
    ],
    assign: { 0: 'frontFar', 2: 'frontFar', 1: 'backFar', 49: 'backNear', 50: 'frontNear', 51: 'tailTip' },
  },
  // walking, facing right, tail up; silhouette (2) runs head, ears, body, tail and near legs (the head
  // is cut from it, so the ears turn with the head); far legs 0/5 and 1/6
  tuxedo: {
    pivot: [52.28, 66.84],
    parts: [
      { name: 'head', pivot: [84.28, 50.84], layer: 'over', pad: 1.5, poly: [[70.28, 17.84], [117.28, 17.84], [117.28, 58.84], [82.28, 58.84], [70.28, 43.84]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [93.78, 42.34], poly: [[84.28, 38.34], [103.78, 38.34], [103.78, 46.34], [84.28, 46.34]] },
      { name: 'tail', pivot: [10.28, 42.84], layer: 'under', pad: 3, poly: [[-3.72, 43.34], [-3.72, 19.84], [16.28, 19.84], [20.28, 34.84], [24.78, 43.34]] },
      { name: 'tailTip', parent: 'tail', pivot: [7.78, 19.84], layer: 'under', pad: 3, poly: [[-5.72, 19.84], [18.28, 19.84], [18.28, -6.16], [-5.72, -6.16]] },
      { name: 'frontNear', pivot: [77.28, 82.84], layer: 'under', pad: 3.5, poly: [[68.28, 84.84], [84.28, 80.84], [92.28, 93.84], [106.28, 105.84], [106.28, 120.84], [83.28, 120.84], [74.28, 99.84]] },
      { name: 'backNear', pivot: [16.28, 82.84], layer: 'under', pad: 3.5, poly: [[5.28, 83.34], [24.28, 83.34], [29.28, 117.84], [5.28, 117.84]] },
      { name: 'frontFar', pivot: [70.28, 83.84], split: false, poly: [[62.28, 79.84], [80.28, 79.84], [80.28, 117.84], [62.28, 117.84]] },
      { name: 'backFar', pivot: [30.28, 79.84], split: false, poly: [[20.28, 75.84], [44.28, 75.84], [44.28, 109.84], [20.28, 109.84]] },
    ],
    assign: { 0: 'frontFar', 5: 'frontFar', 1: 'backFar', 6: 'backFar', 7: 'backNear', 4: 'frontNear' },
  },
  // walking, facing left; cream silhouette (3) runs head, body and the near hind leg; the tail (2)
  // and the near foreleg (36) are their own shapes; far legs 1/37/39 and 0/38
  siamese: {
    pivot: [56.55, 52.17],
    parts: [
      { name: 'head', pivot: [27.55, 31.17], layer: 'over', pad: 1.5, poly: [[-4.45, -6.83], [42.55, -6.83], [42.55, 17.17], [37.55, 27.17], [26.55, 34.67], [-2.45, 37.17]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [21.55, 20.17], poly: [[12.05, 16.67], [31.05, 16.67], [31.05, 23.67], [12.05, 23.67]] },
      // the tail starts where it leaves the rump's edge
      { name: 'tail', pivot: [95.55, 44.17], layer: 'under', pad: 2, poly: [[91.55, 31.17], [121.55, 31.17], [121.55, 73.17], [111.55, 73.17], [101.55, 53.17], [91.55, 38.17]] },
      { name: 'tailTip', parent: 'tail', pivot: [121.55, 60.17], layer: 'under', pad: 2, poly: [[121.55, 31.17], [161.55, 31.17], [161.55, 73.17], [121.55, 73.17]] },
      { name: 'backNear', pivot: [100.55, 76.17], layer: 'under', pad: 3, poly: [[93.55, 79.67], [95.55, 76.67], [105.55, 71.17], [110.55, 71.17], [110.55, 103.17], [86, 103.17], [86, 88], [92, 82]] },
      { name: 'frontNear', pivot: [33.55, 70.67], split: false, poly: [[21.55, 67.17], [45.55, 67.17], [45.55, 102.17], [21.55, 102.17]] },
      { name: 'frontFar', pivot: [18.55, 61.17], split: false, poly: [[8.55, 55.17], [29.55, 55.17], [29.55, 101.17], [8.55, 101.17]] },
      { name: 'backFar', pivot: [72.55, 73.17], split: false, poly: [[56.55, 68.17], [91.55, 68.17], [91.55, 101.17], [56.55, 101.17]] },
    ],
    assign: { 36: 'frontNear', 41: 'frontNear', 1: 'frontFar', 37: 'frontFar', 39: 'frontFar', 0: 'backFar', 38: 'backFar', 40: 'backNear' },
  },
  // walking, facing left; silhouette (1) runs body, both forelegs and the near hind leg; the plume
  // tail (2-4) and the head (15-41, ears 17-20 apart) sit on top; far hind leg 0
  ragdoll: {
    pivot: [72.5, 44.62],
    parts: [
      { name: 'head', pivot: [34.5, 33.62], split: false, poly: [[-5.5, -5.38], [50.5, -5.38], [50.5, 40.62], [12.5, 40.62], [-5.5, 34.62]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [26.5, 22.62], poly: [[16.5, 17.62], [37, 17.62], [37, 27.62], [16.5, 27.62]] },
      { name: 'earL', parent: 'head', split: false, pivot: [22.5, 15.62], poly: [[15, -2.38], [28.5, -2.38], [28.5, 17.62], [15, 17.62]] },
      { name: 'earR', parent: 'head', split: false, pivot: [39.5, 20.62], poly: [[33.5, 4.62], [48.5, 4.62], [48.5, 25.12], [33.5, 25.12]] },
      { name: 'tail', pivot: [100.5, 24.62], split: false, poly: [[87.5, -0.38], [157.5, -0.38], [157.5, 49.62], [87.5, 49.62]] },
      { name: 'frontA', pivot: [30.5, 59.62], layer: 'under', pad: 3, poly: [[-3.5, 55.62], [26.5, 55.62], [39.5, 60.62], [32.5, 74.62], [22.5, 90.62], [-3.5, 90.62]] },
      { name: 'frontB', pivot: [57.5, 60.62], layer: 'under', pad: 3, poly: [[44.5, 61.12], [67.5, 59.12], [69.5, 90.62], [44.5, 90.62]] },
      { name: 'backNear', pivot: [122.5, 52.62], layer: 'under', pad: 3, poly: [[106.5, 53.12], [119.5, 49.62], [134.5, 50.62], [149.5, 90.62], [112.5, 90.62], [108.5, 67.62]] },
      { name: 'backFar', pivot: [88.5, 57.62], split: false, poly: [[76.5, 52.62], [107.5, 52.62], [107.5, 89.62], [76.5, 89.62]] },
    ],
    assign: { 2: 'tail', 3: 'tail', 4: 'tail', 0: 'backFar', 11: 'backFar', 13: 'frontA', 9: 'frontA', 12: 'frontB', 8: 'frontB', 10: 'backNear' },
  },
  // sitting, facing right; silhouette (3) runs head, body and the tail that curls round the
  // bottom-left to a tip at the bottom right; ears are drawn into it, eyes 19-28
  calico: {
    pivot: [55, 112],
    parts: [
      { name: 'head', pivot: [80, 37], layer: 'over', pad: 1.5, poly: [[54, -2], [101, -2], [101, 34], [92.5, 36], [80, 36], [68, 36.5], [62, 40.5], [54, 40.5]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [75, 20.7], poly: [[66.5, 15.5], [84.5, 15.5], [84.5, 26], [66.5, 26]] },
      // below y 124 there is nothing but tail
      { name: 'tailTip', pivot: [39, 131], layer: 'over', pad: 1.5, poly: [[38, 124], [62, 124], [62, 140], [38, 140]] },
    ],
  },
  // sitting, facing left; silhouette (1) runs head, body and the tail along the bottom
  // (tip at the left, x 47-52); eyes 6-16
  abyssinian: {
    pivot: [55, 82],
    parts: [
      { name: 'head', pivot: [22, 31], layer: 'over', pad: 1.5, poly: [[-2, -2], [42, -2], [42, 30.5], [36, 30.5], [30, 32.5], [12, 33.5], [-2, 34.5]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [21.5, 17], poly: [[10, 13], [33, 13], [33, 21], [10, 21]] },
      // below the front paws (y 95) the band is only tail
      { name: 'tailTip', pivot: [72, 104], layer: 'over', pad: 1.5, poly: [[42, 97], [72, 97], [72, 111], [42, 111]] },
    ],
  },
  // lying, facing front; the head (8) with its own ears (9-12) sits on the body (0); the
  // orange tail (5) wraps round the front, its tip at the bottom middle
  snowshoe: {
    pivot: [50, 58],
    parts: [
      { name: 'head', pivot: [76, 33], split: false, poly: [[44, -2], [108, -2], [108, 41], [44, 41]] },
      { name: 'earL', parent: 'head', split: false, pivot: [64, 17], poly: [[57, 2], [72, 2], [72, 22], [57, 22]] },
      { name: 'earR', parent: 'head', split: false, pivot: [84, 14], poly: [[78, -1], [93, -1], [93, 18], [78, 18]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [77, 20.5], poly: [[66, 17], [88, 17], [88, 24], [66, 24]] },
      { name: 'tailTip', pivot: [30, 65], layer: 'over', pad: 2, only: [5], poly: [[28, 50], [58, 50], [58, 78], [28, 78]] },
    ],
  },
  // sitting, facing front; silhouette (2) runs head and body, the ears (4-7) are their own;
  // the tail (31) and its spots (32-65) curl round the ground to a tip at the bottom right
  ginger: {
    pivot: [40, 100],
    parts: [
      { name: 'head', pivot: [66, 36], layer: 'over', pad: 1.5, poly: [[30, -2], [100, -2], [100, 37], [84, 37], [80, 35.5], [70, 35.5], [56, 37.5], [48, 38], [30, 38]] },
      { name: 'earL', parent: 'head', split: false, pivot: [54, 15], poly: [[47, 0], [60, 0], [60, 18], [47, 18]] },
      { name: 'earR', parent: 'head', split: false, pivot: [76, 14], poly: [[70, -1], [82.5, -1], [82.5, 16], [70, 16]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [66.5, 18], poly: [[55, 13.5], [78, 13.5], [78, 22.5], [55, 22.5]] },
      { name: 'tail', pivot: [9, 108], layer: 'over', pad: 1.5, only: TAIL_GINGER, poly: [[10, 94], [36, 94], [36, 130], [10, 130]] },
      { name: 'tailTip', parent: 'tail', pivot: [36, 121], layer: 'over', pad: 1.5, only: TAIL_GINGER, poly: [[36, 94], [64, 94], [64, 136], [36, 136]] },
    ],
  },
  // sitting, head turned to its left; the head (11) and both ears (6, 28-29) are their own
  // shapes; the tail (1) curls round the ground to the left; eyes 14-25
  grey: {
    pivot: [50, 100],
    parts: [
      { name: 'head', pivot: [50, 38], split: false, poly: [[20, -2], [67, -2], [67, 43], [20, 43]] },
      { name: 'earL', parent: 'head', split: false, pivot: [42, 12], poly: [[29, -1.5], [47, -1.5], [47, 16], [29, 16]] },
      { name: 'earR', parent: 'head', split: false, pivot: [53, 22], poly: [[47, 2], [66, 2], [66, 26.5], [47, 26.5]] },
      { name: 'eyes', parent: 'head', split: false, pivot: [40, 25], poly: [[31.5, 20.5], [50.5, 20.5], [50.5, 29.5], [31.5, 29.5]] },
      { name: 'tail', pivot: [34, 97], only: [1], layer: 'over', pad: 1.5, poly: [[16, 90], [40, 90], [40, 112], [16, 112]] },
      { name: 'tailTip', parent: 'tail', pivot: [16, 101], only: [1], layer: 'over', pad: 1.5, poly: [[-2, 90], [16, 90], [16, 112], [-2, 112]] },
    ],
  },
};
