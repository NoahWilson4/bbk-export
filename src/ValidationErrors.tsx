import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { Orders, ValidationErrors } from './utils';

const useStyles = makeStyles((theme) =>
  createStyles({
    cell: {
      borderBottom: 'none',
    },
    root: {
      marginBottom: theme.spacing(3),
    },
  })
);

export function ValidationErrorAlerts({
  validationErrors,
}: {
  validationErrors?: ValidationErrors;
}) {
  const classes = useStyles();

  return (
    <>
      {validationErrors?.length
        ? validationErrors.map((e, i) => (
            <Alert
              severity="error"
              elevation={4}
              key={i}
              variant="filled"
              className={classes.root}
            >
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.cell}>Error:</TableCell>
                    <TableCell className={classes.cell}>{e.error}</TableCell>
                  </TableRow>
                  {e.order ? (
                    <>
                      <TableRow>
                        <TableCell className={classes.cell}>
                          Order ID:
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {e.order.id || 'missing ID'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>
                          Order Customer:
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {e.order.shippingAddress?.name || 'unkown'}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : null}
                  {e.item ? (
                    <TableRow>
                      <TableCell className={classes.cell}>
                        Errored Item:
                      </TableCell>
                      <TableCell className={classes.cell}>
                        {JSON.stringify(e.item)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Alert>
          ))
        : null}
    </>
  );
}
