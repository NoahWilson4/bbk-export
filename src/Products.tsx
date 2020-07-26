import React from 'react';
import { Section, SubSection } from './Section';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import products, { Product } from './products/index';
import { Grid, Table, TableCell, TableBody, TableRow } from '@material-ui/core';

export function Products() {
  return (
    <Section className="products">
      {products.map((p) => (
        <ProductItem key={p.title} product={p} />
      ))}
    </Section>
  );
}

export default Products;

const useStyles = makeStyles((theme) =>
  createStyles({
    details: {
      fontSize: '0.9rem',
    },
    leftColumn: {
      fontWeight: 'bold',
      textAlign: 'left',
    },
  })
);

export function ProductItem({ product }: { product: Product }) {
  const classes = useStyles();

  return (
    <SubSection header={product.title}>
      <Table className={classes.details} size="small">
        <TableBody>
          <TableRow>
            <TableCell className={classes.leftColumn}>Label Title:</TableCell>
            <TableCell>{product.label?.title}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.leftColumn}>
              Label Instructions:
            </TableCell>
            <TableCell> {product.label?.instructions}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.leftColumn}>Recipe:</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </SubSection>
  );
}
