import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { Orders, ValidationErrors } from './utils';

const useStyles = makeStyles((theme) =>
  createStyles({
    errorData: {
      fontSize: '0.85rem',
      wordWrap: 'break-word',
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
            <Alert severity="error" elevation={4} key={i} variant="filled">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Error:</TableCell>
                    <TableCell className={classes.errorData}>
                      {e.error}
                    </TableCell>
                  </TableRow>
                  {e.order ? (
                    <TableRow>
                      <TableCell>Order:</TableCell>
                      <TableCell className={classes.errorData}>
                        {JSON.stringify(e.order)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {e.item ? (
                    <TableRow>
                      <TableCell>Item:</TableCell>
                      <TableCell className={classes.errorData}>
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
