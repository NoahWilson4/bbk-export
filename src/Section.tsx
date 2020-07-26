import React from 'react';
import classnames from 'classnames';
import { Typography } from '@material-ui/core';

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
        <Typography className="no-print" variant="h4">
          {header}
        </Typography>
      ) : null}
      {children}
    </section>
  );
}

export function SubSection({
  className,
  header,
  children,
}: {
  className?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={classnames('sub-section', className)}>
      {header ? <Typography variant="h6">{header}</Typography> : null}
      {children}
    </div>
  );
}
