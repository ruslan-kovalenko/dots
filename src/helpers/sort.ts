import Node from '@/types/node';

function sort(array: Node[]): Node[] {
  return array.sort((a, b) => a.x - b.x || a.y - b.y);
}

export default sort;