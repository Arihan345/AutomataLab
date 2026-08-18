export type RegexNode =
  | { type: 'symbol'; value: string }
  | { type: 'concat'; left: RegexNode; right: RegexNode }
  | { type: 'union'; left: RegexNode; right: RegexNode }
  | { type: 'star'; child: RegexNode };