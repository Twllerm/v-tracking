// eslint-disable-next-line import/prefer-default-export
const _ = require('lodash');

function Point(x, y) {
  this.x = x;
  this.y = y;
  this.parent = null;
}

function Wall(p1, p2, objectId) {
  this.p1 = p1;
  this.p2 = p2;
  this.p1.parent = this;
  this.p2.parent = this;
  this.points = [p1, p2];
  this.objectId = objectId;

  this.length = function () {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  this.direction = () => {
    const vLength = this.length();
    return new Point((p2.x - p1.x) / vLength, (p2.y - p1.y) / vLength);
  };

  this.intersectsWith = (wall) => {
    const a = this.p1;
    const b = this.p2;
    const c = wall.p1;
    const d = wall.p2;
    const cmp = new Point(c.x - a.x, c.y - a.y);
    const r = new Point(b.x - a.x, b.y - a.y);
    const s = new Point(d.x - c.x, d.y - c.y);

    const cmpxr = cmp.x * r.y - cmp.y * r.x;
    const cmpxs = cmp.x * s.y - cmp.y * s.x;
    const rxs = r.x * s.y - r.y * s.x;
    if (cmpxr == 0) {
      return ((c.x - a.x < 0) != (c.x - b.x < 0))
				|| ((c.y - a.y < 0) != (c.y - b.y < 0));
    }
    if (rxs == 0) { return false; }

    const rxsr = 1 / rxs;
    const t = cmpxs * rxsr;
    const u = cmpxr * rxsr;
    return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
  };

  this.intersectionPoint = (wall) => {
    const a = this.p1;
    const b = this.p2;
    const c = wall.p1;
    const d = wall.p2;

    const divider = ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x));
    if (divider == 0) { return new Point(0, 0); }
    const intersectionX = ((a.x * b.y - a.y * b.x) * (c.x - d.x) - (a.x - b.x) * (c.x * d.y - c.y * d.x)) / divider;
    const intersectionY = ((a.x * b.y - a.y * b.x) * (c.y - d.y) - (a.y - b.y) * (c.x * d.y - c.y * d.x)) / divider;

    return new Point(intersectionX, intersectionY);
  };
}


function getHitpoints(fromX, fromY, walls) {
  const hitpoints = [];
  const ids = [];
  // For every wall...
  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i];
    // Cast a ray to every point of the current wall
    for (let j = 0; j < wall.points.length; j++) {
      let closestPoint = null;
      if (j == 0) closestPoint = wall.p1;
      if (j == 1) closestPoint = wall.p2;
      const ray = new Wall(new Point(fromX, fromY), new Point(closestPoint.x, closestPoint.y));
      let minDistance = ray.length();
      let interId = wall.objectId;
      // Check every wall for intersection
      for (let k = 0; k < walls.length; k++) {
        const checkWall = walls[k];
        if (wall !== checkWall) {
          if (checkWall.intersectsWith(ray)) {
            // If checkWall intersects with our ray we have to check it's intersection point's distance
            // If the distance is smaller than the current minimum set intersectionPoint as the closest
            // point and save the distance.
            const intersectionPoint = checkWall.intersectionPoint(ray);
            const checkId = checkWall.objectId;
            const tempRay = new Wall(new Point(fromX, fromY), new Point(intersectionPoint.x, intersectionPoint.y));
            if (tempRay.length() < minDistance) {
              closestPoint = intersectionPoint;
              minDistance = tempRay.length();
              interId = checkId;
            }
          }
        }
      }
      hitpoints.push(closestPoint);
      ids.push(interId);
    }
  }

  return [hitpoints, _.uniq(ids)];
}


module.exports = {
  Wall,
  Point,
  getHitpoints,
};
