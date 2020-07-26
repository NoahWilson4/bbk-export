import React from 'react';
import { Orders } from './utils';
import { Section } from './Section';

export function Labels({ orders }: { orders: Orders }) {
  return <Section className="labels" header="Labels"></Section>;
}

export default Labels;
