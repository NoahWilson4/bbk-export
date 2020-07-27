import React from 'react';
import { Orders } from './utils';
import { Section } from './Section';
import { Button } from '@material-ui/core';
import { createLabels } from './create-labels';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import products from './products/index';

const useStyles = makeStyles((theme) =>
  createStyles({
    iframe: {
      margin: `${theme.spacing(3)}px auto`,
      display: 'block',
      border: 'none',
      width: '100%',
      height: 800,
      maxWidth: 600,
    },
  })
);

export function Labels({ orders }: { orders: Orders }) {
  const [error, setError] = React.useState<any>();
  const [working, setWorking] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string>();

  const classes = useStyles();

  const generateLabels = React.useCallback(async () => {
    setWorking(true);

    try {
      const url = await createLabels(orders, products);
      setPdfUrl(url);
    } catch (e) {
      console.warn(e);
      setError('There was an error rendering the labels.');
    } finally {
      setWorking(false);
    }
  }, [orders, setWorking, setError, setPdfUrl]);

  return (
    <Section className="labels" header="Labels">
      <Button
        variant="contained"
        color="primary"
        onClick={generateLabels}
        disabled={working}
      >
        Generate Labels
      </Button>
      {pdfUrl ? <iframe className={classes.iframe} src={pdfUrl} /> : null}
      {error ? <div>There was an error: {error}</div> : null}
    </Section>
  );
}

export default Labels;
