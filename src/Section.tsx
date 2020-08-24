import React from 'react';
import classnames from 'classnames';
import { Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

export function Section({
  className,
  header,
  children,
}: {
  className?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className={className}>
      {header ? (
        <Typography className="no-print" variant="h3">
          {header}
        </Typography>
      ) : null}
      {children}
    </section>
  );
}

const useStyles = makeStyles((theme) =>
  createStyles({
    header: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
  })
);

export function SubSection({
  className,
  header,
  children,
}: {
  className?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const classes = useStyles();

  return (
    <div className={classnames('sub-section', className)}>
      {header ? (
        <Typography className={classes.header} variant="h4">
          {header}
        </Typography>
      ) : null}
      {children}
    </div>
  );
}
